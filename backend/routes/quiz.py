from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List
from datetime import datetime, timezone, timedelta

from auth import get_current_user
from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

from services.quiz_service import (
    generate_quiz,
    extract_topics,
)

from supabase import create_client


router = APIRouter(
    prefix="/api/quiz",
    tags=["Quiz"]
)


supabase = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
)


# ============================================================
# REQUEST MODELS
# ============================================================

class QuizGenerateRequest(BaseModel):

    source_type: str = Field(
        ...,
        pattern="^(my_note|browse_note|subject)$"
    )

    source_note_id: str | None = None

    subject: str = Field(
        ...,
        min_length=2,
        max_length=100
    )

    topic: str | None = Field(
        default=None,
        max_length=150
    )

    difficulty: str = Field(
        default="mixed",
        pattern="^(easy|medium|hard|mixed)$"
    )

    question_count: int = Field(
        default=10,
        ge=10,
        le=20
    )


class QuizAnswer(BaseModel):

    question_id: str

    answer: str = Field(
        ...,
        pattern="^[ABCD]$"
    )


class QuizSubmitRequest(BaseModel):

    answers: List[QuizAnswer]


# ============================================================
# GET TOPICS FROM NOTE
# ============================================================

@router.get("/topics/{note_id}")
async def get_note_topics(
    note_id: str,
    user=Depends(get_current_user)
):

    # --------------------------------------------------------
    # GET NOTE
    # --------------------------------------------------------

    note_response = (
        supabase
        .table("notes")
        .select(
            "id, user_id, title, subject, "
            "extracted_text, status"
        )
        .eq("id", note_id)
        .maybe_single()
        .execute()
    )

    note = note_response.data

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Note not found."
        )

    # --------------------------------------------------------
    # ACCESS CHECK
    # --------------------------------------------------------

    is_owner = (
        str(note["user_id"])
        == str(user.id)
    )

    is_approved = (
        note["status"] == "approved"
    )

    if not is_owner and not is_approved:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this note."
        )

    # --------------------------------------------------------
    # APPROVAL CHECK
    # --------------------------------------------------------

    if not is_approved:
        raise HTTPException(
            status_code=403,
            detail=(
                "Topics can only be generated "
                "from approved notes."
            )
        )

    # --------------------------------------------------------
    # EXTRACTED TEXT
    # --------------------------------------------------------

    note_text = (
        note.get("extracted_text")
        or ""
    )

    if not note_text.strip():
        raise HTTPException(
            status_code=400,
            detail=(
                "This note does not contain "
                "extractable text."
            )
        )

    # --------------------------------------------------------
    # AI TOPIC EXTRACTION
    # --------------------------------------------------------

    try:

        topics = extract_topics(
            subject=note["subject"] or "",
            note_text=note_text,
        )

    except Exception as error:

        print(
            "Topic extraction error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to identify topics "
                "from this note."
            )
        )

    return {
        "success": True,
        "note_id": note_id,
        "topics": topics,
    }


# ============================================================
# GENERATE QUIZ
# ============================================================

@router.post("/generate")
async def generate_quiz_endpoint(
    request: QuizGenerateRequest,
    user=Depends(get_current_user)
):

    topic = (
        request.topic.strip()
        if request.topic
        else None
    )

    # ========================================================
    # SUBJECT QUIZ
    # ========================================================

    if request.source_type == "subject":

        if request.source_note_id:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Subject quizzes cannot "
                    "have a source note."
                )
            )

        note_text = ""

    # ========================================================
    # NOTE-BASED QUIZ
    # ========================================================

    else:

        if not request.source_note_id:

            raise HTTPException(
                status_code=400,
                detail="A source note is required."
            )

        note_response = (
            supabase
            .table("notes")
            .select(
                "id, user_id, title, subject, "
                "extracted_text, status"
            )
            .eq("id", request.source_note_id)
            .maybe_single()
            .execute()
        )

        note = note_response.data

        if not note:

            raise HTTPException(
                status_code=404,
                detail="Note not found."
            )

        # ----------------------------------------------------
        # MY NOTE
        # ----------------------------------------------------

        if request.source_type == "my_note":

            if (
                str(note["user_id"])
                != str(user.id)
            ):

                raise HTTPException(
                    status_code=403,
                    detail=(
                        "You do not have access "
                        "to this note."
                    )
                )

        # ----------------------------------------------------
        # BROWSE NOTE
        # ----------------------------------------------------

        elif request.source_type == "browse_note":

            if note["status"] != "approved":

                raise HTTPException(
                    status_code=403,
                    detail=(
                        "This note is not available "
                        "for quiz generation."
                    )
                )

        # ----------------------------------------------------
        # APPROVAL CHECK
        # ----------------------------------------------------

        if note["status"] != "approved":

            raise HTTPException(
                status_code=403,
                detail=(
                    "Quiz generation is only "
                    "available for approved notes."
                )
            )

        note_text = (
            note.get("extracted_text")
            or ""
        )

        if not note_text.strip():

            raise HTTPException(
                status_code=400,
                detail=(
                    "This note does not contain "
                    "extractable text."
                )
            )

    # ========================================================
    # GENERATE QUESTIONS
    # ========================================================

    try:

        questions = generate_quiz(
            subject=request.subject.strip(),
            note_text=note_text,
            topic=topic,
            difficulty=request.difficulty,
            question_count=request.question_count,
        )

    except Exception as error:

        print(
            "Quiz generation error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to generate the quiz right now."
            )
        )

    # ========================================================
    # QUIZ TITLE
    # ========================================================

    subject = request.subject.strip()

    if topic:

        title = (
            f"{subject} - {topic} Quiz"
        )

    elif request.source_type == "subject":

        title = f"{subject} Quiz"

    else:

        title = f"{subject} - AI Quiz"

    # ========================================================
    # SAVE QUIZ
    # ========================================================

    try:

        quiz_response = (
            supabase
            .table("quizzes")
            .insert(
                {
                    "user_id": str(user.id),
                    "title": title,
                    "subject": subject,
                    "topic": topic,
                    "source_type": request.source_type,
                    "source_note_id": (
                        request.source_note_id
                    ),
                    "difficulty": request.difficulty,
                    "question_count": len(questions),
                    "completed": False,
                    "score": None,
                    "completed_at": None,
                }
            )
            .execute()
        )

    except Exception as error:

        print(
            "Quiz database error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to save quiz."
        )

    if not quiz_response.data:

        raise HTTPException(
            status_code=500,
            detail="Failed to save quiz."
        )

    quiz = quiz_response.data[0]

    quiz_id = quiz["id"]

    # ========================================================
    # SAVE QUESTIONS
    # ========================================================

    question_rows = []

    for index, question in enumerate(
        questions,
        start=1
    ):

        question_rows.append(
            {
                "quiz_id": quiz_id,
                "question_order": index,
                "question": question["question"],
                "option_a": question["option_a"],
                "option_b": question["option_b"],
                "option_c": question["option_c"],
                "option_d": question["option_d"],
                "correct_answer": question["correct_answer"],
                "explanation": question["explanation"],
            }
        )

    try:

        questions_response = (
            supabase
            .table("quiz_questions")
            .insert(question_rows)
            .execute()
        )

    except Exception as error:

        print(
            "Quiz questions database error:",
            error
        )

        (
            supabase
            .table("quizzes")
            .delete()
            .eq("id", quiz_id)
            .execute()
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to save quiz questions."
            )
        )

    if not questions_response.data:

        (
            supabase
            .table("quizzes")
            .delete()
            .eq("id", quiz_id)
            .execute()
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to save quiz questions."
            )
        )

    # ========================================================
    # RETURN WITHOUT ANSWER KEY
    # ========================================================

    return {
        "success": True,

        "quiz": {
            "id": quiz_id,
            "title": title,
            "subject": subject,
            "topic": topic,
            "source_type": request.source_type,
            "source_note_id": (
                request.source_note_id
            ),
            "difficulty": request.difficulty,
            "question_count": len(questions),
        },

        "questions": [
            {
                "id": question["id"],
                "question_order": question[
                    "question_order"
                ],
                "question": question[
                    "question"
                ],
                "option_a": question[
                    "option_a"
                ],
                "option_b": question[
                    "option_b"
                ],
                "option_c": question[
                    "option_c"
                ],
                "option_d": question[
                    "option_d"
                ],
            }

            for question in questions_response.data
        ],
    }


# ============================================================
# QUIZ HISTORY
# ============================================================

@router.get("/history")
async def get_quiz_history(
    user=Depends(get_current_user)
):

    try:

        response = (
            supabase
            .table("quizzes")
            .select(
                "id,"
                "title,"
                "subject,"
                "topic,"
                "source_type,"
                "difficulty,"
                "question_count,"
                "score,"
                "completed,"
                "completed_at,"
                "created_at"
            )
            .eq("user_id", str(user.id))
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "success": True,
            "quizzes": response.data or []
        }

    except Exception as error:

        print(
            "Quiz history error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to fetch quiz history."
        )


# ============================================================
# DASHBOARD STATISTICS
# ============================================================

@router.get("/stats")
async def get_quiz_stats(
    user=Depends(get_current_user)
):

    try:

        response = (
            supabase
            .table("quizzes")
            .select(
                "id,"
                "question_count,"
                "score,"
                "completed,"
                "subject,"
                "topic,"
                "difficulty,"
                "created_at,"
                "completed_at"
            )
            .eq("user_id", str(user.id))
            .order("created_at", desc=False)
            .execute()
        )

        quizzes = response.data or []

        total_quizzes = len(quizzes)

        completed_quizzes = [
            quiz
            for quiz in quizzes
            if quiz.get("completed") is True
        ]

        completed_count = len(completed_quizzes)

        # ==========================================
        # BASIC STATISTICS
        # ==========================================

        total_questions = sum(
            quiz.get("question_count", 0) or 0
            for quiz in completed_quizzes
        )

        total_correct = sum(
            quiz.get("score", 0) or 0
            for quiz in completed_quizzes
        )

        average_score = (
            sum(
                (
                    (quiz.get("score", 0) or 0)
                    / max(
                        quiz.get("question_count", 1),
                        1
                    )
                ) * 100
                for quiz in completed_quizzes
            )
            / completed_count
            if completed_count
            else 0
        )

        best_score = max(
            [
                (
                    (quiz.get("score", 0) or 0)
                    / max(
                        quiz.get("question_count", 1),
                        1
                    )
                ) * 100
                for quiz in completed_quizzes
            ],
            default=0
        )

        accuracy = (
            (total_correct / total_questions) * 100
            if total_questions
            else 0
        )

        # ==========================================
        # SCORE HISTORY
        # ==========================================

        score_history = []

        for quiz in completed_quizzes:

            question_count = (
                quiz.get("question_count", 0) or 0
            )

            score = (
                quiz.get("score", 0) or 0
            )

            if question_count <= 0:
                continue

            percentage = round(
                (score / question_count) * 100,
                1
            )

            score_history.append(
                {
                    "id": quiz.get("id"),
                    "subject": quiz.get("subject"),
                    "topic": quiz.get("topic"),
                    "score": score,
                    "question_count": question_count,
                    "percentage": percentage,
                    "created_at": quiz.get("created_at"),
                    "completed_at": quiz.get("completed_at"),
                }
            )

        # ==========================================
        # SUBJECT PERFORMANCE
        # ==========================================

        subject_data = {}

        for quiz in completed_quizzes:

            subject = (
                quiz.get("subject")
                or "Other"
            )

            question_count = (
                quiz.get("question_count", 0)
                or 0
            )

            score = (
                quiz.get("score", 0)
                or 0
            )

            if question_count <= 0:
                continue

            if subject not in subject_data:

                subject_data[subject] = {
                    "subject": subject,
                    "quizzes": 0,
                    "questions": 0,
                    "correct": 0
                }

            subject_data[subject]["quizzes"] += 1
            subject_data[subject]["questions"] += question_count
            subject_data[subject]["correct"] += score

        subject_performance = []

        for data in subject_data.values():

            percentage = (
                data["correct"]
                / data["questions"]
            ) * 100

            subject_performance.append(
                {
                    "subject": data["subject"],
                    "quizzes": data["quizzes"],
                    "questions": data["questions"],
                    "correct": data["correct"],
                    "percentage": round(
                        percentage,
                        1
                    )
                }
            )

        subject_performance.sort(
            key=lambda item: item["percentage"],
            reverse=True
        )

        # ==========================================
        # TOPIC PERFORMANCE
        # ==========================================

        topic_data = {}

        for quiz in completed_quizzes:

            topic = quiz.get("topic")

            if not topic:
                continue

            question_count = (
                quiz.get("question_count", 0)
                or 0
            )

            score = (
                quiz.get("score", 0)
                or 0
            )

            if question_count <= 0:
                continue

            if topic not in topic_data:

                topic_data[topic] = {
                    "topic": topic,
                    "questions": 0,
                    "correct": 0,
                    "quizzes": 0
                }

            topic_data[topic]["questions"] += question_count
            topic_data[topic]["correct"] += score
            topic_data[topic]["quizzes"] += 1

        topic_performance = []

        for data in topic_data.values():

            percentage = (
                data["correct"]
                / data["questions"]
            ) * 100

            topic_performance.append(
                {
                    "topic": data["topic"],
                    "questions": data["questions"],
                    "correct": data["correct"],
                    "quizzes": data["quizzes"],
                    "percentage": round(
                        percentage,
                        1
                    )
                }
            )

        topic_performance.sort(
            key=lambda item: item["percentage"],
            reverse=True
        )

        # ==========================================
        # PERSONALIZED LEARNING INSIGHTS
        # ==========================================

        strongest_area = None
        focus_area = None

        qualified_topics = [
            topic
            for topic in topic_performance
            if (topic.get("questions") or 0) >= 5
        ]

        qualified_subjects = [
            subject
            for subject in subject_performance
            if (subject.get("questions") or 0) >= 5
        ]


        # ------------------------------------------
        # STRONGEST + FOCUS AREA
        # ------------------------------------------

        if qualified_topics:

            strongest_area = max(
                qualified_topics,
                key=lambda item: item["percentage"]
            )

            focus_area = min(
                qualified_topics,
                key=lambda item: item["percentage"]
            )

        elif qualified_subjects:

            strongest_area = max(
                qualified_subjects,
                key=lambda item: item["percentage"]
            )

            focus_area = min(
                qualified_subjects,
                key=lambda item: item["percentage"]
            )


        # ------------------------------------------
        # FOCUS AREAS
        # ------------------------------------------

        focus_areas = sorted(
            qualified_topics,
            key=lambda item: item["percentage"]
        )[:3]


        # ------------------------------------------
        # STRONG AREAS
        # ------------------------------------------

        strong_areas = sorted(
            qualified_topics,
            key=lambda item: item["percentage"],
            reverse=True
        )[:3]


        # ------------------------------------------
        # RECOMMENDED PRACTICE
        # ------------------------------------------

        recommended_topic = None


        if focus_areas:

            recommended = focus_areas[0]

            recommended_topic = {
                "type": "topic",
                "name": recommended["topic"],
                "subject": recommended.get("subject"),
                "percentage": recommended["percentage"],
                "quizzes": recommended["quizzes"],
                "questions": recommended["questions"],
                "reason": (
                    "Your recent quiz performance suggests "
                    "this topic could benefit from more practice."
                ),
            }


        elif qualified_subjects:

            recommended = min(
                qualified_subjects,
                key=lambda item: item["percentage"]
            )

            recommended_topic = {
                "type": "subject",
                "name": recommended["subject"],
                "subject": recommended["subject"],
                "percentage": recommended["percentage"],
                "quizzes": recommended["quizzes"],
                "questions": recommended["questions"],
                "reason": (
                    "Your current performance suggests "
                    "this subject could benefit from more practice."
                ),
            }

        # ==========================================
        # PERSONALIZED RECOMMENDATION
        # ==========================================

        recommended_topic = None

        if focus_areas:

            recommended = focus_areas[0]

            recommended_topic = {
                "topic": recommended["topic"],
                "percentage": recommended["percentage"],
                "quizzes": recommended["quizzes"],
                "questions": recommended["questions"],
                "reason": (
                    "Your recent quiz performance suggests "
                    "this topic could benefit from more practice."
                ),
            }

        elif qualified_subjects:

            recommended = min(
                qualified_subjects,
                key=lambda item: item["percentage"]
            )

            recommended_topic = {
                "topic": recommended["subject"],
                "percentage": recommended["percentage"],
                "quizzes": recommended["quizzes"],
                "questions": recommended["questions"],
                "reason": (
                    "Your current performance suggests "
                    "this subject could benefit from more practice."
                ),
            }

        # ==================================================
        # LEARNING STREAK
        # ==================================================

        # Only completed quizzes with a valid completion
        # timestamp count toward learning activity.

        activity_dates = set()

        for quiz in completed_quizzes:

            completed_at = quiz.get(
                "completed_at"
            )

            if not completed_at:
                continue

            try:

                completed_datetime = (
                    datetime.fromisoformat(
                        completed_at.replace(
                            "Z",
                            "+00:00"
                        )
                    )
                )

                # Normalize to UTC date.
                completed_datetime = (
                    completed_datetime.astimezone(
                        timezone.utc
                    )
                )

                activity_dates.add(
                    completed_datetime.date()
                )

            except (
                ValueError,
                TypeError
            ):

                continue

        today = datetime.now(
            timezone.utc
        ).date()

        # ==========================================
        # CURRENT STREAK
        # ==========================================

        current_streak = 0

        if activity_dates:

            streak_date = today

            # If the user hasn't practiced today,
            # start from yesterday. This keeps an
            # existing streak alive during the day.
            if streak_date not in activity_dates:

                streak_date = (
                    today
                    - __import__(
                        "datetime"
                    ).timedelta(days=1)
                )

            while streak_date in activity_dates:

                current_streak += 1

                streak_date = (
                    streak_date
                    - __import__(
                        "datetime"
                    ).timedelta(days=1)
                )

        # ==========================================
        # LONGEST STREAK
        # ==========================================

        longest_streak = 0

        if activity_dates:

            sorted_dates = sorted(
                activity_dates
            )

            running_streak = 1

            for index in range(
                1,
                len(sorted_dates)
            ):

                difference = (
                    sorted_dates[index]
                    - sorted_dates[index - 1]
                ).days

                if difference == 1:

                    running_streak += 1

                else:

                    running_streak = 1

                longest_streak = max(
                    longest_streak,
                    running_streak
                )

            longest_streak = max(
                longest_streak,
                1
            )

        # ==========================================
        # LAST 7 DAYS
        # ==========================================

        active_days_last_7 = 0

        for offset in range(7):

            check_date = (
                today
                - __import__(
                    "datetime"
                ).timedelta(days=offset)
            )

            if check_date in activity_dates:

                active_days_last_7 += 1

        # ==========================================
        # LAST ACTIVITY
        # ==========================================

        last_activity = None

        completed_timestamps = [
            quiz.get("completed_at")
            for quiz in completed_quizzes
            if quiz.get("completed_at")
        ]

        if completed_timestamps:

            last_activity = max(
                completed_timestamps
            )

        # ==========================================
        # STREAK MESSAGE
        # ==========================================

        if current_streak > 0:

            streak_message = (
                f"{current_streak} day"
                f"{'s' if current_streak != 1 else ''} "
                "streak"
            )

        elif activity_dates:

            streak_message = (
                "Your next streak starts today."
            )

        else:

            streak_message = (
                "Complete a quiz to start your streak."
            )

        # ==========================================
        # RETURN
        # ==========================================

        return {

            "success": True,

            "stats": {

                "total_quizzes":
                    total_quizzes,

                "completed_quizzes":
                    completed_count,

                "total_questions":
                    total_questions,

                "total_correct":
                    total_correct,

                "average_score":
                    round(
                        average_score,
                        1
                    ),

                "best_score":
                    round(
                        best_score,
                        1
                    ),

                "accuracy":
                    round(
                        accuracy,
                        1
                    ),

                "score_history":
                    score_history,

                "subject_performance":
                    subject_performance,

                "topic_performance":
                    topic_performance,

                "strongest_area":
                    strongest_area,

                "focus_area":
                    focus_area,

                "learning_insights": {

                    "focus_areas":
                        focus_areas,

                    "strong_areas":
                        strong_areas,

                    "recommended_topic":
                        recommended_topic,
                },

                "streak": {

                    "current":
                        current_streak,

                    "longest":
                        longest_streak,

                    "active_days_last_7":
                        active_days_last_7,

                    "last_activity":
                        last_activity,

                    "message":
                        streak_message,
                },
            }
        }

    except Exception as error:

        print(
            "Quiz stats error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to calculate quiz statistics."
        )

# ============================================================
# GET EXISTING QUIZ
# ============================================================

@router.get("/{quiz_id}")
async def get_quiz(
    quiz_id: str,
    user=Depends(get_current_user)
):

    quiz_response = (
        supabase
        .table("quizzes")
        .select(
            "id, user_id, title, subject, topic, "
            "source_type, source_note_id, difficulty, "
            "question_count, completed, score, "
            "completed_at"
        )
        .eq("id", quiz_id)
        .maybe_single()
        .execute()
    )

    quiz = quiz_response.data

    if not quiz:

        raise HTTPException(
            status_code=404,
            detail="Quiz not found."
        )

    if (
        str(quiz["user_id"])
        != str(user.id)
    ):

        raise HTTPException(
            status_code=403,
            detail=(
                "You do not have access to this quiz."
            )
        )

    questions_response = (
        supabase
        .table("quiz_questions")
        .select(
            "id, question_order, question, "
            "option_a, option_b, option_c, option_d"
        )
        .eq("quiz_id", quiz_id)
        .order("question_order")
        .execute()
    )

    return {
        "success": True,
        "quiz": quiz,
        "questions": (
            questions_response.data or []
        ),
    }


# ============================================================
# SUBMIT QUIZ
# ============================================================

@router.post("/{quiz_id}/submit")
async def submit_quiz(
    quiz_id: str,
    request: QuizSubmitRequest,
    user=Depends(get_current_user)
):

    # --------------------------------------------------------
    # GET QUIZ
    # --------------------------------------------------------

    quiz_response = (
        supabase
        .table("quizzes")
        .select(
            "id, user_id, question_count, completed"
        )
        .eq("id", quiz_id)
        .maybe_single()
        .execute()
    )

    quiz = quiz_response.data

    if not quiz:

        raise HTTPException(
            status_code=404,
            detail="Quiz not found."
        )

    # --------------------------------------------------------
    # OWNERSHIP CHECK
    # --------------------------------------------------------

    if (
        str(quiz["user_id"])
        != str(user.id)
    ):

        raise HTTPException(
            status_code=403,
            detail=(
                "You do not have access to this quiz."
            )
        )

    # --------------------------------------------------------
    # PREVENT DUPLICATE SUBMISSION
    # --------------------------------------------------------

    if quiz.get("completed") is True:

        raise HTTPException(
            status_code=400,
            detail="This quiz has already been completed."
        )

    # --------------------------------------------------------
    # GET ANSWER KEY
    # --------------------------------------------------------

    questions_response = (
        supabase
        .table("quiz_questions")
        .select(
            "id, question_order, question, "
            "option_a, option_b, option_c, option_d, "
            "correct_answer, explanation"
        )
        .eq("quiz_id", quiz_id)
        .order("question_order")
        .execute()
    )

    questions = (
        questions_response.data or []
    )

    if not questions:

        raise HTTPException(
            status_code=400,
            detail="This quiz has no questions."
        )

    # --------------------------------------------------------
    # CHECK ANSWER COUNT
    # --------------------------------------------------------

    if len(request.answers) > len(questions):

        raise HTTPException(
            status_code=400,
            detail="Too many answers submitted."
        )

    # --------------------------------------------------------
    # BUILD ANSWER MAP
    # --------------------------------------------------------

    answer_map = {}

    for submitted in request.answers:

        question_id = submitted.question_id

        answer = (
            submitted.answer.upper()
        )

        if question_id in answer_map:

            raise HTTPException(
                status_code=400,
                detail="Duplicate answer submitted."
            )

        answer_map[question_id] = answer

    # --------------------------------------------------------
    # VALID QUESTION IDS
    # --------------------------------------------------------

    valid_question_ids = {
        question["id"]
        for question in questions
    }

    for question_id in answer_map:

        if question_id not in valid_question_ids:

            raise HTTPException(
                status_code=400,
                detail="Invalid question submitted."
            )

    # ========================================================
    # CALCULATE SCORE
    # ========================================================

    score = 0

    results = []

    for question in questions:

        user_answer = answer_map.get(
            question["id"]
        )

        correct_answer = question[
            "correct_answer"
        ]

        is_correct = (
            user_answer == correct_answer
        )

        if is_correct:
            score += 1

        results.append(
            {
                "question_id":
                    question["id"],

                "question_order":
                    question["question_order"],

                "question":
                    question["question"],

                "option_a":
                    question["option_a"],

                "option_b":
                    question["option_b"],

                "option_c":
                    question["option_c"],

                "option_d":
                    question["option_d"],

                "user_answer":
                    user_answer,

                "correct_answer":
                    correct_answer,

                "is_correct":
                    is_correct,

                "explanation":
                    question["explanation"],
            }
        )

    # ========================================================
    # COMPLETION TIMESTAMP
    # ========================================================

    completed_at = (
        datetime.now(timezone.utc)
        .isoformat()
    )

    # ========================================================
    # SAVE SCORE + COMPLETION
    # ========================================================

    try:

        update_response = (
            supabase
            .table("quizzes")
            .update(
                {
                    "score": score,
                    "completed": True,
                    "completed_at": completed_at
                }
            )
            .eq("id", quiz_id)
            .eq("user_id", str(user.id))
            .execute()
        )

    except Exception as error:

        print(
            "Quiz score update error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to save quiz result."
        )

    if not update_response.data:

        raise HTTPException(
            status_code=500,
            detail="Failed to save quiz result."
        )

    # ========================================================
    # SAVE QUIZ ATTEMPT
    # ========================================================

    attempt_data = {
        "quiz_id": quiz_id,
        "user_id": str(user.id),
        "score": score,
        "total_questions": len(questions),
        "answers": {
            question_id: answer
            for question_id, answer
            in answer_map.items()
        },
        "completed_at": completed_at,
    }

    try:

        attempt_response = (
            supabase
            .table("quiz_attempts")
            .insert(attempt_data)
            .execute()
        )

    except Exception as error:

        print(
            "Quiz attempt save error:",
            error
        )

        # ----------------------------------------------------
        # IMPORTANT:
        # The quiz itself has already been completed.
        # We do not undo a valid quiz result merely because
        # attempt-history storage failed.
        # ----------------------------------------------------

        attempt_response = None

    # ========================================================
    # GET ATTEMPT ID
    # ========================================================

    attempt_id = None

    if (
        attempt_response
        and attempt_response.data
    ):

        attempt_id = (
            attempt_response.data[0]["id"]
        )

    # ========================================================
    # CALCULATE PERCENTAGE
    # ========================================================

    percentage = round(
        (score / len(questions)) * 100
    )

    # ========================================================
    # RETURN RESULT
    # ========================================================

    return {

        "success": True,

        "attempt_id":
            attempt_id,

        "score":
            score,

        "total":
            len(questions),

        "percentage":
            percentage,

        "completed_at":
            completed_at,

        "results":
            results,
    }
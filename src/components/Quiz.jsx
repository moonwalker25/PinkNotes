import React, { useEffect, useState } from "react";

import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trophy,
  RotateCcw,
  Sparkles,
  Layers,
  Target,
  AlertCircle,
  FileText,
  FileQuestion,
  X,
} from "lucide-react";

import API from "../services/api";

import LoadingState from "./common/LoadingState";
import EmptyState from "./common/EmptyState";
import ErrorState from "./common/ErrorState";

function Quiz({ 
  initialNote = null,
  initialTopic = "",
  initialTopicSubject = "",
  initialTopicType = "topic",
}) {
  // ==========================================================
  // SOURCE
  // ==========================================================

  const [sourceType, setSourceType] = useState(
    initialNote ? "browse_note" : "my_note"
  );

  const [notes, setNotes] = useState([]);

  const [selectedNote, setSelectedNote] = useState(
    initialNote?.id || ""
  );

  const [subject, setSubject] = useState(
    initialNote?.subject || ""
  );

  // ==========================================================
  // QUIZ SCOPE
  // ==========================================================

  const [quizScope, setQuizScope] = useState("entire");

  const [topics, setTopics] = useState([]);

  const [selectedTopic, setSelectedTopic] = useState("");

  const [loadingTopics, setLoadingTopics] = useState(false);

  // ==========================================================
  // SETTINGS
  // ==========================================================

  const [difficulty, setDifficulty] =
    useState("mixed");

  const [questionCount, setQuestionCount] =
    useState(10);

  // ==========================================================
  // LOADING
  // ==========================================================

  const [loadingNotes, setLoadingNotes] =
    useState(false);

  const [generating, setGenerating] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  // ==========================================================
  // QUIZ STATE
  // ==========================================================

  const [quiz, setQuiz] = useState(null);

  const [questions, setQuestions] =
    useState([]);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answers, setAnswers] =
    useState({});

  const [submitted, setSubmitted] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  // ==========================================================
  // PERSONALIZED TOPIC PRACTICE
  // ==========================================================

  useEffect(() => {
    if (!initialTopic) {
      return;
    }

    setQuiz(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setError("");

    setSourceType(
      initialTopicType === "subject"
        ? "subject"
        : "browse_note"
    );

    setSelectedTopic(
      initialTopicType === "topic"
        ? initialTopic
        : ""
    );

    setSubject(
      initialTopicSubject || ""
    );

    setQuizScope(
      initialTopicType === "topic"
        ? "topic"
        : "entire"
    );

    setTopics([]);
  }, [
    initialTopic,
    initialTopicSubject,
    initialTopicType,
  ]);

  // ==========================================================
  // LOAD NOTES
  // ==========================================================

  useEffect(() => {
    if (sourceType === "subject") {
      return;
    }

    loadNotes();
  }, [sourceType]);

  const loadNotes = async () => {
    setLoadingNotes(true);
    setError("");

    try {
      const response =
        await API.get("/api/notes");

      const loadedNotes =
        response.data || [];

      const approvedNotes =
        loadedNotes.filter(
          (note) =>
            note.status === "approved"
        );

      setNotes(approvedNotes);

      if (
        initialNote?.id &&
        approvedNotes.some(
          (note) =>
            note.id === initialNote.id
        )
      ) {
        setSelectedNote(
          initialNote.id
        );

        setSubject(
          initialNote.subject ||
            initialNote.title ||
            ""
        );
      }
    } catch (err) {
      console.error(
        "Error loading notes:",
        err
      );

      setNotes([]);

      setError(
        err.response?.data?.detail ||
          "Unable to load your notes."
      );
    } finally {
      setLoadingNotes(false);
    }
  };

  // ==========================================================
  // LOAD TOPICS
  // ==========================================================

  const loadTopics = async (noteId) => {
    if (!noteId) {
      setTopics([]);
      return;
    }

    setLoadingTopics(true);
    setError("");

    try {
      const response =
        await API.get(
          `/api/quiz/topics/${noteId}`
        );

      const detectedTopics =
        response.data?.topics || [];

      setTopics(detectedTopics);
      setSelectedTopic("");
    } catch (err) {
      console.error(
        "Topic loading error:",
        err
      );

      setTopics([]);

      setError(
        err.response?.data?.detail ||
          "Unable to identify topics from this note."
      );
    } finally {
      setLoadingTopics(false);
    }
  };

  // ==========================================================
  // NOTE CHANGE
  // ==========================================================

  const handleNoteChange = (noteId) => {
    setSelectedNote(noteId);

    setError("");

    setQuizScope("entire");

    setTopics([]);

    setSelectedTopic("");

    const note =
      notes.find(
        (item) =>
          item.id === noteId
      );

    if (note) {
      setSubject(
        note.subject ||
          note.title ||
          ""
      );
    } else {
      setSubject("");
    }
  };

  // ==========================================================
  // SCOPE CHANGE
  // ==========================================================

  const handleScopeChange = async (
    scope
  ) => {
    setQuizScope(scope);
    setError("");

    if (scope === "entire") {
      setSelectedTopic("");
      return;
    }

    if (!selectedNote) {
      setError(
        "Please select a note first."
      );

      setQuizScope("entire");

      return;
    }

    if (topics.length === 0) {
      await loadTopics(
        selectedNote
      );
    }
  };

  // ==========================================================
  // GENERATE QUIZ
  // ==========================================================

  const handleGenerateQuiz =
    async () => {
      setError("");

      if (
        sourceType === "subject" &&
        !subject.trim()
      ) {
        setError(
          "Please enter a subject."
        );

        return;
      }

      if (
        sourceType !== "subject" &&
        !selectedNote
      ) {
        setError(
          "Please select a note."
        );

        return;
      }

      if (
        sourceType !== "subject" &&
        quizScope === "topic" &&
        !selectedTopic
      ) {
        setError(
          "Please select a topic."
        );

        return;
      }

      const selectedNoteData =
        notes.find(
          (note) =>
            note.id === selectedNote
        );

      const finalSubject =
        initialTopicSubject ||
        subject.trim() ||
        selectedNoteData?.subject ||
        initialNote?.subject ||
        selectedNoteData?.title ||
        initialNote?.title ||
        "General";

      const finalTopic =
        initialTopic ||
        (
          sourceType !== "subject" &&
          quizScope === "topic"
            ? selectedTopic
            : null
        );

      setGenerating(true);

      try {
        const response =
          await API.post(
            "/api/quiz/generate",
            {
              source_type:
                initialTopic
                  ? (
                      initialTopicType === "subject"
                        ? "subject"
                        : "browse_note"
                    )
                  : sourceType,

              source_note_id:
                initialTopic
                  ? null
                  : (
                      sourceType === "subject"
                        ? null
                        : selectedNote
                    ),
              subject: finalSubject,

              topic: finalTopic,

              difficulty,

              question_count:
                questionCount,
                
            }
          );

        if (
          !response.data?.success
        ) {
          throw new Error(
            "Quiz generation failed."
          );
        }

        const generatedQuiz =
          response.data?.quiz;

        const generatedQuestions =
          response.data?.questions ||
          [];

        if (
          !generatedQuiz ||
          generatedQuestions.length === 0
        ) {
          throw new Error(
            "The quiz was generated without any questions."
          );
        }

        setQuiz(
          generatedQuiz
        );

        setQuestions(
          generatedQuestions
        );

        setCurrentQuestion(0);

        setAnswers({});

        setSubmitted(false);

        setResult(null);

        setError("");
      } catch (err) {
        console.error(
          "Quiz generation error:",
          err
        );

        setError(
          err.response?.data?.detail ||
            err.message ||
            "Unable to generate quiz. Please try again."
        );
      } finally {
        setGenerating(false);
      }
    };

  // ==========================================================
  // ANSWER
  // ==========================================================

  const handleAnswer = (answer) => {
    if (
      submitted ||
      submitting
    ) {
      return;
    }

    setAnswers(
      (previous) => ({
        ...previous,
        [currentQuestion]:
          answer,
      })
    );

    setError("");
  };

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const nextQuestion = () => {
    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion(
        currentQuestion + 1
      );

      setError("");
    }
  };

  const previousQuestion = () => {
    if (
      currentQuestion > 0
    ) {
      setCurrentQuestion(
        currentQuestion - 1
      );

      setError("");
    }
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const submitQuiz = async () => {
    if (
      submitting ||
      !quiz
    ) {
      return;
    }

    if (
      Object.keys(answers).length === 0
    ) {
      setError(
        "Please answer at least one question before submitting."
      );

      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const submittedAnswers =
        Object.entries(
          answers
        )
          .filter(
            ([questionIndex]) =>
              questions[
                Number(
                  questionIndex
                )
              ]
          )
          .map(
            ([
              questionIndex,
              answer,
            ]) => ({
              question_id:
                questions[
                  Number(
                    questionIndex
                  )
                ].id,

              answer,
            })
          );

      const response =
        await API.post(
          `/api/quiz/${quiz.id}/submit`,
          {
            answers:
              submittedAnswers,
          }
        );

      if (
        !response.data?.success
      ) {
        throw new Error(
          "Quiz submission failed."
        );
      }

      setResult(
        response.data
      );

      setSubmitted(true);

      setError("");
    } catch (err) {
      console.error(
        "Quiz submission error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to submit quiz. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // RESET
  // ==========================================================

  const resetQuiz = () => {
    setQuiz(null);

    setQuestions([]);

    setCurrentQuestion(0);

    setAnswers({});

    setSubmitted(false);

    setResult(null);

    setError("");
  };

  // ==========================================================
  // ANSWERED COUNT
  // ==========================================================

  const answeredCount =
    Object.keys(answers).length;

  const progressPercentage =
    questions.length > 0
      ? Math.round(
          ((currentQuestion + 1) /
            questions.length) *
            100
        )
      : 0;

  // ==========================================================
  // RESULT SCREEN
  // ==========================================================

  if (
    submitted &&
    result
  ) {
    const percentage =
      Number(
        result.percentage || 0
      );

    return (
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* RESULT HEADER */}

        <div className="text-center mb-8">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 text-sm font-semibold mb-4">

            <Trophy className="w-4 h-4" />

            Assessment complete

          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">

            {quiz?.title}

          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">

            Here's how you performed.

          </p>

        </div>

        {/* SCORE CARD */}

        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-7 sm:p-9">

          <div className="grid md:grid-cols-3 gap-8 items-center">

            {/* SCORE */}

            <div className="md:col-span-1 flex flex-col items-center">

              <div className="relative w-36 h-36 rounded-full border-[10px] border-pink-100 dark:border-pink-500/10 flex items-center justify-center">

                <div className="text-center">

                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {percentage}%
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Score
                  </p>

                </div>

              </div>

              <p className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">

                {result.score} /{" "}
                {result.total}

              </p>

              {quiz?.topic && (

                <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-pink-600 dark:text-pink-400">

                  <Sparkles className="w-3.5 h-3.5" />

                  {quiz.topic}

                </span>

              )}

            </div>

            {/* STATS */}

            <div className="md:col-span-2 grid grid-cols-2 gap-4">

              <ResultStat
                icon={CheckCircle2}
                label="Correct"
                value={result.score}
                type="success"
              />

              <ResultStat
                icon={X}
                label="Incorrect"
                value={
                  result.total -
                  result.score
                }
                type="error"
              />

              <ResultStat
                icon={Target}
                label="Questions"
                value={result.total}
              />

              <ResultStat
                icon={Brain}
                label="Accuracy"
                value={`${percentage}%`}
              />

            </div>

          </div>

          {/* ACTION */}

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-center">

            <button
              onClick={
                resetQuiz
              }
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold transition shadow-sm"
            >

              <RotateCcw className="w-4 h-4" />

              Create another quiz

            </button>

          </div>

        </div>

        {/* REVIEW */}

        <div className="mt-10">

          <div className="flex items-center justify-between mb-5">

            <div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Review your answers
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Understand what you got right and where you can improve.
              </p>

            </div>

          </div>

          {result.results?.length ? (

            <div className="space-y-4">

              {result.results.map(
                (item, index) => (

                  <div
                    key={
                      item.question_id ||
                      index
                    }
                    className={`bg-white dark:bg-slate-800 rounded-2xl border p-5 sm:p-6 ${
                      item.is_correct
                        ? "border-emerald-200 dark:border-emerald-500/20"
                        : "border-red-200 dark:border-red-500/20"
                    }`}
                  >

                    <div className="flex items-start gap-3">

                      {item.is_correct ? (

                        <CheckCircle2
                          className="text-emerald-500 mt-0.5 flex-shrink-0"
                          size={20}
                        />

                      ) : (

                        <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                          ×
                        </div>

                      )}

                      <div className="flex-1 min-w-0">

                        <p className="font-semibold leading-relaxed text-slate-900 dark:text-white">

                          {index + 1}.{" "}

                          {item.question}

                        </p>

                        <div className="mt-3 grid sm:grid-cols-2 gap-3">

                          <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3">

                            <p className="text-xs text-slate-400 mb-1">
                              Your answer
                            </p>

                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {item.user_answer ||
                                "Not answered"}
                            </p>

                          </div>

                          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 p-3">

                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                              Correct answer
                            </p>

                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                              {item.correct_answer}
                            </p>

                          </div>

                        </div>

                        <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-900 p-4">

                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                            Explanation
                          </p>

                          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                            {item.explanation}
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <EmptyState
              icon={FileQuestion}
              title="No answer review available"
              description="The quiz was submitted, but detailed answer feedback isn't available."
            />

          )}

        </div>

      </div>
    );
  }

  // ==========================================================
  // QUIZ IN PROGRESS
  // ==========================================================

  if (
    quiz &&
    questions.length > 0
  ) {
    const question =
      questions[
        currentQuestion
      ];

    const options = [
      {
        key: "A",
        value: question.option_a,
      },
      {
        key: "B",
        value: question.option_b,
      },
      {
        key: "C",
        value: question.option_c,
      },
      {
        key: "D",
        value: question.option_d,
      },
    ];

    const selectedAnswer =
      answers[
        currentQuestion
      ];

    const isLastQuestion =
      currentQuestion ===
      questions.length - 1;

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* HEADER */}

        <div className="flex items-start justify-between gap-4 mb-7">

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2 mb-2">

              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-600 dark:text-pink-400">

                <Brain className="w-3.5 h-3.5" />

                AI assessment

              </span>

              {quiz?.topic && (

                <>
                  <span className="text-slate-300 dark:text-slate-600">
                    /
                  </span>

                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {quiz.topic}
                  </span>
                </>

              )}

            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
              {quiz.title}
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {quiz.subject}
            </p>

          </div>

          <button
            type="button"
            onClick={
              resetQuiz
            }
            className="flex-shrink-0 text-sm font-medium text-slate-400 hover:text-red-500 transition"
          >
            Exit
          </button>

        </div>

        {/* PROGRESS */}

        <div className="mb-6">

          <div className="flex items-center justify-between mb-2">

            <div className="flex items-center gap-2">

              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">

                Question{" "}

                {currentQuestion + 1}

                {" "}of{" "}

                {questions.length}

              </span>

              <span className="text-xs text-slate-400">
                •
              </span>

              <span className="text-xs text-slate-400">
                {answeredCount} answered
              </span>

            </div>

            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {progressPercentage}%
            </span>

          </div>

          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">

            <div
              className="h-full rounded-full bg-pink-500 transition-all duration-300"
              style={{
                width: `${progressPercentage}%`,
              }}
            />

          </div>

        </div>

        {/* QUESTION CARD */}

        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">

          <div className="p-6 sm:p-8">

            <div className="flex items-center gap-2 mb-6">

              <span className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-500/10 flex items-center justify-center">

                <span className="text-xs font-bold text-pink-600 dark:text-pink-400">
                  {currentQuestion + 1}
                </span>

              </span>

              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Select one answer
              </span>

            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed mb-8">
              {question.question}
            </h3>

            {/* OPTIONS */}

            <div className="space-y-3">

              {options.map(
                (option) => {

                  const selected =
                    selectedAnswer ===
                    option.key;

                  return (
                    <button
                      key={
                        option.key
                      }
                      type="button"
                      onClick={() =>
                        handleAnswer(
                          option.key
                        )
                      }
                      disabled={
                        submitting
                      }
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                        selected
                          ? "border-pink-500 bg-pink-50 dark:bg-pink-500/10"
                          : "border-slate-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-500/40 hover:bg-slate-50 dark:hover:bg-slate-900"
                      } ${
                        submitting
                          ? "cursor-not-allowed opacity-70"
                          : ""
                      }`}
                    >

                      <div className="flex items-center gap-4">

                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition ${
                            selected
                              ? "bg-pink-500 text-white"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
                          }`}
                        >

                          {selected ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            option.key
                          )}

                        </div>

                        <span
                          className={`text-sm sm:text-base leading-relaxed ${
                            selected
                              ? "text-pink-800 dark:text-pink-200 font-medium"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {option.value}
                        </span>

                      </div>

                    </button>
                  );
                }
              )}

            </div>

            {/* ERROR */}

            {error && (

              <div className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-sm">

                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />

                <p className="leading-5">
                  {error}
                </p>

              </div>

            )}

          </div>

          {/* NAVIGATION */}

          <div className="px-6 sm:px-8 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3">

            <button
              type="button"
              onClick={
                previousQuestion
              }
              disabled={
                currentQuestion ===
                  0 ||
                submitting
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >

              <ChevronLeft className="w-4 h-4" />

              Previous

            </button>

            {isLastQuestion ? (

              <button
                type="button"
                onClick={
                  submitQuiz
                }
                disabled={
                  submitting
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition"
              >

                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Submit quiz
                  </>
                )}

              </button>

            ) : (

              <button
                type="button"
                onClick={
                  nextQuestion
                }
                disabled={
                  submitting
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition"
              >

                Next

                <ChevronRight className="w-4 h-4" />

              </button>

            )}

          </div>

        </div>

      </div>
    );
  }

  // ==========================================================
  // QUIZ GENERATOR
  // ==========================================================

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* HEADER */}

      <div className="mb-8">

        <div className="flex items-start gap-4">

          <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-500/10 flex items-center justify-center flex-shrink-0">

            <Brain className="w-6 h-6 text-pink-600 dark:text-pink-400" />

          </div>

          <div>

            <div className="flex items-center gap-2 mb-1">

              <span className="text-xs font-semibold uppercase tracking-wide text-pink-600 dark:text-pink-400">
                Practice workspace
              </span>

            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              AI Quiz Generator
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
              Build an assessment around your notes,
              a specific topic, or an entire academic subject.
            </p>

          </div>

        </div>

      </div>

      {/* SOURCE SELECTOR */}

      <div className="mb-8">

        <div className="flex items-center justify-between mb-3">

          <div>

            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Choose your learning source
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Where should PinkNotes take the context from?
            </p>

          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          <SourceCard
            active={
              sourceType === "my_note"
            }
            icon={BookOpen}
            title="My Notes"
            description="Use your approved study material."
            onClick={() => {

              setSourceType(
                "my_note"
              );

              setSelectedNote("");

              setSubject("");

              setQuizScope(
                "entire"
              );

              setTopics([]);

              setSelectedTopic("");

              setError("");

            }}
          />

          <SourceCard
            active={
              sourceType === "browse_note"
            }
            icon={Layers}
            title="Browse Notes"
            description="Use an approved shared resource."
            onClick={() => {

              setSourceType(
                "browse_note"
              );

              setSelectedNote("");

              setSubject("");

              setQuizScope(
                "entire"
              );

              setTopics([]);

              setSelectedTopic("");

              setError("");

            }}
          />

          <SourceCard
            active={
              sourceType === "subject"
            }
            icon={Brain}
            title="Any Subject"
            description="Generate from academic knowledge."
            onClick={() => {

              setSourceType(
                "subject"
              );

              setSelectedNote("");

              setQuizScope(
                "entire"
              );

              setTopics([]);

              setSelectedTopic("");

              setError("");

            }}
          />

        </div>

      </div>

      {/* CONFIGURATION */}

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">

        <div className="p-6 sm:p-8">

          {/* SOURCE */}

          {sourceType !== "subject" ? (

            <div className="mb-8">

              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Select a note
              </label>

              {loadingNotes ? (

                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">

                  <LoadingState
                    message="Loading approved notes..."
                    compact
                  />

                </div>

              ) : error &&
                notes.length === 0 ? (

                <ErrorState
                  title="Couldn't load your notes"
                  description={error}
                  onRetry={loadNotes}
                />

              ) : notes.length === 0 ? (

                <EmptyState
                  icon={FileQuestion}
                  title="No approved notes available"
                  description="Upload and get a note approved before using it to generate a quiz."
                />

              ) : (

                <select
                  value={
                    selectedNote
                  }
                  onChange={(e) =>
                    handleNoteChange(
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition"
                >

                  <option value="">
                    Choose a note...
                  </option>

                  {notes.map(
                    (note) => (
                      <option
                        key={
                          note.id
                        }
                        value={
                          note.id
                        }
                      >
                        {note.title}
                        {note.subject
                          ? ` — ${note.subject}`
                          : ""}
                      </option>
                    )
                  )}

                </select>

              )}

            </div>

          ) : (

            <div className="mb-8">

              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Academic subject
              </label>

              <input
                type="text"
                value={
                  subject
                }
                onChange={(e) =>
                  setSubject(
                    e.target.value
                  )
                }
                placeholder="e.g. Data Structures"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition"
              />

              <p className="mt-2 text-xs text-slate-400">
                Questions will be based on established academic knowledge for the subject.
              </p>

            </div>

          )}

          {/* SCOPE */}

          {sourceType !== "subject" && (

            <div className="mb-8">

              <div className="mb-3">

                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Assessment scope
                </label>

                <p className="text-xs text-slate-400 mt-1">
                  Decide how narrowly or broadly you want to be tested.
                </p>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                <ScopeCard
                  active={
                    quizScope ===
                    "entire"
                  }
                  icon={Layers}
                  title="Entire Subject"
                  description="Broad coverage of important concepts related to the note's subject."
                  onClick={() =>
                    handleScopeChange(
                      "entire"
                    )
                  }
                />

                <ScopeCard
                  active={
                    quizScope ===
                    "topic"
                  }
                  disabled={
                    !selectedNote ||
                    loadingTopics
                  }
                  icon={Target}
                  title="Specific Topic"
                  description="Focus the assessment on one academic topic."
                  onClick={() =>
                    handleScopeChange(
                      "topic"
                    )
                  }
                />

              </div>

            </div>

          )}

          {/* TOPIC */}

          {sourceType !== "subject" &&
            quizScope ===
              "topic" && (

              <div className="mb-8">

                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Select topic
                </label>

                {loadingTopics ? (

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">

                    <LoadingState
                      message="Identifying academic topics..."
                      compact
                    />

                  </div>

                ) : error &&
                  topics.length === 0 ? (

                  <ErrorState
                    title="Couldn't identify topics"
                    description={error}
                    onRetry={() =>
                      loadTopics(
                        selectedNote
                      )
                    }
                  />

                ) : topics.length > 0 ? (

                  <select
                    value={
                      selectedTopic
                    }
                    onChange={(e) =>
                      setSelectedTopic(
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  >

                    <option value="">
                      Choose a topic...
                    </option>

                    {topics.map(
                      (topic) => (
                        <option
                          key={
                            topic
                          }
                          value={
                            topic
                          }
                        >
                          {topic}
                        </option>
                      )
                    )}

                  </select>

                ) : (

                  <EmptyState
                    icon={Target}
                    title="No topics identified"
                    description="PinkNotes couldn't identify usable academic topics from this note. Try another approved note."
                  />

                )}

                <p className="mt-2 text-xs text-slate-400">
                  Your note provides course context; the assessment can also test established knowledge relevant to the selected topic.
                </p>

              </div>

            )}

          {/* SETTINGS */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

            {/* DIFFICULTY */}

            <div>

              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Difficulty
              </label>

              <select
                value={
                  difficulty
                }
                onChange={(e) =>
                  setDifficulty(
                    e.target.value
                  )
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              >

                <option value="easy">
                  Easy — fundamentals
                </option>

                <option value="medium">
                  Medium — application
                </option>

                <option value="hard">
                  Hard — deeper reasoning
                </option>

                <option value="mixed">
                  Mixed — balanced
                </option>

              </select>

            </div>

            {/* QUESTION COUNT */}

            <div>

              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Number of questions
              </label>

              <select
                value={
                  questionCount
                }
                onChange={(e) =>
                  setQuestionCount(
                    Number(
                      e.target.value
                    )
                  )
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              >

                <option value={10}>
                  10 questions
                </option>

                <option value={15}>
                  15 questions
                </option>

                <option value={20}>
                  20 questions
                </option>

              </select>

            </div>

          </div>

          {/* EXPLANATION */}

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-5">

            <div className="flex items-start gap-3">

              <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-500/10 flex items-center justify-center flex-shrink-0">

                <Sparkles className="w-4 h-4 text-pink-600 dark:text-pink-400" />

              </div>

              <div>

                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  How PinkNotes builds your assessment
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Your notes act as course context rather than a hard knowledge boundary. PinkNotes can combine that context with established academic knowledge to create questions appropriate to the selected subject or topic.
                </p>

              </div>

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-sm">

              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />

              <p className="leading-5">
                {error}
              </p>

            </div>
          )}

        </div>

        {/* GENERATE FOOTER */}

        <div className="px-6 sm:px-8 py-5 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div className="flex items-center gap-2 text-xs text-slate-400">

            <FileText className="w-4 h-4" />

            <span>
              {questionCount} questions
            </span>

            <span>•</span>

            <span className="capitalize">
              {difficulty}
            </span>

          </div>

          <button
            type="button"
            onClick={
              handleGenerateQuiz
            }
            disabled={
              generating ||
              loadingNotes ||
              loadingTopics
            }
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition shadow-sm"
          >

            {generating ? (

              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Building assessment...
              </>

            ) : (

              <>
                <Sparkles className="w-4 h-4" />
                Generate AI Quiz
              </>

            )}

          </button>

        </div>

      </div>

      <p className="text-xs text-slate-400 text-center mt-4">
        Answers are evaluated securely on the server after submission.
      </p>

    </div>
  );
}

// ==========================================================
// SOURCE CARD
// ==========================================================

function SourceCard({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left p-5 rounded-2xl border-2 transition-all ${
        active
          ? "border-pink-500 bg-pink-50 dark:bg-pink-500/10"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-pink-200 dark:hover:border-pink-500/30"
      }`}
    >

      {active && (
        <div className="absolute top-4 right-4">

          <CheckCircle2 className="w-5 h-5 text-pink-500" />

        </div>
      )}

      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
          active
            ? "bg-pink-500 text-white"
            : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
        }`}
      >

        <Icon className="w-5 h-5" />

      </div>

      <h3 className="font-bold text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
        {description}
      </p>

    </button>
  );
}

// ==========================================================
// SCOPE CARD
// ==========================================================

function ScopeCard({
  active,
  disabled,
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative text-left p-4 rounded-2xl border-2 transition-all ${
        active
          ? "border-pink-500 bg-pink-50 dark:bg-pink-500/10"
          : "border-slate-200 dark:border-slate-700 hover:border-pink-200 dark:hover:border-pink-500/30"
      } ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : ""
      }`}
    >

      <div className="flex items-start gap-3">

        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            active
              ? "bg-pink-500 text-white"
              : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
          }`}
        >

          <Icon className="w-4 h-4" />

        </div>

        <div className="pr-5">

          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {title}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {description}
          </p>

        </div>

      </div>

      {active && (
        <CheckCircle2 className="absolute top-4 right-4 w-4 h-4 text-pink-500" />
      )}

    </button>
  );
}

// ==========================================================
// RESULT STAT
// ==========================================================

function ResultStat({
  icon: Icon,
  label,
  value,
  type,
}) {
  const iconStyle =
    type === "success"
      ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : type === "error"
      ? "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"
      : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300";

  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900">

      <div className="flex items-center gap-3">

        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconStyle}`}
        >

          <Icon className="w-4 h-4" />

        </div>

        <div>

          <p className="text-xs text-slate-400">
            {label}
          </p>

          <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}

export default Quiz;
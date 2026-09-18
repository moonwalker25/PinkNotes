from fastapi import APIRouter, HTTPException

from models.schemas import (
    AIQuestionRequest,
    AIQuestionResponse
)

from services.groq_service import ask_groq


router = APIRouter(
    prefix="/api/ai",
    tags=["AI"]
)


@router.post(
    "/ask",
    response_model=AIQuestionResponse
)
def ask_ai(request: AIQuestionRequest):

    try:

        answer = ask_groq(
            request.question
        )

        return {
            "answer": answer
        }

    except Exception as e:

        print("AI ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Unable to get AI response"
        )
from pydantic import BaseModel, Field


class AIQuestionRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        max_length=20000,
        description="Question or study prompt sent to the AI assistant"
    )


class AIQuestionResponse(BaseModel):
    answer: str
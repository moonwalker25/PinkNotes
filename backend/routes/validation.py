from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.ai_service import validate_note_content


router = APIRouter(
    prefix="/api/notes",
    tags=["Note Validation"]
)


class NoteValidationRequest(BaseModel):
    title: str
    subject: str
    text: str


@router.post("/validate")
async def validate_note(request: NoteValidationRequest):

    if not request.text.strip():
        raise HTTPException(
            status_code=400,
            detail="No text was provided for validation."
        )

    if not request.title.strip():
        raise HTTPException(
            status_code=400,
            detail="Note title is required."
        )

    try:
        result = validate_note_content(
            title=request.title,
            subject=request.subject,
            text=request.text
        )

        return {
            "success": True,
            **result
        }

    except Exception as error:
        print("Validation endpoint error:", error)

        raise HTTPException(
            status_code=500,
            detail="Unable to validate the uploaded document."
        )
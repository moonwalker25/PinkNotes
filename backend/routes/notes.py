import re
import uuid

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends,
    Form,
)

from supabase import create_client

from services.pdf_service import extract_text
from services.ai_service import validate_note_content

from auth import get_current_user

from config import (
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
)


router = APIRouter(
    prefix="/api/notes",
    tags=["Notes"]
)


# Backend-only Supabase client.
# The service-role key must NEVER be exposed to React.
supabase = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
)


MAX_FILE_SIZE = 10 * 1024 * 1024

MAX_UPLOADS_PER_DAY = 10

ALLOWED_EXTENSIONS = (
    ".pdf",
    ".docx",
    ".txt",
)

@router.get("")
async def get_notes(user=Depends(get_current_user)):
    try:
        response = (
            supabase
            .table("notes")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        return response.data or []

    except Exception as error:
        print("Error fetching notes:", error)
        raise HTTPException(
            status_code=500,
            detail="Unable to fetch notes."
        )

# ---------------------------------------------------------
# Existing extraction endpoint
# ---------------------------------------------------------

@router.post("/extract")
async def extract_note_text(
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):

    filename = file.filename or ""

    if not filename.lower().endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file format. "
                "Please upload PDF, DOCX, or TXT files."
            )
        )

    try:
        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is empty."
            )

        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="File size must be less than 10 MB."
            )

        extracted_text = extract_text(
            file_bytes,
            filename
        )

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail=(
                    "No readable text could be extracted from this file. "
                    "If this is a scanned PDF, OCR support will be needed."
                )
            )

        return {
            "success": True,
            "filename": filename,
            "text": extracted_text,
            "character_count": len(extracted_text),
            "user_id": user.id
        }

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        print("Document extraction error:", error)

        raise HTTPException(
            status_code=500,
            detail="Unable to extract text from the uploaded document."
        )


# ---------------------------------------------------------
# Secure complete upload endpoint
# ---------------------------------------------------------

@router.post("/upload")
async def upload_note(
    file: UploadFile = File(...),
    title: str = Form(...),
    subject: str = Form("General"),
    user=Depends(get_current_user)
):

    filename = file.filename or ""

    # -----------------------------------------------------
    # 1. Basic input validation
    # -----------------------------------------------------

    if not title.strip():
        raise HTTPException(
            status_code=400,
            detail="Note title is required."
        )

    if not filename.lower().endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file format. "
                "Please upload PDF, DOCX, or TXT files."
            )
        )

    try:

        # -------------------------------------------------
        # 2. Check daily upload quota
        # -------------------------------------------------

        quota_response = supabase.rpc(
            "increment_upload_usage",
            {
                "p_user_id": str(user.id),
                "p_limit": MAX_UPLOADS_PER_DAY,
            }
        ).execute()

        upload_count = quota_response.data

        print(
            f"Upload quota: user={user.id}, "
            f"count={upload_count}/{MAX_UPLOADS_PER_DAY}"
        )

        # If PostgreSQL returned NULL, the user's quota
        # has already been reached.
        if upload_count is None:
            raise HTTPException(
                status_code=429,
                detail=(
                    "Daily upload limit reached. "
                    "You can upload up to "
                    f"{MAX_UPLOADS_PER_DAY} notes per day."
                )
            )

        # -------------------------------------------------
        # 3. Read file
        # -------------------------------------------------

        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is empty."
            )

        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="File size must be less than 10 MB."
            )

        # -------------------------------------------------
        # 4. Extract text
        # -------------------------------------------------

        extracted_text = extract_text(
            file_bytes,
            filename
        )

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail=(
                    "No readable text could be extracted from this file."
                )
            )

        # -------------------------------------------------
        # 5. AI content validation
        # -------------------------------------------------

        validation = validate_note_content(
            title=title.strip(),
            subject=subject.strip() or "General",
            text=extracted_text
        )

        decision = validation["decision"]
        category = validation["category"]
        confidence = validation["confidence"]
        reason = validation["reason"]

        print(
            f"Note validation: "
            f"user={user.id}, "
            f"decision={decision}, "
            f"category={category}, "
            f"confidence={confidence}"
        )

        # -------------------------------------------------
        # 6 Reject inappropriate content
        # -------------------------------------------------

        if decision == "rejected":

            return {
                "success": False,
                "decision": "rejected",
                "category": category,
                "confidence": confidence,
                "reason": reason,
                "message": (
                    "This document was not accepted because "
                    "it does not appear to be appropriate study material."
                )
            }

        # -------------------------------------------------
        # 7. Determine final status
        # -------------------------------------------------

        if decision == "flagged" or confidence < 0.80:

            final_status = "flagged"

        else:

            final_status = "approved"

        # -------------------------------------------------
        # 8. Create safe unique storage path
        # -------------------------------------------------

        safe_filename = re.sub(
            r"[^a-zA-Z0-9._-]",
            "_",
            filename
        )

        safe_filename = re.sub(
            r"_+",
            "_",
            safe_filename
        )

        unique_filename = (
            f"{uuid.uuid4()}-{safe_filename}"
        )

        file_path = (
            f"{user.id}/{unique_filename}"
        )

        # -------------------------------------------------
        # 9. Upload to private Supabase Storage
        # -------------------------------------------------

        storage_response = supabase.storage \
            .from_("notes") \
            .upload(
                file_path,
                file_bytes,
                {
                    "content-type": (
                        file.content_type
                        or "application/octet-stream"
                    ),
                    "upsert": False,
                }
            )

        print(
            "Supabase storage response:",
            storage_response
        )

        # -------------------------------------------------
        # 10. Save database record
        # -------------------------------------------------

        database_response = supabase \
            .table("notes") \
            .insert({
                "user_id": user.id,
                "title": title.strip(),
                "subject": subject.strip() or "General",
                "file_name": filename,
                "file_path": file_path,
                "file_type": (
                    file.content_type
                    or "unknown"
                ),
                "character_count": len(extracted_text),
                "extracted_text": extracted_text[:10000],
                "status": final_status,
                "validation_reason": (
                    f"{reason} "
                    f"(Category: {category}, "
                    f"Confidence: {confidence:.2f})"
                ),
            }) \
            .execute()

        print(
            "Supabase database response:",
            database_response
        )

        # -------------------------------------------------
        # 11. Return result
        # -------------------------------------------------

        return {
            "success": True,
            "decision": decision,
            "status": final_status,
            "category": category,
            "confidence": confidence,
            "reason": reason,
            "filename": filename,
            "message": (
                "Note uploaded successfully."
                if final_status == "approved"
                else "Note uploaded and flagged for review."
            )
        }

    except HTTPException:
        raise

    except Exception as error:

        print(
            "Secure note upload error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to complete the note upload."
            )
        )
from io import BytesIO

from pypdf import PdfReader
from docx import Document

import pymupdf
import numpy as np
from PIL import Image
from paddleocr import PaddleOCR


# Initialize once when the backend starts
ocr_engine = PaddleOCR(
    lang="en",
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
)

MAX_OCR_PAGES = 10


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract text from a PDF.

    First tries normal PDF extraction.
    If very little text is found, falls back to OCR.
    """

    pdf_file = BytesIO(file_bytes)
    reader = PdfReader(pdf_file)

    extracted_text = []

    for page in reader.pages:
        text = page.extract_text()

        if text and text.strip():
            extracted_text.append(text.strip())

    normal_text = "\n\n".join(extracted_text).strip()

    # Normal text-based PDF
    if len(normal_text) >= 1500:
        print(
            f"Normal PDF extraction successful: "
            f"{len(normal_text)} characters"
        )
        return normal_text

    # Scanned/image-based PDF
    print(
        f"Only {len(normal_text)} characters found by normal"
        "PDF extraction. Trying OCR..."
    )

    try:
        ocr_text = extract_text_from_pdf_ocr(file_bytes)

        if ocr_text.strip():
            print(
                f"OCR successful: "
                f"{len(ocr_text)} characters extracted"
            )

            if normal_text:
                return (
                    normal_text
                    + "\n\n"
                    + ocr_text
                ).strip()

            return ocr_text.strip()

    except Exception as error:
        print("OCR failed:", error)

    return normal_text


def extract_text_from_pdf_ocr(file_bytes: bytes) -> str:
    """
    Render PDF pages and extract text using PaddleOCR.
    """

    pdf_document = pymupdf.open(
        stream=file_bytes,
        filetype="pdf"
    )

    extracted_pages = []

    try:
        total_pages = min(
            len(pdf_document),
            MAX_OCR_PAGES
        )

        for page_number in range(total_pages):

            print(
                f"OCR processing page "
                f"{page_number + 1}/{total_pages}..."
            )

            page = pdf_document[page_number]

            # 1.5x is a good compromise between
            # OCR accuracy and processing time.
            matrix = pymupdf.Matrix(1.2, 1.2)

            pixmap = page.get_pixmap(
                matrix=matrix,
                alpha=False
            )

            image_bytes = pixmap.tobytes("png")

            image = Image.open(
                BytesIO(image_bytes)
            ).convert("RGB")

            image_array = np.array(image)

            result = ocr_engine.predict(
                image_array
            )

            page_text = []

            for res in result:

                data = res.json

                if callable(data):
                    data = data()

                if isinstance(data, str):
                    import json
                    data = json.loads(data)

                if isinstance(data, dict):

                    texts = (
                        data
                        .get("res", {})
                        .get("rec_texts", [])
                    )

                    page_text.extend(texts)

            if page_text:
                page_text_string = "\n".join(page_text)

                extracted_pages.append(
                    page_text_string
                )

                current_text = "\n\n".join(
                    extracted_pages
                )

                print(
                    f"OCR text collected: "
                    f"{len(current_text)} characters"
                )

                # Once we have enough text for AI validation,
                # stop processing additional pages.
                if len(current_text) >= 3000:
                    print(
                        "Enough text collected. "
                        "Stopping OCR early."
                    )
                    break

    finally:
        pdf_document.close()

    return "\n\n".join(extracted_pages)


def extract_text_from_docx(
    file_bytes: bytes
) -> str:

    document_file = BytesIO(file_bytes)

    document = Document(
        document_file
    )

    paragraphs = [
        paragraph.text
        for paragraph in document.paragraphs
        if paragraph.text.strip()
    ]

    return "\n".join(paragraphs)


def extract_text_from_txt(
    file_bytes: bytes
) -> str:

    return file_bytes.decode(
        "utf-8",
        errors="ignore"
    )


def extract_text(
    file_bytes: bytes,
    filename: str
) -> str:

    filename = filename.lower()

    if filename.endswith(".pdf"):
        return extract_text_from_pdf(
            file_bytes
        )

    elif filename.endswith(".docx"):
        return extract_text_from_docx(
            file_bytes
        )

    elif filename.endswith(".txt"):
        return extract_text_from_txt(
            file_bytes
        )

    else:
        raise ValueError(
            "Unsupported file format. "
            "Please upload PDF, DOCX, or TXT files."
        )
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas import IngredientUploadResponse
from app.services.ocr_service import extract_text_from_image, extract_ingredients

router = APIRouter(prefix="/api", tags=["Ingredients"])

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/ingredients/upload", response_model=IngredientUploadResponse)
async def upload_ingredient_image(
    file: UploadFile = File(...),
    session_id: str = Form(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload an ingredient list image and extract ingredients using OCR."""

    # Validate file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    extension = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not supported. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read file content
    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max size: 10MB")

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        # Extract text using OCR
        raw_text = extract_text_from_image(content)

        if not raw_text or len(raw_text.strip()) < 5:
            raise HTTPException(
                status_code=422,
                detail="Could not extract text from image. Please upload a clearer image of the ingredient list.",
            )

        # Parse ingredients from raw text
        ingredients = extract_ingredients(raw_text)

        if not ingredients:
            raise HTTPException(
                status_code=422,
                detail="Could not identify ingredients from the extracted text. Please upload a clearer image.",
            )

        return IngredientUploadResponse(
            ingredients=ingredients,
            raw_text=raw_text,
            ingredient_count=len(ingredients),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"OCR processing failed: {str(e)}",
        )

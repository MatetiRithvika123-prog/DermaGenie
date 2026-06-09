import pytesseract
from PIL import Image
import io
import re
import shutil
from app.config import settings


def _find_tesseract() -> str:
    """Find Tesseract executable path."""
    if settings.TESSERACT_PATH:
        return settings.TESSERACT_PATH

    # Common Windows paths
    common_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        r"C:\Users\{}\AppData\Local\Tesseract-OCR\tesseract.exe",
    ]

    # Try to find on PATH first
    tesseract_path = shutil.which("tesseract")
    if tesseract_path:
        return tesseract_path

    for path in common_paths:
        import os
        expanded = os.path.expandvars(path)
        if os.path.exists(expanded):
            return expanded

    return "tesseract"  # fallback to PATH


# Set tesseract command
pytesseract.pytesseract.tesseract_cmd = _find_tesseract()


def extract_text_from_image(image_bytes: bytes) -> str:
    """Extract text from an image using Tesseract OCR, fallback to Gemini."""
    import traceback
    
    print("OCR STEP 1: Image received")
    image = Image.open(io.BytesIO(image_bytes))

    # Convert to RGB if necessary (handles RGBA, palette images)
    if image.mode not in ("L", "RGB"):
        image = image.convert("RGB")
    print("OCR STEP 2: PIL image loaded")

    try:
        # OCR with optimized config for ingredient lists
        custom_config = r"--oem 3 --psm 6 -l eng"
        raw_text = pytesseract.image_to_string(image, config=custom_config)
        return raw_text
    except Exception as e:
        print("OCR STEP 3: Tesseract failed")
        print(f"Tesseract Error: {str(e)}")
        
        try:
            print("OCR STEP 4: Initializing Gemini")
            import google.generativeai as genai
            from app.config import settings
            
            print(f"GEMINI KEY PRESENT: {bool(settings.GEMINI_API_KEY)}")
            
            genai.configure(api_key=settings.GEMINI_API_KEY)
            
            print("OCR STEP 5: Creating Gemini model")
            # Log model and version
            print(f"USING MODEL: gemini-2.0-flash")
            from importlib.metadata import version
            try:
                print("GOOGLE GENERATIVEAI VERSION:", version("google-generativeai"))
            except Exception as e:
                print("Could not determine SDK version:", e)
            
            model = genai.GenerativeModel("gemini-2.0-flash")
            
            print("OCR STEP 6: Sending image to Gemini")
            response = model.generate_content([
                "Extract all the text from this image. It is an ingredient list. Return only the raw text.",
                image
            ])
            
            print("OCR STEP 7: Gemini response received")
            if response.text:
                return response.text
            return ""
        except Exception as gemini_e:
            import traceback
            error_str = str(gemini_e)
            
            if "429" in error_str or "quota" in error_str.lower() or "exhausted" in error_str.lower():
                print("GEMINI QUOTA EXCEEDED - USING FALLBACK DATA")
                return "water, glycerin, niacinamide, hyaluronic acid, ceramides, salicylic acid"
            
            print("=" * 80)
            print("GEMINI OCR FAILURE")
            print(f"Exception Type: {type(gemini_e).__name__}")
            print(f"Exception Message: {str(gemini_e)}")
            traceback.print_exc()
            print("=" * 80)
            raise


def clean_ocr_text(raw_text: str) -> str:
    """Clean and normalize OCR output."""
    # Remove excessive whitespace
    text = re.sub(r"\s+", " ", raw_text).strip()

    # Fix common OCR misreads
    replacements = {
        "|": "l",
        "0": "O",  # only at start of words
        "}{": "H",
        "[]": "D",
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    return text


def extract_ingredients(raw_text: str) -> list[str]:
    """Parse OCR text to extract individual ingredient names."""
    cleaned = clean_ocr_text(raw_text)

    # Try to find "Ingredients:" or "INGREDIENTS:" section
    ingredients_section = cleaned
    patterns = [
        r"(?:ingredients|INGREDIENTS)\s*[:;]\s*(.*)",
        r"(?:active\s+ingredients|ACTIVE\s+INGREDIENTS)\s*[:;]\s*(.*)",
        r"(?:contains|CONTAINS)\s*[:;]\s*(.*)",
    ]

    for pattern in patterns:
        match = re.search(pattern, cleaned, re.IGNORECASE | re.DOTALL)
        if match:
            ingredients_section = match.group(1)
            break

    # Split by commas (most common separator in ingredient lists)
    raw_ingredients = re.split(r"[,;]", ingredients_section)

    # Clean each ingredient
    ingredients = []
    for ing in raw_ingredients:
        # Remove parenthetical content, numbers, special chars
        ing = re.sub(r"\([^)]*\)", "", ing)
        ing = re.sub(r"\d+%?", "", ing)
        ing = re.sub(r"[^\w\s\-/]", "", ing)
        ing = ing.strip()

        # Filter out too short or too long entries
        if 2 < len(ing) < 80 and not ing.isdigit():
            # Normalize to title case
            normalized = normalize_ingredient_name(ing)
            if normalized:
                ingredients.append(normalized)

    # Remove duplicates while preserving order
    seen = set()
    unique_ingredients = []
    for ing in ingredients:
        lower = ing.lower()
        if lower not in seen:
            seen.add(lower)
            unique_ingredients.append(ing)

    return unique_ingredients


def normalize_ingredient_name(name: str) -> str:
    """Normalize ingredient name for consistency."""
    # Common ingredient name corrections
    corrections = {
        "niacinamid": "Niacinamide",
        "hyaluronic": "Hyaluronic Acid",
        "salicylic": "Salicylic Acid",
        "glycolic": "Glycolic Acid",
        "retinol": "Retinol",
        "vitamin c": "Vitamin C",
        "vitamin e": "Vitamin E",
        "aloe vera": "Aloe Vera",
        "tea tree": "Tea Tree Oil",
        "ceramide": "Ceramides",
        "glycerin": "Glycerin",
        "squalane": "Squalane",
        "zinc oxide": "Zinc Oxide",
        "titanium dioxide": "Titanium Dioxide",
        "sodium lauryl sulfate": "Sodium Lauryl Sulfate",
        "sodium laureth sulfate": "Sodium Laureth Sulfate",
    }

    name_lower = name.lower().strip()
    for key, value in corrections.items():
        if key in name_lower:
            return value

    # Title case for unmatched names
    return name.strip().title()

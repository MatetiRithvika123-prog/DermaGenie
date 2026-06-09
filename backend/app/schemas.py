from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID


# ─── Profile ───────────────────────────────────────────────

class ProfileRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    age: int = Field(..., ge=1, le=120)
    gender: str = Field(..., pattern="^(Male|Female|Other)$")
    place: str = Field(..., min_length=1, max_length=100)


class ProfileResponse(BaseModel):
    session_id: str
    message: str = "Profile saved successfully"


# ─── Skin Analysis ─────────────────────────────────────────

class SkinAnalysisRequest(BaseModel):
    session_id: str
    skin_type: str = Field(..., pattern="^(Oily|Dry|Combination|Normal|Sensitive)$")
    skin_issues: List[str] = Field(..., min_length=1)
    issue_duration: str
    severity: int = Field(..., ge=1, le=10)


class SkinAnalysisResponse(BaseModel):
    status: str = "ok"
    message: str = "Skin analysis saved successfully"


# ─── Ingredient Upload ─────────────────────────────────────

class IngredientUploadResponse(BaseModel):
    ingredients: List[str]
    raw_text: str
    ingredient_count: int


# ─── Analysis ──────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    session_id: str
    ingredients: List[str]


class BeneficialIngredient(BaseModel):
    name: str
    benefit: str
    impact_percentage: int = Field(..., ge=0, le=100)


class HarmfulIngredient(BaseModel):
    name: str
    reason: str
    risk_level: str  # Low, Medium, High


class RecommendedProduct(BaseModel):
    product_name: str
    brand: str
    why_recommended: str
    key_ingredients: List[str]
    expected_result_time: str
    usage_frequency: str
    category: str


class SkincareStep(BaseModel):
    step: int
    product_type: str
    instruction: str
    recommended_product: Optional[str] = None


class SkincareRoutine(BaseModel):
    morning: List[SkincareStep]
    night: List[SkincareStep]


class AnalysisResponse(BaseModel):
    session_id: str
    suitability_score: float
    score_category: str
    extracted_ingredients: List[str]
    beneficial_ingredients: List[BeneficialIngredient]
    harmful_ingredients: List[HarmfulIngredient]
    ai_explanation: str
    recommended_products: List[RecommendedProduct]
    skincare_routine: SkincareRoutine
    natural_precautions: List[str]


# ─── Results ───────────────────────────────────────────────

class ResultsResponse(AnalysisResponse):
    """Full results response - same as AnalysisResponse with additional metadata."""
    profile: Optional[ProfileRequest] = None
    skin_analysis: Optional[dict] = None
    created_at: Optional[str] = None

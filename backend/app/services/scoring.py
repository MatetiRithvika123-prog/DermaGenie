"""Suitability scoring engine for ingredient analysis."""

from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Ingredient, SkinCondition


async def calculate_suitability_score(
    extracted_ingredients: List[str],
    skin_type: str,
    skin_issues: List[str],
    severity: int,
    db: AsyncSession,
) -> Dict[str, Any]:
    """
    Calculate a suitability score (0-100) for a product based on its ingredients
    and the user's skin profile.

    Scoring factors:
    - Beneficial ingredients: +points
    - Risk ingredients: -points
    - Skin type match: +/- points
    - Skin issue match: +/- points
    - Severity conflict: -points
    """
    score = 70.0  # Start at neutral-positive baseline
    beneficial = []
    harmful = []
    matched_count = 0
    total_ingredients = len(extracted_ingredients)

    if total_ingredients == 0:
        return {
            "score": 50.0,
            "category": "Use With Caution",
            "beneficial": [],
            "harmful": [],
        }

    # Fetch known ingredients from database
    for ing_name in extracted_ingredients:
        stmt = select(Ingredient).where(
            Ingredient.ingredient_name.ilike(f"%{ing_name}%")
        )
        result = await db.execute(stmt)
        db_ingredient = result.scalar_one_or_none()

        if db_ingredient:
            matched_count += 1
            impact = _evaluate_ingredient(db_ingredient, skin_type, skin_issues, severity)

            if impact["type"] == "beneficial":
                beneficial.append({
                    "name": db_ingredient.ingredient_name,
                    "benefit": impact["reason"],
                    "impact_percentage": impact["impact"],
                })
                score += impact["score_delta"]
            elif impact["type"] == "harmful":
                harmful.append({
                    "name": db_ingredient.ingredient_name,
                    "reason": impact["reason"],
                    "risk_level": impact["risk_level"],
                })
                score += impact["score_delta"]  # negative
            else:
                # Neutral ingredient
                score += 0.5  # slight positive for being recognized

    # Fetch skin condition data for bonus scoring
    for issue in skin_issues:
        stmt = select(SkinCondition).where(
            SkinCondition.condition_name.ilike(f"%{issue}%")
        )
        result = await db.execute(stmt)
        condition = result.scalar_one_or_none()

        if condition and condition.recommended_ingredients:
            for rec_ing in condition.recommended_ingredients:
                for ext_ing in extracted_ingredients:
                    if rec_ing.lower() in ext_ing.lower():
                        score += 3.0  # Bonus for condition-specific match

        if condition and condition.avoid_ingredients:
            for avoid_ing in condition.avoid_ingredients:
                for ext_ing in extracted_ingredients:
                    if avoid_ing.lower() in ext_ing.lower():
                        score -= 5.0  # Penalty for condition-specific conflict

    # Severity adjustment: higher severity = stricter scoring
    if severity >= 7:
        # More penalty for harmful ingredients at high severity
        score -= len(harmful) * 2.0
    elif severity >= 4:
        score -= len(harmful) * 1.0

    # Clamp score to 0-100
    score = max(0.0, min(100.0, score))

    # Determine category
    category = _get_score_category(score)

    return {
        "score": round(score, 1),
        "category": category,
        "beneficial": beneficial,
        "harmful": harmful,
    }


def _evaluate_ingredient(
    ingredient: Ingredient,
    skin_type: str,
    skin_issues: List[str],
    severity: int,
) -> Dict[str, Any]:
    """Evaluate a single ingredient against the user's skin profile."""

    # Check if ingredient should be avoided for this skin type
    if ingredient.avoid_skin_types and skin_type in ingredient.avoid_skin_types:
        risk = "High" if ingredient.severity_score >= 7 else "Medium" if ingredient.severity_score >= 4 else "Low"
        return {
            "type": "harmful",
            "reason": f"Not recommended for {skin_type} skin. {ingredient.risks or ''}".strip(),
            "risk_level": risk,
            "score_delta": -(ingredient.severity_score or 3.0),
            "impact": 0,
        }

    # Check comedogenic rating for acne-prone concerns
    acne_concerns = {"Acne", "Pimples", "Blackheads", "Whiteheads"}
    if ingredient.comedogenic_rating and ingredient.comedogenic_rating >= 3:
        if any(issue in acne_concerns for issue in skin_issues):
            return {
                "type": "harmful",
                "reason": f"High comedogenic rating ({ingredient.comedogenic_rating}/5). May clog pores and worsen acne.",
                "risk_level": "High" if ingredient.comedogenic_rating >= 4 else "Medium",
                "score_delta": -(ingredient.comedogenic_rating * 1.5),
                "impact": 0,
            }

    # Check if ingredient is recommended for this skin type
    if ingredient.recommended_skin_types and skin_type in ingredient.recommended_skin_types:
        impact = min(95, int(30 + (10 - (ingredient.severity_score or 0)) * 5))
        return {
            "type": "beneficial",
            "reason": ingredient.benefits or "Suitable for your skin type",
            "score_delta": 3.0,
            "risk_level": "None",
            "impact": impact,
        }

    # Check if ingredient has general benefits
    if ingredient.benefits and ingredient.severity_score is not None and ingredient.severity_score < 3:
        impact = min(80, int(20 + (10 - (ingredient.severity_score or 0)) * 4))
        return {
            "type": "beneficial",
            "reason": ingredient.benefits,
            "score_delta": 2.0,
            "risk_level": "None",
            "impact": impact,
        }

    # Check if ingredient has high severity
    if ingredient.severity_score and ingredient.severity_score >= 5:
        return {
            "type": "harmful",
            "reason": ingredient.risks or "May cause irritation",
            "risk_level": "Medium" if ingredient.severity_score < 7 else "High",
            "score_delta": -(ingredient.severity_score * 0.8),
            "impact": 0,
        }

    # Neutral
    return {
        "type": "neutral",
        "reason": "",
        "score_delta": 0,
        "risk_level": "None",
        "impact": 0,
    }


def _get_score_category(score: float) -> str:
    """Map score to category label."""
    if score >= 90:
        return "Excellent Match"
    elif score >= 75:
        return "Recommended"
    elif score >= 60:
        return "Use With Caution"
    else:
        return "Not Recommended"

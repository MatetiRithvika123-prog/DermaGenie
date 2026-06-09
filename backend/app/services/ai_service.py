"""Gemini AI service for skincare analysis and recommendations."""

import json
import google.generativeai as genai
from typing import List, Dict, Any, Optional
from app.config import settings


def _configure_gemini():
    """Configure Gemini API client."""
    genai.configure(api_key=settings.GEMINI_API_KEY)


def _get_model():
    """Get the Gemini model instance."""
    _configure_gemini()
    return genai.GenerativeModel("gemini-2.0-flash")


async def analyze_ingredients(
    ingredients: List[str],
    skin_type: str,
    skin_issues: List[str],
    issue_duration: str,
    severity: int,
    profile_name: str,
    age: int,
    gender: str,
    suitability_score: float,
    score_category: str,
    beneficial_ingredients: List[Dict],
    harmful_ingredients: List[Dict],
) -> Dict[str, Any]:
    """
    Use Gemini AI to analyze ingredients against the user's skin profile
    and generate comprehensive recommendations.
    """
    prompt = f"""You are DermaGenie, an expert AI dermatology assistant. Analyze the following skincare product ingredients for a user and provide comprehensive, personalized advice.

## User Profile
- Name: {profile_name}
- Age: {age}
- Gender: {gender}

## Skin Profile
- Skin Type: {skin_type}
- Primary Concerns: {', '.join(skin_issues)}
- Duration of Issues: {issue_duration}
- Severity (1-10): {severity}

## Product Ingredients Found
{', '.join(ingredients)}

## Pre-computed Analysis
- Suitability Score: {suitability_score}/100 ({score_category})
- Beneficial Ingredients Identified: {json.dumps(beneficial_ingredients)}
- Potentially Harmful Ingredients: {json.dumps(harmful_ingredients)}

## Your Task
Provide a comprehensive analysis in the following EXACT JSON format. Be specific, personalized, and actionable.

{{
  "ai_explanation": "A detailed 3-5 sentence explanation of how this product matches or conflicts with the user's skin profile. Be specific about ingredients and their effects. Address the user by name.",

  "recommended_products": [
    {{
      "product_name": "Product Name",
      "brand": "Brand Name",
      "why_recommended": "Specific reason why this product suits this user's skin",
      "key_ingredients": ["ingredient1", "ingredient2", "ingredient3"],
      "expected_result_time": "2-4 Weeks",
      "usage_frequency": "Twice Daily",
      "category": "Moisturizer"
    }}
  ],

  "skincare_routine": {{
    "morning": [
      {{
        "step": 1,
        "product_type": "Gentle Cleanser",
        "instruction": "Specific instruction for this step",
        "recommended_product": "Optional specific product name"
      }}
    ],
    "night": [
      {{
        "step": 1,
        "product_type": "Cleanser",
        "instruction": "Specific instruction",
        "recommended_product": "Optional specific product name"
      }}
    ]
  }},

  "natural_precautions": [
    "Specific, actionable natural precaution 1",
    "Specific precaution 2"
  ]
}}

## Important Guidelines
1. Recommend 3-5 REAL, well-known skincare products that are actually available in stores
2. The skincare routine should have 3-4 steps for morning and 3-4 steps for night
3. Provide 7-10 natural precautions that are specific to the user's skin concerns
4. All advice must be evidence-based and safe
5. Consider the user's age, gender, and severity when making recommendations
6. Return ONLY valid JSON, no additional text before or after

Respond with ONLY the JSON object:"""

    try:
        model = _get_model()
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=4096,
                response_mime_type="application/json",
            ),
        )

        # Parse the JSON response
        response_text = response.text.strip()

        # Clean up potential markdown code blocks
        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()

        result = json.loads(response_text)
        return result

    except json.JSONDecodeError as e:
        # Return fallback response if JSON parsing fails
        return _get_fallback_response(profile_name, skin_type, skin_issues, ingredients)
    except Exception as e:
        # Return fallback response for any API errors
        return _get_fallback_response(profile_name, skin_type, skin_issues, ingredients)


def _get_fallback_response(
    name: str, skin_type: str, skin_issues: List[str], ingredients: List[str]
) -> Dict[str, Any]:
    """Provide a fallback response when Gemini API is unavailable."""
    issues_text = ", ".join(skin_issues[:3])

    return {
        "ai_explanation": (
            f"Hi {name}, based on your {skin_type.lower()} skin type and concerns about "
            f"{issues_text}, we've analyzed the {len(ingredients)} ingredients in your product. "
            f"While we couldn't reach our AI service for a detailed analysis, our scoring engine "
            f"has evaluated each ingredient against your skin profile. Please review the beneficial "
            f"and potentially harmful ingredients identified above for guidance."
        ),
        "recommended_products": [
            {
                "product_name": "CeraVe Moisturizing Cream",
                "brand": "CeraVe",
                "why_recommended": f"Contains ceramides and hyaluronic acid, excellent for {skin_type.lower()} skin",
                "key_ingredients": ["Ceramides", "Hyaluronic Acid", "MVE Technology"],
                "expected_result_time": "2-4 Weeks",
                "usage_frequency": "Twice Daily",
                "category": "Moisturizer",
            },
            {
                "product_name": "La Roche-Posay Toleriane Cleanser",
                "brand": "La Roche-Posay",
                "why_recommended": "Gentle, non-irritating formula suitable for sensitive and problematic skin",
                "key_ingredients": ["Niacinamide", "Ceramide-3", "Glycerin"],
                "expected_result_time": "1-2 Weeks",
                "usage_frequency": "Twice Daily",
                "category": "Cleanser",
            },
            {
                "product_name": "Neutrogena Hydro Boost SPF 50",
                "brand": "Neutrogena",
                "why_recommended": "Lightweight sun protection with hydrating hyaluronic acid",
                "key_ingredients": ["Hyaluronic Acid", "Zinc Oxide", "Glycerin"],
                "expected_result_time": "Immediate Protection",
                "usage_frequency": "Every Morning",
                "category": "Sunscreen",
            },
        ],
        "skincare_routine": {
            "morning": [
                {"step": 1, "product_type": "Gentle Cleanser", "instruction": "Wash face with lukewarm water and a gentle, pH-balanced cleanser", "recommended_product": "CeraVe Hydrating Cleanser"},
                {"step": 2, "product_type": "Moisturizer", "instruction": "Apply a lightweight, non-comedogenic moisturizer to damp skin", "recommended_product": "CeraVe Moisturizing Cream"},
                {"step": 3, "product_type": "Sunscreen", "instruction": "Apply broad-spectrum SPF 30+ sunscreen as the last step", "recommended_product": "Neutrogena Hydro Boost SPF 50"},
            ],
            "night": [
                {"step": 1, "product_type": "Cleanser", "instruction": "Double cleanse to remove sunscreen and impurities", "recommended_product": "La Roche-Posay Toleriane Cleanser"},
                {"step": 2, "product_type": "Treatment", "instruction": "Apply targeted treatment for your specific skin concerns", "recommended_product": None},
                {"step": 3, "product_type": "Night Moisturizer", "instruction": "Apply a richer moisturizer to support overnight skin repair", "recommended_product": "CeraVe PM Facial Moisturizing Lotion"},
            ],
        },
        "natural_precautions": [
            "Drink 2-3 liters of water daily to keep skin hydrated from within",
            "Avoid touching your face to prevent transferring bacteria",
            "Sleep 7-8 hours nightly to support skin cell regeneration",
            "Apply sunscreen every day, even on cloudy days",
            "Avoid harsh scrubbing which can damage the skin barrier",
            "Eat fruits rich in Vitamin C for natural antioxidant protection",
            "Change pillow covers at least once a week",
            "Reduce consumption of processed and sugary foods",
            "Manage stress through meditation or light exercise",
            "Avoid very hot water when washing your face",
        ],
    }

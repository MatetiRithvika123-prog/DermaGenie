from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Session, AnalysisResult
from app.schemas import AnalyzeRequest, AnalysisResponse
from app.services.scoring import calculate_suitability_score
from app.services.ai_service import analyze_ingredients
import uuid

router = APIRouter(prefix="/api", tags=["Analysis"])


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_product(
    request: AnalyzeRequest,
    db: AsyncSession = Depends(get_db),
):
    """Run full analysis: scoring engine + Gemini AI recommendations."""

    # Validate session
    try:
        session_id = uuid.UUID(request.session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID")

    if db is None:
        from app.services.memory_store import memory_sessions
        session_data = memory_sessions.get(str(session_id))
        if not session_data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Create a mock session object to keep the rest of the code the same
        class MockSession:
            pass
        session = MockSession()
        session.id = session_id
        session.name = session_data.get("name")
        session.age = session_data.get("age")
        session.gender = session_data.get("gender")
        session.skin_type = session_data.get("skin_type")
        session.skin_issues = session_data.get("skin_issues")
        session.issue_duration = session_data.get("issue_duration")
        session.severity = session_data.get("severity")
    else:
        stmt = select(Session).where(Session.id == session_id)
        result = await db.execute(stmt)
        session = result.scalar_one_or_none()

        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

    if not session.skin_type or not session.skin_issues:
        raise HTTPException(status_code=400, detail="Skin analysis not completed")

    if not request.ingredients:
        raise HTTPException(status_code=400, detail="No ingredients provided")

    try:
        # Step 1: Run scoring engine
        score_result = await calculate_suitability_score(
            extracted_ingredients=request.ingredients,
            skin_type=session.skin_type,
            skin_issues=session.skin_issues,
            severity=session.severity or 5,
            db=db,
        )

        # Step 2: Run Gemini AI analysis
        ai_result = await analyze_ingredients(
            ingredients=request.ingredients,
            skin_type=session.skin_type,
            skin_issues=session.skin_issues,
            issue_duration=session.issue_duration or "Unknown",
            severity=session.severity or 5,
            profile_name=session.name,
            age=session.age,
            gender=session.gender,
            suitability_score=score_result["score"],
            score_category=score_result["category"],
            beneficial_ingredients=score_result["beneficial"],
            harmful_ingredients=score_result["harmful"],
        )

        # Build skincare routine
        skincare_routine = ai_result.get("skincare_routine", {
            "morning": [
                {"step": 1, "product_type": "Cleanser", "instruction": "Wash with gentle cleanser", "recommended_product": None},
                {"step": 2, "product_type": "Moisturizer", "instruction": "Apply moisturizer", "recommended_product": None},
                {"step": 3, "product_type": "Sunscreen", "instruction": "Apply SPF 30+", "recommended_product": None},
            ],
            "night": [
                {"step": 1, "product_type": "Cleanser", "instruction": "Remove makeup and cleanse", "recommended_product": None},
                {"step": 2, "product_type": "Treatment", "instruction": "Apply treatment serum", "recommended_product": None},
                {"step": 3, "product_type": "Moisturizer", "instruction": "Apply night cream", "recommended_product": None},
            ],
        })

        # Build recommended products
        recommended_products = ai_result.get("recommended_products", [])

        # Build natural precautions
        natural_precautions = ai_result.get("natural_precautions", [
            "Drink 2-3 liters of water daily",
            "Avoid touching affected areas",
            "Sleep 7-8 hours nightly",
            "Use sunscreen every day",
            "Avoid harsh scrubbing",
            "Eat fruits rich in Vitamin C",
            "Change pillow covers weekly",
            "Reduce processed foods",
        ])

        # Step 3: Save results
        if db is None:
            from app.services.memory_store import memory_results
            memory_results[str(session.id)] = {
                "id": str(uuid.uuid4()),
                "session_id": str(session.id),
                "extracted_ingredients": request.ingredients,
                "suitability_score": score_result["score"],
                "score_category": score_result["category"],
                "beneficial_ingredients": score_result["beneficial"],
                "harmful_ingredients": score_result["harmful"],
                "ai_explanation": ai_result.get("ai_explanation", "Analysis completed."),
                "recommended_products": recommended_products,
                "skincare_routine": skincare_routine,
                "natural_precautions": natural_precautions,
            }
        else:
            analysis_result = AnalysisResult(
                id=uuid.uuid4(),
                session_id=session.id,
                extracted_ingredients=request.ingredients,
                suitability_score=score_result["score"],
                score_category=score_result["category"],
                beneficial_ingredients=score_result["beneficial"],
                harmful_ingredients=score_result["harmful"],
                ai_explanation=ai_result.get("ai_explanation", "Analysis completed."),
                recommended_products=recommended_products,
                skincare_routine=skincare_routine,
                natural_precautions=natural_precautions,
            )
            db.add(analysis_result)
            await db.flush()

        # Build response
        return AnalysisResponse(
            session_id=str(session.id),
            suitability_score=score_result["score"],
            score_category=score_result["category"],
            extracted_ingredients=request.ingredients,
            beneficial_ingredients=score_result["beneficial"],
            harmful_ingredients=score_result["harmful"],
            ai_explanation=ai_result.get("ai_explanation", "Analysis completed."),
            recommended_products=recommended_products,
            skincare_routine=skincare_routine,
            natural_precautions=natural_precautions,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}",
        )

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Session, AnalysisResult
from app.schemas import ResultsResponse
import uuid

router = APIRouter(prefix="/api", tags=["Results"])


@router.get("/results/{session_id}", response_model=ResultsResponse)
async def get_results(
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve complete analysis results for a session."""

    try:
        sid = uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID")

    # Get session with profile data
    stmt = select(Session).where(Session.id == sid)
    result = await db.execute(stmt)
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get latest analysis result
    stmt = (
        select(AnalysisResult)
        .where(AnalysisResult.session_id == sid)
        .order_by(AnalysisResult.created_at.desc())
        .limit(1)
    )
    result = await db.execute(stmt)
    analysis = result.scalar_one_or_none()

    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis results found for this session")

    return ResultsResponse(
        session_id=str(session.id),
        suitability_score=analysis.suitability_score or 0,
        score_category=analysis.score_category or "Unknown",
        extracted_ingredients=analysis.extracted_ingredients or [],
        beneficial_ingredients=analysis.beneficial_ingredients or [],
        harmful_ingredients=analysis.harmful_ingredients or [],
        ai_explanation=analysis.ai_explanation or "",
        recommended_products=analysis.recommended_products or [],
        skincare_routine=analysis.skincare_routine or {"morning": [], "night": []},
        natural_precautions=analysis.natural_precautions or [],
        profile={
            "name": session.name,
            "age": session.age,
            "gender": session.gender,
            "place": session.place,
        },
        skin_analysis={
            "skin_type": session.skin_type,
            "skin_issues": session.skin_issues,
            "issue_duration": session.issue_duration,
            "severity": session.severity,
        },
        created_at=analysis.created_at.isoformat() if analysis.created_at else None,
    )

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Session
from app.schemas import SkinAnalysisRequest, SkinAnalysisResponse
import uuid

router = APIRouter(prefix="/api", tags=["Skin Analysis"])


@router.post("/skin-analysis", response_model=SkinAnalysisResponse)
async def save_skin_analysis(
    analysis: SkinAnalysisRequest,
    db: AsyncSession = Depends(get_db),
):
    """Save skin analysis data to an existing session."""
    try:
        session_id = uuid.UUID(analysis.session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID format")

    # Find the session
    stmt = select(Session).where(Session.id == session_id)
    result = await db.execute(stmt)
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Update session with skin analysis data
    session.skin_type = analysis.skin_type
    session.skin_issues = analysis.skin_issues
    session.issue_duration = analysis.issue_duration
    session.severity = analysis.severity

    await db.flush()

    return SkinAnalysisResponse(
        status="ok",
        message="Skin analysis saved successfully",
    )

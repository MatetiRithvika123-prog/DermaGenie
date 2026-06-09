from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Session
from app.schemas import ProfileRequest, ProfileResponse
import uuid

router = APIRouter(prefix="/api", tags=["Profile"])


@router.post("/profile", response_model=ProfileResponse)
async def create_profile(
    profile: ProfileRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create a new user session with profile data."""
    try:
        session_id = uuid.uuid4()
        
        if db is None:
            from app.services.memory_store import memory_sessions
            memory_sessions[str(session_id)] = {
                "id": str(session_id),
                "name": profile.name,
                "age": profile.age,
                "gender": profile.gender,
                "place": profile.place,
            }
        else:
            session = Session(
                id=session_id,
                name=profile.name,
                age=profile.age,
                gender=profile.gender,
                place=profile.place,
            )
            db.add(session)
            await db.flush()

        return ProfileResponse(
            session_id=str(session_id),
            message="Profile saved successfully",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save profile: {str(e)}")

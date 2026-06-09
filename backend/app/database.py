from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

# Global flag for database availability
# If it contains the placeholder 'your_password' or 'your_project_ref', we know it's not configured
DB_AVAILABLE = "your_password" not in settings.DATABASE_URL and "your_project_ref" not in settings.DATABASE_URL

# asyncpg does not accept the pgbouncer query parameter
clean_db_url = settings.DATABASE_URL.replace("?pgbouncer=true&", "?").replace("?pgbouncer=true", "").replace("&pgbouncer=true", "")

engine = create_async_engine(
    clean_db_url,
    echo=False,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    prepared_statement_cache_size=0,
    connect_args={"statement_cache_size": 0},
)

async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    """Dependency that provides an async database session."""
    global DB_AVAILABLE
    if not DB_AVAILABLE:
        yield None
        return

    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def create_tables():
    """Create all database tables."""
    if not DB_AVAILABLE:
        return
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

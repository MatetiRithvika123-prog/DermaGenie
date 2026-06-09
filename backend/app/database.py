from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

# Global flag for database availability
# If it contains the placeholder 'your_password' or 'your_project_ref', we know it's not configured
DB_AVAILABLE = "your_password" not in settings.DATABASE_URL and "your_project_ref" not in settings.DATABASE_URL

import urllib.parse

# asyncpg does not accept the pgbouncer query parameter
clean_db_url = settings.DATABASE_URL.replace("?pgbouncer=true&", "?").replace("?pgbouncer=true", "").replace("&pgbouncer=true", "")

# MIGRATION: Switch from Transaction Pooler (6543) to Session Pooler (5432) to prevent DuplicatePreparedStatementError
clean_db_url = clean_db_url.replace(":6543/", ":5432/")

print("=" * 80)
print("DATABASE CONFIGURATION DIAGNOSTICS")
parsed_url = urllib.parse.urlparse(clean_db_url)
print(f"HOST: {parsed_url.hostname}")
print(f"PORT: {parsed_url.port}")
print(f"PGBOUNCER REMOVED: {'pgbouncer' not in clean_db_url}")
print(f"STATEMENT CACHE: Disabled (0)")
print("=" * 80)

from sqlalchemy.pool import NullPool

# If they still forced 6543 somehow, use NullPool to prevent asyncpg from caching across connections
is_transaction_pooler = "6543" in clean_db_url

engine_kwargs = {
    "echo": False,
    "connect_args": {"statement_cache_size": 0},
}

if is_transaction_pooler:
    engine_kwargs["poolclass"] = NullPool
else:
    engine_kwargs["pool_size"] = 20
    engine_kwargs["max_overflow"] = 10
    engine_kwargs["pool_pre_ping"] = True

engine = create_async_engine(clean_db_url, **engine_kwargs)

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

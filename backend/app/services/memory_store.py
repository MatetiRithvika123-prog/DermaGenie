from typing import Dict, Any
from uuid import UUID

# In-memory storage for local fallback when the database is unavailable
memory_sessions: Dict[str, Any] = {}
memory_results: Dict[str, Any] = {}

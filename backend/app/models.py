import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Text, DateTime, JSON, ForeignKey, Boolean, Index
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Session(Base):
    """User session - holds profile and skin analysis data."""
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    place = Column(String(100), nullable=False)
    skin_type = Column(String(50), nullable=True)
    skin_issues = Column(JSON, nullable=True)  # list of strings
    issue_duration = Column(String(50), nullable=True)
    severity = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    analysis_results = relationship("AnalysisResult", back_populates="session", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_sessions_created_at", "created_at"),
    )


class Ingredient(Base):
    """Skincare ingredient with properties and skin type compatibility."""
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ingredient_name = Column(String(200), nullable=False, unique=True)
    category = Column(String(100), nullable=False)  # e.g., Humectant, Emollient, Active, Preservative
    benefits = Column(Text, nullable=True)
    risks = Column(Text, nullable=True)
    recommended_skin_types = Column(JSON, nullable=True)  # list of skin types
    avoid_skin_types = Column(JSON, nullable=True)  # list of skin types
    severity_score = Column(Float, default=0.0)  # 0-10, how harsh/irritating
    is_natural = Column(Boolean, default=False)
    comedogenic_rating = Column(Integer, default=0)  # 0-5

    __table_args__ = (
        Index("ix_ingredients_name", "ingredient_name"),
        Index("ix_ingredients_category", "category"),
    )


class Product(Base):
    """Skincare product with ingredient list."""
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_name = Column(String(300), nullable=False)
    brand = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)  # Cleanser, Moisturizer, Sunscreen, etc.
    description = Column(Text, nullable=True)
    key_ingredients = Column(JSON, nullable=True)  # list of key ingredient names
    all_ingredients = Column(JSON, nullable=True)  # full ingredient list
    skin_types = Column(JSON, nullable=True)  # recommended skin types
    skin_concerns = Column(JSON, nullable=True)  # addresses these concerns
    price_range = Column(String(50), nullable=True)  # $, $$, $$$
    usage_frequency = Column(String(100), nullable=True)  # e.g., "Twice daily"
    expected_results = Column(String(100), nullable=True)  # e.g., "2-4 weeks"

    __table_args__ = (
        Index("ix_products_brand", "brand"),
        Index("ix_products_category", "category"),
    )


class SkinCondition(Base):
    """Skin condition/concern reference data."""
    __tablename__ = "skin_conditions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    condition_name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    recommended_ingredients = Column(JSON, nullable=True)  # list of ingredient names
    avoid_ingredients = Column(JSON, nullable=True)  # list of ingredient names
    severity_factors = Column(JSON, nullable=True)

    __table_args__ = (
        Index("ix_skin_conditions_name", "condition_name"),
    )


class AnalysisResult(Base):
    """Complete analysis result for a user session."""
    __tablename__ = "analysis_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    extracted_ingredients = Column(JSON, nullable=True)  # list of ingredient strings from OCR
    suitability_score = Column(Float, nullable=True)  # 0-100
    score_category = Column(String(50), nullable=True)  # Excellent/Recommended/Caution/Not Recommended
    beneficial_ingredients = Column(JSON, nullable=True)  # list of {name, benefit, impact}
    harmful_ingredients = Column(JSON, nullable=True)  # list of {name, reason, risk_level}
    ai_explanation = Column(Text, nullable=True)
    recommended_products = Column(JSON, nullable=True)  # list of product recommendations
    skincare_routine = Column(JSON, nullable=True)  # {morning: [...], night: [...]}
    natural_precautions = Column(JSON, nullable=True)  # list of precaution strings
    raw_ocr_text = Column(Text, nullable=True)
    uploaded_image_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    session = relationship("Session", back_populates="analysis_results")

    __table_args__ = (
        Index("ix_analysis_results_session_id", "session_id"),
    )

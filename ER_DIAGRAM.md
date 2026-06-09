# DermaGenie — ER Diagram

## Database Schema

```mermaid
erDiagram
    SESSIONS {
        UUID id PK
        VARCHAR name
        INT age
        VARCHAR gender
        VARCHAR place
        VARCHAR skin_type
        JSON skin_issues
        VARCHAR issue_duration
        INT severity
        DATETIME created_at
        DATETIME updated_at
    }

    INGREDIENTS {
        INT id PK
        VARCHAR ingredient_name UK
        VARCHAR category
        TEXT benefits
        TEXT risks
        JSON recommended_skin_types
        JSON avoid_skin_types
        FLOAT severity_score
        BOOLEAN is_natural
        INT comedogenic_rating
    }

    PRODUCTS {
        INT id PK
        VARCHAR product_name
        VARCHAR brand
        VARCHAR category
        TEXT description
        JSON key_ingredients
        JSON all_ingredients
        JSON skin_types
        JSON skin_concerns
        VARCHAR price_range
        VARCHAR usage_frequency
        VARCHAR expected_results
    }

    SKIN_CONDITIONS {
        INT id PK
        VARCHAR condition_name UK
        TEXT description
        JSON recommended_ingredients
        JSON avoid_ingredients
        JSON severity_factors
    }

    ANALYSIS_RESULTS {
        UUID id PK
        UUID session_id FK
        JSON extracted_ingredients
        FLOAT suitability_score
        VARCHAR score_category
        JSON beneficial_ingredients
        JSON harmful_ingredients
        TEXT ai_explanation
        JSON recommended_products
        JSON skincare_routine
        JSON natural_precautions
        TEXT raw_ocr_text
        VARCHAR uploaded_image_path
        DATETIME created_at
    }

    SESSIONS ||--o{ ANALYSIS_RESULTS : "has many"
```

## Table Descriptions

### sessions
Stores the user's profile and skin assessment data. Each user interaction creates a new session (no authentication). The `skin_type`, `skin_issues`, `issue_duration`, and `severity` fields are populated after the skin analysis step.

### ingredients
Reference table of 80+ skincare ingredients with metadata: benefits, risks, skin type compatibility, comedogenic rating, and severity score. Used by the scoring engine to evaluate extracted ingredients.

### products
Reference table of 40+ real skincare products with their key ingredients, target skin types, and skin concerns. Used by the recommendation engine and seeded by `seed_data.py`.

### skin_conditions
Reference table of 13 common skin conditions with recommended and avoid ingredient lists. Used by the scoring engine to apply condition-specific bonuses and penalties.

### analysis_results
Stores the complete output of each analysis: suitability score, beneficial/harmful ingredients, AI explanation, product recommendations, skincare routine, and natural precautions. Linked to a session via `session_id` FK.

## Relationships

- **sessions → analysis_results**: One-to-many. A session can have multiple analyses (one per product upload).
- **ingredients**: Standalone reference table. Queried by the scoring engine via `ILIKE` matching against extracted ingredient names.
- **products**: Standalone reference table. Used by the Gemini AI and recommendation engine.
- **skin_conditions**: Standalone reference table. Cross-referenced during scoring to apply condition-specific adjustments.

## Indexes

| Table | Index | Columns |
|---|---|---|
| sessions | ix_sessions_created_at | created_at |
| ingredients | ix_ingredients_name | ingredient_name |
| ingredients | ix_ingredients_category | category |
| products | ix_products_brand | brand |
| products | ix_products_category | category |
| skin_conditions | ix_skin_conditions_name | condition_name |
| analysis_results | ix_analysis_results_session_id | session_id |

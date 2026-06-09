# DermaGenie API Documentation

Base URL: `http://localhost:8000`

Interactive docs: `http://localhost:8000/docs` (Swagger UI) | `http://localhost:8000/redoc` (ReDoc)

---

## Endpoints

### 1. Health Check

| | |
|---|---|
| **GET** | `/` |
| **GET** | `/health` |

**Response (200)**
```json
{ "name": "DermaGenie API", "version": "1.0.0", "status": "running", "docs": "/docs" }
```

---

### 2. Create Profile

| | |
|---|---|
| **POST** | `/api/profile` |

Creates a new user session with profile data. Returns a `session_id` used for all subsequent requests.

**Request Body**
```json
{
  "name": "John Doe",     // string, required, 1-100 chars
  "age": 25,              // integer, required, 1-120
  "gender": "Male",       // "Male" | "Female" | "Other"
  "place": "New York"     // string, required, 1-100 chars
}
```

**Response (200)**
```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "message": "Profile saved successfully"
}
```

**Errors**
- `422`: Validation error (invalid field values)
- `500`: Internal server error

---

### 3. Save Skin Analysis

| | |
|---|---|
| **POST** | `/api/skin-analysis` |

Saves the user's skin assessment data to the existing session.

**Request Body**
```json
{
  "session_id": "uuid-string",
  "skin_type": "Oily",            // "Oily" | "Dry" | "Combination" | "Normal" | "Sensitive"
  "skin_issues": ["Acne", "Dark Spots"],  // array of strings, min 1
  "issue_duration": "1-3 Months",
  "severity": 7                    // integer, 1-10
}
```

**Response (200)**
```json
{
  "status": "ok",
  "message": "Skin analysis saved successfully"
}
```

**Errors**
- `400`: Invalid session ID format
- `404`: Session not found
- `422`: Validation error

---

### 4. Upload Ingredient Image (OCR)

| | |
|---|---|
| **POST** | `/api/ingredients/upload` |

Uploads a product ingredient image, runs OCR to extract text, then parses individual ingredients.

**Request** — `multipart/form-data`
| Field | Type | Description |
|---|---|---|
| `file` | File | JPG, JPEG, or PNG image (max 10MB) |
| `session_id` | string | Session UUID |

**Response (200)**
```json
{
  "ingredients": ["Hyaluronic Acid", "Glycerin", "Niacinamide", "Ceramides"],
  "raw_text": "Ingredients: Hyaluronic Acid, Glycerin, ...",
  "ingredient_count": 4
}
```

**Errors**
- `400`: No file / unsupported type / too large / empty file
- `422`: Could not extract text or identify ingredients
- `500`: OCR processing failed

---

### 5. Run Product Analysis

| | |
|---|---|
| **POST** | `/api/analyze` |

The core endpoint. Runs the **scoring engine** + **Gemini AI** to produce a complete analysis.

**Request Body**
```json
{
  "session_id": "uuid-string",
  "ingredients": ["Hyaluronic Acid", "Glycerin", "Niacinamide"]
}
```

**Response (200)**
```json
{
  "session_id": "uuid-string",
  "suitability_score": 82.5,
  "score_category": "Recommended",
  "extracted_ingredients": ["Hyaluronic Acid", "Glycerin", "Niacinamide"],
  "beneficial_ingredients": [
    {
      "name": "Hyaluronic Acid",
      "benefit": "Attracts and retains moisture, plumps skin",
      "impact_percentage": 85
    }
  ],
  "harmful_ingredients": [
    {
      "name": "Fragrance",
      "reason": "Major irritant for sensitive skin",
      "risk_level": "High"
    }
  ],
  "ai_explanation": "Hi John, based on your oily skin type...",
  "recommended_products": [
    {
      "product_name": "CeraVe Moisturizing Cream",
      "brand": "CeraVe",
      "why_recommended": "Contains ceramides ideal for your skin",
      "key_ingredients": ["Ceramides", "Hyaluronic Acid"],
      "expected_result_time": "2-4 Weeks",
      "usage_frequency": "Twice Daily",
      "category": "Moisturizer"
    }
  ],
  "skincare_routine": {
    "morning": [
      {
        "step": 1,
        "product_type": "Gentle Cleanser",
        "instruction": "Wash with lukewarm water",
        "recommended_product": "CeraVe Hydrating Cleanser"
      }
    ],
    "night": [
      {
        "step": 1,
        "product_type": "Cleanser",
        "instruction": "Double cleanse",
        "recommended_product": null
      }
    ]
  },
  "natural_precautions": [
    "Drink 2-3 liters of water daily",
    "Avoid touching your face"
  ]
}
```

**Score Categories**
| Score Range | Category |
|---|---|
| 90-100 | Excellent Match |
| 75-89 | Recommended |
| 60-74 | Use With Caution |
| 0-59 | Not Recommended |

**Errors**
- `400`: Invalid session / missing skin analysis / no ingredients
- `404`: Session not found
- `500`: Analysis failed

---

### 6. Get Results

| | |
|---|---|
| **GET** | `/api/results/{session_id}` |

Retrieves the saved analysis results for a session.

**Path Parameter**
- `session_id`: UUID string

**Response (200)** — Same as `/api/analyze` response, plus:
```json
{
  "profile": { "name": "John", "age": 25, "gender": "Male", "place": "NY" },
  "skin_analysis": { "skin_type": "Oily", "skin_issues": ["Acne"], "severity": 7 },
  "created_at": "2026-06-09T10:30:00"
}
```

**Errors**
- `400`: Invalid session ID
- `404`: Session or results not found

---

## Data Flow

```
Profile → Skin Analysis → Image Upload (OCR) → Scoring + AI → Results Dashboard
```

1. **Profile** creates a session with a UUID
2. **Skin Analysis** attaches skin data to the session
3. **Ingredient Upload** runs Tesseract OCR to extract ingredients from an image
4. **Analyze** runs the scoring engine (database-backed) + Gemini AI (generative) and saves to `analysis_results`
5. **Results** retrieves the saved analysis for display

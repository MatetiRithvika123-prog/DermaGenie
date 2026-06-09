import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Profile ──────────────────────────────────────────────

export async function createProfile(data: {
  name: string;
  age: number;
  gender: string;
  place: string;
}): Promise<{ session_id: string; message: string }> {
  const response = await api.post("/api/profile", data);
  return response.data;
}

// ─── Skin Analysis ────────────────────────────────────────

export async function saveSkinAnalysis(data: {
  session_id: string;
  skin_type: string;
  skin_issues: string[];
  issue_duration: string;
  severity: number;
}): Promise<{ status: string; message: string }> {
  const response = await api.post("/api/skin-analysis", data);
  return response.data;
}

// ─── Ingredient Upload ────────────────────────────────────

export async function uploadIngredientImage(
  file: File,
  sessionId: string
): Promise<{
  ingredients: string[];
  raw_text: string;
  ingredient_count: number;
}> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("session_id", sessionId);

  const response = await api.post("/api/ingredients/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

// ─── Analysis ─────────────────────────────────────────────

export async function analyzeProduct(data: {
  session_id: string;
  ingredients: string[];
}): Promise<{
  session_id: string;
  suitability_score: number;
  score_category: string;
  extracted_ingredients: string[];
  beneficial_ingredients: Array<{
    name: string;
    benefit: string;
    impact_percentage: number;
  }>;
  harmful_ingredients: Array<{
    name: string;
    reason: string;
    risk_level: string;
  }>;
  ai_explanation: string;
  recommended_products: Array<{
    product_name: string;
    brand: string;
    why_recommended: string;
    key_ingredients: string[];
    expected_result_time: string;
    usage_frequency: string;
    category: string;
  }>;
  skincare_routine: {
    morning: Array<{
      step: number;
      product_type: string;
      instruction: string;
      recommended_product?: string | null;
    }>;
    night: Array<{
      step: number;
      product_type: string;
      instruction: string;
      recommended_product?: string | null;
    }>;
  };
  natural_precautions: string[];
}> {
  const response = await api.post("/api/analyze", data);
  return response.data;
}

// ─── Results ──────────────────────────────────────────────

export async function getResults(sessionId: string) {
  const response = await api.get(`/api/results/${sessionId}`);
  return response.data;
}

export default api;

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Profile {
  name: string;
  age: number;
  gender: string;
  place: string;
}

export interface SkinAnalysis {
  skinType: string;
  skinIssues: string[];
  issueDuration: string;
  severity: number;
}

export interface BeneficialIngredient {
  name: string;
  benefit: string;
  impact_percentage: number;
}

export interface HarmfulIngredient {
  name: string;
  reason: string;
  risk_level: string;
}

export interface RecommendedProduct {
  product_name: string;
  brand: string;
  why_recommended: string;
  key_ingredients: string[];
  expected_result_time: string;
  usage_frequency: string;
  category: string;
}

export interface SkincareStep {
  step: number;
  product_type: string;
  instruction: string;
  recommended_product?: string | null;
}

export interface AnalysisResults {
  sessionId: string;
  suitabilityScore: number;
  scoreCategory: string;
  extractedIngredients: string[];
  beneficialIngredients: BeneficialIngredient[];
  harmfulIngredients: HarmfulIngredient[];
  aiExplanation: string;
  recommendedProducts: RecommendedProduct[];
  skincareRoutine: {
    morning: SkincareStep[];
    night: SkincareStep[];
  };
  naturalPrecautions: string[];
}

interface DermaGenieState {
  // Session
  sessionId: string | null;
  setSessionId: (id: string) => void;

  // Profile
  profile: Profile | null;
  setProfile: (profile: Profile) => void;

  // Skin Analysis
  skinAnalysis: SkinAnalysis | null;
  setSkinAnalysis: (analysis: SkinAnalysis) => void;

  // Extracted Ingredients
  extractedIngredients: string[];
  setExtractedIngredients: (ingredients: string[]) => void;

  // Analysis Results
  results: AnalysisResults | null;
  setResults: (results: AnalysisResults) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Reset
  reset: () => void;
}

export const useStore = create<DermaGenieState>()(
  persist(
    (set) => ({
      sessionId: null,
      setSessionId: (id) => set({ sessionId: id }),

      profile: null,
      setProfile: (profile) => set({ profile }),

      skinAnalysis: null,
      setSkinAnalysis: (analysis) => set({ skinAnalysis: analysis }),

      extractedIngredients: [],
      setExtractedIngredients: (ingredients) =>
        set({ extractedIngredients: ingredients }),

      results: null,
      setResults: (results) => set({ results }),

      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      reset: () =>
        set({
          sessionId: null,
          profile: null,
          skinAnalysis: null,
          extractedIngredients: [],
          results: null,
          isLoading: false,
        }),
    }),
    {
      name: "dermagenie-store",
    }
  )
);

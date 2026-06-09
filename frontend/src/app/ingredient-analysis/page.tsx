"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  FlaskConical,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Header from "@/components/layout/Header";
import AnimatedBackground from "@/components/layout/AnimatedBackground";
import { useStore } from "@/lib/store";
import { uploadIngredientImage, analyzeProduct } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

type UploadState = "idle" | "uploading" | "extracted" | "analyzing" | "error";

export default function IngredientAnalysisPage() {
  const router = useRouter();
  const { sessionId, setExtractedIngredients, setResults } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setState("idle");
      setError("");
      setIngredients([]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setState("idle");
    setIngredients([]);
    setError("");
  };

  const handleExtract = async () => {
    if (!file) return;

    setState("uploading");
    setError("");
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 90));
    }, 200);

    try {
      const sid = sessionId || "local-" + Date.now();
      const result = await uploadIngredientImage(file, sid);
      clearInterval(progressInterval);
      setProgress(100);
      setIngredients(result.ingredients);
      setExtractedIngredients(result.ingredients);
      setState("extracted");
    } catch (err: unknown) {
      clearInterval(progressInterval);
      const message = err instanceof Error ? err.message : "Failed to extract ingredients. Please try with a clearer image.";
      setError(message);
      setState("error");
    }
  };

  const handleAnalyze = async () => {
    if (ingredients.length === 0) return;

    setState("analyzing");
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 90));
    }, 300);

    try {
      const sid = sessionId || "local-" + Date.now();
      const result = await analyzeProduct({
        session_id: sid,
        ingredients,
      });

      clearInterval(progressInterval);
      setProgress(100);

      setResults({
        sessionId: result.session_id,
        suitabilityScore: result.suitability_score,
        scoreCategory: result.score_category,
        extractedIngredients: result.extracted_ingredients,
        beneficialIngredients: result.beneficial_ingredients,
        harmfulIngredients: result.harmful_ingredients,
        aiExplanation: result.ai_explanation,
        recommendedProducts: result.recommended_products,
        skincareRoutine: result.skincare_routine,
        naturalPrecautions: result.natural_precautions,
      });

      router.push("/results");
    } catch (_err) {
      clearInterval(progressInterval);
      setError("Analysis failed. Please check your connection and try again.");
      setState("extracted"); // Go back to extracted state
    }
  };

  return (
    <>
      <AnimatedBackground />
      <Header />
      <main className="min-h-screen pt-[100px] pb-12 px-6">
        <div className="max-w-[640px] mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="card-elevated p-8 md:p-12"
          >
            {/* Title */}
            <motion.div variants={fadeUp} custom={0} className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] mx-auto mb-6 flex items-center justify-center shadow-lg">
                <FlaskConical className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-[32px] md:text-[36px] font-bold text-[#0F172A] mb-2">
                Ingredient Analysis
              </h1>
              <p className="text-[16px] text-[#64748B]">
                Upload the ingredient list image from your skincare product.
              </p>
            </motion.div>

            {/* Upload Zone */}
            <motion.div variants={fadeUp} custom={1}>
              {!file ? (
                <div
                  {...getRootProps()}
                  className={`upload-zone ${isDragActive ? "upload-zone-active" : ""}`}
                >
                  <input {...getInputProps()} />
                  <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mb-2">
                    <Upload className="w-7 h-7 text-[#2563EB]" />
                  </div>
                  <p className="text-[16px] font-semibold text-[#0F172A]">
                    {isDragActive
                      ? "Drop the image here"
                      : "Drag & drop your image here"}
                  </p>
                  <p className="text-[14px] text-[#94A3B8]">
                    or click to browse • JPG, PNG, JPEG
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <ImageIcon className="w-4 h-4 text-[#94A3B8]" />
                    <span className="text-[13px] text-[#94A3B8]">
                      Max file size: 10MB
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-[var(--radius-card)] overflow-hidden border-2 border-[#E2E8F0]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview!}
                    alt="Uploaded ingredient list"
                    className="w-full h-[280px] object-contain bg-[#F8FAFC]"
                  />
                  {state === "idle" && (
                    <button
                      onClick={removeFile}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-md"
                    >
                      <X className="w-4 h-4 text-[#64748B]" />
                    </button>
                  )}
                  {/* Progress overlay */}
                  <AnimatePresence>
                    {(state === "uploading" || state === "analyzing") && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center"
                      >
                        <Loader2 className="w-10 h-10 text-[#2563EB] animate-spin mb-4" />
                        <p className="text-[16px] font-semibold text-[#0F172A] mb-2">
                          {state === "uploading"
                            ? "Extracting Ingredients..."
                            : "Running AI Analysis..."}
                        </p>
                        <div className="w-48 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA] rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <p className="text-[13px] text-[#94A3B8] mt-2">
                          {progress}% complete
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 rounded-xl bg-[#FEE2E2] border border-[#FECACA] flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[14px] text-[#DC2626] font-medium">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Extracted Ingredients */}
            <AnimatePresence>
              {state === "extracted" && ingredients.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                    <span className="text-[15px] font-semibold text-[#15803D]">
                      {ingredients.length} ingredients extracted
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map((ing) => (
                      <span key={ing} className="pill pill-green text-[13px]">
                        {ing}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Button */}
            <motion.div variants={fadeUp} custom={2} className="mt-8">
              {state === "idle" && file && (
                <button
                  onClick={handleExtract}
                  className="btn-primary w-full h-[60px] text-[17px]"
                >
                  Extract Ingredients
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
              {state === "extracted" && (
                <button
                  onClick={handleAnalyze}
                  className="btn-primary w-full h-[60px] text-[17px]"
                >
                  Analyze Product
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
              {state === "error" && (
                <div className="flex gap-3">
                  <button
                    onClick={removeFile}
                    className="flex-1 h-[56px] rounded-2xl border-2 border-[#E2E8F0] text-[#64748B] font-medium hover:border-[#94A3B8] transition-colors"
                  >
                    Upload Different Image
                  </button>
                  <button
                    onClick={handleExtract}
                    className="flex-1 btn-primary h-[56px]"
                  >
                    Retry
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </main>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Sun,
  Moon,
  Leaf,
  Package,
  Brain,
  Droplets,
  Clock,
  RefreshCw,
  Heart,
} from "lucide-react";
import Header from "@/components/layout/Header";
import AnimatedBackground from "@/components/layout/AnimatedBackground";
import { useStore } from "@/lib/store";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

function getScoreColor(score: number) {
  if (score >= 90) return "#22C55E";
  if (score >= 75) return "#3B82F6";
  if (score >= 60) return "#F59E0B";
  return "#EF4444";
}

function getScoreBadgeStyle(category: string) {
  switch (category) {
    case "Excellent Match":
      return "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]";
    case "Recommended":
      return "bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]";
    case "Use With Caution":
      return "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]";
    default:
      return "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]";
  }
}

function getRiskBadgeStyle(level: string) {
  switch (level) {
    case "Low":
      return "pill-yellow";
    case "Medium":
      return "pill-yellow";
    case "High":
      return "pill-red";
    default:
      return "pill-blue";
  }
}

export default function ResultsPage() {
  const router = useRouter();
  const { results, profile, skinAnalysis } = useStore();
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!results) {
      router.push("/profile");
      return;
    }
    // Animate score
    const target = results.suitabilityScore;
    const duration = 1500;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [results, router]);

  if (!results) return null;

  const scoreColor = getScoreColor(results.suitabilityScore);
  const badgeStyle = getScoreBadgeStyle(results.scoreCategory);

  return (
    <>
      <AnimatedBackground />
      <Header />
      <main className="min-h-screen pt-[100px] pb-16 px-6">
        <div className="max-w-[900px] mx-auto">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push("/ingredient-analysis")}
            className="flex items-center gap-2 text-[15px] text-[#64748B] hover:text-[#2563EB] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Analysis
          </motion.button>

          {/* ═══ Section 1: Suitability Score ═══ */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="card-elevated p-8 md:p-12 text-center mb-8"
          >
            <h1 className="text-[28px] md:text-[36px] font-bold text-[#0F172A] mb-2">
              Product Analysis Results
            </h1>
            {profile && (
              <p className="text-[16px] text-[#64748B] mb-8">
                Personalized results for <span className="font-semibold text-[#0F172A]">{profile.name}</span>
              </p>
            )}

            <div className="w-[180px] h-[180px] mx-auto mb-6 score-ring">
              <CircularProgressbar
                value={animatedScore}
                text={`${animatedScore}%`}
                styles={buildStyles({
                  pathColor: scoreColor,
                  textColor: "#0F172A",
                  trailColor: "#E2E8F0",
                  pathTransitionDuration: 0,
                  textSize: "24px",
                })}
                strokeWidth={10}
              />
            </div>

            <span
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[15px] font-semibold border ${badgeStyle}`}
            >
              {results.suitabilityScore >= 75 ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <ShieldAlert className="w-4 h-4" />
              )}
              {results.scoreCategory}
            </span>

            {skinAnalysis && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="pill pill-blue text-[13px]">{skinAnalysis.skinType} Skin</span>
                {skinAnalysis.skinIssues.slice(0, 3).map((issue) => (
                  <span key={issue} className="pill pill-blue text-[13px]">
                    {issue}
                  </span>
                ))}
                <span className="pill pill-yellow text-[13px]">
                  Severity: {skinAnalysis.severity}/10
                </span>
              </div>
            )}
          </motion.div>

          {/* ═══ Section 2: Extracted Ingredients ═══ */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className="card-elevated p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
                <Droplets className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div>
                <h2 className="text-[22px] font-bold text-[#0F172A]">
                  Extracted Ingredients
                </h2>
                <p className="text-[14px] text-[#94A3B8]">
                  {results.extractedIngredients.length} ingredients detected
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {results.extractedIngredients.map((ing) => (
                <span key={ing} className="pill pill-blue">
                  {ing}
                </span>
              ))}
            </div>
          </motion.div>

          {/* ═══ Section 3: Beneficial Ingredients ═══ */}
          {results.beneficialIngredients.length > 0 && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={2}
              className="card-elevated p-8 mb-8"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                </div>
                <h2 className="text-[22px] font-bold text-[#0F172A]">
                  Beneficial Ingredients
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {results.beneficialIngredients.map((ing) => (
                  <div
                    key={ing.name}
                    className="rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[16px] font-bold text-[#15803D]">
                        {ing.name}
                      </span>
                      <span className="text-[13px] font-semibold text-[#22C55E] bg-[#DCFCE7] px-2.5 py-1 rounded-full">
                        +{ing.impact_percentage}%
                      </span>
                    </div>
                    <p className="text-[14px] text-[#4B5563] leading-relaxed">
                      {ing.benefit}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══ Section 4: Harmful Ingredients ═══ */}
          {results.harmfulIngredients.length > 0 && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={3}
              className="card-elevated p-8 mb-8"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                </div>
                <h2 className="text-[22px] font-bold text-[#0F172A]">
                  Ingredients That May Worsen Your Skin
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {results.harmfulIngredients.map((ing) => (
                  <div
                    key={ing.name}
                    className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[16px] font-bold text-[#DC2626]">
                        {ing.name}
                      </span>
                      <span className={`pill text-[12px] !py-1 !px-2.5 ${getRiskBadgeStyle(ing.risk_level)}`}>
                        {ing.risk_level} Risk
                      </span>
                    </div>
                    <p className="text-[14px] text-[#4B5563] leading-relaxed">
                      {ing.reason}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══ Section 5: AI Explanation ═══ */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={4}
            className="card-elevated p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#60A5FA] flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-[22px] font-bold text-[#0F172A]">
                AI Analysis
              </h2>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#EFF6FF] to-[#F8FAFC] border border-[#BFDBFE]">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#2563EB] mt-0.5 flex-shrink-0" />
                <p className="text-[16px] text-[#374151] leading-relaxed">
                  {results.aiExplanation}
                </p>
              </div>
            </div>
          </motion.div>

          {/* ═══ Section 6: Recommended Products ═══ */}
          {results.recommendedProducts.length > 0 && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={5}
              className="card-elevated p-8 mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <h2 className="text-[22px] font-bold text-[#0F172A]">
                  Recommended Products
                </h2>
              </div>
              <div className="grid gap-5">
                {results.recommendedProducts.map((product, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#E2E8F0] bg-white p-6 hover:shadow-lg hover:border-[#BFDBFE] transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="pill pill-blue text-[12px] !py-0.5">
                            {product.category}
                          </span>
                        </div>
                        <h3 className="text-[18px] font-bold text-[#0F172A] mb-1">
                          {product.product_name}
                        </h3>
                        <p className="text-[14px] text-[#64748B] mb-3">
                          by {product.brand}
                        </p>
                        <p className="text-[15px] text-[#4B5563] mb-3">
                          {product.why_recommended}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {product.key_ingredients.map((ki) => (
                            <span key={ki} className="pill pill-green text-[12px] !py-1">
                              {ki}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex md:flex-col gap-4 md:gap-3 md:items-end md:text-right flex-shrink-0">
                        <div className="flex items-center gap-2 text-[14px] text-[#64748B]">
                          <Clock className="w-4 h-4 text-[#2563EB]" />
                          {product.expected_result_time}
                        </div>
                        <div className="flex items-center gap-2 text-[14px] text-[#64748B]">
                          <RefreshCw className="w-4 h-4 text-[#22C55E]" />
                          {product.usage_frequency}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══ Section 7: Personalized Skincare Routine ═══ */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={6}
            className="card-elevated p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#D97706]" />
              </div>
              <h2 className="text-[22px] font-bold text-[#0F172A]">
                Personalized Skincare Routine
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Morning */}
              <div className="rounded-2xl border border-[#FDE68A] bg-gradient-to-b from-[#FFFBEB] to-white p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Sun className="w-5 h-5 text-[#F59E0B]" />
                  <h3 className="text-[18px] font-bold text-[#0F172A]">
                    Morning Routine
                  </h3>
                </div>
                <div className="space-y-4">
                  {results.skincareRoutine.morning.map((step) => (
                    <div key={step.step} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] flex items-center justify-center flex-shrink-0 text-[14px] font-bold text-[#D97706]">
                        {step.step}
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-[#0F172A]">
                          {step.product_type}
                        </p>
                        <p className="text-[14px] text-[#64748B] mt-0.5">
                          {step.instruction}
                        </p>
                        {step.recommended_product && (
                          <p className="text-[13px] text-[#2563EB] mt-1 font-medium">
                            → {step.recommended_product}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Night */}
              <div className="rounded-2xl border border-[#C7D2FE] bg-gradient-to-b from-[#EEF2FF] to-white p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Moon className="w-5 h-5 text-[#6366F1]" />
                  <h3 className="text-[18px] font-bold text-[#0F172A]">
                    Night Routine
                  </h3>
                </div>
                <div className="space-y-4">
                  {results.skincareRoutine.night.map((step) => (
                    <div key={step.step} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#E0E7FF] flex items-center justify-center flex-shrink-0 text-[14px] font-bold text-[#6366F1]">
                        {step.step}
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-[#0F172A]">
                          {step.product_type}
                        </p>
                        <p className="text-[14px] text-[#64748B] mt-0.5">
                          {step.instruction}
                        </p>
                        {step.recommended_product && (
                          <p className="text-[13px] text-[#2563EB] mt-1 font-medium">
                            → {step.recommended_product}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ═══ Section 8: Natural Precautions ═══ */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={7}
            className="card-elevated p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] flex items-center justify-center">
                <Leaf className="w-5 h-5 text-[#059669]" />
              </div>
              <h2 className="text-[22px] font-bold text-[#0F172A]">
                Natural Precautions
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {results.naturalPrecautions.map((precaution, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-xl bg-[#F0FDF4] border border-[#D1FAE5] hover:shadow-md transition-shadow"
                >
                  <Heart className="w-4 h-4 text-[#22C55E] mt-0.5 flex-shrink-0" />
                  <p className="text-[14px] text-[#374151] leading-relaxed">
                    {precaution}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ═══ New Analysis CTA ═══ */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={8}
            className="text-center mt-12"
          >
            <button
              onClick={() => {
                router.push("/ingredient-analysis");
              }}
              className="btn-primary px-10 h-[56px] text-[16px]"
            >
              Analyze Another Product
              <RefreshCw className="w-5 h-5" />
            </button>
            <p className="text-[13px] text-[#94A3B8] mt-4">
              Upload a different product to compare results
            </p>
          </motion.div>
        </div>
      </main>
    </>
  );
}

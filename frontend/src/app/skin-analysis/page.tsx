"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Stethoscope, ArrowRight, ChevronDown, Check } from "lucide-react";
import Header from "@/components/layout/Header";
import AnimatedBackground from "@/components/layout/AnimatedBackground";
import { useStore } from "@/lib/store";
import { saveSkinAnalysis } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const skinTypes = ["Oily", "Dry", "Combination", "Normal", "Sensitive"];

const skinIssues = [
  "Acne", "Pimples", "Dark Spots", "Hyperpigmentation", "Redness",
  "Dryness", "Itching", "Irritation", "Blackheads", "Whiteheads",
  "Fine Lines", "Wrinkles", "Uneven Skin Tone",
];

const durations = [
  "Less than 1 Week",
  "1-4 Weeks",
  "1-3 Months",
  "3-6 Months",
  "More than 6 Months",
];

export default function SkinAnalysisPage() {
  const router = useRouter();
  const { sessionId, setSkinAnalysis } = useStore();
  const [skinType, setSkinType] = useState("");
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState(5);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const toggleIssue = (issue: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issue)
        ? prev.filter((i) => i !== issue)
        : [...prev, issue]
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!skinType) newErrors.skinType = "Please select your skin type";
    if (selectedIssues.length === 0)
      newErrors.issues = "Please select at least one skin concern";
    if (!duration) newErrors.duration = "Please select duration";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const analysisData = {
        skinType,
        skinIssues: selectedIssues,
        issueDuration: duration,
        severity,
      };

      if (sessionId) {
        await saveSkinAnalysis({
          session_id: sessionId,
          skin_type: skinType,
          skin_issues: selectedIssues,
          issue_duration: duration,
          severity,
        });
      }

      setSkinAnalysis(analysisData);
      router.push("/ingredient-analysis");
    } catch (error) {
      console.error("Failed to save skin analysis:", error);
      setSkinAnalysis({
        skinType,
        skinIssues: selectedIssues,
        issueDuration: duration,
        severity,
      });
      router.push("/ingredient-analysis");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityLabel = (val: number) => {
    if (val <= 3) return "Mild";
    if (val <= 6) return "Moderate";
    if (val <= 8) return "Severe";
    return "Very Severe";
  };

  const getSeverityColor = (val: number) => {
    if (val <= 3) return "#22C55E";
    if (val <= 6) return "#F59E0B";
    if (val <= 8) return "#F97316";
    return "#EF4444";
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
            <motion.div variants={fadeUp} custom={0} className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#60A5FA] mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-[32px] md:text-[36px] font-bold text-[#0F172A] mb-2">
                Skin Assessment
              </h1>
              <p className="text-[16px] text-[#64748B]">
                Tell us about your skin so we can provide personalized analysis.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1: Skin Type */}
              <motion.div variants={fadeUp} custom={1}>
                <label htmlFor="skin-type" className="input-label text-[16px] mb-3 block">
                  Skin Type
                </label>
                <div className="relative">
                  <select
                    id="skin-type"
                    value={skinType}
                    onChange={(e) => setSkinType(e.target.value)}
                    className={`input-field appearance-none pr-12 ${
                      errors.skinType ? "!border-[#EF4444]" : ""
                    }`}
                  >
                    <option value="">Select your skin type</option>
                    {skinTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] pointer-events-none" />
                </div>
                {errors.skinType && (
                  <p className="text-[13px] text-[#EF4444] mt-1">
                    {errors.skinType}
                  </p>
                )}
              </motion.div>

              {/* Section 2: Primary Skin Issues */}
              <motion.div variants={fadeUp} custom={2}>
                <label className="input-label text-[16px] mb-3 block">
                  Primary Skin Concerns{" "}
                  <span className="text-[#94A3B8] font-normal">
                    (Select all that apply)
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {skinIssues.map((issue) => {
                    const selected = selectedIssues.includes(issue);
                    return (
                      <button
                        key={issue}
                        type="button"
                        onClick={() => toggleIssue(issue)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-[14px] font-medium transition-all duration-200 text-left ${
                          selected
                            ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                            : "border-[#E2E8F0] text-[#64748B] hover:border-[#94A3B8]"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            selected
                              ? "border-[#2563EB] bg-[#2563EB]"
                              : "border-[#CBD5E1]"
                          }`}
                        >
                          {selected && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        {issue}
                      </button>
                    );
                  })}
                </div>
                {errors.issues && (
                  <p className="text-[13px] text-[#EF4444] mt-2">
                    {errors.issues}
                  </p>
                )}
              </motion.div>

              {/* Section 3: Duration */}
              <motion.div variants={fadeUp} custom={3}>
                <label className="input-label text-[16px] mb-3 block">
                  How long have you been facing this issue?
                </label>
                <div className="space-y-2">
                  {durations.map((d) => (
                    <label
                      key={d}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        duration === d
                          ? "border-[#2563EB] bg-[#EFF6FF]"
                          : "border-[#E2E8F0] hover:border-[#94A3B8]"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          duration === d
                            ? "border-[#2563EB]"
                            : "border-[#CBD5E1]"
                        }`}
                      >
                        {duration === d && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                        )}
                      </div>
                      <span
                        className={`text-[15px] font-medium ${
                          duration === d ? "text-[#2563EB]" : "text-[#64748B]"
                        }`}
                      >
                        {d}
                      </span>
                      <input
                        type="radio"
                        name="duration"
                        value={d}
                        checked={duration === d}
                        onChange={() => setDuration(d)}
                        className="sr-only"
                      />
                    </label>
                  ))}
                </div>
                {errors.duration && (
                  <p className="text-[13px] text-[#EF4444] mt-1">
                    {errors.duration}
                  </p>
                )}
              </motion.div>

              {/* Section 4: Severity Slider */}
              <motion.div variants={fadeUp} custom={4}>
                <label className="input-label text-[16px] mb-1 block">
                  Severity Level
                </label>
                <p className="text-[14px] text-[#94A3B8] mb-4">
                  How severe are your skin concerns?
                </p>
                <div className="space-y-4">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={severity}
                    onChange={(e) => setSeverity(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#94A3B8]">Mild (1)</span>
                    <div className="text-center">
                      <span
                        className="text-[28px] font-bold"
                        style={{ color: getSeverityColor(severity) }}
                      >
                        {severity}
                      </span>
                      <span
                        className="block text-[13px] font-medium"
                        style={{ color: getSeverityColor(severity) }}
                      >
                        {getSeverityLabel(severity)}
                      </span>
                    </div>
                    <span className="text-[13px] text-[#94A3B8]">
                      Very Severe (10)
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Submit */}
              <motion.div variants={fadeUp} custom={5} className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full h-[60px] text-[17px]"
                >
                  {loading ? (
                    <>
                      <div className="spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Proceed to Ingredient Analysis
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </main>
    </>
  );
}

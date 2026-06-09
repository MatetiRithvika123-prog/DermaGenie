"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, ArrowRight, Sparkles } from "lucide-react";
import Header from "@/components/layout/Header";
import AnimatedBackground from "@/components/layout/AnimatedBackground";
import { useStore } from "@/lib/store";
import { createProfile } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function ProfilePage() {
  const router = useRouter();
  const { setProfile, setSessionId } = useStore();
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    place: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.age || parseInt(form.age) < 1 || parseInt(form.age) > 120)
      newErrors.age = "Please enter a valid age";
    if (!form.gender) newErrors.gender = "Please select your gender";
    if (!form.place.trim()) newErrors.place = "Place is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const profileData = {
        name: form.name.trim(),
        age: parseInt(form.age),
        gender: form.gender,
        place: form.place.trim(),
      };

      const response = await createProfile(profileData);
      setProfile(profileData);
      setSessionId(response.session_id);
      router.push("/skin-analysis");
    } catch (error) {
      console.error("Failed to create profile:", error);
      // Still continue even if backend is down - store locally
      const profileData = {
        name: form.name.trim(),
        age: parseInt(form.age),
        gender: form.gender,
        place: form.place.trim(),
      };
      setProfile(profileData);
      setSessionId("local-" + Date.now());
      router.push("/skin-analysis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatedBackground />
      <Header />
      <main className="min-h-screen flex items-center justify-center pt-[80px] pb-12 px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="w-full max-w-[560px]"
        >
          <div className="card-elevated p-8 md:p-12">
            {/* Icon & Title */}
            <motion.div variants={fadeUp} custom={0} className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#60A5FA] mx-auto mb-6 flex items-center justify-center shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-[32px] md:text-[36px] font-bold text-[#0F172A] mb-2">
                Welcome to <span className="text-[#2563EB]">DermaGenie</span>
              </h1>
              <p className="text-[16px] text-[#64748B]">
                Let&apos;s understand your profile before analyzing your skin.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <motion.div variants={fadeUp} custom={1}>
                <label htmlFor="name" className="input-label">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  className={`input-field ${errors.name ? "!border-[#EF4444]" : ""}`}
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {errors.name && (
                  <p className="text-[13px] text-[#EF4444] mt-1">{errors.name}</p>
                )}
              </motion.div>

              {/* Age */}
              <motion.div variants={fadeUp} custom={2}>
                <label htmlFor="age" className="input-label">
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  className={`input-field ${errors.age ? "!border-[#EF4444]" : ""}`}
                  placeholder="Enter your age"
                  min={1}
                  max={120}
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
                {errors.age && (
                  <p className="text-[13px] text-[#EF4444] mt-1">{errors.age}</p>
                )}
              </motion.div>

              {/* Gender */}
              <motion.div variants={fadeUp} custom={3}>
                <label className="input-label">Gender</label>
                <div className="flex gap-4 mt-1">
                  {["Male", "Female", "Other"].map((g) => (
                    <label
                      key={g}
                      className={`flex-1 flex items-center justify-center gap-2 h-[56px] rounded-[14px] border-2 cursor-pointer transition-all duration-200 text-[15px] font-medium ${
                        form.gender === g
                          ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                          : "border-[#E2E8F0] text-[#64748B] hover:border-[#94A3B8]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={form.gender === g}
                        onChange={(e) =>
                          setForm({ ...form, gender: e.target.value })
                        }
                        className="sr-only"
                      />
                      {g}
                    </label>
                  ))}
                </div>
                {errors.gender && (
                  <p className="text-[13px] text-[#EF4444] mt-1">
                    {errors.gender}
                  </p>
                )}
              </motion.div>

              {/* Place */}
              <motion.div variants={fadeUp} custom={4}>
                <label htmlFor="place" className="input-label">
                  Place
                </label>
                <input
                  id="place"
                  type="text"
                  className={`input-field ${errors.place ? "!border-[#EF4444]" : ""}`}
                  placeholder="Enter your city or location"
                  value={form.place}
                  onChange={(e) => setForm({ ...form, place: e.target.value })}
                />
                {errors.place && (
                  <p className="text-[13px] text-[#EF4444] mt-1">
                    {errors.place}
                  </p>
                )}
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
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            <motion.div
              variants={fadeUp}
              custom={6}
              className="mt-6 text-center"
            >
              <p className="text-[13px] text-[#94A3B8] flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                No signup or login required
              </p>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </>
  );
}

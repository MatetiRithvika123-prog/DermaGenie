"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ScanEye,
  FlaskConical,
  Sparkles,
  ArrowRight,
  Upload,
  Brain,
  ClipboardCheck,
  BarChart3,
  Shield,
  Zap,
  Heart,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import Header from "@/components/layout/Header";
import AnimatedBackground from "@/components/layout/AnimatedBackground";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

const features = [
  {
    icon: ScanEye,
    title: "Skin Analysis",
    description:
      "Complete skin assessment analyzing your type, concerns, and severity to build a personalized profile.",
    color: "#2563EB",
    bgColor: "#EFF6FF",
  },
  {
    icon: FlaskConical,
    title: "Ingredient Scanner",
    description:
      "Upload product ingredient images and our OCR + AI engine extracts and evaluates every ingredient.",
    color: "#7C3AED",
    bgColor: "#F5F3FF",
  },
  {
    icon: Sparkles,
    title: "AI Recommendations",
    description:
      "Get personalized product recommendations, skincare routines, and natural precautions powered by AI.",
    color: "#059669",
    bgColor: "#ECFDF5",
  },
];

const howItWorks = [
  {
    icon: ClipboardCheck,
    step: "01",
    title: "Create Profile",
    description: "Tell us about yourself and your skin type",
  },
  {
    icon: ScanEye,
    step: "02",
    title: "Skin Assessment",
    description: "Identify your concerns and their severity",
  },
  {
    icon: Upload,
    step: "03",
    title: "Upload Ingredients",
    description: "Snap a photo of your product's ingredient list",
  },
  {
    icon: BarChart3,
    step: "04",
    title: "Get Results",
    description: "Receive AI-powered analysis and recommendations",
  },
];

const stats = [
  { value: "80+", label: "Ingredients Analyzed" },
  { value: "40+", label: "Products in Database" },
  { value: "AI", label: "Powered by Gemini" },
  { value: "100%", label: "Free to Use" },
];

export default function LandingPage() {
  return (
    <>
      <AnimatedBackground />
      <Header />

      {/* ═══ Hero Section ═══ */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-[80px]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] text-[14px] font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Skincare Intelligence
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="text-[48px] md:text-[64px] font-extrabold text-[#0F172A] leading-[1.1] mb-6 tracking-tight"
          >
            Your AI-Powered
            <br />
            <span className="bg-gradient-to-r from-[#2563EB] to-[#60A5FA] bg-clip-text text-transparent">
              Skin Care Assistant
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="max-w-[700px] mx-auto text-[18px] md:text-[22px] text-[#64748B] leading-relaxed mb-10"
          >
            Analyze your skin concerns, evaluate skincare ingredients, and
            receive intelligent recommendations powered by AI.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/profile"
              className="btn-primary w-[220px] h-[60px] text-[17px] font-semibold"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/#features"
              className="px-8 py-4 rounded-2xl text-[16px] font-medium text-[#64748B] border-2 border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB] transition-all duration-300"
            >
              Learn More
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-[800px] mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-[32px] font-bold text-[#2563EB]">
                  {stat.value}
                </div>
                <div className="text-[14px] text-[#64748B] mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ Features Section ═══ */}
      <section id="features" className="section">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] text-[13px] font-semibold mb-4 uppercase tracking-wide">
              <Zap className="w-3.5 h-3.5" />
              Features
            </span>
            <h2 className="text-[36px] font-bold text-[#0F172A] mb-4">
              Everything You Need for{" "}
              <span className="text-[#2563EB]">Smarter Skincare</span>
            </h2>
            <p className="text-[18px] text-[#64748B] max-w-[600px] mx-auto">
              Our platform combines OCR technology and AI to give you a complete
              understanding of your skincare products.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="glass-card p-8 text-center group cursor-default"
              >
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: feature.bgColor }}
                >
                  <feature.icon
                    className="w-7 h-7"
                    style={{ color: feature.color }}
                  />
                </div>
                <h3 className="text-[24px] font-bold text-[#0F172A] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[16px] text-[#64748B] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section
        id="how-it-works"
        className="section bg-gradient-to-b from-white to-[#F8FAFC]"
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-[13px] font-semibold mb-4 uppercase tracking-wide">
              <Shield className="w-3.5 h-3.5" />
              How It Works
            </span>
            <h2 className="text-[36px] font-bold text-[#0F172A] mb-4">
              Simple{" "}
              <span className="text-[#2563EB]">4-Step</span> Process
            </h2>
            <p className="text-[18px] text-[#64748B] max-w-[600px] mx-auto">
              Get personalized skincare recommendations in minutes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="relative text-center group"
              >
                {/* Connector line */}
                {i < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-[#BFDBFE] to-[#E2E8F0]" />
                )}
                <div className="relative glass-card p-8">
                  <div className="text-[13px] font-bold text-[#2563EB] mb-4 tracking-wider">
                    STEP {item.step}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] mx-auto mb-5 flex items-center justify-center group-hover:bg-[#2563EB] transition-colors duration-300">
                    <item.icon className="w-6 h-6 text-[#2563EB] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-[20px] font-bold text-[#0F172A] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[15px] text-[#64748B]">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA Section ═══ */}
      <section className="section">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] p-12 md:p-20 text-center text-white"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-white/20 blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-white/10 blur-[60px]" />
            </div>
            <div className="relative z-10">
              <Heart className="w-12 h-12 mx-auto mb-6 opacity-80" />
              <h2 className="text-[36px] md:text-[44px] font-bold mb-4">
                Ready to Transform Your Skincare?
              </h2>
              <p className="text-[18px] text-white/80 max-w-[500px] mx-auto mb-8">
                Start your personalized skin analysis today. No signup required.
              </p>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 bg-white text-[#2563EB] font-semibold px-10 py-4 rounded-2xl text-[17px] hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Start Free Analysis
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Contact Section ═══ */}
      <section id="contact" className="section bg-white">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <h2 className="text-[36px] font-bold text-[#0F172A] mb-4">
              Get in Touch
            </h2>
            <p className="text-[18px] text-[#64748B]">
              Have questions? We&apos;re here to help.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-[800px] mx-auto">
            {[
              {
                icon: Mail,
                title: "Email",
                value: "rithvikamateti@gmail.com",
              },
              {
                icon: Phone,
                title: "Phone",
                value: "+91 6303941448",
              },
              {
                icon: MapPin,
                title: "Location",
                value: "Hyderabad, India",
              },
            ].map((contact, i) => (
              <motion.div
                key={contact.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="glass-card p-6 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] mx-auto mb-4 flex items-center justify-center">
                  <contact.icon className="w-5 h-5 text-[#2563EB]" />
                </div>
                <h3 className="text-[16px] font-bold text-[#0F172A] mb-1">
                  {contact.title}
                </h3>
                <p className="text-[14px] text-[#64748B]">{contact.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="py-8 border-t border-[#E2E8F0]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#2563EB]" />
            <span className="text-[16px] font-bold text-[#0F172A]">
              Derma<span className="text-[#2563EB]">Genie</span>
            </span>
          </div>
          <p className="text-[14px] text-[#94A3B8]">
            © {new Date().getFullYear()} DermaGenie. AI-Powered Skincare Intelligence.
          </p>
        </div>
      </footer>
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isLanding = pathname === "/";

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("/#") && isLanding) {
      const el = document.querySelector(href.replace("/", ""));
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="glass-header fixed top-0 left-0 right-0 z-50 h-[80px]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#60A5FA] flex items-center justify-center shadow-lg group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-shadow duration-300">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-white animate-pulse" />
          </div>
          <span className="text-[28px] font-bold text-[#0F172A] tracking-tight">
            Derma<span className="text-[#2563EB]">Genie</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-[15px] font-medium text-[#64748B] hover:text-[#2563EB] transition-colors duration-200 relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2563EB] rounded-full group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
          <Link
            href="/profile"
            className="btn-primary !py-3 !px-6 !text-[14px] !rounded-xl"
          >
            Get Started
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-[#F1F5F9] transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden glass absolute top-[80px] left-0 right-0 p-6 shadow-lg"
          >
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-[16px] font-medium text-[#64748B] hover:text-[#2563EB] py-2 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="btn-primary mt-2 text-center"
              >
                Get Started
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

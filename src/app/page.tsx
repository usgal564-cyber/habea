"use client";

import { useState, useEffect, useCallback } from "react";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar";
import HeroSection from "@/components/sections/hero-section";
import AboutSection from "@/components/sections/about-section";
import TrainingSection from "@/components/sections/training-section";
import QuizSection from "@/components/sections/quiz-section";
import ExamSection from "@/components/sections/exam-section";
import ServiceSection from "@/components/sections/service-section";
import FeedbackSection from "@/components/sections/feedback-section";
import SurveySection from "@/components/sections/survey-section";
import Footer from "@/components/footer";

const sectionIds = [
  "home",
  "about",
  "training",
  "quiz",
  "exam",
  "service",
  "feedback",
  "survey",
];

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");
  const [mounted, setMounted] = useState(false);

  const handleNavigate = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />
      <main className="flex-1">
        <HeroSection onNavigate={handleNavigate} />
        <AboutSection />
        <TrainingSection />
        <QuizSection />
        <ExamSection />
        <ServiceSection />
        <FeedbackSection />
        <SurveySection />
      </main>
      <Footer onNavigate={handleNavigate} />
      <Toaster position="top-right" richColors />
    </div>
  );
}

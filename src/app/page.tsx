"use client";

import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { LoginDialog } from "@/components/auth/login-dialog";
import { useAuthStore } from "@/hooks/use-auth";

// Lazy-loaded page components
import HomePage from "@/components/pages/home-page";
import AboutPage from "@/components/pages/about-page";
import TrainingPage from "@/components/pages/training-page";
import QuizPage from "@/components/pages/quiz-page";
import ExamPage from "@/components/pages/exam-page";
import ConsultingPage from "@/components/pages/consulting-page";
import FeedbackPage from "@/components/pages/feedback-page";
import SurveyPage from "@/components/pages/survey-page";
import AdminPage from "@/components/pages/admin-page";
import ProfilePage from "@/components/pages/profile-page";

export type PageId = "home" | "about" | "training" | "quiz" | "exam" | "consulting" | "feedback" | "survey" | "admin" | "profile";

const pageConfig: Record<PageId, string> = {
  home: "Нүүр",
  about: "Бидний тухай",
  training: "Сургалт",
  quiz: "Мэдлэг сорих",
  exam: "Шалгалт",
  consulting: "Зөвлөх үйлчилгээ",
  feedback: "Санал хүсэлт",
  survey: "Сэтгэл ханамж",
  admin: "Админ",
  profile: "Профайл",
};

export function getPages() {
  return pageConfig;
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageId>("home");
  const [authOpen, setAuthOpen] = useState(false);
  const { user, setAuth, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        if (!res.ok) {
          setAuth(null, null);
        }
      }).catch(() => {});
    }
  }, []);

  const handleNavigate = (pageId: PageId) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home": return <HomePage onNavigate={handleNavigate} />;
      case "about": return <AboutPage />;
      case "training": return <TrainingPage />;
      case "quiz": return <QuizPage />;
      case "exam": return <ExamPage />;
      case "consulting": return <ConsultingPage />;
      case "feedback": return <FeedbackPage />;
      case "survey": return <SurveyPage />;
      case "admin": return <AdminPage />;
      case "profile": return <ProfilePage />;
      default: return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onAuthClick={() => setAuthOpen(true)}
        user={user}
        onLogout={() => {
          useAuthStore.getState().logout();
          setCurrentPage("home");
        }}
      />
      <main className="flex-1 pt-16 lg:pt-20">
        {renderPage()}
      </main>
      <Footer onNavigate={handleNavigate} />
      <LoginDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
      />
      <Toaster position="top-right" richColors />
    </div>
  );
}

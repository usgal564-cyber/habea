"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Shield,
  LogIn,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PageId } from "@/app/page";

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (pageId: PageId) => void;
  onAuthClick: () => void;
  user: { userId: string; email: string; role: string } | null;
  onLogout: () => void;
}

const navItems: { id: PageId; label: string; adminOnly?: boolean }[] = [
  { id: "home", label: "Нүүр" },
  { id: "about", label: "Бидний тухай" },
  { id: "training", label: "Сургалт" },
  { id: "quiz", label: "Мэдлэг сорих" },
  { id: "exam", label: "Шалгалт" },
  { id: "consulting", label: "Зөвлөх үйлчилгээ" },
  { id: "feedback", label: "Санал хүсэлт" },
  { id: "survey", label: "Сэтгэл ханамж" },
  { id: "admin", label: "Админ", adminOnly: true },
];

export function Navbar({ currentPage, onNavigate, onAuthClick, user, onLogout }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const visibleItems = navItems.filter((item) => {
    if (item.adminOnly && (!user || user.role !== "ADMIN")) return false;
    return true;
  });

  const handleNavClick = (pageId: PageId) => {
    onNavigate(pageId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-brand-950/95 backdrop-blur-md shadow-lg border-b border-brand-800/50"
            : "bg-brand-950/90 backdrop-blur-sm"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <button onClick={() => handleNavClick("home")} className="flex items-center gap-3 group">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg group-hover:shadow-brand-500/30 transition-shadow">
                <Shield className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg lg:text-xl font-bold text-white tracking-tight">ХАБЭА</span>
                <span className="text-[10px] lg:text-xs text-brand-200 font-medium -mt-1">Бага дунд аж ахуйн нэгж</span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {visibleItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative",
                      isActive
                        ? "text-white bg-brand-700/50"
                        : "text-brand-100 hover:text-white hover:bg-brand-800/40"
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Auth button */}
            <div className="flex items-center gap-2">
              {user ? (
                <div className="hidden lg:flex items-center gap-2">
                  <span className="text-sm text-brand-200">
                    {user.role === "ADMIN" ? "Админ" : user.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="text-brand-200 hover:text-white hover:bg-brand-800/40"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAuthClick}
                  className="hidden lg:flex text-brand-200 hover:text-white hover:bg-brand-800/40"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Нэвтрэх
                </Button>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-white hover:bg-brand-800/50"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <nav className="absolute right-0 top-0 bottom-0 w-72 bg-brand-950/98 backdrop-blur-lg border-l border-brand-800/50 pt-20 px-4">
            <div className="flex flex-col gap-1">
              {visibleItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200",
                      isActive
                        ? "bg-brand-700/50 text-white border border-brand-600/30"
                        : "text-brand-200 hover:bg-brand-800/40 hover:text-white"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      isActive ? "bg-brand-500 text-white" : "bg-brand-800/50 text-brand-300"
                    )}>
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                );
              })}

              <div className="mt-4 pt-4 border-t border-brand-800/50">
                {user ? (
                  <button
                    onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-left w-full text-brand-200 hover:bg-brand-800/40 hover:text-white transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-800/50 text-brand-300 flex items-center justify-center">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">Гарах</span>
                  </button>
                ) : (
                  <button
                    onClick={() => { onAuthClick(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-left w-full text-brand-200 hover:bg-brand-800/40 hover:text-white transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-800/50 text-brand-300 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">Нэвтрэх / Бүртгүүлэх</span>
                  </button>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

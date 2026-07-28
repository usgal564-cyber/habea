"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Shield,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

const navItems = [
  { id: "home", label: "Нүүр", icon: Shield },
  { id: "about", label: "Бидний тухай", icon: null },
  { id: "training", label: "Сургалт", icon: null },
  { id: "quiz", label: "Мэдлэг сорих", icon: null },
  { id: "exam", label: "Шалгалт", icon: null },
  { id: "service", label: "Захиалгын үйлчилгээ", icon: null },
  { id: "feedback", label: "Санал хүсэлт", icon: null },
  { id: "survey", label: "Сэтгэл ханамж", icon: null },
];

export default function Navbar({ activeSection, onNavigate }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentLabel = navItems.find((n) => n.id === activeSection)?.label || "Нүүр";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-brand-950/95 backdrop-blur-md shadow-lg border-b border-brand-800/50"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <button
              onClick={() => handleNavClick("home")}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg group-hover:shadow-brand-500/30 transition-shadow">
                <Shield className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg lg:text-xl font-bold text-white tracking-tight">
                  ХАБЭА
                </span>
                <span className="text-[10px] lg:text-xs text-brand-200 font-medium -mt-1">
                  Бага дунд аж ахуйн нэгж
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
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
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-400 rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <div className="xl:hidden">
              {/* Current section indicator */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-brand-200 font-medium hidden sm:block">
                  {currentLabel}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-white hover:bg-brand-800/50"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 xl:hidden"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-brand-950/98 backdrop-blur-lg border-l border-brand-800/50 pt-20 px-4"
            >
              <div className="flex flex-col gap-1">
                {navItems.map((item, index) => {
                  const isActive = activeSection === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNavClick(item.id)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200",
                        isActive
                          ? "bg-brand-700/50 text-white border border-brand-600/30"
                          : "text-brand-200 hover:bg-brand-800/40 hover:text-white"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                          isActive
                            ? "bg-brand-500 text-white"
                            : "bg-brand-800/50 text-brand-300"
                        )}
                      >
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-sm">
                        {item.label}
                      </span>
                      {isActive && (
                        <ChevronDown className="w-4 h-4 ml-auto text-brand-400" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

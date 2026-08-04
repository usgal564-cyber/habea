// Navbar component with dropdown menus
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  Shield,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  BookOpen,
  Brain,
  ClipboardCheck,
  MessageSquare,
  Star,
  Briefcase,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PageId } from "@/App";

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (pageId: PageId) => void;
  onAuthClick: () => void;
  user: { userId: string; email: string; role: string } | null;
  onLogout: () => void;
}

type NavItem = { id: PageId; label: string; icon?: React.ReactNode; adminOnly?: boolean; authOnly?: boolean };
type NavGroup = { groupLabel: string; groupIcon: React.ReactNode; items: NavItem[] };

const mainLinks: NavItem[] = [
  { id: "home", label: "Нүүр", icon: <Shield className="w-4 h-4" /> },
  { id: "about", label: "Бидний тухай", icon: <Info className="w-4 h-4" /> },
];

const learningGroup: NavGroup = {
  groupLabel: "Сургалт, сорил, шалгалт",
  groupIcon: <BookOpen className="w-4 h-4" />,
  items: [
    { id: "training", label: "Сургалтууд", icon: <BookOpen className="w-4 h-4" /> },
    { id: "quiz", label: "Мэдлэг сорих", icon: <Brain className="w-4 h-4" /> },
    { id: "exam", label: "Шалгалт", icon: <ClipboardCheck className="w-4 h-4" /> },
  ],
};

const servicesGroup: NavGroup = {
  groupLabel: "Үйлчилгээ",
  groupIcon: <Briefcase className="w-4 h-4" />,
  items: [
    { id: "consulting", label: "Зөвлөх үйлчилгээ", icon: <Briefcase className="w-4 h-4" /> },
    { id: "feedback", label: "Санал хүсэлт", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "survey", label: "Сэтгэл ханамж", icon: <Star className="w-4 h-4" /> },
  ],
};

const specialItems: NavItem[] = [
  { id: "admin", label: "Админ", icon: <Shield className="w-4 h-4" />, adminOnly: true },
  { id: "profile", label: "Профайл", icon: <User className="w-4 h-4" />, authOnly: true },
];

function DropdownMenu({
  group,
  currentPage,
  onNavigate,
}: {
  group: NavGroup;
  currentPage: PageId;
  onNavigate: (pageId: PageId) => void;
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAnyActive = group.items.some((i) => i.id === currentPage);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          isAnyActive
            ? "text-white bg-brand-700/50"
            : "text-brand-100 hover:text-white hover:bg-brand-800/40"
        )}
      >
        {group.groupIcon}
        <span>{group.groupLabel}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-brand-950/98 backdrop-blur-lg border border-brand-700/50 rounded-xl shadow-2xl shadow-black/30 py-2 z-50">
          <p className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-400">
            {group.groupLabel}
          </p>
          {group.items.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-all duration-150",
                  isActive
                    ? "text-white bg-brand-700/60 font-medium"
                    : "text-brand-100 hover:text-white hover:bg-brand-800/50"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                    isActive ? "bg-brand-500 text-white" : "bg-brand-800/60 text-brand-300"
                  )}
                >
                  {item.icon}
                </div>
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

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

  const filterVisible = (items: NavItem[]): NavItem[] =>
    items.filter((item) => {
      if (item.adminOnly && (!user || user.role !== "ADMIN")) return false;
      if (item.authOnly && !user) return false;
      return true;
    });

  const visibleMain = filterVisible(mainLinks);
  const visibleLearningItems = filterVisible(learningGroup.items);
  const visibleServiceItems = filterVisible(servicesGroup.items);
  const visibleSpecial = filterVisible(specialItems);

  const hasLearning = visibleLearningItems.length > 0;
  const hasServices = visibleServiceItems.length > 0;

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

            {/* Desktop Navigation - grouped with dropdowns */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* Standalone links */}
              {visibleMain.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative",
                      isActive
                        ? "text-white bg-brand-700/50"
                        : "text-brand-100 hover:text-white hover:bg-brand-800/40"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-400 rounded-full" />
                    )}
                  </button>
                );
              })}

              {/* Learning dropdown */}
              {hasLearning && (
                <DropdownMenu
                  group={{ ...learningGroup, items: visibleLearningItems }}
                  currentPage={currentPage}
                  onNavigate={onNavigate}
                />
              )}

              {/* Services dropdown */}
              {hasServices && (
                <DropdownMenu
                  group={{ ...servicesGroup, items: visibleServiceItems }}
                  currentPage={currentPage}
                  onNavigate={onNavigate}
                />
              )}

              {/* Divider */}
              {visibleSpecial.length > 0 && (
                <div className="w-px h-6 bg-brand-700/50 mx-2" />
              )}

              {/* Special items (Profile, Admin) */}
              {visibleSpecial.map((item) => {
                const isActive = currentPage === item.id;
                const isProfile = item.id === "profile";
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative",
                      isActive
                        ? "text-white bg-brand-700/50"
                        : isProfile
                          ? "text-amber-200 hover:text-amber-100 hover:bg-amber-900/30"
                          : "text-brand-300 hover:text-white hover:bg-brand-800/40"
                    )}
                  >
                    {item.icon}
                    <span>
                      {isProfile ? (user?.email?.split("@")[0] || "Профайл") : item.label}
                    </span>
                    {isActive && (
                      <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Auth button */}
            <div className="flex items-center gap-2">
              {!user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAuthClick}
                  className="hidden lg:flex text-brand-200 hover:text-white hover:bg-brand-800/40"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  <span>Нэвтрэх</span>
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
          <nav className="absolute right-0 top-0 bottom-0 w-80 bg-brand-950/98 backdrop-blur-lg border-l border-brand-800/50 pt-20 px-4 overflow-y-auto">
            <div className="flex flex-col gap-1">

              {/* Main links */}
              {visibleMain.map((item) => {
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
                      {item.icon}
                    </div>
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                );
              })}

              {/* Divider */}
              {hasLearning && (
                <div className="pt-3 pb-1">
                  <p className="px-4 text-[11px] font-semibold uppercase tracking-wider text-brand-400">
                    Сургалт, сорил, шалгалт
                  </p>
                </div>
              )}

              {/* Learning items */}
              {visibleLearningItems.map((item) => {
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
                      {item.icon}
                    </div>
                    <span className="font-medium text-sm">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />
                    )}
                  </button>
                );
              })}

              {/* Divider */}
              {hasServices && (
                <div className="pt-3 pb-1">
                  <p className="px-4 text-[11px] font-semibold uppercase tracking-wider text-brand-400">
                    Үйлчилгээ
                  </p>
                </div>
              )}

              {/* Service items */}
              {visibleServiceItems.map((item) => {
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
                      {item.icon}
                    </div>
                    <span className="font-medium text-sm">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />
                    )}
                  </button>
                );
              })}

              {/* Divider */}
              {visibleSpecial.length > 0 && (
                <div className="pt-3 pb-1 border-t border-brand-800/50 mt-3">
                  <p className="px-4 text-[11px] font-semibold uppercase tracking-wider text-brand-400">
                    Хувийн
                  </p>
                </div>
              )}

              {/* Special items */}
              {visibleSpecial.map((item) => {
                const isActive = currentPage === item.id;
                const isProfile = item.id === "profile";
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200",
                      isActive
                        ? "bg-brand-700/50 text-white border border-brand-600/30"
                        : isProfile
                          ? "text-amber-200 hover:bg-amber-900/30 hover:text-amber-100"
                          : "text-brand-200 hover:bg-brand-800/40 hover:text-white"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      isProfile ? "bg-amber-700/30 text-amber-300" : isActive ? "bg-brand-500 text-white" : "bg-brand-800/50 text-brand-300"
                    )}>
                      {item.icon}
                    </div>
                    <span className="font-medium text-sm">
                      {isProfile ? (user?.email?.split("@")[0] || "Профайл") : item.label}
                    </span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />
                    )}
                  </button>
                );
              })}

              {/* Logout / Login */}
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

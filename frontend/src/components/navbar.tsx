// Navbar component with dropdown menus and admin notification bell
import { useState, useEffect, useRef, useCallback } from "react";
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
  Bell,
  Loader2,
  Trash2,
  CheckCircle,
  Clock,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PageId } from "@/App";
import { toast } from "sonner";

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (pageId: PageId) => void;
  onAuthClick: () => void;
  user: { userId: string; email: string; role: string } | null;
  onLogout: () => void;
  token?: string;
}

type NavItem = { id: PageId; label: string; icon?: React.ReactNode; adminOnly?: boolean; authOnly?: boolean };
type NavGroup = { groupLabel: string; groupIcon: React.ReactNode; items: NavItem[] };

interface ConsultationItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  serviceType: string;
  message: string;
  adminResponse: string;
  status: string;
  createdAt: string;
}

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

function UserNotificationBell({ token, onNavigate }: { token: string; onNavigate: (id: PageId) => void }) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadItems, setUnreadItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchUnread = useCallback(async () => {
    try {
      const [countRes, consRes] = await Promise.all([
        fetch("/api/consultations/unread-count", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/consultations", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (countRes.ok) {
        const data = await countRes.json();
        setUnreadCount(data.unreadCount || 0);
      }
      if (consRes.ok) {
        const data = await consRes.json();
        const unread = (data.consultations || []).filter((c: any) => c.adminResponse && !c.userRead);
        setUnreadItems(unread);
      }
    } catch { /* silent */ }
  }, [token]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleMouseEnter = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  const handleMouseLeave = () => { timeoutRef.current = setTimeout(() => setOpen(false), 200); };

  const handleViewDetail = async (id: string) => {
    try {
      await fetch(`/api/consultations/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* silent */ }
    setOpen(false);
    onNavigate("consulting");
  };

  if (unreadCount === 0) return null;

  return (
    <div className="relative" ref={dropdownRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl text-amber-300 hover:text-amber-200 hover:bg-amber-900/30 transition-all duration-200"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-2xl shadow-2xl shadow-black/20 border border-gray-100 z-50 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-white" />
              <span className="font-semibold text-white text-sm">Шинэ зөвлөмж</span>
              {unreadCount > 0 && (
                <span className="bg-white/20 text-white text-xs font-medium px-2.5 py-0.5 rounded-full ml-auto">{unreadCount}</span>
              )}
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
              </div>
            ) : unreadItems.length === 0 ? (
              <div className="text-center py-10 px-4">
                <CheckCircle className="w-8 h-8 text-green-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Бүх зөвлөмж уншсан</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {unreadItems.map((c: any) => (
                  <div key={c.id} className="px-4 py-3 hover:bg-amber-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-medium text-sm text-gray-900 truncate">Зөвлөгөөний хариу</p>
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">Шинэ</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{c.adminResponse}</p>
                    <button
                      onClick={() => handleViewDetail(c.id)}
                      className="text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
                    >
                      Дэлгэрэнгүй харах →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminNotificationBell({ token }: { token: string }) {
  const [open, setOpen] = useState(false);
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"consultations" | "enollments">("consultations");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyLoading, setReplyLoading] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pendingCount = consultations.filter((c) => c.status === "pending").length;
  const totalCount = pendingCount + enrollments.length;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const [consRes, dashRes] = await Promise.all([
        fetch("/api/admin/consultations", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/dashboard", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (consRes.ok) {
        const data = await consRes.json();
        setConsultations(data.consultations || []);
      }
      if (dashRes.ok) {
        const data = await dashRes.json();
        setEnrollments(data.recentEnrollments || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 200);
  };

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/consultations/${id}/status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(status === "completed" ? "Амжилттай хийгдлээ" : "Шинэчлэгдлээ");
        fetchNotifications();
      }
    } catch {
      toast.error("Алдаа гарлаа");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteConsultation = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/consultations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Устгагдлаа");
        fetchNotifications();
      }
    } catch {
      toast.error("Алдаа гарлаа");
    } finally {
      setActionLoading(null);
    }
  };

  const replyConsultation = async (id: string) => {
    const text = replyText[id]?.trim();
    if (!text) { toast.error("Зөвлөмж хоосон байна"); return; }
    setReplyLoading(id);
    try {
      const res = await fetch(`/api/admin/consultations/${id}/response`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ response: text }),
      });
      if (res.ok) {
        toast.success("Зөвлөмж амжилттай илгээгдлээ");
        setReplyText((prev) => { const n = { ...prev }; delete n[id]; return n; });
        setExpandedId(null);
        fetchNotifications();
      }
    } catch {
      toast.error("Алдаа гарлаа");
    } finally {
      setReplyLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "Саяхан";
      if (diffMin < 60) return `${diffMin} мин`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr} цаг`;
      return d.toLocaleDateString("mn-MN", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case "pending": return "Хүлээгдэж байна";
      case "in_progress": return "Боловсруулж байна";
      case "completed": return "Хийгдсэн";
      default: return s;
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "pending": return "bg-amber-100 text-amber-700";
      case "in_progress": return "bg-blue-100 text-blue-700";
      case "completed": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="relative" ref={dropdownRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl text-brand-200 hover:text-white hover:bg-brand-800/40 transition-all duration-200"
      >
        <Bell className="w-5 h-5" />
        {totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
            {totalCount > 9 ? "9+" : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[420px] bg-white rounded-2xl shadow-2xl shadow-black/20 border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-white" />
                <span className="font-semibold text-white text-sm">Мэдэгдэл</span>
              </div>
              {totalCount > 0 && (
                <span className="bg-white/20 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {totalCount} шинэ
                </span>
              )}
            </div>
            {/* Tab buttons */}
            <div className="flex gap-1 mt-3">
              <button
                onClick={() => setActiveTab("consultations")}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  activeTab === "consultations" ? "bg-white/20 text-white" : "text-white/60 hover:text-white/80"
                )}
              >
                Зөвлөгөө
                {pendingCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-[9px] flex items-center justify-center text-white">{pendingCount}</span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("eollments")}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  activeTab === "eollments" ? "bg-white/20 text-white" : "text-white/60 hover:text-white/80"
                )}
              >
                Сургалт бүртгэл
                {enrollments.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-[9px] flex items-center justify-center text-white">{enrollments.length}</span>
                )}
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
              </div>
            ) : activeTab === "consultations" ? (
              consultations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500">Зөвлөгөөний хүсэлт байхгүй</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {consultations.slice(0, 10).map((c) => (
                    <div key={c.id} className="px-4 py-3 hover:bg-gray-50/80 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-1.5 cursor-pointer" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-gray-900 truncate">{c.name}</p>
                            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0", statusColor(c.status))}>
                              {statusLabel(c.status)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {c.company && `${c.company} · `}{c.phone}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-gray-400 whitespace-nowrap">{formatDate(c.createdAt)}</span>
                          <svg className={cn("w-3.5 h-3.5 text-gray-400 transition-transform", expandedId === c.id && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">{c.message}</p>
                      {expandedId === c.id && (
                        <div className="mt-2 space-y-2">
                          {c.adminResponse && (
                            <div className="bg-brand-50 border border-brand-100 rounded-lg p-3">
                              <p className="text-[11px] font-medium text-brand-700 mb-1">Өмнөх зөвлөмж:</p>
                              <p className="text-xs text-gray-700 whitespace-pre-wrap">{c.adminResponse}</p>
                            </div>
                          )}
                          <div className="flex gap-1.5 flex-wrap">
                            {c.status === "pending" && (
                              <button onClick={() => updateStatus(c.id, "in_progress")} disabled={actionLoading === c.id} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-[11px] font-medium transition-colors disabled:opacity-50">
                                {actionLoading === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3" />}
                                Хүлээх
                              </button>
                            )}
                            {(c.status === "pending" || c.status === "in_progress") && (
                              <button onClick={() => updateStatus(c.id, "completed")} disabled={actionLoading === c.id} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 text-[11px] font-medium transition-colors disabled:opacity-50">
                                {actionLoading === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                Хийсэн
                              </button>
                            )}
                            <button onClick={() => deleteConsultation(c.id)} disabled={actionLoading === c.id} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-[11px] font-medium transition-colors disabled:opacity-50">
                              {actionLoading === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                              Устгах
                            </button>
                          </div>
                          <textarea
                            value={replyText[c.id] || ""}
                            onChange={(e) => setReplyText((prev) => ({ ...prev, [c.id]: e.target.value }))}
                            placeholder="Зөвлөмж/заавар бичих..."
                            rows={2}
                            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-300"
                          />
                          <button
                            onClick={() => replyConsultation(c.id)}
                            disabled={replyLoading === c.id || !replyText[c.id]?.trim()}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 text-[11px] font-medium transition-colors disabled:opacity-50"
                          >
                            {replyLoading === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                            Зөвлөмж илгээх
                          </button>
                        </div>
                      )}
                      {expandedId !== c.id && c.status === "pending" && (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => updateStatus(c.id, "in_progress")} disabled={actionLoading === c.id} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-[11px] font-medium transition-colors disabled:opacity-50">
                            {actionLoading === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3" />}
                            Хүлээх
                          </button>
                          <button onClick={() => updateStatus(c.id, "completed")} disabled={actionLoading === c.id} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 text-[11px] font-medium transition-colors disabled:opacity-50">
                            {actionLoading === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                            Хийсэн
                          </button>
                          <button onClick={() => deleteConsultation(c.id)} disabled={actionLoading === c.id} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-[11px] font-medium transition-colors disabled:opacity-50">
                            {actionLoading === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            Устгах
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : activeTab === "eollments" ? (
              enrollments.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500">Сургалтын бүртгэл байхгүй</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {enrollments.map((en: any, i: number) => (
                    <div key={i} className="px-4 py-3 hover:bg-emerald-50/50 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{en.userName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{en.userEmail}</p>
                        </div>
                        <span className="text-[11px] text-gray-400 shrink-0 whitespace-nowrap">{formatDate(en.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3 h-3 text-emerald-500" />
                          <p className="text-xs text-emerald-700 font-medium">{en.courseTitle}</p>
                        </div>
                        <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", en.paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                          {en.paid ? "Төлсөн" : "Төлөөгүй"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : null}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50/50">
            <button
              onClick={() => { setOpen(false); }}
              className="w-full text-center text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
            >
              Админ хэсгээс харах
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar({ currentPage, onNavigate, onAuthClick, user, onLogout, token }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "TEACHER";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filterVisible = (items: NavItem[]): NavItem[] =>
    items.filter((item) => {
      if (item.adminOnly && !isAdmin) return false;
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
              <img
                src="/logo.png"
                alt="ХАБЭА"
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl object-contain shadow-lg group-hover:shadow-brand-500/30 transition-shadow"
              />
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

            {/* Auth button + Notification bell */}
            <div className="flex items-center gap-2">
              {/* Admin notification bell */}
              {isAdmin && token && (
                <AdminNotificationBell token={token} />
              )}

              {/* User notification bell (admin response) */}
              {!isAdmin && user && token && (
                <UserNotificationBell token={token} onNavigate={onNavigate} />
              )}

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
  
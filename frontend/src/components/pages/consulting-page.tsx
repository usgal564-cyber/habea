import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ShieldCheck,
  Network,
  Stethoscope,
  ClipboardCheck,
  Award,
  Send,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Users,
  Building2,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  ChevronDown,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/hooks/use-auth";

const serviceTypes = [
  {
    id: "policy-intro",
    title: "ХАБЭА бодлоготой танилцуулах",
    description: "Байгууллагын ХАБЭА бодлогын төслийг боловсруулан, танилцуулах үйлчилгээ. Ажилтанд танилцуулах, ойлголт өгөх.",
    detail: "Бидний мэргэжлийн баг тантай хамтран байгууллагын ХАБЭА бодлогын төслийг боловсруулж, ажилтанд танилцуулах, дотоод сургалт зохион байгуулах үйлчилгээг үзүүлнэ.",
    icon: FileText,
    benefits: ["ХАБЭА бодлогын төсөл боловсруулах", "Ажилтанд танилцуулах сургалт", "Дотоод журналын загвар"],
  },
  {
    id: "safety-consult",
    title: "Аюулгүй ажиллагааны зөвлөгөө",
    description: "Ажлын байраны аюулгүй байдлын дүрмийн зөвлөгөө, эрсдэлийн үнэлгээ хийх, аюулгүй байдлын төлөвлөгөө боловсруулах.",
    detail: "Ажлын байраны аюулгүй байдлын дүрэм, стандартын дагуу зөвлөгөө өгч, эрсдэлийн үнэлгээ хийх, аюулгүй байдлын төлөвлөгөө боловсруулна.",
    icon: ShieldCheck,
    benefits: ["Эрсдэлийн үнэлгээ", "Аюулгүй байдлын төлөвлөгөө", "Гаралт дүрмийн зөвлөгөө"],
  },
  {
    id: "habea-system",
    title: "ХАБЭА удирдлагын систем",
    description: "ISO 45001 стандартын дагуу ХАБЭА удирдлагын системийг боловсруулан, хэрэгжүүлэхэд зөвлөгөө өгөх.",
    detail: "ISO 45001 стандартын дагуу ХАБЭА удирдлагын системийг боловсруулан, хэрэгжүүлэх, аудитаар хангах зөвлөгөө өгнө.",
    icon: Network,
    benefits: ["ISO 45001 хэрэгжүүлэлт", "Удирдлагын систем боловсруулах", "Дотоод аудит"],
  },
  {
    id: "health-exam",
    title: "Эрүүл мэндийн үзлэг",
    description: "Ажилтны эрүүл мэндийн үзлэг зохион байгуулах, ажлын байранд холбогдох мэргэжлийн үзлэг.",
    detail: "Ажлын байранд холбогдох эрүүл мэндийн үзлэг, мэргэжлийн оношлуулалт зохион байгуулах, эрүүл мэндийн гэрчилгээ олгох.",
    icon: Stethoscope,
    benefits: ["Эрүүл мэндийн үзлэг зохион байгуулах", "Мэргэжлийн оношлуулалт", "Гэрчилгээ олгох"],
  },
  {
    id: "workplace-assess",
    title: "Ажлын байраны үнэлгээ",
    description: "Ажлын байраны нөхцөл, орчин, тоног төхөөрөмжийн үнэлгээ хийх, дүгнэлт гаргах.",
    detail: "Ажлын байраны нөхцөл, орчин, тоног төхөөрөмжийн бүрэн үнэлгээ хийж, дүгнэлт болон сайжруулалтын санал тавина.",
    icon: ClipboardCheck,
    benefits: ["Бүрэн үнэлгээ хийх", "Дүгнэлт тайлан", "Сайжруулалтын санал"],
  },
  {
    id: "iso-consult",
    title: "ISO стандартын зөвлөгөө",
    description: "ISO 45001, ISO 14001, ISO 9001 зэрэг олон улсын стандартын зөвлөгөө, хэрэгжүүлэлт.",
    detail: "ISO 45001, ISO 14001, ISO 9001 зэрэг олон улсын стандартын зөвлөгөө өгч, хэрэгжүүлэлт, гэрчилгээнд бэлтгэх.",
    icon: Award,
    benefits: ["ISO стандартын зөвлөгөө", "Гэрчилгээнд бэлтгэл", "Хэрэгжүүлэх дэмжлэг"],
  },
];

interface ConsultationRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  serviceType: string;
  message: string;
  adminResponse: string;
  userRead: boolean;
  status: string;
  createdAt: string;
}

export default function ConsultingPage() {
  const { user, token } = useAuthStore();
  const isAdmin = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "TEACHER";

  const [activeTab, setActiveTab] = useState<"request" | "history">("request");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminReply, setAdminReply] = useState<Record<string, string>>({});
  const [replyLoading, setReplyLoading] = useState<string | null>(null);

  const selected = serviceTypes.find((s) => s.id === selectedService);

  // Fetch consultations
  const fetchConsultations = useCallback(async () => {
    if (!token) return;
    setLoadingHistory(true);
    try {
      const url = isAdmin ? "/api/admin/consultations" : "/api/consultations";
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setConsultations(data.consultations || []);
      }
    } catch { /* silent */ }
    finally { setLoadingHistory(false); }
  }, [token, isAdmin]);

  useEffect(() => { fetchConsultations(); }, [fetchConsultations]);

  // Auto-fill user info
  useEffect(() => {
    if (user && !form.name) {
      setForm((prev) => ({
        ...prev,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error("Заавал бөглөх талбарыг бөглөнө үү.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, serviceType: selectedService }),
      });
      if (res.ok) {
        toast.success("Зөвлөгөөний хүсэлт амжилттай илгээгдлээ!");
        setForm({ name: "", email: "", phone: "", company: "", description: "" });
        setSelectedService(null);
        fetchConsultations();
      } else {
        toast.error("Алдаа гарлаа.");
      }
    } catch {
      toast.error("Серверийн алдаа гарлаа.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExpand = async (id: string, isUnread: boolean) => {
    setExpandedId(expandedId === id ? null : id);
    if (isUnread && token) {
      try {
        await fetch(`/api/consultations/${id}/read`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
        setConsultations((prev) => prev.map((c) => c.id === id ? { ...c, userRead: true } : c));
      } catch { /* silent */ }
    }
  };

  const handleAdminReply = async (id: string) => {
    const text = adminReply[id]?.trim();
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
        setAdminReply((prev) => { const n = { ...prev }; delete n[id]; return n; });
        fetchConsultations();
      }
    } catch { toast.error("Алдаа гарлаа"); }
    finally { setReplyLoading(null); }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("mn-MN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
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
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-brand-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-700/50 border border-brand-600/30 mb-6">
              <ShieldCheck className="w-4 h-4 text-brand-300" />
              <span className="text-sm font-medium text-brand-200">Мэргэжлийн зөвлөгөө</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Зөвлөх Үйлчилгээ</h1>
            <p className="text-brand-200/80 max-w-2xl mx-auto text-lg">
              Байгууллагын ХАБЭА-ийн бүх төрлийн зөвлөгөө үйлчилгээг мэргэжлийн түвшинд үзүүлнэ
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs (only when logged in) */}
          {user && (
            <div className="flex items-center gap-1 mb-8 bg-gray-100 rounded-xl p-1 w-fit">
              <button
                onClick={() => setActiveTab("request")}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  activeTab === "request" ? "bg-white text-foreground shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Send className="w-4 h-4" />
                Хүсэлт илгээх
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  activeTab === "history" ? "bg-white text-foreground shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Clock className="w-4 h-4" />
                {isAdmin ? "Бүх хүсэлтүүд" : "Миний хүсэлтүүд"}
                {consultations.length > 0 && (
                  <span className="bg-brand-100 text-brand-700 text-xs font-medium px-2 py-0.5 rounded-full">{consultations.length}</span>
                )}
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === "history" && user ? (
              /* ─── History Tab ─── */
              <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                  </div>
                ) : consultations.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">Хүсэлт байхгүй байна</p>
                    <p className="text-sm text-gray-400 mt-1">Зөвлөгөөний хүсэлт илгээх бол дээрх таб дээр дарна уу</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-4xl mx-auto">
                    {consultations.map((c) => {
                      const isUnread = c.adminResponse && !c.userRead;
                      const isExpanded = expandedId === c.id;
                      const svc = serviceTypes.find((s) => s.id === c.serviceType);
                      return (
                        <Card key={c.id} className={cn("border-0 shadow-sm transition-all", isUnread && !isExpanded && "border-l-4 border-l-amber-400")}>
                          <CardContent className="p-0">
                            <button
                              className="w-full text-left px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50/50 transition-colors rounded-t-xl"
                              onClick={() => handleExpand(c.id, !!isUnread)}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  {svc && <svc.icon className="w-4 h-4 text-brand-500" />}
                                  <h3 className="font-semibold text-foreground text-sm">{svc?.title || c.serviceType || "Зөвлөгөө"}</h3>
                                  <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", statusColor(c.status))}>{statusLabel(c.status)}</span>
                                  {isUnread && !isExpanded && (
                                    <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-medium px-2 py-0.5 rounded-full animate-pulse">
                                      <Eye className="w-3 h-3" /> Шинэ зөвлөмж
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                  <span>{c.name}</span>
                                  {c.company && <span>· {c.company}</span>}
                                  {isAdmin && <span>· {c.email}</span>}
                                  <span>· {formatDate(c.createdAt)}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{c.message}</p>
                              </div>
                              <ChevronDown className={cn("w-4 h-4 text-gray-400 shrink-0 mt-1 transition-transform", isExpanded && "rotate-180")} />
                            </button>

                            {isExpanded && (
                              <div className="px-6 pb-5 border-t border-gray-100 pt-4 space-y-4">
                                {/* User message */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                  <p className="text-xs font-medium text-gray-500 mb-1">Хүсэлт:</p>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.message || "( хоосон )"}</p>
                                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                    {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                                    {c.company && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{c.company}</span>}
                                  </div>
                                </div>

                                {/* Admin response */}
                                {c.adminResponse ? (
                                  <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
                                    <p className="text-xs font-medium text-brand-700 mb-1 flex items-center gap-1">
                                      <Award className="w-3 h-3" />
                                      Админы зөвлөмж/заавар:
                                    </p>
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{c.adminResponse}</p>
                                  </div>
                                ) : (
                                  !isAdmin && (
                                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                                      <Clock className="w-5 h-5 text-gray-300 mx-auto mb-1" />
                                      <p className="text-sm text-gray-400">Хариу хүлээж байна...</p>
                                    </div>
                                  )
                                )}

                                {/* Admin reply form */}
                                {isAdmin && (
                                  <div className="space-y-2">
                                    <Textarea
                                      value={adminReply[c.id] || ""}
                                      onChange={(e) => setAdminReply((prev) => ({ ...prev, [c.id]: e.target.value }))}
                                      placeholder="Зөвлөмж/заавар бичих..."
                                      rows={3}
                                      className="text-sm border-gray-200 focus:border-brand-400"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => handleAdminReply(c.id)}
                                      disabled={replyLoading === c.id || !adminReply[c.id]?.trim()}
                                      className="bg-brand-600 hover:bg-brand-700 text-white h-9"
                                    >
                                      {replyLoading === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                      Зөвлөмж илгээх
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              /* ─── Request Tab (or unauthenticated) ─── */
              <motion.div key="request" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <AnimatePresence mode="wait">
                  {!selectedService ? (
                    /* ─── List View: 6 service cards ─── */
                    <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {serviceTypes.map((service, index) => {
                          const Icon = service.icon;
                          return (
                            <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.07 }}>
                              <Card className="h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-200 group" onClick={() => setSelectedService(service.id)}>
                                <CardContent className="p-6">
                                  <div className="flex items-start gap-4 mb-3">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-brand-50 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                                      <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-foreground mb-1">{service.title}</h3>
                                      <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 mt-4 text-brand-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                                    <span>Дэлгэрэнгүй</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : (
                    /* ─── Detail View: selected service + form ─── */
                    <motion.div key="detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                      <button onClick={() => setSelectedService(null)} className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium mb-8 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Бүх үйлчилгээг харах
                      </button>

                      <div className="grid lg:grid-cols-5 gap-8">
                        {/* LEFT: Service info */}
                        <div className="lg:col-span-2">
                          {selected && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                              <Card className="border-0 shadow-sm overflow-hidden">
                                <div className="bg-gradient-to-br from-brand-600 to-brand-700 p-8 text-center">
                                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                                    {(() => { const Icon = selected.icon; return <Icon className="w-8 h-8 text-white" />; })()}
                                  </div>
                                  <h2 className="text-xl font-bold text-white">{selected.title}</h2>
                                </div>
                                <CardContent className="p-6 space-y-5">
                                  <p className="text-sm text-gray-700 leading-relaxed">{selected.detail}</p>
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Танд ямар ач холбогдолтой вэ?</p>
                                    <div className="space-y-2.5">
                                      {selected.benefits.map((b, i) => (
                                        <div key={i} className="flex items-center gap-2.5">
                                          <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-3 h-3 text-brand-600" />
                                          </div>
                                          <span className="text-sm text-gray-700">{b}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="pt-4 border-t space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                      <Clock className="w-4 h-4 text-brand-400" /><span>Хариу 1-2 ажлын өдөр</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                      <Phone className="w-4 h-4 text-brand-400" /><span>+976 7777-XXXX</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                      <Mail className="w-4 h-4 text-brand-400" /><span>info@habea.mn</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )}
                        </div>

                        {/* RIGHT: Form */}
                        <div className="lg:col-span-3">
                          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                            <Card className="border-brand-100 bg-gradient-to-br from-white to-brand-50/30">
                              <CardContent className="p-6 lg:p-8">
                                <div className="flex items-center gap-3 mb-6">
                                  <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                                    <Send className="w-5 h-5 text-brand-600" />
                                  </div>
                                  <div>
                                    <h2 className="text-lg font-bold text-foreground">Зөвлөгөөний Хүсэлт Илгээх</h2>
                                    <p className="text-xs text-muted-foreground">Мэдээллээ бөглөж, бид тантай холбогдох болно</p>
                                  </div>
                                </div>

                                {selected && (
                                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-brand-50 border border-brand-100 mb-6">
                                    <div className="w-9 h-9 rounded-lg bg-brand-500 text-white flex items-center justify-center shrink-0">
                                      {(() => { const Icon = selected.icon; return <Icon className="w-4 h-4" />; })()}
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Сонгосон үйлчилгээ</Label>
                                      <p className="font-medium text-brand-800 text-sm">{selected.title}</p>
                                    </div>
                                  </div>
                                )}

                                {!user && (
                                  <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-700">
                                    Хүсэлт илгээхийн тулд эхлээд нэвтрэнэ үү.
                                  </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                  <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Нэр <span className="text-red-500">*</span></Label>
                                      <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Таны овог нэр" className="pl-10" disabled={!user} />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Имэйл <span className="text-red-500">*</span></Label>
                                      <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" className="pl-10" disabled={!user} />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Утас <span className="text-red-500">*</span></Label>
                                      <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+976 XXXX XXXX" className="pl-10" disabled={!user} />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Компани</Label>
                                      <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Байгууллагын нэр" className="pl-10" disabled={!user} />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Тодорхойлолт</Label>
                                    <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Зөвлөгөөний талаар дэлгэрэнгүй тайлбар..." disabled={!user} />
                                  </div>
                                  <Button type="submit" disabled={isSubmitting || !user} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-6 text-base font-semibold rounded-xl">
                                    {isSubmitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Илгээж байна...</>) : (<><Send className="w-4 h-4 ml-2" />Хүсэлт илгээх</>)}
                                  </Button>
                                </form>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

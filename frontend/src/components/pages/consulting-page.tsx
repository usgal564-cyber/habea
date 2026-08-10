import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const serviceTypes = [
  {
    id: "policy-intro",
    title: "ХАБЭА бодлоготой танилцуулах",
    description:
      "Байгууллагын ХАБЭА бодлогын төслийг боловсруулан, танилцуулах үйлчилгээ. Ажилтанд танилцуулах, ойлголт өгөх.",
    detail: "Бидний мэргэжлийн баг тантай хамтран байгууллагын ХАБЭА бодлогын төслийг боловсруулж, ажилтанд танилцуулах, дотоод сургалт зохион байгуулах үйлчилгээг үзүүлнэ.",
    icon: FileText,
    benefits: ["ХАБЭА бодлогын төсөл боловсруулах", "Ажилтанд танилцуулах сургалт", "Дотоод журналын загвар"],
  },
  {
    id: "safety-consult",
    title: "Аюулгүй ажиллагааны зөвлөгөө",
    description:
      "Ажлын байраны аюулгүй байдлын дүрмийн зөвлөгөө, эрсдэлийн үнэлгээ хийх, аюулгүй байдлын төлөвлөгөө боловсруулах.",
    detail: "Ажлын байраны аюулгүй байдлын дүрэм, стандартын дагуу зөвлөгөө өгч, эрсдэлийн үнэлгээ хийх, аюулгүй байдлын төлөвлөгөө боловсруулна.",
    icon: ShieldCheck,
    benefits: ["Эрсдэлийн үнэлгээ", "Аюулгүй байдлын төлөвлөгөө", "Гаралт дүрмийн зөвлөгөө"],
  },
  {
    id: "habea-system",
    title: "ХАБЭА удирдлагын систем",
    description:
      "ISO 45001 стандартын дагуу ХАБЭА удирдлагын системийг боловсруулан, хэрэгжүүлэхэд зөвлөгөө өгөх.",
    detail: "ISO 45001 стандартын дагуу ХАБЭА удирдлагын системийг боловсруулан, хэрэгжүүлэх, аудитаар хангах зөвлөгөө өгнө.",
    icon: Network,
    benefits: ["ISO 45001 хэрэгжүүлэлт", "Удирдлагын систем боловсруулах", "Дотоод аудит"],
  },
  {
    id: "health-exam",
    title: "Эрүүл мэндийн үзлэг",
    description:
      "Ажилтны эрүүл мэндийн үзлэг зохион байгуулах, ажлын байранд холбогдох мэргэжлийн үзлэг.",
    detail: "Ажлын байранд холбогдох эрүүл мэндийн үзлэг, мэргэжлийн оношлуулалт зохион байгуулах, эрүүл мэндийн гэрчилгээ олгох.",
    icon: Stethoscope,
    benefits: ["Эрүүл мэндийн үзлэг зохион байгуулах", "Мэргэжлийн оношлуулалт", "Гэрчилгээ олгох"],
  },
  {
    id: "workplace-assess",
    title: "Ажлын байраны үнэлгээ",
    description:
      "Ажлын байраны нөхцөл, орчин, тоног төхөөрөмжийн үнэлгээ хийх, дүгнэлт гаргах.",
    detail: "Ажлын байраны нөхцөл, орчин, тоног төхөөрөмжийн бүрэн үнэлгээ хийж, дүгнэлт болон сайжруулалтын санал тавина.",
    icon: ClipboardCheck,
    benefits: ["Бүрэн үнэлгээ хийх", "Дүгнэлт тайлан", "Сайжруулалтын санал"],
  },
  {
    id: "iso-consult",
    title: "ISO стандартын зөвлөгөө",
    description:
      "ISO 45001, ISO 14001, ISO 9001 зэрэг олон улсын стандартын зөвлөгөө, хэрэгжүүлэлт.",
    detail: "ISO 45001, ISO 14001, ISO 9001 зэрэг олон улсын стандартын зөвлөгөө өгч, хэрэгжүүлэлт, гэрчилгээнд бэлтгэх.",
    icon: Award,
    benefits: ["ISO стандартын зөвлөгөө", "Гэрчилгээнд бэлтгэл", "Хэрэгжүүлэх дэмжлэг"],
  },
];

export default function ConsultingPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selected = serviceTypes.find((s) => s.id === selectedService);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          serviceType: selectedService,
        }),
      });
      if (res.ok) {
        toast.success(
          "Зөвлөгөөний хүсэлт амжилттай илгээгдлээ! Бид тантай холбогдох болно."
        );
        setForm({ name: "", email: "", phone: "", company: "", description: "" });
        setSelectedService(null);
      } else {
        toast.error("Алдаа гарлаа. Дахин оролдоно уу.");
      }
    } catch {
      toast.error("Серверийн алдаа гарлаа.");
    } finally {
      setIsSubmitting(false);
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-700/50 border border-brand-600/30 mb-6">
              <ShieldCheck className="w-4 h-4 text-brand-300" />
              <span className="text-sm font-medium text-brand-200">
                Мэргэжлийн зөвлөгөө
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Зөвлөх Үйлчилгээ
            </h1>
            <p className="text-brand-200/80 max-w-2xl mx-auto text-lg">
              Байгууллагын ХАБЭА-ийн бүх төрлийн зөвлөгөө үйлчилгээг
              мэргэжлийн түвшинд үзүүлнэ
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {!selectedService ? (
              /* ─── List View: 6 service cards ─── */
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {serviceTypes.map((service, index) => {
                    const Icon = service.icon;
                    return (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.07 }}
                      >
                        <Card
                          className="h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-200 group"
                          onClick={() => setSelectedService(service.id)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4 mb-3">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-brand-50 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                                <Icon className="w-6 h-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground mb-1">
                                  {service.title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {service.description}
                                </p>
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
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Back button */}
                <button
                  onClick={() => setSelectedService(null)}
                  className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium mb-8 group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Бүх үйлчилгээг харах
                </button>

                <div className="grid lg:grid-cols-5 gap-8">
                  {/* LEFT: Service info */}
                  <div className="lg:col-span-2">
                    {selected && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                        <Card className="border-0 shadow-sm overflow-hidden">
                          {/* Service hero */}
                          <div className="bg-gradient-to-br from-brand-600 to-brand-700 p-8 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                              {(() => {
                                const Icon = selected.icon;
                                return <Icon className="w-8 h-8 text-white" />;
                              })()}
                            </div>
                            <h2 className="text-xl font-bold text-white">
                              {selected.title}
                            </h2>
                          </div>
                          <CardContent className="p-6 space-y-5">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {selected.detail}
                            </p>

                            {/* Benefits */}
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Танд ямар ач холбогдолтай вэ?
                              </p>
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

                            {/* Quick info */}
                            <div className="pt-4 border-t space-y-3">
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <Clock className="w-4 h-4 text-brand-400" />
                                <span>Хариу 1-2 ажлын өдөр</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <Phone className="w-4 h-4 text-brand-400" />
                                <span>+976 7777-XXXX</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <Mail className="w-4 h-4 text-brand-400" />
                                <span>info@habea.mn</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </div>

                  {/* RIGHT: Form */}
                  <div className="lg:col-span-3">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <Card className="border-brand-100 bg-gradient-to-br from-white to-brand-50/30">
                        <CardContent className="p-6 lg:p-8">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                              <Send className="w-5 h-5 text-brand-600" />
                            </div>
                            <div>
                              <h2 className="text-lg font-bold text-foreground">
                                Зөвлөгөөний Хүсэлт Илгээх
                              </h2>
                              <p className="text-xs text-muted-foreground">
                                Мэдээллээ бөглөж, бид тантай холбогдох болно
                              </p>
                            </div>
                          </div>

                          {/* Selected service badge */}
                          {selected && (
                            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-brand-50 border border-brand-100 mb-6">
                              <div className="w-9 h-9 rounded-lg bg-brand-500 text-white flex items-center justify-center shrink-0">
                                {(() => {
                                  const Icon = selected.icon;
                                  return <Icon className="w-4 h-4" />;
                                })()}
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Сонгосон үйлчилгээ</Label>
                                <p className="font-medium text-brand-800 text-sm">{selected.title}</p>
                              </div>
                            </div>
                          )}

                          <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Нэр <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <Input
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Таны овог нэр"
                                    className="pl-10"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Имэйл <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <Input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="email@example.com"
                                    className="pl-10"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Утас <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <Input
                                    required
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="+976 XXXX XXXX"
                                    className="pl-10"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Компани</Label>
                                <div className="relative">
                                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <Input
                                    value={form.company}
                                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                                    placeholder="Байгууллагын нэр"
                                    className="pl-10"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Тодорхойлолт</Label>
                              <Textarea
                                rows={4}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Зөвлөгөөний талаар дэлгэрэнгүй тайлбар..."
                              />
                            </div>
                            <Button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full bg-brand-600 hover:bg-brand-700 text-white py-6 text-base font-semibold rounded-xl"
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Илгээж байна...
                                </>
                              ) : (
                                <>
                                  Хүсэлт илгээх
                                  <Send className="w-4 h-4 ml-2" />
                                </>
                              )}
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
        </div>
      </section>
    </div>
  );
}

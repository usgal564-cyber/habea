"use client";

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
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const serviceTypes = [
  {
    id: "policy-intro",
    title: "ХАБЭА бодлоготой танилцуулах",
    description:
      "Байгууллагын ХАБЭА бодлогын төслийг боловсруулан, танилцуулах үйлчилгээ. Ажилтанд танилцуулах, ойлголт өгөх.",
    icon: FileText,
  },
  {
    id: "safety-consult",
    title: "Аюулгүй ажиллагааны зөвлөгөө",
    description:
      "Ажлын байраны аюулгүй байдлын дүрмийн зөвлөгөө, эрсдэлийн үнэлгээ хийх, аюулгүй байдлын төлөвлөгөө боловсруулах.",
    icon: ShieldCheck,
  },
  {
    id: "habea-system",
    title: "ХАБЭА удирдлагын систем",
    description:
      "ISO 45001 стандартын дагуу ХАБЭА удирдлагын системийг боловсруулан, хэрэгжүүлэхэд зөвлөгөө өгөх.",
    icon: Network,
  },
  {
    id: "health-exam",
    title: "Эрүүл мэндийн үзлэг",
    description:
      "Ажилтны эрүүл мэндийн үзлэг зохион байгуулах, ажлын байранд холбогдох мэргэжлийн үзлэг.",
    icon: Stethoscope,
  },
  {
    id: "workplace-assess",
    title: "Ажлын байраны үнэлгээ",
    description:
      "Ажлын байраны нөхцөл, орчин, тоног төхөөрөмжийн үнэлгээ хийх, дүгнэлт гаргах.",
    icon: ClipboardCheck,
  },
  {
    id: "iso-consult",
    title: "ISO стандартын зөвлөгөө",
    description:
      "ISO 45001, ISO 14001, ISO 9001 зэрэг олон улсын стандартын зөвлөгөө, хэрэгжүүлэлт.",
    icon: Award,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) {
      toast.error("Үйлчилгээний төрөл сонгоно уу.");
      return;
    }
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

  const selected = serviceTypes.find((s) => s.id === selectedService);

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

      {/* Service Cards */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceTypes.map((service, index) => {
              const Icon = service.icon;
              const isSelected = selectedService === service.id;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.07 }}
                >
                  <Card
                    className={cn(
                      "h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group",
                      isSelected
                        ? "border-brand-400 ring-2 ring-brand-200 bg-brand-50/40"
                        : "hover:border-brand-200"
                    )}
                    onClick={() =>
                      setSelectedService(isSelected ? null : service.id)
                    }
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-3">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300",
                            isSelected
                              ? "bg-brand-500 text-white"
                              : "bg-brand-50 text-brand-600 group-hover:bg-brand-100"
                          )}
                        >
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
                      {isSelected && (
                        <div className="flex items-center gap-2 mt-2 text-brand-600 text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          Сонгогдсон
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Form */}
          <AnimatePresence>
            {selectedService && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: 20 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: 10 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <div className="mt-12 max-w-3xl mx-auto">
                  <Card className="border-brand-100 bg-gradient-to-br from-white to-brand-50/30">
                    <CardContent className="p-6 lg:p-8">
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-100 mb-3">
                          <Send className="w-6 h-6 text-brand-600" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">
                          Зөвлөгөөний Хүсэлт Илгээх
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Мэдээллээ бөглөж, бид тантай холбогдох болно
                        </p>
                      </div>

                      {/* Selected Service Badge */}
                      <div className="p-3 rounded-xl bg-brand-50 border border-brand-100 mb-6">
                        <Label className="text-xs text-muted-foreground">
                          Сонгосон үйлчилгээ
                        </Label>
                        <p className="font-medium text-brand-800 mt-0.5">
                          {selected?.title}
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>
                              Нэр <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              required
                              value={form.name}
                              onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                              }
                              placeholder="Таны овог нэр"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>
                              Имэйл <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              type="email"
                              required
                              value={form.email}
                              onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                              }
                              placeholder="email@example.com"
                            />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>
                              Утас <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              required
                              value={form.phone}
                              onChange={(e) =>
                                setForm({ ...form, phone: e.target.value })
                              }
                              placeholder="+976 XXXX XXXX"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Компани</Label>
                            <Input
                              value={form.company}
                              onChange={(e) =>
                                setForm({ ...form, company: e.target.value })
                              }
                              placeholder="Байгууллагын нэр"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Тодорхойлолт</Label>
                          <Textarea
                            rows={4}
                            value={form.description}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                description: e.target.value,
                              })
                            }
                            placeholder="Зөвлөгөөний талаар дэлгэрэнгүй тайлбар..."
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-brand-600 hover:bg-brand-700 text-white py-6 text-base font-semibold rounded-xl"
                        >
                          {isSubmitting
                            ? "Илгээж байна..."
                            : "Хүсэлт илгээх"}
                          <Send className="w-4 h-4 ml-2" />
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedService && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-10"
            >
              <div className="inline-flex items-center gap-2 text-brand-500 text-sm">
                <ChevronDown className="w-4 h-4 animate-bounce" />
                Дээрх үйлчилгээний төрлөөс сонгоно уу
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

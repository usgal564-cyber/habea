"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Target,
  Eye,
  Rocket,
  Users,
  Building2,
  Globe,
  Landmark,
  Factory,
  Mail,
  Phone,
  User,
  Briefcase,
  MessageSquare,
  Send,
  MapPin,
  Clock,
  Shield,
  Heart,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/* ---- animation helpers ---- */
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

/* ---- data ---- */
const missionVisionGoals = [
  {
    icon: Target,
    label: "Зорилго",
    title: "Бидний зорилго",
    description:
      "Монгол Улсын бага дунд аж ахуйн нэгжүүдийн ажилтны аюулгүй байдал, эрүүл ахуйн түвшнийг дээшлүүлж, олон улсын стандартын хүртэл хүргэхэд туслах нь бидний гол зорилго юм.",
    accent: "from-brand-500 to-brand-600",
    accentBg: "bg-brand-500",
  },
  {
    icon: Eye,
    label: "Алсын хараа",
    title: "Бидний алсын хараа",
    description:
      "Бага дунд аж ахуйн нэгжүүдийн ажилтнууд бүр ХАБЭА-ын мэдлэгтэй, аюулгүй, эрүүл ажлын орчинд ажилладаг нийгмийг бүрдүүлэх.",
    accent: "from-brand-600 to-brand-700",
    accentBg: "bg-brand-600",
  },
  {
    icon: Rocket,
    label: "Үйл ажиллагаа",
    title: "Бидний үйл ажиллагаа",
    description:
      "ХАБЭА-ын сургалт, семинар, зөвлөгөө, шалгалт, тест, судалгаа зэрэг цогц үйлчилгээг үзүүлж, ажил олгогч нарт дэмжлэг үзүүлнэ.",
    accent: "from-brand-700 to-brand-800",
    accentBg: "bg-brand-700",
  },
];

const partners = [
  { icon: Landmark, name: "Хөдөлмөрийн болон нийгмийн хамгааллын яам", desc: "Төрийн бодлогын хамтрагч" },
  { icon: Shield, name: "Ажлын байранд хяналт тавих газар", desc: "Хяналтын байгууллага" },
  { icon: Building2, name: "Монголын ХАБЭА холбоо", desc: "Мэргэжлийн нийгэмлэг" },
  { icon: Globe, name: "Олон улсын ХАБА байгууллагууд", desc: "Олон улсын түнш" },
  { icon: Factory, name: "Бага дунд үйлдвэрүүд", desc: "Аж ахуйн нэгжүүд" },
  { icon: Heart, name: "Боловсролын байгууллагууд", desc: "Боловсролын түнш" },
];

const contactInfo = [
  { icon: MapPin, label: "Хаяг", value: "Улаанбаатар хот, БЗД, 1-р хороо" },
  { icon: Phone, label: "Утас", value: "+976 7700-1234" },
  { icon: Mail, label: "И-мэйл", value: "info@habea.mn" },
  { icon: Clock, label: "Цагийн хуваарь", value: "Даваа - Баасан, 09:00 - 18:00" },
];

/* ---- component ---- */
export default function AboutPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Мэдээллийг бүрэн оруулна уу");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Алдаа гарлаа");
      }

      toast.success("Амжилттай илгээгдлээ! Бид тун удахгүй холбогдох болно.");
      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Серверийн алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden">
      {/* ========== PAGE HEADER ========== */}
      <section className="relative py-16 sm:py-24 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-brand-50/50 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 via-brand-400 to-brand-600" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={staggerItem} className="inline-flex items-center gap-2 bg-brand-100 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span className="text-brand-700 text-sm font-semibold">Бидний тухай</span>
            </motion.div>
            <motion.h1 variants={staggerItem} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              ХАБЭА <span className="text-brand-700">баг хамт олон</span>
            </motion.h1>
            <motion.p variants={staggerItem} className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Бид нь ажилтны аюулгүй байдал, эрүүл ахуйн салбарт мэргэжлийн
              туршлагатай, үйлчилгээндээ санаатай баг хамт олон юм.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ========== MISSION / VISION / GOALS ========== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {missionVisionGoals.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.label} variants={staggerItem}>
                  <Card className="group h-full border-brand-100 hover:border-brand-200 shadow-sm hover:shadow-lg hover:shadow-brand-900/8 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className={`h-1.5 bg-gradient-to-r ${item.accent}`} />
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-1">
                        <div className={`w-12 h-12 rounded-2xl bg-brand-100 group-hover:bg-brand-200 flex items-center justify-center transition-colors duration-300`}>
                          <Icon className="w-6 h-6 text-brand-700" />
                        </div>
                        <span className="text-xs font-semibold tracking-wider uppercase text-brand-600">
                          {item.label}
                        </span>
                      </div>
                      <CardTitle className="text-xl mt-2">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">
                        {item.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ========== ABOUT CONTENT ========== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-brand-50/40">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            <motion.div variants={staggerItem} className="text-center mb-12">
              <span className="inline-block text-brand-600 text-sm font-semibold tracking-wider uppercase mb-3">
                Бидний танилцуулга
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                ХАБЭА салбарын <span className="text-brand-700">тэргүүлэгч</span>
              </h2>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="bg-white rounded-2xl border border-brand-100 shadow-sm p-6 sm:p-10"
            >
              <div className="space-y-4 text-muted-foreground leading-relaxed text-[15px]">
                <p>
                  <span className="font-semibold text-foreground">ХАБЭА</span> нь Монгол
                  Улсын бага дунд аж ахуйн нэгжүүдийн ажилтны аюулгүй байдал, эрүүл
                  ахуйн ажлыг дэмжих зорилготойгоор байгуулагдсан байгууллага юм.
                </p>
                <p>
                  Бид өнөөдрийн байдлаар <span className="text-brand-700 font-semibold">500+</span> сургалт,
                  <span className="text-brand-700 font-semibold"> 1000+</span> харилцагчтай,
                  <span className="text-brand-700 font-semibold"> 50+</span> байгууллагатай хамтран
                  ажиллаж, <span className="text-brand-700 font-semibold">98%</span> үйлчилгээний
                  чанартай үйл ажиллагаагаа явуулж байна.
                </p>
                <p>
                  Манай баг нь ХАБЭА-ын салбарт 10 гаруй жилийн туршлагатай мэргэжилтнүүдээс
                  бүрдсэн бөгөөд олон улсын ХАБЭА стандарт, хамгийн сүүлийн үеийн
                  технологийг ашиглан сургалт, шалгалт, зөвлөгөөний үйлчилгээг үзүүлдэг.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========== PARTNERS ========== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            <motion.div variants={staggerItem} className="text-center mb-12">
              <span className="inline-block text-brand-600 text-sm font-semibold tracking-wider uppercase mb-3">
                Түншлэл
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Хамт олны <span className="text-brand-700">хүч</span>
              </h2>
              <p className="text-muted-foreground text-base max-w-xl mx-auto">
                Бид төр, хувийн хэвшил, олон улсын байгууллагуудтай хамтран ажиллаж
                байна
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {partners.map((partner) => {
                const Icon = partner.icon;
                return (
                  <motion.div key={partner.name} variants={staggerItem}>
                    <Card className="h-full border-brand-100 hover:border-brand-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-brand-700" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-sm mb-1">
                            {partner.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {partner.desc}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========== CONTACT ========== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-brand-50/40">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            <motion.div variants={staggerItem} className="text-center mb-12">
              <span className="inline-block text-brand-600 text-sm font-semibold tracking-wider uppercase mb-3">
                Холбогдох
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Бидэнтэй <span className="text-brand-700">холбогдох</span>
              </h2>
              <p className="text-muted-foreground text-base max-w-xl mx-auto">
                Асуулт, санал хүсэлт байвал бидэнд холбогдож болно. Бид тун
                удахгүй хариу өгнө.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-5 gap-8">
              {/* Contact Info Cards */}
              <motion.div variants={staggerContainer} className="lg:col-span-2 space-y-4">
                {contactInfo.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={item.label} variants={staggerItem}>
                      <Card className="border-brand-100 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-brand-700" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">
                              {item.label}
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                              {item.value}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Contact Form */}
              <motion.div variants={staggerItem} className="lg:col-span-3">
                <Card className="border-brand-100 shadow-sm">
                  <CardContent className="p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="space-y-2">
                          <Label htmlFor="contact-name" className="text-sm font-medium">
                            <User className="w-3.5 h-3.5 mr-1.5 inline-block text-brand-600" />
                            Нэр <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="contact-name"
                            name="name"
                            placeholder="Таны нэр"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="h-11 border-brand-200 focus:border-brand-500 focus:ring-brand-500/20"
                          />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <Label htmlFor="contact-email" className="text-sm font-medium">
                            <Mail className="w-3.5 h-3.5 mr-1.5 inline-block text-brand-600" />
                            И-мэйл <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="contact-email"
                            name="email"
                            type="email"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="h-11 border-brand-200 focus:border-brand-500 focus:ring-brand-500/20"
                          />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                          <Label htmlFor="contact-phone" className="text-sm font-medium">
                            <Phone className="w-3.5 h-3.5 mr-1.5 inline-block text-brand-600" />
                            Утас
                          </Label>
                          <Input
                            id="contact-phone"
                            name="phone"
                            type="tel"
                            placeholder="+976 7700-0000"
                            value={formData.phone}
                            onChange={handleChange}
                            className="h-11 border-brand-200 focus:border-brand-500 focus:ring-brand-500/20"
                          />
                        </div>

                        {/* Company */}
                        <div className="space-y-2">
                          <Label htmlFor="contact-company" className="text-sm font-medium">
                            <Briefcase className="w-3.5 h-3.5 mr-1.5 inline-block text-brand-600" />
                            Байгууллага
                          </Label>
                          <Input
                            id="contact-company"
                            name="company"
                            placeholder="Байгууллагын нэр"
                            value={formData.company}
                            onChange={handleChange}
                            className="h-11 border-brand-200 focus:border-brand-500 focus:ring-brand-500/20"
                          />
                        </div>
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <Label htmlFor="contact-message" className="text-sm font-medium">
                          <MessageSquare className="w-3.5 h-3.5 mr-1.5 inline-block text-brand-600" />
                          Зурвас <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="contact-message"
                          name="message"
                          placeholder="Асуулт, санал хүсэлтээ бичнэ үү..."
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          className="border-brand-200 focus:border-brand-500 focus:ring-brand-500/20 resize-none"
                        />
                      </div>

                      {/* Submit */}
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto bg-brand-700 hover:bg-brand-800 text-white font-semibold h-11 px-8 rounded-xl shadow-md shadow-brand-900/10 hover:shadow-lg transition-all"
                      >
                        {submitting ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Илгээж байна...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Илгээх
                          </span>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

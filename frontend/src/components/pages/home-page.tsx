"use client";

import { motion } from "framer-motion";
import {
  Shield,
  GraduationCap,
  Brain,
  ClipboardCheck,
  Users,
  Building2,
  Award,
  ArrowRight,
  CheckCircle2,
  Target,
  Lightbulb,
  Handshake,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PageId } from "@/app/page";

interface HomePageProps {
  onNavigate: (pageId: PageId) => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
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

const stats = [
  { value: "500+", label: "Сургалт", icon: GraduationCap },
  { value: "1000+", label: "Харилцагч", icon: Users },
  { value: "50+", label: "Байгуулга", icon: Building2 },
  { value: "98%", label: "Үйлчилгээ", icon: Award },
];

const features = [
  {
    icon: GraduationCap,
    title: "Мэргэжлийн сургалт",
    description:
      "ХАБЭА-ын мэдлэг, ур чадварыг дээшлүүлэх бүх төрлийн сургалт, семинар зохион байгуулна.",
    pageId: "training" as PageId,
    color: "from-brand-500 to-brand-700",
    bgColor: "bg-brand-50",
    iconColor: "text-brand-600",
  },
  {
    icon: Brain,
    title: "Мэдлэг сорих",
    description:
      "Олон төрлийн ХАБЭА-ын мэдлэгийн тестүүдээр өөрийгөө сорь, дадлага хийнэ.",
    pageId: "quiz" as PageId,
    color: "from-brand-600 to-brand-800",
    bgColor: "bg-brand-50",
    iconColor: "text-brand-600",
  },
  {
    icon: ClipboardCheck,
    title: "Шалгалт өгөх",
    description:
      "Байгууллагаас зохион байгуулсан албан ёсны ХАБЭА шалгалтанд онлайн оролцоно.",
    pageId: "exam" as PageId,
    color: "from-brand-700 to-brand-900",
    bgColor: "bg-brand-50",
    iconColor: "text-brand-600",
  },
];

const highlights = [
  {
    icon: Target,
    title: "Зорилготой",
    description: "Ажилтны аюулгүй байдал, эрүүл ахуйн стандартын дагуу сургалт зохион байгуулна",
  },
  {
    icon: Lightbulb,
    title: "Шинэлэг",
    description: "Цахим шалгалт, тест системээр хурдан шуурхай үр дүнд хүрнэ",
  },
  {
    icon: Handshake,
    title: "Итгэлтэй",
    description: "Бага дунд аж ахуйн нэгжүүдтэй урт хугацааны түншлэл",
  },
];

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="overflow-hidden">
      {/* ========== HERO SECTION ========== */}
      <section className="relative min-h-[85vh] flex items-center justify-center">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(76,175,80,0.15),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(34,139,54,0.2),_transparent_50%)]" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating decorative shapes */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-brand-400/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-brand-300/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Logo badge */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8"
          >
            <Shield className="w-4 h-4 text-brand-300" />
            <span className="text-brand-200 text-sm font-medium">
              Бага дунд аж ахуйн нэгж
            </span>
          </motion.div>

          {/* Company Name */}
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-5xl sm:text-6xl lg:text-8xl font-extrabold text-white mb-6 tracking-tight"
          >
            ХАБЭА
          </motion.h1>

          {/* Tagline */}
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-lg sm:text-xl lg:text-2xl text-brand-100 max-w-2xl mx-auto mb-4 font-light leading-relaxed"
          >
            Ажилтны аюулгүй байдал, эрүүл ахуйн ажлыг
            <span className="text-brand-300 font-semibold"> мэргэжлийн түвшинд</span>{" "}
            зохион байгуулна
          </motion.p>

          <motion.p
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-base text-brand-200/80 max-w-xl mx-auto mb-10"
          >
            Бага дунд аж ахуйн нэгжүүдэд зориулсан цогц ХАБЭА сургалт, шалгалт, зөвлөх үйлчилгээ
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Button
              size="lg"
              onClick={() => onNavigate("training")}
              className="bg-white text-brand-900 hover:bg-brand-50 font-semibold h-12 px-8 text-base rounded-xl shadow-lg shadow-black/10 hover:shadow-xl transition-all"
            >
              <GraduationCap className="w-5 h-5 mr-2" />
              Сургалт
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              size="lg"
              onClick={() => onNavigate("quiz")}
              className="bg-white text-brand-900 hover:bg-brand-50 font-semibold h-12 px-8 text-base rounded-xl shadow-lg shadow-black/10 hover:shadow-xl transition-all"
            >
              <Brain className="w-5 h-5 mr-2" />
              Мэдлэг сорих
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              size="lg"
              onClick={() => onNavigate("exam")}
              className="bg-white text-brand-900 hover:bg-brand-50 font-semibold h-12 px-8 text-base rounded-xl shadow-lg shadow-black/10 hover:shadow-xl transition-all"
            >
              <ClipboardCheck className="w-5 h-5 mr-2" />
              Шалгалт
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ========== STATS SECTION ========== */}
      <section className="relative -mt-16 z-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} variants={staggerItem}>
                <Card className="border-brand-100 shadow-lg shadow-brand-900/5 hover:shadow-xl hover:shadow-brand-900/10 transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-brand-700" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-brand-900">
                      {stat.value}
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">
                      {stat.label}
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="text-center mb-14"
          >
            <motion.span
              variants={staggerItem}
              className="inline-block text-brand-600 text-sm font-semibold tracking-wider uppercase mb-3"
            >
              Үйлчилгээ
            </motion.span>
            <motion.h2
              variants={staggerItem}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4"
            >
              Бидний үйлчилгээнүүд
            </motion.h2>
            <motion.p
              variants={staggerItem}
              className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto"
            >
              ХАБЭА-ын бүхий л үйл ажиллагааг цогц байдлаар дэмжих үйлчилгээг санал болгож байна
            </motion.p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={staggerItem}>
                  <Card className="group h-full border-brand-100 hover:border-brand-200 shadow-sm hover:shadow-lg hover:shadow-brand-900/8 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
                    onClick={() => onNavigate(feature.pageId)}
                  >
                    {/* Gradient top bar */}
                    <div className={`h-1.5 bg-gradient-to-r ${feature.color}`} />
                    <CardContent className="p-6 sm:p-8 flex flex-col gap-5">
                      <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-brand-700 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                      <div className="mt-auto pt-2">
                        <span className="inline-flex items-center gap-1.5 text-brand-600 text-sm font-medium group-hover:gap-2.5 transition-all">
                          Дэлгэрэнгүй
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ========== WHY US SECTION ========== */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-brand-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
            >
              <motion.span
                variants={staggerItem}
                className="inline-block text-brand-600 text-sm font-semibold tracking-wider uppercase mb-3"
              >
                Яагаад бид?
              </motion.span>
              <motion.h2
                variants={staggerItem}
                className="text-3xl sm:text-4xl font-bold text-foreground mb-6"
              >
                Бага дунд аж ахуйн нэгжүүдийн{" "}
                <span className="text-brand-700">ХАБЭА түнш</span>
              </motion.h2>
              <motion.p
                variants={staggerItem}
                className="text-muted-foreground text-base leading-relaxed mb-8"
              >
                Бид нь олон жилийн туршлагатай ХАБЭА мэргэжилтнүүдээс бүрдсэн баг бөгөөд
                Mongolia-ын Бага дунд аж ахуйн нэгжүүдэд зориулсан бүрэн цогц
                үйлчилгээг үзүүлж байна.
              </motion.p>

              <motion.div
                variants={staggerContainer}
                className="space-y-4"
              >
                {[
                  "Ажилтны аюулгүй байдал, эрүүл ахуйн хууль, хүрээлэн байгаа орчны тухай хууль тогтоомжийн хэрэгжилт",
                  "Ажил олгогч, ажилтны ХАБЭА-ын үүрэг, хариуцлагын талаар мэдлэг олгох",
                  "Ажилтны эрүүл мэнд, аюулгүй ажиллагааг хангах арга хэмжээ",
                  "Ажлын байранд гарах аюулгүй байдал, эрүүл ахуйн шаардлагууд",
                ].map((text, i) => (
                  <motion.div
                    key={i}
                    variants={staggerItem}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-brand-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground leading-relaxed">
                      {text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div variants={staggerItem} className="mt-8">
                <Button
                  size="lg"
                  onClick={() => onNavigate("about")}
                  className="bg-brand-700 hover:bg-brand-800 text-white font-semibold h-12 px-8 rounded-xl shadow-md shadow-brand-900/10 hover:shadow-lg transition-all"
                >
                  Бидний тухай
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Right: Highlight cards */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid sm:grid-cols-2 gap-4"
            >
              {highlights.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    variants={staggerItem}
                    className={i === 0 ? "sm:col-span-2" : ""}
                  >
                    <Card className="h-full border-brand-100 hover:border-brand-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-brand-700" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== CTA BANNER ========== */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 p-8 sm:p-12 lg:p-16 text-center"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-300/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4"
              >
                Аюулгүй, эрүүл ажлын орчин бүрдүүлье
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-brand-200 text-base sm:text-lg max-w-xl mx-auto mb-8"
              >
                Манай сургалтуудад нэгдэж, ХАБЭА-ын мэдлэг чадвараа дээшлүүлээрэй.
                Эхлэхэд бэлэн үү?
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3"
              >
                <Button
                  size="lg"
                  onClick={() => onNavigate("training")}
                  className="bg-white text-brand-900 hover:bg-brand-50 font-semibold h-12 px-8 text-base rounded-xl shadow-lg transition-all"
                >
                  Сургалт үзэх
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  size="lg"
                  onClick={() => onNavigate("consulting")}
                  className="bg-white text-brand-900 hover:bg-brand-50 font-semibold h-12 px-8 text-base rounded-xl shadow-lg transition-all"
                >
                  Зөвлөгөө авах
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

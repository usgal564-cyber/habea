"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Users,
  Award,
  BookOpen,
  ArrowDown,
  CheckCircle2,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void;
}

const stats = [
  { icon: Users, value: "5,000+", label: "Сургалтад хамрагдсан" },
  { icon: Award, value: "98%", label: "Амжилтын хувь" },
  { icon: BookOpen, value: "50+", label: "Сургалтын хөтөлбөр" },
  { icon: TrendingUp, value: "10+", label: "Жилийн туршлага" },
];

const features = [
  {
    icon: Shield,
    title: "ХАБЭА Систем",
    desc: "Ажлын байраны эрүүл мэнд, аюулгүй байдал, байгаль орчны менежмент",
  },
  {
    icon: Target,
    title: "Мэргэжлийн Сургалт",
    desc: "Монголын хууль, хүний эрх, хөдөлмөрийн хуулийн дагуу сургалт",
  },
  {
    icon: Clock,
    title: "Уян хатан Хуваарь",
    desc: "Таны цагийн хуваарид тохирох уян хатан сургалтын хувь",
  },
  {
    icon: CheckCircle2,
    title: "Сертификат",
    desc: "Улсын бүртгэлтэй гэрчилгээ олгоно",
  },
];

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800" />
      <div className="absolute inset-0 opacity-20">
        <img
          src="/hero-bg.png"
          alt="Hero background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/40 to-brand-950/60" />

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-brand-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-800/50 border border-brand-700/30 backdrop-blur-sm"
              >
                <Shield className="w-4 h-4 text-brand-400" />
                <span className="text-sm font-medium text-brand-200">
                  ХАБЭА Бага Дунд Аж Ахуйн Нэгж
                </span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Ажлын байраны{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-400">
                  аюулгүй байдал
                </span>
                <br />
                болон эрүүл мэндийн сургалт
              </h1>

              <p className="text-lg text-brand-200/80 max-w-xl leading-relaxed">
                Бид ажил олгогч эзэд, ажилтнуудад хАБЭА-ийн бодлоготой
                танилцуулан, мэдлэг чадварыг дээшлүүлэхэд туслах зорилготой
                үйл ажиллагааг эрхэлж явуулдаг.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => onNavigate("training")}
                className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300 px-8 py-6 text-base font-semibold rounded-xl"
              >
                Сургалт үзэх
                <ArrowDown className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate("about")}
                className="border-brand-600/30 text-brand-200 hover:bg-brand-800/40 hover:text-white hover:border-brand-500/50 px-8 py-6 text-base rounded-xl"
              >
                Бидний тухай
              </Button>
            </div>
          </motion.div>

          {/* Right: Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:grid grid-cols-2 gap-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="bg-brand-900/40 backdrop-blur-md border-brand-700/20 hover:bg-brand-900/60 transition-all duration-300 hover:border-brand-600/40 hover:-translate-y-1 group h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-brand-800/50 flex items-center justify-center mb-4 group-hover:bg-brand-700/50 transition-colors">
                      <feature.icon className="w-6 h-6 text-brand-400" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-brand-300/70 text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 lg:mt-24"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-brand-900/30 backdrop-blur-sm border border-brand-700/20 rounded-2xl p-4 lg:p-6 text-center hover:bg-brand-900/50 transition-all duration-300"
              >
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-brand-800/40 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-brand-400" />
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-brand-300/70 mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  AlertTriangle,
  Award,
  BookOpen,
  Target,
  MessageSquare,
  Handshake,
  Shield,
  Brain,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Heart,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TrainingCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  courses: {
    title: string;
    description: string;
    duration: string;
    icon: React.ElementType;
  }[];
}

const trainingCategories: TrainingCategory[] = [
  {
    id: "staff",
    title: "Нийт Ажилтны Сургалт",
    subtitle: "Ажил олгогч эздийн сургалт, эрсдэлтэй ажлын байрны сургалт, ХАБЭА ажилтан мэргэшүүлэх сургалт",
    icon: Users,
    color: "text-brand-600",
    bgColor: "bg-brand-50",
    courses: [
      {
        title: "АЖИЛ ОЛГОГЧ ЭЗДИЙН СУРГАЛТ",
        description: "Ажил олгогч эздийн ХАБЭА-ийн хууль эрх зүйн үүргийн тухай сургалт",
        duration: "8 цаг",
        icon: GraduationCap,
      },
      {
        title: "ЭРСДЭЛТЭЙ АЖЛЫН БАЙРНЫ СУРГАЛТ",
        description: "Эрсдэлтэй ажлын байранд ажиллагсдын эрүүл мэнд, аюулгүй байдал",
        duration: "16 цаг",
        icon: AlertTriangle,
      },
      {
        title: "ХАБЭА АЖИЛТАН МЭРГЭШҮҮЛЭХ СУРГАЛТ",
        description: "ХАБЭА мэргэжлийн ажилтны бэлтгэл, сургалт",
        duration: "40 цаг",
        icon: Award,
      },
    ],
  },
  {
    id: "personal",
    title: "Хувь хүний хөгжлийн сургалт",
    subtitle: "Багийн ажиллагаа, манлайлал, харилцаа хандах, архины хор уршиг, ёс зүйн ур чадвар",
    icon: Brain,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    courses: [
      {
        title: "БАГИЙН АЖИЛЛАГАА",
        description: "Багийн ажиллагааны ур чадвар, хамт олныг удирдах",
        duration: "8 цаг",
        icon: Users,
      },
      {
        title: "МАНЛАЙЛАЛ",
        description: "Удирдах ур чадвар, манлайлалын чадвар хөгжүүлэх",
        duration: "16 цаг",
        icon: Star,
      },
      {
        title: "ХАРИЛЦАА - ХАНДЛАГА",
        description: "Үр дүнтэй харилцааны ур чадвар, зөв зохистой хандах",
        duration: "8 цаг",
        icon: MessageSquare,
      },
      {
        title: "АРХИНЫ - ХОР УРШИГ",
        description: "Архи, тамхи, мансууруулах бодисын хор уршгийн тухай",
        duration: "4 цаг",
        icon: Heart,
      },
      {
        title: "ЁС ЗҮЙН - УР ЧАДВАР",
        description: "Мэргэжлийн ёс зүй, ажлын байрны ёс суртахуун",
        duration: "4 цаг",
        icon: Handshake,
      },
    ],
  },
  {
    id: "iso",
    title: "Олон улсын ISO стандартын аудитор бэлтгэх сургалт",
    subtitle: "MNS ISO 45001:2018, MNS ISO 14001:2015, MNS ISO 9001:2016",
    icon: FileCheck,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    courses: [
      {
        title: "MNS ISO 45001:2018",
        description: "ХАБЭА менежментийн систем - Олон улсын стандарт",
        duration: "40 цаг",
        icon: Shield,
      },
      {
        title: "MNS ISO 14001:2015",
        description: "Байгаль орчны менежментийн систем - Олон улсын стандарт",
        duration: "32 цаг",
        icon: Target,
      },
      {
        title: "MNS ISO 9001:2016",
        description: "Чанарын менежментийн систем - Олон улсын стандарт",
        duration: "32 цаг",
        icon: BookOpen,
      },
    ],
  },
];

function TrainingCategoryCard({ category }: { category: TrainingCategory }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-brand-100">
        {/* Category Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left"
        >
          <CardHeader className="pb-4 hover:bg-brand-50/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center",
                    category.bgColor
                  )}
                >
                  <category.icon className={cn("w-7 h-7", category.color)} />
                </div>
                <div>
                  <CardTitle className="text-xl text-foreground">
                    {category.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                    {category.subtitle}
                  </p>
                </div>
              </div>
              <div className="shrink-0 ml-4">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </button>

        {/* Courses */}
        {isExpanded && (
          <CardContent className="pt-0 pb-6">
            <div className="border-t border-brand-100 pt-6">
              <div className="space-y-4">
                {category.courses.map((course, index) => (
                  <motion.div
                    key={course.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-brand-50/30 hover:bg-brand-50/60 transition-colors"
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        category.bgColor
                      )}
                    >
                      <course.icon
                        className={cn("w-5 h-5", category.color)}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm">
                        {course.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {course.description}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="shrink-0 bg-brand-100 text-brand-700"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {course.duration}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}

export default function TrainingSection() {
  return (
    <section id="training" className="py-20 lg:py-28 bg-brand-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 border border-brand-200 mb-4">
            <GraduationCap className="w-4 h-4 text-brand-700" />
            <span className="text-sm font-medium text-brand-700">Сургалт</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Манай Сургалтын Хөтөлбөрүүд
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            ХАБЭА-ийн бүх түвшний сургалтууд, олон улсын стандартын аудитор
            бэлтгэл, хувь хүний хөгжлийн сургалтууд
          </p>
        </motion.div>

        {/* Training Categories */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {trainingCategories.map((category) => (
            <TrainingCategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: CheckCircle2,
                title: "Сертификат",
                desc: "Албан ёсны гэрчилгээ",
              },
              {
                icon: GraduationCap,
                title: "Мэргэжлийн багш",
                desc: "Туршлагатай багш нар",
              },
              {
                icon: BookOpen,
                title: "Хэрэглээний материал",
                desc: "Сургалтын материаллаг",
              },
              {
                icon: Award,
                title: "Гэрчилгээ олгоно",
                desc: "Мэргэжлийн гэрчилгээ",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="flex items-center gap-3 p-4 rounded-xl bg-white border border-brand-100 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {feature.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  BookOpen,
  Clock,
  Users,
  Award,
  GraduationCap,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  MapPin,
  Calendar,
  ArrowLeft,
  ArrowRight,
  FileText,
  CreditCard,
  Wallet,
  Lock,
  UserPlus,
  ClipboardList,
  Banknote,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/hooks/use-auth";

type Course = {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  price: number | null;
  maxStudents: number | null;
  image?: string | null;
  _count?: { registrations: number };
  schedule?: CourseSchedule;
};

type CourseSchedule = {
  startDate: string;
  endDate: string;
  days: string;
  time: string;
  location: string;
  instructor: string;
};

const COURSE_PRICES: Record<string, number> = {
  staff: 30000,
  personal: 25000,
  iso: 50000,
};

const COURSE_SCHEDULES: Record<string, CourseSchedule> = {
  "Ажлын байраны аюулгүй байдалын үндэс": {
    startDate: "2025-08-01",
    endDate: "2025-08-08",
    days: "Даваа - Баасан",
    time: "09:00 - 17:00",
    location: "Улаанбаатар, БЗД, 3-р хороо, Бизнес центер, 201 тоот",
    instructor: "Д. Батбаатар (ХАБЭА эксперт)",
  },
  "Гал түймрийн эсрэг тэмцэл": {
    startDate: "2025-08-15",
    endDate: "2025-08-22",
    days: "Даваа - Баасан",
    time: "10:00 - 18:00",
    location: "Улаанбаатар, БЗД, Цогцоолбор, 4-р давхар",
    instructor: "Г. Ууганбаяр (Гал унтраах сургалтын мэргэжилтэн)",
  },
  "Анхны тусламж": {
    startDate: "2025-08-10",
    endDate: "2025-08-17",
    days: "Даваа - Баасан",
    time: "09:00 - 17:00",
    location: "Улаанбаатар, СБД, Эрүүл мэндийн сургалтын төв",
    instructor: "Н. Оюунчимэг (Анхны тусламжын багш)",
  },
  "ISO 45001 ХАБЭА менежмент": {
    startDate: "2025-09-01",
    endDate: "2025-09-20",
    days: "Даваа - Пүрэв",
    time: "09:00 - 17:00",
    location: "Улаанбаатар, ЧД, Конференц танхим, 5-р давхар",
    instructor: "Т. Мөнхбаатар (ISO сертификацийн аудитор)",
  },
};

const CATEGORY_MAP: Record<string, string> = {
  staff: "Ажилтны сургалт",
  personal: "Хувь хүний сургалт",
  iso: "ISO сургалт",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  staff: <Users className="size-5" />,
  personal: <GraduationCap className="size-5" />,
  iso: <Award className="size-5" />,
};

const FALLBACK_COURSES: Course[] = [
  {
    id: "staff-1",
    title: "Ажлын байраны аюулгүй байдалын үндэс",
    category: "staff",
    description: "Ажлын байраны аюулгүй байдлын гол зарчмууд, хууль эрх зүйн актууд, ажилтны эрх үүрэг, аюулгүй ажиллагааны дүрмийн талаар сургалт",
    duration: "16 цаг",
    price: 30000,
    maxStudents: 30,
    _count: { registrations: 0 },
  },
  {
    id: "staff-2",
    title: "Гал түймрийн эсрэг тэмцэл",
    category: "staff",
    description: "Гал түймэр эхлэх шалтгаан, урьдчилан сэргийлэх аргууд, гал унтраах хэрэгсэл ашиглах, яаралтай нөхцөлд авах арга хэмжээ",
    duration: "8 цаг",
    price: 30000,
    maxStudents: 25,
    _count: { registrations: 0 },
  },
  {
    id: "staff-3",
    title: "Анхны тусламж",
    category: "staff",
    description: "Анхны тусламж үзүүлэх үндсэн мэдлэг, зүрхний массаж, амьсгалын замыг чөлөөлөх, шарх авах, тунадас авах зэрэг",
    duration: "8 цаг",
    price: 30000,
    maxStudents: 20,
    _count: { registrations: 0 },
  },
  {
    id: "staff-4",
    title: "Өндөрлөгийн ажил",
    category: "staff",
    description: "Өндөрлөгийн ажил гүйцэтгэхэд шаардлагатай хамгаалах хэрэгсэл, аюулгүй ажиллагааны дүрэм",
    duration: "8 цаг",
    price: 30000,
    maxStudents: 15,
    _count: { registrations: 0 },
  },
  {
    id: "personal-1",
    title: "Хувийн хамгаалах хэрэгсэл",
    category: "personal",
    description: "Хувийн хамгаалах хэрэгсэлүүдийн төрөл, зориулалт, зөв ашиглах арга",
    duration: "4 цаг",
    price: 25000,
    maxStudents: 30,
    _count: { registrations: 0 },
  },
  {
    id: "personal-2",
    title: "Цахилгааны аюулгүй байдал",
    category: "personal",
    description: "Цахилгааны гэнэтийн осол, цахилгаан гэдэс, хамгаалах хэрэгсэл ашиглах",
    duration: "8 цаг",
    price: 25000,
    maxStudents: 25,
    _count: { registrations: 0 },
  },
  {
    id: "personal-3",
    title: "Хортой бодисын аюулгүй байдал",
    category: "personal",
    description: "Хортой бодис танилт, аюулгүй ажиллагааны дүрэм, хадгалах тээвэрлэх",
    duration: "8 цаг",
    price: 25000,
    maxStudents: 20,
    _count: { registrations: 0 },
  },
  {
    id: "iso-1",
    title: "ISO 45001 ХАБЭА менежмент",
    category: "iso",
    description: "ISO 45001:2018 стандартын шаардлага, хэрэгжилт, дотоод аудит, менежментийн системийг бий болгох",
    duration: "40 цаг",
    price: 50000,
    maxStudents: 20,
    _count: { registrations: 0 },
  },
  {
    id: "iso-2",
    title: "ISO 14001 Байгаль орчин",
    category: "iso",
    description: "ISO 14001:2015 байгаль орчны менежментийн систем, нөлөөллийн үнэлгээ",
    duration: "32 цаг",
    price: 50000,
    maxStudents: 20,
    _count: { registrations: 0 },
  },
  {
    id: "iso-3",
    title: "ISO 9001 Чанарын менежмент",
    category: "iso",
    description: "ISO 9001:2015 чанарын менежментийн систем, үйл явцын хандлага, тогтмол сайжруулалт",
    duration: "32 цаг",
    price: 50000,
    maxStudents: 20,
    _count: { registrations: 0 },
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-end pt-2">
          <Skeleton className="h-9 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

function CourseCard({
  course,
  onEnroll,
  isRegistering,
}: {
  course: Course;
  onEnroll: (courseId: string) => void;
  isRegistering: boolean;
}) {
  const categoryKey = course.category.toLowerCase();
  const icon = CATEGORY_ICONS[categoryKey] || <BookOpen className="size-5" />;
  const price = course.price || COURSE_PRICES[categoryKey] || 30000;

  return (
    <motion.div variants={itemVariants} layout>
      <Card className="group relative overflow-hidden border-brand-100 bg-white transition-all duration-300 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-100/50">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 to-brand-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1.5">
              <CardTitle className="text-lg leading-tight text-brand-900 group-hover:text-brand-700 transition-colors">
                {course.title}
              </CardTitle>
              <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                {course.description}
              </CardDescription>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
              {icon}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-brand-500" />
              <span>{course.duration}</span>
            </div>
            {course.maxStudents && (
              <div className="flex items-center gap-1.5">
                <Users className="size-3.5 text-brand-500" />
                <span>Макс: {course.maxStudents}</span>
              </div>
            )}
            {course._count?.registrations !== undefined && (
              <Badge variant="secondary" className="text-xs bg-brand-50 text-brand-700 hover:bg-brand-100">
                {course._count.registrations} бүртгүүлсэн
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-lg font-bold text-brand-700">
              {price.toLocaleString()}₮
            </div>

            <Button
              size="sm"
              className="bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500"
              onClick={() => onEnroll(course.id)}
              disabled={isRegistering}
            >
              {isRegistering ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Lock className="size-4" />
              )}
              Бүртгүүлэх
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Enrollment Dialog (Multi-step) ──────────────────── */

type EnrollStep = "info" | "anket" | "payment" | "confirmed";

function EnrollmentDialog({
  course,
  onClose,
  onConfirmed,
}: {
  course: Course;
  onClose: () => void;
  onConfirmed: () => void;
}) {
  const { user, token } = useAuthStore();
  const [step, setStep] = useState<EnrollStep>("info");
  const [loading, setLoading] = useState(false);

  // Anket fields
  const [organization, setOrganization] = useState("");
  const [position, setPosition] = useState("");
  const [experience, setExperience] = useState("");
  const [goal, setGoal] = useState("");

  const categoryKey = course.category.toLowerCase();
  const price = course.price || COURSE_PRICES[categoryKey] || 30000;
  const schedule = COURSE_SCHEDULES[course.title];

  // Step 1: Check login & show course info
  const handleStepInfo = () => {
    if (!user || !token) {
      toast.error("Нэвтрэх шаардлагатай", { description: "Сургалтад бүртгүүлэхийн тулд нэвтэрнө үү." });
      return;
    }
    setStep("anket");
  };

  // Step 2: Fill anket & register
  const handleAnket = async () => {
    setLoading(true);
    try {
      // First register for the course
      const res = await fetch(`/api/courses/${course.id}/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Бүртгэл амжилттай!");
        setStep("payment");
      } else {
        toast.error("Бүртгэл амжилтгүй", { description: data.error || "Алдаа гарлаа" });
      }
    } catch {
      toast.error("Холболтын алдаа");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Payment
  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/courses/payment", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: course.id }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Төлбөр амжилттай!");
        setStep("confirmed");
      } else {
        toast.error("Төлбөр амжилтгүй", { description: data.error });
      }
    } catch {
      toast.error("Холболтын алдаа");
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = [
    { id: "info", label: "Мэдээлэл", icon: <ClipboardList className="w-4 h-4" /> },
    { id: "anket", label: "Анкет", icon: <FileText className="w-4 h-4" /> },
    { id: "payment", label: "Төлбөр", icon: <CreditCard className="w-4 h-4" /> },
    { id: "confirmed", label: "Баталгаа", icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const currentStepIdx = stepLabels.findIndex((s) => s.id === step);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-700 to-brand-900 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">{course.title}</h3>
              <p className="text-brand-200 text-sm mt-1">{COURSE_PRICES[categoryKey] ? "Төлбөртэй сургалт" : "Сургалтад бүртгүүлэх"}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {stepLabels.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    i <= currentStepIdx
                      ? "bg-white text-brand-700"
                      : "bg-white/20 text-white/60"
                  }`}
                >
                  {s.icon}
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`flex-1 h-0.5 ${i < currentStepIdx ? "bg-white" : "bg-white/20"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Course Info */}
            {step === "info" && (
              <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="bg-brand-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-brand-600" />
                    <span className="text-muted-foreground">Хугацаа:</span>
                    <span className="font-medium text-brand-900">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Banknote className="w-4 h-4 text-brand-600" />
                    <span className="text-muted-foreground">Үнэ:</span>
                    <span className="font-bold text-brand-900">{price.toLocaleString()}₮</span>
                  </div>
                  {course.maxStudents && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-brand-600" />
                      <span className="text-muted-foreground">Суудлын тоо:</span>
                      <span className="font-medium text-brand-900">{course.maxStudents}</span>
                    </div>
                  )}
                </div>

                {schedule && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                    <h4 className="font-semibold text-amber-900 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Хичээлийн хуваарь
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Эхлэх:</p>
                        <p className="font-medium">{schedule.startDate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Дуусах:</p>
                        <p className="font-medium">{schedule.endDate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Өдөр:</p>
                        <p className="font-medium">{schedule.days}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Цаг:</p>
                        <p className="font-medium">{schedule.time}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-muted-foreground">Байршил:</p>
                        <p className="font-medium">{schedule.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <UserPlus className="w-4 h-4 text-brand-600" />
                      <span className="text-muted-foreground">Багш:</span>
                      <span className="font-medium">{schedule.instructor}</span>
                    </div>
                  </div>
                )}

                <Button onClick={handleStepInfo} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3">
                  {user && token ? (
                    <>
                      Анкет бөглөх <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Нэвтрэх/Бүртгүүлэх
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Step 2: Anket */}
            {step === "anket" && (
              <motion.div key="anket" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h4 className="font-semibold text-brand-900">Бүртгэлийн анкет</h4>
                <div className="space-y-3">
                  <div>
                    <Label>Байгууллагын нэр</Label>
                    <Input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Ажиллаж байгаа байгууллага" />
                  </div>
                  <div>
                    <Label>Албан тушаал</Label>
                    <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Албан тушаал" />
                  </div>
                  <div>
                    <Label>Ажлын туршлага</Label>
                    <Input value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="Жишээ: 3 жил" />
                  </div>
                  <div>
                    <Label>Сургалтад бүртгүүлэх зорилго</Label>
                    <Textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Ямар зорилготой сургалтад хамрагдах вэ?" rows={3} />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("info")} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Буцах
                  </Button>
                  <Button onClick={handleAnket} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Бүртгүүлэх"}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {step === "payment" && (
              <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-amber-700" />
                  </div>
                  <h4 className="font-bold text-xl text-brand-900">Төлбөр төлөх</h4>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Сургалт:</span>
                    <span className="font-medium">{course.title}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-muted-foreground">Төлбөрийн дүн:</span>
                    <span className="text-xl font-bold text-amber-800">{price.toLocaleString()}₮</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 text-sm text-muted-foreground space-y-2">
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-600" />
                    Төлбөр төлсний дараа сургалтад баталгаажна
                  </p>
                  <p className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-brand-600" />
                    Сургалт дуусмагц сертификат олгогдоно
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("anket")} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Буцах
                  </Button>
                  <Button onClick={handlePayment} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white" disabled={loading}>
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-1" />
                        {price.toLocaleString()}₮ төлөх
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Confirmed */}
            {step === "confirmed" && (
              <motion.div key="confirmed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </motion.div>
                <h4 className="text-xl font-bold text-brand-900">Амжилттай бүртгэгдлээ!</h4>
                <p className="text-muted-foreground">Сургалтад амжилттай бүртгэгдлээ. Дараах мэдээллийг хадгална уу:</p>

                {schedule && (
                  <div className="bg-brand-50 rounded-xl p-4 text-left space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-brand-600" />
                      <span className="font-medium">{schedule.startDate} - {schedule.endDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-brand-600" />
                      <span>{schedule.days} | {schedule.time}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      <span>{schedule.location}</span>
                    </div>
                  </div>
                )}

                <Button onClick={() => { onConfirmed(); onClose(); }} className="w-full bg-brand-600 hover:bg-brand-700 text-white">
                  Дуусгах
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────── */

export default function TrainingPage() {
  const { user, token } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("staff");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();
        if (data.courses && data.courses.length > 0) {
          setCourses(data.courses);
        } else {
          setCourses(FALLBACK_COURSES);
        }
      } catch {
        setCourses(FALLBACK_COURSES);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const handleEnroll = useCallback((courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setShowEnrollDialog(true);
    }
  }, [courses]);

  const handleConfirmed = useCallback(() => {
    setShowEnrollDialog(false);
    setSelectedCourse(null);
  }, []);

  const getFilteredCourses = (category: string): Course[] => {
    const key = category.toLowerCase();
    return courses.filter((c) => c.category.toLowerCase() === key);
  };

  return (
    <section className="w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
          <ShieldCheck className="size-4" />
          Мэргэжлийн сургалт
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
          Сургалтууд
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          ХАБЭА-ын бүх чиглэлээр мэргэжлийн сургалт, семинар зохион байгуулдаг.
          Сургалтад бүртгүүлэх → Анкет бөглөх → Төлбөр төлөх → Хичээлийн хуваарь харах
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="bg-brand-50 p-1 h-auto">
            <TabsTrigger
              value="staff"
              className="rounded-md px-4 py-2.5 text-sm font-medium data-[state=active]:bg-brand-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              <Users className="size-4 mr-1.5" />
              Ажилтны сургалт
            </TabsTrigger>
            <TabsTrigger
              value="personal"
              className="rounded-md px-4 py-2.5 text-sm font-medium data-[state=active]:bg-brand-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              <GraduationCap className="size-4 mr-1.5" />
              Хувь хүний сургалт
            </TabsTrigger>
            <TabsTrigger
              value="iso"
              className="rounded-md px-4 py-2.5 text-sm font-medium data-[state=active]:bg-brand-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              <Award className="size-4 mr-1.5" />
              ISO сургалт
            </TabsTrigger>
          </TabsList>
        </div>

        {["staff", "personal", "iso"].map((cat) => (
          <TabsContent key={cat} value={cat}>
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {getFilteredCourses(cat).length > 0 ? (
                  getFilteredCourses(cat).map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onEnroll={handleEnroll}
                      isRegistering={registeringId === course.id}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
                      <BookOpen className="size-8 text-brand-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-brand-900">Сургалт олдсонгүй</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Энэ чиглэлээр одоогоор сургалт байхгүй байна.</p>
                  </div>
                )}
              </motion.div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Enrollment Dialog */}
      <AnimatePresence>
        {showEnrollDialog && selectedCourse && (
          <EnrollmentDialog
            course={selectedCourse}
            onClose={() => setShowEnrollDialog(false)}
            onConfirmed={handleConfirmed}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

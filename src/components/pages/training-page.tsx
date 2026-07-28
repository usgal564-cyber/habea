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
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
  // Staff courses
  {
    id: "staff-1",
    title: "Ажлын байраны аюулгүй байдалын үндэс",
    category: "staff",
    description:
      "Ажлын байраны аюулгүй байдлын гол зарчмууд, хууль эрх зүйн актууд, ажилтны эрх үүрэг, аюулгүй ажиллагааны дүрмийн талаар сургалт",
    duration: "16 цаг",
    price: null,
    maxStudents: 30,
    _count: { registrations: 0 },
  },
  {
    id: "staff-2",
    title: "Гал түймрийн эсрэг тэмцэл",
    category: "staff",
    description:
      "Гал түймэр эхлэх шалтгаан, урьдчилан сэргийлэх аргууд, гал унтраах хэрэгсэл ашиглах, яаралтай нөхцөлд авах арга хэмжээ",
    duration: "8 цаг",
    price: null,
    maxStudents: 25,
    _count: { registrations: 0 },
  },
  {
    id: "staff-3",
    title: "Анхны тусламж",
    category: "staff",
    description:
      "Анхны тусламж үзүүлэх үндсэн мэдлэг, зүрхний массаж, амьсгалын замыг чөлөөлөх, шарх авах, тунадас авах зэрэг",
    duration: "8 цаг",
    price: null,
    maxStudents: 20,
    _count: { registrations: 0 },
  },
  {
    id: "staff-4",
    title: "Өндөрлөгийн ажил",
    category: "staff",
    description:
      "Өндөрлөгийн ажил гүйцэтгэхэд шаардлагатай хамгаалах хэрэгсэл, аюулгүй ажиллагааны дүрэм, осгүйлэлтийн аргууд",
    duration: "8 цаг",
    price: null,
    maxStudents: 15,
    _count: { registrations: 0 },
  },
  // Personal courses
  {
    id: "personal-1",
    title: "Хувийн хамгаалах хэрэгсэл",
    category: "personal",
    description:
      "Хувийн хамгаалах хэрэгсэлүүдийн төрөл, зориулалт, зөв ашиглах арга, хадгалах нөхцөл, шинэчлэх хугацаа",
    duration: "4 цаг",
    price: null,
    maxStudents: 30,
    _count: { registrations: 0 },
  },
  {
    id: "personal-2",
    title: "Цахилгааны аюулгүй байдал",
    category: "personal",
    description:
      "Цахилгааны гэнэтийн осол, цахилгаан гэдэс, хамгаалах хэрэгсэл ашиглах, анхны тусламж үзүүлэх",
    duration: "8 цаг",
    price: null,
    maxStudents: 25,
    _count: { registrations: 0 },
  },
  {
    id: "personal-3",
    title: "Хортой бодисын аюулгүй байдал",
    category: "personal",
    description:
    "Хортой бодис танилт, аюулгүй ажиллагааны дүрэм, хадгалах тээвэрлэх, хордлогын анхны тусламж",
    duration: "8 цаг",
    price: null,
    maxStudents: 20,
    _count: { registrations: 0 },
  },
  // ISO courses
  {
    id: "iso-1",
    title: "ISO 45001 ХАБЭА менежмент",
    category: "iso",
    description:
      "ISO 45001:2018 стандартын шаардлага, хэрэгжилт, дотоод аудит, менежментийн системийг бий болгох",
    duration: "40 цаг",
    price: 500000,
    maxStudents: 20,
    _count: { registrations: 0 },
  },
  {
    id: "iso-2",
    title: "ISO 14001 Байгаль орчин",
    category: "iso",
    description:
    "ISO 14001:2015 байгаль орчны менежментийн систем, нөлөөллийн үнэлгээ, хяналт, сайжруулалт",
    duration: "32 цаг",
    price: 450000,
    maxStudents: 20,
    _count: { registrations: 0 },
  },
  {
    id: "iso-3",
    title: "ISO 9001 Чанарын менежмент",
    category: "iso",
    description:
    "ISO 9001:2015 чанарын менежментийн систем, үйл явцын хандлага, тогтмол сайжруулалт",
    duration: "32 цаг",
    price: 450000,
    maxStudents: 20,
    _count: { registrations: 0 },
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
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
  onRegister,
  isRegistering,
}: {
  course: Course;
  onRegister: (courseId: string) => void;
  isRegistering: boolean;
}) {
  const categoryKey = course.category.toLowerCase();
  const icon = CATEGORY_ICONS[categoryKey] || <BookOpen className="size-5" />;

  return (
    <motion.div variants={itemVariants} layout>
      <Card className="group relative overflow-hidden border-brand-100 bg-white transition-all duration-300 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-100/50">
        {/* Top accent line */}
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
          {/* Meta info */}
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

          {/* Price & Register */}
          <div className="flex items-center justify-between pt-1">
            {course.price ? (
              <div className="text-lg font-bold text-brand-700">
                {course.price.toLocaleString()}₮
              </div>
            ) : (
              <Badge className="bg-brand-100 text-brand-800 hover:bg-brand-200 transition-colors">
                Үнэгүй
              </Badge>
            )}

            <Button
              size="sm"
              className="bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500"
              onClick={() => onRegister(course.id)}
              disabled={isRegistering}
            >
              {isRegistering ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Бүртгүүлэх
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function TrainingPage() {
  const { token } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("staff");

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

  const handleRegister = useCallback(
    async (courseId: string) => {
      if (!token) {
        toast.error("Нэвтрэх шаардлагатай", {
          description: "Сургалтад бүртгүүлэхийн тулд нэвтэрнэ үү.",
        });
        return;
      }

      setRegisteringId(courseId);
      try {
        const res = await fetch(`/api/courses/${courseId}/register`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();

        if (res.ok) {
          toast.success("Амжилттай бүртгэгдлээ!", {
            description: data.message || "Сургалтад амжилттай бүртгэгдлээ.",
          });
        } else {
          toast.error("Бүртгэл амжилтгүй", {
            description: data.error || "Алдаа гарлаа, дахин оролдоно уу.",
          });
        }
      } catch {
        toast.error("Холболтын алдаа", {
          description: "Сүлжээний холболт тасарсан байна.",
        });
      } finally {
        setRegisteringId(null);
      }
    },
    [token]
  );

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
          Сонгосон чиглэлээ доорх табаас үзнэ үү.
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

        {/* Staff Tab */}
        <TabsContent value="staff">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="staff"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {getFilteredCourses("staff").length > 0 ? (
                  getFilteredCourses("staff").map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onRegister={handleRegister}
                      isRegistering={registeringId === course.id}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
                      <BookOpen className="size-8 text-brand-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-brand-900">
                      Сургалт олдсонгүй
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Энэ чиглэлээр одоогоор сургалт байхгүй байна.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </TabsContent>

        {/* Personal Tab */}
        <TabsContent value="personal">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="personal"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {getFilteredCourses("personal").length > 0 ? (
                  getFilteredCourses("personal").map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onRegister={handleRegister}
                      isRegistering={registeringId === course.id}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
                      <GraduationCap className="size-8 text-brand-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-brand-900">
                      Сургалт олдсонгүй
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Энэ чиглэлээр одоогоор сургалт байхгүй байна.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </TabsContent>

        {/* ISO Tab */}
        <TabsContent value="iso">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="iso"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {getFilteredCourses("iso").length > 0 ? (
                  getFilteredCourses("iso").map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onRegister={handleRegister}
                      isRegistering={registeringId === course.id}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
                      <Award className="size-8 text-brand-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-brand-900">
                      Сургалт олдсонгүй
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Энэ чиглэлээр одоогоор сургалт байхгүй байна.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}

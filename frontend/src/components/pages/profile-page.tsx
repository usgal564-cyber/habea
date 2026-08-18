import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  User, Mail, Phone, MapPin, LogOut, BookOpen, Brain, ClipboardCheck,
  Calendar, Award, XCircle, Loader2, Shield, Clock, BarChart3,
  TrendingUp, TrendingDown, Target, Timer, RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/hooks/use-auth";

interface UserProfile {
  id: string; firstName: string; lastName: string; email: string;
  phone: string; address?: string | null; secondaryPhone?: string | null;
  role: string; createdAt: string;
}
interface QuizResult {
  id: string; quizId: string; score: number; total: number;
  passed: boolean; createdAt: string; quiz?: { title: string };
  // backward compat: flat title from old API
  title?: string;
}
interface ExamResult {
  id: string; examId: string; score: number; total: number;
  passed: boolean; timeSpent?: number; createdAt: string; exam?: { title: string };
  // backward compat: flat title from old API
  title?: string;
}
interface CourseReg {
  id: string; status: string; createdAt: string;
  course?: { title: string; category: string; duration: string };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function ProfilePage() {
  const { user, token, logout } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [courseRegs, setCourseRegs] = useState<CourseReg[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "quizzes" | "exams" | "courses">("overview");

  const fetchProfileData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [profileRes, quizRes, examRes, courseRes] = await Promise.all([
        fetch("/api/profile", { headers }),
        fetch("/api/profile?section=quizzes", { headers }),
        fetch("/api/profile?section=exams", { headers }),
        fetch("/api/profile?section=courses", { headers }),
      ]);
      if (profileRes.ok) { const pData = await profileRes.json(); setProfile(pData.user); }
      if (quizRes.ok) { const qData = await quizRes.json(); setQuizResults(qData.results || []); }
      if (examRes.ok) { const eData = await examRes.json(); setExamResults(eData.results || []); }
      if (courseRes.ok) { const cData = await courseRes.json(); setCourseRegs(cData.registrations || []); }
    } catch { toast.error("Мэдээлэл ачааллахад алдаа гарлаа"); }
    finally { setLoading(false); }
  };

  // Fetch on mount and whenever refreshKey changes
  useEffect(() => { fetchProfileData(); }, [token, refreshKey]);

  if (!user || !token) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-brand-400" />
            </div>
            <h2 className="text-2xl font-bold text-brand-900 mb-2">Нэвтрэх шаардлагатай</h2>
            <p className="text-muted-foreground mb-6">Профайл хуудасг үзэхийн тулд нэвтэрнө үү</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Computed stats
  const totalQuizzes = quizResults.length;
  const totalExams = examResults.length;
  const totalCourses = courseRegs.length;
  const passedQuizzes = quizResults.filter((r) => r.passed).length;
  const passedExams = examResults.filter((r) => r.passed).length;

  const quizPcts = quizResults.map(r => r.total > 0 ? (r.score / r.total) * 100 : 0);
  const examPcts = examResults.map(r => r.total > 0 ? (r.score / r.total) * 100 : 0);
  const quizAvgScore = totalQuizzes > 0 ? Math.round(quizPcts.reduce((a, b) => a + b, 0) / totalQuizzes) : 0;
  const examAvgScore = totalExams > 0 ? Math.round(examPcts.reduce((a, b) => a + b, 0) / totalExams) : 0;
  const quizBestScore = totalQuizzes > 0 ? Math.max(...quizPcts) : 0;
  const examBestScore = totalExams > 0 ? Math.max(...examPcts) : 0;
  const combinedAvg = totalQuizzes + totalExams > 0
    ? Math.round((quizPcts.reduce((a, b) => a + b, 0) + examPcts.reduce((a, b) => a + b, 0)) / (totalQuizzes + totalExams))
    : 0;
  const examAvgTime = totalExams > 0 && examResults.some(r => r.timeSpent)
    ? Math.round(examResults.filter(r => r.timeSpent).reduce((s, r) => s + (r.timeSpent || 0), 0) / examResults.filter(r => r.timeSpent).length / 60)
    : 0;

  const getScoreColor = (pct: number) => pct >= 70 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-500";
  const getBarColor = (pct: number) => pct >= 70 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <section className="w-full">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-5 right-10 w-64 h-64 bg-brand-400 rounded-full blur-3xl" />
          <div className="absolute bottom-5 left-10 w-80 h-80 bg-brand-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-bold text-white">
                {profile ? `${profile.lastName} ${profile.firstName}` : "Хэрэглэгч"}
              </h1>
              <p className="text-brand-200 mt-1">{profile?.email || user.email}</p>
              {profile?.role === "ADMIN" && (
                <Badge className="mt-2 bg-amber-500 text-white hover:bg-amber-600">
                  <Shield className="w-3 h-3 mr-1" /> Админ
                </Badge>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">

            {/* ── Stats Cards ── */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Card 1: Сорил */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-xs text-muted-foreground">Сорил</p>
                  </div>
                  <p className="text-2xl font-bold text-brand-900">{totalQuizzes}</p>
                  {totalQuizzes > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-muted-foreground">Дундаж</span>
                        <span className={`text-xs font-bold ${getScoreColor(quizAvgScore)}`}>{quizAvgScore}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${quizAvgScore}%` }} transition={{ duration: 0.6 }} className={`h-full rounded-full ${getBarColor(quizAvgScore)}`} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Card 2: Шалгалт */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
                      <ClipboardCheck className="w-4 h-4 text-brand-600" />
                    </div>
                    <p className="text-xs text-muted-foreground">Шалгалт</p>
                  </div>
                  <p className="text-2xl font-bold text-brand-900">{totalExams}</p>
                  {totalExams > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-muted-foreground">Дундаж</span>
                        <span className={`text-xs font-bold ${getScoreColor(examAvgScore)}`}>{examAvgScore}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${examAvgScore}%` }} transition={{ duration: 0.6, delay: 0.1 }} className={`h-full rounded-full ${getBarColor(examAvgScore)}`} />
                      </div>
                      {examAvgTime > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-0.5"><Timer className="w-2.5 h-2.5" /> Дундаж: {examAvgTime} мин</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Card 3: Амжилт */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <Award className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-xs text-muted-foreground">Амжилт</p>
                  </div>
                  <p className="text-2xl font-bold text-brand-900">
                    {totalQuizzes + totalExams > 0
                      ? Math.round(((passedQuizzes + passedExams) / (totalQuizzes + totalExams)) * 100)
                      : 0}%
                  </p>
                  {totalQuizzes + totalExams > 0 && (
                    <p className="text-[10px] text-brand-600 mt-1">{passedQuizzes + passedExams}/{totalQuizzes + totalExams} тэнцэв</p>
                  )}
                </CardContent>
              </Card>

              {/* Card 4: Нийт дундаж */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-xs text-muted-foreground">Нийт дундаж</p>
                  </div>
                  <p className="text-2xl font-bold text-brand-900">{combinedAvg > 0 ? `${combinedAvg}%` : "—"}</p>
                  {combinedAvg > 0 && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${combinedAvg}%` }} transition={{ duration: 0.6, delay: 0.2 }} className={`h-full rounded-full ${getBarColor(combinedAvg)}`} />
                      </div>
                    </div>
                  )}
                  {totalCourses > 0 && (
                    <p className="text-[10px] text-brand-600 mt-1 flex items-center gap-0.5"><BookOpen className="w-2.5 h-2.5" /> {totalCourses} сургалт</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Best Score Highlights ── */}
            {(quizBestScore > 0 || examBestScore > 0) && (
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-brand-900 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" /> Шилдэг үр дүн
                      </h3>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground hover:text-brand-600" onClick={() => setRefreshKey(k => k + 1)}>
                        <RefreshCw className="w-3 h-3 mr-1" /> Шинэчлэх
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {quizBestScore > 0 && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Brain className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Сорил — Дээд</p>
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${getScoreColor(quizBestScore)}`}>{Math.round(quizBestScore)}%</span>
                              <div className="flex-1 h-1.5 bg-purple-200 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${quizBestScore}%` }} transition={{ duration: 0.8, delay: 0.3 }} className="h-full rounded-full bg-purple-500" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {examBestScore > 0 && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50">
                          <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                            <ClipboardCheck className="w-5 h-5 text-brand-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Шалгалт — Дээд</p>
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${getScoreColor(examBestScore)}`}>{Math.round(examBestScore)}%</span>
                              <div className="flex-1 h-1.5 bg-brand-200 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${examBestScore}%` }} transition={{ duration: 0.8, delay: 0.4 }} className="h-full rounded-full bg-brand-500" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── User Info Card ── */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-brand-900">Хувийн мэдээлэл</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                        <User className="w-4 h-4 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Овог</p>
                        <p className="text-sm font-medium">{profile?.lastName || "-"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                        <User className="w-4 h-4 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Нэр</p>
                        <p className="text-sm font-medium">{profile?.firstName || "-"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Имэйл</p>
                        <p className="text-sm font-medium">{profile?.email || user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Утас</p>
                        <p className="text-sm font-medium">{profile?.phone || "-"}</p>
                      </div>
                    </div>
                    {profile?.address && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-brand-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Хаяг</p>
                          <p className="text-sm font-medium">{profile.address}</p>
                        </div>
                      </div>
                    )}
                    {profile?.secondaryPhone && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                          <Phone className="w-4 h-4 text-brand-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">2-р утас</p>
                          <p className="text-sm font-medium">{profile.secondaryPhone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Tab Navigation ── */}
            <motion.div variants={itemVariants}>
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: "overview" as const, label: "Бүгд", icon: <BookOpen className="w-4 h-4" /> },
                  { id: "quizzes" as const, label: "Сорилууд", icon: <Brain className="w-4 h-4" /> },
                  { id: "exams" as const, label: "Шалгалтууд", icon: <ClipboardCheck className="w-4 h-4" /> },
                  { id: "courses" as const, label: "Сургалтууд", icon: <Calendar className="w-4 h-4" /> },
                ].map((tab) => (
                  <Button key={tab.id} variant={activeTab === tab.id ? "default" : "outline"} size="sm" onClick={() => setActiveTab(tab.id)}
                    className={activeTab === tab.id ? "bg-brand-600 hover:bg-brand-700 text-white" : "border-brand-200 text-brand-700 hover:bg-brand-50"}>
                    {tab.icon}
                    <span className="ml-1.5">{tab.label}</span>
                  </Button>
                ))}
              </div>
            </motion.div>

            {/* ── Quiz Results ── */}
            {(activeTab === "overview" || activeTab === "quizzes") && quizResults.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-brand-900 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" /> Сорилын үр дүн
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 ml-1">{totalQuizzes}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                      {quizResults.map((result, idx) => {
                        const pct = result.total > 0 ? (result.score / result.total) * 100 : 0;
                        const title = result.quiz?.title || (result as any).title || "Сорил";
                        return (
                          <div key={result.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-purple-50/50 transition-colors">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${result.passed ? "bg-green-100" : "bg-red-100"}`}>
                              {result.passed ? <Award className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-brand-900 truncate">{title}</p>
                                <Badge variant={result.passed ? "default" : "destructive"} className={`text-[10px] shrink-0 ${result.passed ? "bg-green-100 text-green-800" : ""}`}>
                                  {result.passed ? "Тэнсэв" : "Амжилтгүй"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, delay: idx * 0.05 }} className={`h-full rounded-full ${getBarColor(pct)}`} />
                                </div>
                                <span className={`text-xs font-bold shrink-0 ${getScoreColor(pct)}`}>{Math.round(pct)}%</span>
                                <span className="text-[10px] text-muted-foreground shrink-0">{result.score}/{result.total}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(result.createdAt).toLocaleDateString("mn-MN")}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── Exam Results ── */}
            {(activeTab === "overview" || activeTab === "exams") && examResults.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-brand-900 flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5 text-brand-600" /> Шалгалтын үр дүн
                      <Badge variant="secondary" className="bg-brand-100 text-brand-700 ml-1">{totalExams}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                      {examResults.map((result, idx) => {
                        const pct = result.total > 0 ? (result.score / result.total) * 100 : 0;
                        const title = result.exam?.title || (result as any).title || "Шалгалт";
                        return (
                          <div key={result.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-brand-50/50 transition-colors">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${result.passed ? "bg-green-100" : "bg-red-100"}`}>
                              {result.passed ? <Award className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-brand-900 truncate">{title}</p>
                                <Badge variant={result.passed ? "default" : "destructive"} className={`text-[10px] shrink-0 ${result.passed ? "bg-green-100 text-green-800" : ""}`}>
                                  {result.passed ? "Тэнсэв" : "Амжилтгүй"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, delay: idx * 0.05 }} className={`h-full rounded-full ${getBarColor(pct)}`} />
                                </div>
                                <span className={`text-xs font-bold shrink-0 ${getScoreColor(pct)}`}>{Math.round(pct)}%</span>
                                <span className="text-[10px] text-muted-foreground shrink-0">{result.score}/{result.total}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-0.5">
                                <p className="text-[10px] text-muted-foreground">{new Date(result.createdAt).toLocaleDateString("mn-MN")}</p>
                                {result.timeSpent !== undefined && result.timeSpent !== null && result.timeSpent > 0 && (
                                  <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                    <Timer className="w-2.5 h-2.5" />{Math.floor(result.timeSpent / 60)}м {(result.timeSpent % 60)}с
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── Course Registrations ── */}
            {(activeTab === "overview" || activeTab === "courses") && courseRegs.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-brand-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-brand-600" /> Бүртгэлтэй сургалтууд
                      <Badge variant="secondary" className="bg-brand-100 text-brand-700 ml-1">{totalCourses}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                      {courseRegs.map((reg) => (
                        <div key={reg.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-brand-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-brand-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-brand-900">{reg.course?.title || "Сургалт"}</p>
                              <p className="text-xs text-muted-foreground">{reg.course?.category} · {reg.course?.duration}</p>
                              <p className="text-xs text-muted-foreground">{new Date(reg.createdAt).toLocaleDateString("mn-MN")}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className={reg.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                            {reg.status === "confirmed" ? "Батлагдсан" : "Хүлээгдэж байна"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── Empty State ── */}
            {!loading && quizResults.length === 0 && examResults.length === 0 && courseRegs.length === 0 && (
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-sm">
                  <CardContent className="py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-brand-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-brand-900">Одоогоор үйлдэл байхгүй</h3>
                    <p className="text-sm text-muted-foreground mt-1">Сорил өгөх, шалгалт өгөх эсвэл сургалтад бүртгүүлэх боломжтой</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Logout Button */}
        <div className="pt-6 pb-8 flex justify-center">
          <Button onClick={() => { logout(); toast.success("Амжилттай гарлаа"); }} variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300">
            <LogOut className="w-4 h-4 mr-2" /> Системээс гарах
          </Button>
        </div>
      </div>
    </section>
  );
}

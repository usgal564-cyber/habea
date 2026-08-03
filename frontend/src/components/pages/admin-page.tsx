
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  Shield, Users, BookOpen, ClipboardList, Download,
  GraduationCap, Brain, FileText, Star, CheckCircle, XCircle,
  Loader2, TrendingUp, MessageSquare, Database, FileSpreadsheet,
} from "lucide-react";

export default function AdminPage() {
  const { user, token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch("/api/admin/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setDashboard(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [token]);

  if (!user || !token) {
    return (
      <div className="min-h-screen">
        <div className="bg-gradient-to-b from-brand-900 to-brand-800 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 bg-brand-700/50 px-4 py-2 rounded-full mb-6">
                <Shield className="w-4 h-4 text-brand-300" />
                <span className="text-brand-200 text-sm font-medium">Админ хэсэг</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">Админ Хяналтын Самбар</h1>
              <p className="text-brand-200 text-lg">Нэвтрэх шаардлагатай</p>
            </motion.div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 -mt-8">
          <Card className="shadow-xl text-center p-12">
            <Shield className="w-16 h-16 text-brand-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-brand-900 mb-2">Нэвтрэх шаардлагатай</h2>
            <p className="text-muted-foreground">Админ хяналтын самбар руу нэвтрэхийн тулд админ кодоор нэвтэрнө үү.</p>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Ачааллаж байна...</p>
        </div>
      </div>
    );
  }

  const totalUsers = dashboard?.totalUsers || 0;
  const totalEnrollments = dashboard?.totalEnrollments || 0;
  const totalQuizAttempts = dashboard?.totalQuizAttempts || 0;
  const totalExamAttempts = dashboard?.totalExamAttempts || 0;
  const totalFeedback = dashboard?.totalFeedback || 0;
  const totalSurveys = dashboard?.totalSurveys || 0;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 py-10 lg:py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-700/60 flex items-center justify-center">
                <Shield className="w-6 h-6 text-brand-200" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Хяналтын Самбар</h1>
                <p className="text-brand-300 text-sm">
                  {user?.email || "Админ"} · {user?.role === "ADMIN" ? "Админ" : user?.role === "MANAGER" ? "Менежер" : "Багш"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6 pb-16">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mb-8">
          {[
            { label: "Нийт хэрэглэгч", value: totalUsers, icon: Users, accent: "bg-blue-500", lightBg: "bg-blue-50", textColor: "text-blue-700" },
            { label: "Сургалт бүртгэл", value: totalEnrollments, icon: GraduationCap, accent: "bg-emerald-500", lightBg: "bg-emerald-50", textColor: "text-emerald-700" },
            { label: "Тест өгөлт", value: totalQuizAttempts, icon: Brain, accent: "bg-violet-500", lightBg: "bg-violet-50", textColor: "text-violet-700" },
            { label: "Шалгалт өгөлт", value: totalExamAttempts, icon: ClipboardList, accent: "bg-orange-500", lightBg: "bg-orange-50", textColor: "text-orange-700" },
            { label: "Санал хүсэлт", value: totalFeedback, icon: MessageSquare, accent: "bg-amber-500", lightBg: "bg-amber-50", textColor: "text-amber-700" },
            { label: "Судалгаа", value: totalSurveys, icon: FileText, accent: "bg-rose-500", lightBg: "bg-rose-50", textColor: "text-rose-700" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 group">
                  <CardContent className="p-4 lg:p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-3xl lg:text-4xl font-extrabold text-gray-900 group-hover:scale-105 transition-transform origin-left">
                          {stat.value}
                        </p>
                        <p className="text-xs lg:text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
                      </div>
                      <div className={`w-10 h-10 lg:w-11 lg:h-11 rounded-xl ${stat.lightBg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${stat.textColor}`} />
                      </div>
                    </div>
                  </CardContent>
                  <div className={`h-1 w-full ${stat.accent} opacity-60`} />
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="enrollments" className="space-y-6">
          {/* Tab bar */}
          <TabsList className="bg-white border shadow-sm rounded-xl p-1.5 h-auto flex flex-wrap gap-1">
            {[
              { value: "enrollments", label: "Сургалт", icon: <GraduationCap className="w-4 h-4" /> },
              { value: "quizzes", label: "Тест", icon: <Brain className="w-4 h-4" /> },
              { value: "exams", label: "Шалгалт", icon: <ClipboardList className="w-4 h-4" /> },
              { value: "feedback", label: "Санал", icon: <Star className="w-4 h-4" /> },
              { value: "surveys", label: "Судалгаа", icon: <FileText className="w-4 h-4" /> },
              { value: "export", label: "Экспорт", icon: <Download className="w-4 h-4" /> },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 px-3 lg:px-4 py-2.5 rounded-lg text-sm font-medium data-[state=active]:bg-brand-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
              >
                {tab.icon}
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Enrollments Tab ── */}
          <TabsContent value="enrollments">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-xl border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Сургалтанд бүртгэлтэй</CardTitle>
                      <CardDescription>Нийт {totalEnrollments} бүртгэл</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {(!dashboard?.courseStats || dashboard.courseStats.length === 0) ? (
                    <div className="text-center py-16">
                      <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">Одоогоор бүртгэл байхгүй байна</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="font-semibold">Сургалт</TableHead>
                            <TableHead className="font-semibold text-center">Бүртгэлтэй</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dashboard.courseStats.map((c: any, i: number) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{c.title}</TableCell>
                              <TableCell className="text-center">
                                <Badge className="bg-emerald-100 text-emerald-800 font-semibold">{c.enrolled} хүн</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ── Quizzes Tab ── */}
          <TabsContent value="quizzes">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-t-xl border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-violet-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Тест өгөлтийн дүн</CardTitle>
                      <CardDescription>Нийт {totalQuizAttempts} өгөлт</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {(!dashboard?.recentQuizResults || dashboard.recentQuizResults.length === 0) ? (
                    <div className="text-center py-16">
                      <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">Одоогоор тест өгөлт байхгүй байна</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="font-semibold">Оюутан</TableHead>
                            <TableHead className="font-semibold">Тест</TableHead>
                            <TableHead className="font-semibold text-center">Оноо</TableHead>
                            <TableHead className="font-semibold text-center">Огноо</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dashboard.recentQuizResults.map((r: any, i: number) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{r.userName}</TableCell>
                              <TableCell className="text-muted-foreground">{r.quizTitle}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant={r.score >= r.total * 0.8 ? "default" : "destructive"} className={r.score >= r.total * 0.8 ? "bg-green-100 text-green-800" : ""}>
                                  {r.score}/{r.total}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center text-sm text-muted-foreground">
                                {new Date(r.createdAt).toLocaleDateString("mn-MN")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ── Exams Tab ── */}
          <TabsContent value="exams">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-xl border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <ClipboardList className="w-5 h-5 text-orange-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Шалгалтын үр дүн</CardTitle>
                      <CardDescription>Нийт {totalExamAttempts} өгөлт</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {(!dashboard?.recentExamResults || dashboard.recentExamResults.length === 0) ? (
                    <div className="text-center py-16">
                      <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">Одоогоор шалгалтын үр дүн байхгүй байна</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="font-semibold">Оюутан</TableHead>
                            <TableHead className="font-semibold">Шалгалт</TableHead>
                            <TableHead className="font-semibold">Код</TableHead>
                            <TableHead className="font-semibold text-center">Оноо</TableHead>
                            <TableHead className="font-semibold text-center">Дүн</TableHead>
                            <TableHead className="font-semibold text-center">Огноо</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dashboard.recentExamResults.map((r: any, i: number) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{r.userName}</TableCell>
                              <TableCell className="text-muted-foreground">{r.examTitle}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-mono text-xs">{r.examCode}</Badge>
                              </TableCell>
                              <TableCell className="text-center font-medium">{r.score}/{r.total}</TableCell>
                              <TableCell className="text-center">
                                {r.passed ? (
                                  <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                                )}
                              </TableCell>
                              <TableCell className="text-center text-sm text-muted-foreground">
                                {new Date(r.createdAt).toLocaleDateString("mn-MN")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ── Feedback Tab ── */}
          <TabsContent value="feedback">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-t-xl border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Star className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Ирсэн санал хүсэлт</CardTitle>
                      <CardDescription>Нийт {totalFeedback} санал</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 lg:p-6">
                  {(!dashboard?.recentFeedback || dashboard.recentFeedback.length === 0) ? (
                    <div className="text-center py-16">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">Одоогоор санал хүсэлт ирээгүй байна</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                      {dashboard.recentFeedback.map((f: any, i: number) => (
                        <div key={i} className="border rounded-xl p-4 hover:bg-gray-50/80 transition-colors">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700 shrink-0">
                                {f.name?.charAt(0) || "?"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{f.name}</p>
                                <p className="text-xs text-muted-foreground">{new Date(f.createdAt).toLocaleDateString("mn-MN")}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              {Array.from({ length: 5 }, (_, s) => (
                                <Star key={s} className={`w-3.5 h-3.5 ${s < (f.rating || 0) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed pl-12">{f.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ── Surveys Tab ── */}
          <TabsContent value="surveys">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-t-xl border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-rose-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Ирсэн судалгаа</CardTitle>
                      <CardDescription>Нийт {totalSurveys} судалгаа</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 lg:p-6">
                  {(!dashboard?.recentSurveys || dashboard.recentSurveys.length === 0) ? (
                    <div className="text-center py-16">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">Одоогоор судалгаа ирээгүй байна</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                      {dashboard.recentSurveys.map((s: any, i: number) => (
                        <div key={i} className="border rounded-xl p-4 hover:bg-gray-50/80 transition-colors">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-sm font-bold text-rose-700 shrink-0">
                                {s.name?.charAt(0) || "?"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{s.name}</p>
                                <p className="text-xs text-muted-foreground">{s.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString("mn-MN")}</span>
                              <Badge className="bg-rose-100 text-rose-800 text-xs">Судалгаа</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ── Export Tab ── */}
          <TabsContent value="export">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-xl border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Database className="w-5 h-5 text-gray-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Мэдээлэл татаж авах</CardTitle>
                      <CardDescription>Бүх өгөгдлийг нэгтгэж татаж авах боломжтой</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        window.open("/api/admin/exam-attempts/export?token=" + token, "_blank");
                      }}
                      className="group flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-400 hover:bg-brand-50/50 transition-all duration-300"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileSpreadsheet className="w-7 h-7 text-brand-700" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">Шалгалтын үр дүн</p>
                        <p className="text-xs text-muted-foreground mt-0.5">CSV форматаар</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-brand-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <Download className="w-4 h-4" />
                        Татах
                      </div>
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          const r = await fetch("/api/admin/export", { headers: { Authorization: `Bearer ${token}` } });
                          const d = await r.json();
                          const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "habea_export.json";
                          a.click();
                          URL.revokeObjectURL(url);
                          toast.success("Татаж авлаа");
                        } catch {
                          toast.error("Алдаа");
                        }
                      }}
                      className="group flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all duration-300"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Database className="w-7 h-7 text-amber-700" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">Бүх өгөгдөл</p>
                        <p className="text-xs text-muted-foreground mt-0.5">JSON форматаар</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <Download className="w-4 h-4" />
                        Татах
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

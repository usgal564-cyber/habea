
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  Shield, Download, CheckCircle, XCircle,
  Loader2, Database, FileSpreadsheet,
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
      <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 py-8 lg:py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-11 h-11 rounded-xl bg-brand-700/60 flex items-center justify-center">
                <Shield className="w-5 h-5 text-brand-200" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">Хяналтын Самбар</h1>
                <p className="text-brand-300 text-sm mt-0.5">
                  {user?.email || "Админ"} · {user?.role === "ADMIN" ? "Админ" : user?.role === "MANAGER" ? "Менежер" : "Багш"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-5 pb-16">

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4 mb-8">
          {[
            { label: "Нийт хэрэглэгч", value: totalUsers, color: "from-blue-500 to-blue-600" },
            { label: "Сургалт бүртгэл", value: totalEnrollments, color: "from-emerald-500 to-emerald-600" },
            { label: "Тест өгөлт", value: totalQuizAttempts, color: "from-violet-500 to-violet-600" },
            { label: "Шалгалт өгөлт", value: totalExamAttempts, color: "from-orange-500 to-orange-600" },
            { label: "Санал хүсэлт", value: totalFeedback, color: "from-amber-500 to-amber-600" },
            { label: "Судалгаа", value: totalSurveys, color: "from-rose-500 to-rose-600" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-5 lg:p-6">
                  <p className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-none">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground font-medium mt-2">{stat.label}</p>
                </CardContent>
                <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Tabbed Content ── */}
        <Tabs defaultValue="enrollments" className="space-y-5">
          <TabsList className="bg-white border shadow-sm rounded-xl p-1.5 h-auto flex flex-wrap gap-1">
            {[
              { value: "enrollments", label: "Сургалт" },
              { value: "quizzes", label: "Тест" },
              { value: "exams", label: "Шалгалт" },
              { value: "feedback", label: "Санал" },
              { value: "surveys", label: "Судалгаа" },
              { value: "export", label: "Экспорт" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-brand-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Enrollments ── */}
          <TabsContent value="enrollments">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-xl border-b pb-4">
                  <div>
                    <CardTitle className="text-lg">Сургалтанд бүртгэлтэй</CardTitle>
                    <CardDescription>Нийт {totalEnrollments} бүртгэл</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {(!dashboard?.courseStats || dashboard.courseStats.length === 0) ? (
                    <div className="text-center py-16">
                      <p className="text-2xl font-bold text-gray-300 mb-2">0</p>
                      <p className="text-muted-foreground text-sm">Одоогоор бүртгэл байхгүй</p>
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

          {/* ── Quizzes ── */}
          <TabsContent value="quizzes">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-t-xl border-b pb-4">
                  <div>
                    <CardTitle className="text-lg">Тест өгөлтийн дүн</CardTitle>
                    <CardDescription>Нийт {totalQuizAttempts} өгөлт</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {(!dashboard?.recentQuizResults || dashboard.recentQuizResults.length === 0) ? (
                    <div className="text-center py-16">
                      <p className="text-2xl font-bold text-gray-300 mb-2">0</p>
                      <p className="text-muted-foreground text-sm">Одоогоор тест өгөлт байхгүй</p>
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

          {/* ── Exams ── */}
          <TabsContent value="exams">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-xl border-b pb-4">
                  <div>
                    <CardTitle className="text-lg">Шалгалтын үр дүн</CardTitle>
                    <CardDescription>Нийт {totalExamAttempts} өгөлт</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {(!dashboard?.recentExamResults || dashboard.recentExamResults.length === 0) ? (
                    <div className="text-center py-16">
                      <p className="text-2xl font-bold text-gray-300 mb-2">0</p>
                      <p className="text-muted-foreground text-sm">Одоогоор шалгалтын үр дүн байхгүй</p>
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

          {/* ── Feedback ── */}
          <TabsContent value="feedback">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-t-xl border-b pb-4">
                  <div>
                    <CardTitle className="text-lg">Ирсэн санал хүсэлт</CardTitle>
                    <CardDescription>Нийт {totalFeedback} санал</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-4 lg:p-5">
                  {(!dashboard?.recentFeedback || dashboard.recentFeedback.length === 0) ? (
                    <div className="text-center py-16">
                      <p className="text-2xl font-bold text-gray-300 mb-2">0</p>
                      <p className="text-muted-foreground text-sm">Одоогоор санал хүсэлт ирээгүй</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                      {dashboard.recentFeedback.map((f: any, i: number) => (
                        <div key={i} className="rounded-xl border p-4 hover:bg-gray-50/80 transition-colors">
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
                            <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
                              {Array.from({ length: 5 }, (_, s) => (
                                <svg key={s} className={`w-3.5 h-3.5 ${s < (f.rating || 0) ? "text-amber-400" : "text-gray-200"}`} viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
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

          {/* ── Surveys ── */}
          <TabsContent value="surveys">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-t-xl border-b pb-4">
                  <div>
                    <CardTitle className="text-lg">Ирсэн судалгаа</CardTitle>
                    <CardDescription>Нийт {totalSurveys} судалгаа</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-4 lg:p-5">
                  {(!dashboard?.recentSurveys || dashboard.recentSurveys.length === 0) ? (
                    <div className="text-center py-16">
                      <p className="text-2xl font-bold text-gray-300 mb-2">0</p>
                      <p className="text-muted-foreground text-sm">Одоогоор судалгаа ирээгүй</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                      {dashboard.recentSurveys.map((s: any, i: number) => (
                        <div key={i} className="rounded-xl border p-4 hover:bg-gray-50/80 transition-colors">
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

          {/* ── Export ── */}
          <TabsContent value="export">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-xl border-b pb-4">
                  <div>
                    <CardTitle className="text-lg">Мэдээлэл татаж авах</CardTitle>
                    <CardDescription>Бүх өгөгдлийг нэгтгэж татаж авах боломжтой</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => { window.open("/api/admin/exam-attempts/export?token=" + token, "_blank"); }}
                      className="group flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-400 hover:bg-brand-50/40 transition-all duration-300"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-brand-100 group-hover:bg-brand-200 flex items-center justify-center transition-colors">
                        <FileSpreadsheet className="w-7 h-7 text-brand-700" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">Шалгалтын үр дүн</p>
                        <p className="text-xs text-muted-foreground mt-0.5">CSV форматаар</p>
                      </div>
                      <span className="flex items-center gap-1.5 text-brand-700 text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                        <Download className="w-4 h-4" />
                        Татах
                      </span>
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          const r = await fetch("/api/admin/export", { headers: { Authorization: `Bearer ${token}` } });
                          const d = await r.json();
                          const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url; a.download = "habea_export.json"; a.click();
                          URL.revokeObjectURL(url);
                          toast.success("Татаж авлаа");
                        } catch { toast.error("Алдаа"); }
                      }}
                      className="group flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-dashed border-gray-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all duration-300"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center transition-colors">
                        <Database className="w-7 h-7 text-amber-700" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">Бүх өгөгдөл</p>
                        <p className="text-xs text-muted-foreground mt-0.5">JSON форматаар</p>
                      </div>
                      <span className="flex items-center gap-1.5 text-amber-700 text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                        <Download className="w-4 h-4" />
                        Татах
                      </span>
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

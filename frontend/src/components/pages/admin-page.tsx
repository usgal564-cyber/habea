
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  Shield, Users, BookOpen, ClipboardList, BarChart3, Download,
  GraduationCap, Brain, FileText, Star, CheckCircle, XCircle,
  Loader2, TrendingUp,
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
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: "Нийт хэрэглэгч", value: dashboard?.totalUsers || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Сургалт бүртгэл", value: dashboard?.totalEnrollments || 0, icon: GraduationCap, color: "text-green-600", bg: "bg-green-50" },
    { label: "Тест өгөлт", value: dashboard?.totalQuizAttempts || 0, icon: Brain, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Шалгалт өгөлт", value: dashboard?.totalExamAttempts || 0, icon: ClipboardList, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Санал хүсэлт", value: dashboard?.totalFeedback || 0, icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Судалгаа", value: dashboard?.totalSurveys || 0, icon: FileText, color: "text-pink-600", bg: "bg-pink-50" },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-brand-900 to-brand-800 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-brand-700/50 px-4 py-2 rounded-full mb-4">
              <Shield className="w-4 h-4 text-brand-300" />
              <span className="text-brand-200 text-sm font-medium">Админ</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Хяналтын Самбар</h1>
            <p className="text-brand-200">{user.name || user.email} — {user.role === "ADMIN" ? "Админ" : user.role === "MANAGER" ? "Менежер" : "Багш"}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 pb-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <p className="text-2xl font-bold text-brand-900">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Tabs defaultValue="enrollments" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-6">
            <TabsTrigger value="enrollments"><GraduationCap className="w-4 h-4 mr-1 hidden md:inline" />Сургалт</TabsTrigger>
            <TabsTrigger value="quizzes"><Brain className="w-4 h-4 mr-1 hidden md:inline" />Тест</TabsTrigger>
            <TabsTrigger value="exams"><ClipboardList className="w-4 h-4 mr-1 hidden md:inline" />Шалгалт</TabsTrigger>
            <TabsTrigger value="feedback"><Star className="w-4 h-4 mr-1 hidden md:inline" />Санал</TabsTrigger>
            <TabsTrigger value="surveys"><FileText className="w-4 h-4 mr-1 hidden md:inline" />Судалгаа</TabsTrigger>
            <TabsTrigger value="export"><Download className="w-4 h-4 mr-1 hidden md:inline" />Экспорт</TabsTrigger>
          </TabsList>

          {/* Enrollments Tab */}
          <TabsContent value="enrollments">
            <Card>
              <CardHeader><CardTitle className="text-lg">Сургалтанд бүртгэлтэй оюутнууд</CardTitle></CardHeader>
              <CardContent>
                {(!dashboard?.courseStats || dashboard.courseStats.length === 0) ? (
                  <p className="text-center text-muted-foreground py-8">Одоогоор бүртгэл байхгүй байна</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Сургалт</TableHead>
                          <TableHead className="text-center">Бүртгэлтэй</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dashboard.courseStats.map((c: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{c.title}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary">{c.enrolled} хүн</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quizzes">
            <Card>
              <CardHeader><CardTitle className="text-lg">Тест өгөлтийн дүн</CardTitle></CardHeader>
              <CardContent>
                {(!dashboard?.recentQuizResults || dashboard.recentQuizResults.length === 0) ? (
                  <p className="text-center text-muted-foreground py-8">Одоогоор тест өгөлт байхгүй байна</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Оюутан</TableHead>
                          <TableHead>Тест</TableHead>
                          <TableHead className="text-center">Оноо</TableHead>
                          <TableHead className="text-center">Огноо</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dashboard.recentQuizResults.map((r: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{r.userName}</TableCell>
                            <TableCell>{r.quizTitle}</TableCell>
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
          </TabsContent>

          {/* Exam Tab */}
          <TabsContent value="exams">
            <Card>
              <CardHeader><CardTitle className="text-lg">Шалгалтын үр дүн</CardTitle></CardHeader>
              <CardContent>
                {(!dashboard?.recentExamResults || dashboard.recentExamResults.length === 0) ? (
                  <p className="text-center text-muted-foreground py-8">Одоогоор шалгалтын үр дүн байхгүй байна</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Оюутан</TableHead>
                          <TableHead>Шалгалт</TableHead>
                          <TableHead>Код</TableHead>
                          <TableHead className="text-center">Оноо</TableHead>
                          <TableHead className="text-center">Дүн</TableHead>
                          <TableHead className="text-center">Огноо</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dashboard.recentExamResults.map((r: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{r.userName}</TableCell>
                            <TableCell>{r.examTitle}</TableCell>
                            <TableCell><Badge variant="outline" className="font-mono">{r.examCode}</Badge></TableCell>
                            <TableCell className="text-center">{r.score}/{r.total}</TableCell>
                            <TableCell className="text-center">
                              {r.passed ? <CheckCircle className="w-5 h-5 text-green-600 mx-auto" /> : <XCircle className="w-5 h-5 text-red-500 mx-auto" />}
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
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader><CardTitle className="text-lg">Ирсэн санал хүсэлт ({dashboard?.totalFeedback || 0})</CardTitle></CardHeader>
              <CardContent>
                {(!dashboard?.recentFeedback || dashboard.recentFeedback.length === 0) ? (
                  <p className="text-center text-muted-foreground py-8">Одоогоор санал хүсэлт ирээгүй байна</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {dashboard.recentFeedback.map((f: any, i: number) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700">
                              {f.name?.charAt(0) || "?"}
                            </div>
                            <span className="font-medium text-sm">{f.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }, (_, s) => (
                              <Star key={s} className={`w-3 h-3 ${s < (f.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-foreground/80">{f.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{new Date(f.createdAt).toLocaleDateString("mn-MN")}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Surveys Tab */}
          <TabsContent value="surveys">
            <Card>
              <CardHeader><CardTitle className="text-lg">Ирсэн судалгаа ({dashboard?.totalSurveys || 0})</CardTitle></CardHeader>
              <CardContent>
                {(!dashboard?.recentSurveys || dashboard.recentSurveys.length === 0) ? (
                  <p className="text-center text-muted-foreground py-8">Одоогоор судалгаа ирээгүй байна</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {dashboard.recentSurveys.map((s: any, i: number) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.email}</p>
                          </div>
                          <Badge variant="secondary">Судалгаа</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export">
            <Card>
              <CardHeader><CardTitle className="text-lg">Мэдээлэл татаж авах</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Бүх өгөгдлийг нэгтгэж татаж авах боломжтой.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Button onClick={() => { window.open("/api/admin/exam-attempts/export?token=" + token, "_blank"); }} variant="outline" className="h-24 flex-col gap-2">
                    <ClipboardList className="w-6 h-6" />
                    <span>Шалгалтын үр дүн (CSV)</span>
                  </Button>
                  <Button onClick={async () => { try { const r = await fetch("/api/admin/export", { headers: { Authorization: `Bearer ${token}` } }); const d = await r.json(); const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "habea_export.json"; a.click(); URL.revokeObjectURL(url); toast.success("Татаж авлаа"); } catch { toast.error("Алдаа"); } }} variant="outline" className="h-24 flex-col gap-2">
                    <Download className="w-6 h-6" />
                    <span>Бүх өгөгдөл (JSON)</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

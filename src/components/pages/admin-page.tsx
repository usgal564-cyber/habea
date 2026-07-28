"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthStore } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  Shield,
  Plus,
  Play,
  Square,
  Trash2,
  Download,
  BarChart3,
  Users,
  BookOpen,
  Copy,
  Check,
  X,
  ClipboardList,
  Loader2,
} from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  description: string;
  slug: string;
  questionCount: number;
}

interface Exam {
  id: string;
  title: string;
  code: string;
  isActive: boolean;
  timeLimit: number | null;
  createdAt: string;
  _count: { attempts: number };
}

interface ExamResult {
  id: string;
  userName: string;
  score: number;
  total: number;
  passed: boolean;
  createdAt: string;
}

interface ExamQuestion {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctIndex: number;
}

export default function AdminPage() {
  const { user, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState("exams");
  const [loading, setLoading] = useState(false);

  // Exams state
  const [exams, setExams] = useState<Exam[]>([]);
  const [examResults, setExamResults] = useState<{ results: ExamResult[]; stats: { total: number; passed: number; failed: number; average: number } } | null>(null);
  const [resultsExamId, setResultsExamId] = useState<string | null>(null);

  // Create exam dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [examTitle, setExamTitle] = useState("");
  const [examCode, setExamCode] = useState("");
  const [examTimeLimit, setExamTimeLimit] = useState("30");
  const [newQuestions, setNewQuestions] = useState<ExamQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState<ExamQuestion>({
    questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctIndex: 0,
  });

  // Results dialog
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);

  // Quizzes state
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [seeding, setSeeding] = useState(false);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };

  const fetchExams = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/exams", { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setExams(data.exams || []);
      }
    } catch (error) { /* ignore */ }
  }, [token]);

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await fetch("/api/quiz");
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.quizzes || []);
      }
    } catch (error) { /* ignore */ }
  }, []);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchExams();
      fetchQuizzes();
    }
  }, [user, fetchExams, fetchQuizzes]);

  // Not admin
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-900 to-brand-800 flex items-center justify-center">
        <Card className="max-w-md mx-4 shadow-xl">
          <CardContent className="py-12 text-center">
            <Shield className="w-16 h-16 text-brand-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-brand-900 mb-2">Админ эрхтэй хэрэглэгч биш</h2>
            <p className="text-muted-foreground">Энэ хуудас зөвхөн админ хандах боломжтой.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generate random code
  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  };

  // Seed quizzes
  const handleSeedQuizzes = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/seed-quiz", { method: "POST", headers: authHeaders });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchQuizzes();
      } else {
        toast.error(data.error);
      }
    } catch { toast.error("Алдаа гарлаа"); }
    finally { setSeeding(false); }
  };

  // Add question to list
  const addQuestion = () => {
    if (!currentQ.questionText.trim() || !currentQ.optionA.trim() || !currentQ.optionB.trim()) {
      toast.error("Асуулт болон дор хаяж 2 хариулт оруулна уу");
      return;
    }
    setNewQuestions([...newQuestions, { ...currentQ }]);
    setCurrentQ({ questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctIndex: 0 });
  };

  const removeQuestion = (idx: number) => {
    setNewQuestions(newQuestions.filter((_, i) => i !== idx));
  };

  // Create exam
  const handleCreateExam = async () => {
    if (!examTitle.trim()) { toast.error("Шалгалтын нэр оруулна уу"); return; }
    if (!examCode.trim()) { toast.error("Код оруулна уу"); return; }
    if (newQuestions.length < 5) { toast.error("Дор хаяж 5 асуулт оруулна уу"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          title: examTitle,
          code: examCode,
          timeLimit: parseInt(examTimeLimit),
          questions: JSON.stringify(newQuestions),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Шалгалт амжилттай үүсгэлээ!");
        setCreateDialogOpen(false);
        setExamTitle("");
        setExamCode("");
        setNewQuestions([]);
        fetchExams();
      } else {
        toast.error(data.error);
      }
    } catch { toast.error("Алдаа гарлаа"); }
    finally { setLoading(false); }
  };

  // Toggle exam active state
  const handleToggleExam = async (exam: Exam) => {
    try {
      const res = await fetch(`/api/admin/exams/${exam.id}/start`, {
        method: exam.isActive ? "DELETE" : "POST",
        headers: authHeaders,
      });
      if (res.ok) {
        toast.success(exam.isActive ? "Шалгалт зогсов" : "Шалгалт эхэллээ");
        fetchExams();
      }
    } catch { toast.error("Алдаа"); }
  };

  // Delete exam
  const handleDeleteExam = async (examId: string) => {
    if (!confirm("Энэ шалгалтыг устгах уу?")) return;
    try {
      const res = await fetch(`/api/admin/exams/${examId}/start`, { method: "DELETE", headers: authHeaders });
      if (res.ok) {
        toast.success("Шалгалт устгагдлаа");
        fetchExams();
      }
    } catch { toast.error("Алдаа"); }
  };

  // View results
  const handleViewResults = async (examId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/exams/${examId}/results`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setExamResults(data);
        setResultsExamId(examId);
        setResultsDialogOpen(true);
      }
    } catch { toast.error("Алдаа"); }
    finally { setLoading(false); }
  };

  // Export results as CSV
  const handleExportCSV = () => {
    if (!examResults) return;
    const headers = ["№", "Овог Нэр", "Оноо", "Нийт", "Тэнцэлт", "Огноо"];
    const rows = examResults.results.map((r, i) => [
      i + 1, r.userName, r.score, r.total, r.passed ? "Тэнцэв" : "Амжилтгүй",
      new Date(r.createdAt).toLocaleString("mn-MN"),
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    navigator.clipboard.writeText(csv);
    toast.success("CSV хууллагдлаа (clipboard-руу)");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-brand-900 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-700 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Админ хяналтын самбар</h1>
              <p className="text-brand-300 text-sm">ХАБЭА - Шалгалт, сорил удирдлага</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="exams" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              Шалгалт удирдах
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Сорил удирдах
            </TabsTrigger>
          </TabsList>

          {/* Exams Tab */}
          <TabsContent value="exams">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-brand-900">Шалгалтууд</h2>
              <Button onClick={() => { setExamCode(generateCode()); setCreateDialogOpen(true); }} className="bg-brand-600 hover:bg-brand-700">
                <Plus className="w-4 h-4 mr-2" />
                Шинэ шалгалт
              </Button>
            </div>

            {exams.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <ClipboardList className="w-12 h-12 text-brand-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">Одоогоор шалгалт байхгүй байна</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {exams.map((exam) => (
                  <motion.div key={exam.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-brand-900 truncate">{exam.title}</h3>
                              <Badge variant={exam.isActive ? "default" : "secondary"}>
                                {exam.isActive ? "Идэвхтэй" : "Идэвхгүй"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded">Код: {exam.code}</span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> {exam._count.attempts} оролтогч
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewResults(exam.id)} disabled={exam._count.attempts === 0}>
                              <BarChart3 className="w-4 h-4 mr-1" /> Үр дүн
                            </Button>
                            <Button size="sm" variant={exam.isActive ? "destructive" : "default"} onClick={() => handleToggleExam(exam)}>
                              {exam.isActive ? (
                                <><Square className="w-4 h-4 mr-1" /> Зогсоох</>
                              ) : (
                                <><Play className="w-4 h-4 mr-1" /> Эхлүүлэх</>
                              )}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteExam(exam.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-brand-900">Мэдлэг сорих сорилууд</h2>
              <Button onClick={handleSeedQuizzes} disabled={seeding || quizzes.length > 0} className="bg-brand-600 hover:bg-brand-700">
                {seeding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                {quizzes.length > 0 ? "Сорил аль хэдийн байна" : "Сорил үүсгэх (12 сорил)"}
              </Button>
            </div>

            {quizzes.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <BookOpen className="w-12 h-12 text-brand-300 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Одоогоор сорил байхгүй байна</p>
                  <p className="text-sm text-muted-foreground">
                    &quot;Сорил үүсгэх&quot; товч дээр дарж 12 сорил (20 асуулт бүхий) үүсгэнэ үү
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.map((quiz) => (
                  <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{quiz.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{quiz.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{quiz.questionCount} асуулт</Badge>
                        <Badge variant="outline">{quiz.slug}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Exam Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-brand-900">Шинэ шалгалт үүсгэх</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Exam Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Шалгалтын нэр</Label>
                <Input value={examTitle} onChange={(e) => setExamTitle(e.target.value)} placeholder="Шалгалтын нэр" />
              </div>
              <div>
                <Label>Код</Label>
                <div className="flex gap-2">
                  <Input value={examCode} onChange={(e) => setExamCode(e.target.value)} placeholder="ABC123" className="font-mono" />
                  <Button variant="outline" size="icon" onClick={() => setExamCode(generateCode())}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label>Цаг (минут)</Label>
                <Input type="number" value={examTimeLimit} onChange={(e) => setExamTimeLimit(e.target.value)} min="5" max="180" />
              </div>
            </div>

            {/* Add Question */}
            <div className="border rounded-xl p-4 space-y-3 bg-gray-50">
              <h4 className="font-semibold text-brand-900">Асуулт нэмэх ({newQuestions.length} асуулт)</h4>
              <Textarea
                value={currentQ.questionText}
                onChange={(e) => setCurrentQ({ ...currentQ, questionText: e.target.value })}
                placeholder="Асуултын текст"
                rows={2}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input value={currentQ.optionA} onChange={(e) => setCurrentQ({ ...currentQ, optionA: e.target.value })} placeholder="A) Хариулт" />
                <Input value={currentQ.optionB} onChange={(e) => setCurrentQ({ ...currentQ, optionB: e.target.value })} placeholder="B) Хариулт" />
                <Input value={currentQ.optionC} onChange={(e) => setCurrentQ({ ...currentQ, optionC: e.target.value })} placeholder="C) Хариулт" />
                <Input value={currentQ.optionD} onChange={(e) => setCurrentQ({ ...currentQ, optionD: e.target.value })} placeholder="D) Хариулт" />
              </div>
              <div className="flex items-center gap-3">
                <Label>Зөв хариулт:</Label>
                <div className="flex gap-2">
                  {["A", "B", "C", "D"].map((letter, idx) => (
                    <button
                      key={letter}
                      onClick={() => setCurrentQ({ ...currentQ, correctIndex: idx })}
                      className={`w-10 h-10 rounded-lg font-bold transition-all ${
                        currentQ.correctIndex === idx
                          ? "bg-brand-600 text-white"
                          : "bg-white border-2 border-gray-200 hover:border-brand-300"
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
                <Button onClick={addQuestion} className="ml-auto bg-brand-600 hover:bg-brand-700">
                  <Plus className="w-4 h-4 mr-1" /> Нэмэх
                </Button>
              </div>
            </div>

            {/* Question List */}
            {newQuestions.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <h4 className="text-sm font-medium text-muted-foreground">Нэмэгдсэн асуултууд:</h4>
                {newQuestions.map((q, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-white border rounded-lg text-sm">
                    <span className="font-mono text-brand-600 font-bold w-8">{idx + 1}.</span>
                    <span className="flex-1 truncate">{q.questionText}</span>
                    <Badge variant="outline" className="text-xs">
                      Зөв: {["A", "B", "C", "D"][q.correctIndex]}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => removeQuestion(idx)}>
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Хаах</Button>
              <Button onClick={handleCreateExam} className="bg-brand-600 hover:bg-brand-700" disabled={loading || newQuestions.length < 5}>
                {loading ? "Хадгаж байна..." : `Хадгалах (${newQuestions.length} асуулт)`}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={resultsDialogOpen} onOpenChange={setResultsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-brand-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Шалгалтын үр дүн
            </DialogTitle>
          </DialogHeader>

          {examResults && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-brand-50 rounded-xl p-4 text-center">
                  <Users className="w-5 h-5 text-brand-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-brand-900">{examResults.stats.total}</p>
                  <p className="text-xs text-muted-foreground">Нийт</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <Check className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-700">{examResults.stats.passed}</p>
                  <p className="text-xs text-muted-foreground">Тэнцсэн</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <X className="w-5 h-5 text-red-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-red-600">{examResults.stats.failed}</p>
                  <p className="text-xs text-muted-foreground">Амжилтгүй</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <BarChart3 className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-700">{examResults.stats.average}%</p>
                  <p className="text-xs text-muted-foreground">Дундаж</p>
                </div>
              </div>

              {/* Results Table */}
              {examResults.results.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>№</TableHead>
                      <TableHead>Овог Нэр</TableHead>
                      <TableHead>Оноо</TableHead>
                      <TableHead>Нийт</TableHead>
                      <TableHead>Үр дүн</TableHead>
                      <TableHead>Огноо</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examResults.results.map((r, idx) => (
                      <TableRow key={r.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-medium">{r.userName}</TableCell>
                        <TableCell>{r.score}</TableCell>
                        <TableCell>{r.total}</TableCell>
                        <TableCell>
                          <Badge variant={r.passed ? "default" : "destructive"}>
                            {r.passed ? "Тэнсэв" : "Амжилтгүй"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(r.createdAt).toLocaleString("mn-MN")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">Одоогоор оролтогч байхгүй</p>
              )}

              {/* Export */}
              {examResults.results.length > 0 && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={handleExportCSV}>
                    <Download className="w-4 h-4 mr-2" />
                    CSV хуулбарлах
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

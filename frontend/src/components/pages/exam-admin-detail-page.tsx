
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuthStore } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  ArrowLeft, Shield, Lock, Clock, CheckCircle, XCircle,
  Loader2, ChevronDown, ChevronUp, Download, Play, Square,
  Calendar, FileQuestion, Users, AlertTriangle, Trash2,
  Copy,
} from "lucide-react";

interface ExamAdminDetailPageProps {
  examId: string;
  onBack: () => void;
}

interface ExamQuestion {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: number;
  index: number;
}

interface ExamInfo {
  id: string;
  title: string;
  code: string;
  duration: number;
  questionCount: number;
  isActive: boolean;
  endDate: string | null;
  createdAt: string;
}

interface StudentResult {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  score: number;
  total: number;
  passed: boolean;
  timeSpent: number;
  createdAt: string;
}

export default function ExamAdminDetailPage({ examId, onBack }: ExamAdminDetailPageProps) {
  const { token } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [averageScore, setAverageScore] = useState(0);
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [savingDate, setSavingDate] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch exam info + questions
  useEffect(() => {
    const fetchExamData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/exams/${examId}/questions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setExam(data.exam);
          setQuestions(data.questions || []);
          if (data.exam?.endDate) {
            setEndDate(data.exam.endDate.split("T")[0]);
          }
        }
      } catch {
        toast.error("Шалгалтын мэдээлэл ачаалахад алдаа");
      } finally {
        setLoading(false);
      }
    };
    fetchExamData();
  }, [examId, token]);

  // Fetch results when tab opened
  const fetchResults = async () => {
    try {
      const res = await fetch(`/api/admin/exams/${examId}/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        setAverageScore(data.averageScore || 0);
      }
    } catch {
      toast.error("Үр дүн ачаалахад алдаа");
    }
  };

  const toggleExamStatus = async () => {
    if (!exam) return;
    setToggling(true);
    const newStatus = !exam.isActive;
    const endpoint = newStatus ? "start" : "stop";
    try {
      const res = await fetch(`/api/admin/exams/${examId}/${endpoint}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setExam({ ...exam, isActive: newStatus });
        toast.success(newStatus ? "Шалгалт идэвхжлээ" : "Шалгалт зогсов");
      } else {
        toast.error("Алдаа гарлаа");
      }
    } catch {
      toast.error("Сүлжээний алдаа");
    } finally {
      setToggling(false);
    }
  };

  const saveEndDate = async () => {
    setSavingDate(true);
    try {
      const res = await fetch(`/api/admin/exams/${examId}/stop`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ endDate }),
      });
      if (res.ok) {
        toast.success("Зогсоох огноо хадгалагдлаа");
      }
    } catch {
      toast.error("Алдаа гарлаа");
    } finally {
      setSavingDate(false);
    }
  };

  const deleteExam = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/exams/${examId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Шалгалт устгагдлаа");
        onBack();
      } else {
        toast.error("Устгахад алдаа гарлаа");
      }
    } catch {
      toast.error("Алдаа гарлаа");
    } finally {
      setDeleting(false);
    }
  };

  const handleExportPDF = () => {
    if (!exam || students.length === 0) return;
    const { exam: e, students: s, averageScore: avg } = { exam, students, averageScore };
    const passed = s.filter(st => st.passed).length;
    const html = `<!DOCTYPE html><html><head><title>${e.title} - Үр дүн</title>
    <style>body{font-family:sans-serif;padding:40px;color:#333}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:10px;text-align:left}th{background:#f8f8f8}.passed{color:green}.failed{color:red}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #eee;padding-bottom:15px;margin-bottom:20px}.stats{display:flex;gap:30px;margin:20px 0}</style></head>
    <body><div class="header"><div><h1>${e.title}</h1><p>Код: ${e.code}</p></div><div style="text-align:right"><p>Огноо: ${new Date().toLocaleDateString("mn-MN")}</p><p>Тэнцсэн: ${passed}/${s.length}</p></div></div>
    <div class="stats"><div><strong>Дундаж оноо:</strong> ${avg.toFixed(1)}%</div><div><strong>Нийт оролдлого:</strong> ${s.length}</div><div><strong>Тэнцэлтийн хувь:</strong> ${s.length > 0 ? Math.round((passed / s.length) * 100) : 0}%</div></div>
    <table><thead><tr><th>#</th><th>Овог</th><th>Нэр</th><th>Оноо</th><th>Цаг</th><th>Огноо</th><th>Төлөв</th></tr></thead><tbody>${s.map((st, i) => {
      const mins = Math.floor((st.timeSpent || 0) / 60);
      const secs = (st.timeSpent || 0) % 60;
      return `<tr><td>${i + 1}</td><td>${st.lastName || ""}</td><td>${st.firstName || ""}</td><td>${st.score}/${st.total}</td><td>${mins}м ${secs}с</td><td>${st.createdAt ? new Date(st.createdAt).toLocaleDateString("mn-MN") : ""}</td><td class="${st.passed ? "passed" : "failed"}">${st.passed ? "Тэнцэв" : "Амжилтгүй"}</td></tr>`;
    }).join("")}</tbody></table></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${e.title}_үр_дүн.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCode = () => {
    if (exam?.code) {
      navigator.clipboard.writeText(exam.code);
      toast.success("Код хуулагдлаа");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-500">Шалгалт олдсонгүй</p>
          <Button variant="outline" onClick={onBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Буцах
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 lg:py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Админ хэсэгрүү буцах
        </button>

        <Card className="border-0 shadow-sm mb-6">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-xl border-b pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">{exam.title}</CardTitle>
                  <div className="flex items-center gap-3 mt-1.5">
                    <button
                      onClick={copyCode}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <span className="font-mono bg-white/70 border border-orange-200 rounded px-2 py-0.5">{exam.code}</span>
                      <Copy className="w-3 h-3" />
                    </button>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {exam.duration} мин
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <FileQuestion className="w-3 h-3" />
                      {exam.questionCount} асуулт
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={exam.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}>
                  {exam.isActive ? "Идэвхтэй" : "Зогссон"}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Controls Section - Stop/Start + End Date */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Stop/Start Toggle */}
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Шалгалтын төлөв</Label>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={exam.isActive}
                    onCheckedChange={toggleExamStatus}
                    disabled={toggling}
                  />
                  <span className="text-sm text-gray-600">
                    {exam.isActive ? (
                      <span className="flex items-center gap-1.5 text-green-700">
                        <Play className="w-4 h-4" /> Идэвхтэй — сурагчид шалгалт өгч болно
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <Square className="w-4 h-4" /> Зогссон — шалгалт өгөх боломжгүй
                      </span>
                    )}
                  </span>
                </div>
                {toggling && <Loader2 className="w-4 h-4 animate-spin mt-2 text-orange-500" />}
              </div>

              <Separator orientation="vertical" className="hidden sm:block h-12" />

              {/* End Date */}
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                  Зогсоох огноо
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="max-w-[180px]"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveEndDate}
                    disabled={savingDate || !endDate}
                  >
                    {savingDate ? <Loader2 className="w-4 h-4 animate-spin" /> : "Хадгалах"}
                  </Button>
                </div>
              </div>

              <Separator orientation="vertical" className="hidden sm:block h-12" />

              {/* Delete */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">&nbsp;</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                  onClick={deleteExam}
                  disabled={deleting}
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span className="ml-1.5">Устгах</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Collapsible: Questions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Collapsible open={questionsOpen} onOpenChange={setQuestionsOpen}>
          <Card className="border-0 shadow-sm mb-4">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="bg-gradient-to-r from-brand-50 to-emerald-50 rounded-t-xl border-b pb-4 cursor-pointer hover:from-brand-100 hover:to-emerald-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                      <FileQuestion className="w-5 h-5 text-brand-600" />
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-base">Асуултууд</CardTitle>
                      <p className="text-xs text-gray-500 mt-0.5">{questions.length} асуулт</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${questionsOpen ? "rotate-180" : ""}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                  {questions.length === 0 ? (
                    <div className="text-center py-8 text-sm text-gray-400">Асуулт байхгүй</div>
                  ) : (
                    questions.map((q, i) => (
                      <div key={q.id || i} className="p-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {q.index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-800">{q.question}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2.5">
                              {[
                                { label: "A", text: q.optionA },
                                { label: "B", text: q.optionB },
                                { label: "C", text: q.optionC },
                                { label: "D", text: q.optionD },
                              ].map((opt, oi) => (
                                <div
                                  key={oi}
                                  className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border ${
                                    q.correct === oi
                                      ? "bg-green-50 border-green-200 text-green-700 font-medium"
                                      : "bg-gray-50 border-gray-100 text-gray-600"
                                  }`}
                                >
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                    q.correct === oi
                                      ? "bg-green-500 text-white"
                                      : "bg-gray-200 text-gray-600"
                                  }`}>
                                    {opt.label}
                                  </span>
                                  <span className="truncate">{opt.text}</span>
                                  {q.correct === oi && <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 ml-auto" />}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </motion.div>

      {/* Collapsible: Results */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Collapsible
          open={resultsOpen}
          onOpenChange={(open) => {
            setResultsOpen(open);
            if (open && students.length === 0) {
              fetchResults();
            }
          }}
        >
          <Card className="border-0 shadow-sm">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl border-b pb-4 cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-base">Оролдлогын үр дүн</CardTitle>
                      <p className="text-xs text-gray-500 mt-0.5">{students.length} сурагч</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${resultsOpen ? "rotate-180" : ""}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-0">
                {students.length === 0 ? (
                  <div className="text-center py-10 text-sm text-gray-400">
                    Одоогоор оролдлогын үр дүн байхгүй
                  </div>
                ) : (
                  <div className="p-4">
                    {/* Stats bar + PDF export */}
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                      <div className="flex items-center gap-5 flex-wrap">
                        <div className="text-center">
                          <p className="text-lg font-bold text-orange-700">{averageScore.toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Дундаж оноо</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">{students.length}</p>
                          <p className="text-xs text-muted-foreground">Нийт сурагч</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-700">{students.filter(s => s.passed).length}</p>
                          <p className="text-xs text-muted-foreground">Тэнцсэн</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-brand-600">
                            {students.length > 0
                              ? Math.round((students.filter(s => s.passed).length / students.length) * 100)
                              : 0}%
                          </p>
                          <p className="text-xs text-muted-foreground">Тэнцэлтийн хувь</p>
                        </div>
                      </div>
                      <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 bg-white text-green-700 text-sm font-medium hover:bg-green-50 transition-colors shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        PDF
                      </button>
                    </div>
                    {/* Student list */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {students.map((s, si) => {
                        const mins = Math.floor((s.timeSpent || 0) / 60);
                        const secs = (s.timeSpent || 0) % 60;
                        return (
                          <motion.div
                            key={si}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: si * 0.04 }}
                            className="bg-white rounded-xl border border-green-100 p-4 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${s.passed ? "bg-green-100" : "bg-red-100"}`}>
                                {s.passed ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-sm text-gray-900 truncate">
                                  {s.lastName || ""} {s.firstName || ""}
                                </p>
                                <div className="mt-2 space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Оноо</span>
                                    <span className="text-sm font-bold text-gray-900">{s.score}/{s.total}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> Цаг
                                    </span>
                                    <span className="text-sm text-gray-700">{mins} мин {secs} сек</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Огноо</span>
                                    <span className="text-xs text-gray-500">
                                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString("mn-MN") : "—"}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-50">
                                  {s.passed ? (
                                    <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0">Тэнцэв</Badge>
                                  ) : (
                                    <Badge className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0">Амжилтгүй</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </motion.div>
    </div>
  );
}

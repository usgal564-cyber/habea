
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  Shield, Lock, Clock, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  CheckCircle, XCircle, ArrowLeft, Loader2, Plus, Trash2, Copy, Download,
  Eye, AlertTriangle, FileEdit, Award, Scale, Flame, Heart, ClipboardList,
  Zap, Calendar,
} from "lucide-react";
import { examTemplates, type ExamTemplate } from "@/data/exam-templates";

interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

interface ExamDetailQuestion {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: number;
}

type ExamState = "enter-code" | "exam-info" | "taking" | "result";

const QUESTIONS_PER_PAGE = 10;

const iconMap: Record<string, React.ReactNode> = {
  shield: <Shield className="w-6 h-6" />,
  award: <Award className="w-6 h-6" />,
  scale: <Scale className="w-6 h-6" />,
  flame: <Flame className="w-6 h-6" />,
  heart: <Heart className="w-6 h-6" />,
};

const optionLabels = ["A", "B", "C", "D"];

export default function ExamPage() {
  const { user, token } = useAuthStore();
  const isAdmin = user && (user.role === "ADMIN" || user.role === "MANAGER" || user.role === "TEACHER");

  const [state, setState] = useState<ExamState>("enter-code");
  const [code, setCode] = useState("");
  const [examInfo, setExamInfo] = useState<{ id: string; title: string; duration: number; questionCount: number } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; passed: boolean; timeSpent: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [examHistory, setExamHistory] = useState<any[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const examStartTimeRef = useRef<number>(0);
  const handleSubmitRef = useRef<() => void>(() => {});

  // Admin: Create from template
  const [creatingFromTemplate, setCreatingFromTemplate] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState("");
  const [createdTitle, setCreatedTitle] = useState("");

  // Admin: Custom create
  const [showCustomCreate, setShowCustomCreate] = useState(false);
  const [activeCreateType, setActiveCreateType] = useState<"exam" | "quiz">("exam");
  const [examTitle, setExamTitle] = useState("");
  const [examDuration, setExamDuration] = useState("30");
  const [examEndDate, setExamEndDate] = useState("");
  const [quizDescription, setQuizDescription] = useState("");

  // Admin: Created items list
  const [adminExams, setAdminExams] = useState<any[]>([]);
  const [adminQuizzes, setAdminQuizzes] = useState<any[]>([]);
  const [adminQuestions, setAdminQuestions] = useState<{ question: string; optionA: string; optionB: string; optionC: string; optionD: string; correct: string }[]>([
    { question: "", optionA: "", optionB: "", optionC: "", optionD: "", correct: "0" },
  ]);
  const [customCreating, setCustomCreating] = useState(false);

  // Admin: Expanded exam detail
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<ExamDetailQuestion[]>([]);
  const [expandedQuestionsLoading, setExpandedQuestionsLoading] = useState(false);
  const [showExpandedQuestions, setShowExpandedQuestions] = useState(false);

  const safeQuestions = questions || [];
  const totalPages = Math.ceil(safeQuestions.length / QUESTIONS_PER_PAGE);
  const currentQuestions = safeQuestions.slice((currentPage - 1) * QUESTIONS_PER_PAGE, currentPage * QUESTIONS_PER_PAGE);

  // Countdown timer (time left)
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { setTimerActive(false); handleSubmitRef.current(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // Elapsed timer (counting up)
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - examStartTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  useEffect(() => {
    if (token) {
      fetch("/api/exam/history", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => setExamHistory(d.history || []))
        .catch(() => {});
    }
  }, [token, state]);

  // Admin: fetch created items
  const fetchAdminItems = useCallback(() => {
    if (!token || !isAdmin) return;
    fetch("/api/admin/exams", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setAdminExams(d.exams || [])).catch(() => {});
    fetch("/api/admin/quizzes", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setAdminQuizzes(d.quizzes || [])).catch(() => {});
  }, [token, isAdmin]);

  useEffect(() => { fetchAdminItems(); }, [fetchAdminItems]);

  // Admin: Fetch exam questions for expanded detail
  const handleFetchExamQuestions = async (examId: string) => {
    if (!token) return;
    setExpandedQuestionsLoading(true);
    try {
      const res = await fetch(`/api/admin/exams/${examId}/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setExpandedQuestions(data.questions || []);
      } else {
        toast.error(data.error || "Асуулт ачааллахад алдаа");
      }
    } catch {
      toast.error("Холболтын алдаа");
    } finally {
      setExpandedQuestionsLoading(false);
    }
  };

  // Admin: Toggle exam expanded view
  const handleToggleExpand = (examId: string) => {
    if (expandedExamId === examId) {
      setExpandedExamId(null);
      setExpandedQuestions([]);
      setShowExpandedQuestions(false);
    } else {
      setExpandedExamId(examId);
      setExpandedQuestions([]);
      setShowExpandedQuestions(false);
      handleFetchExamQuestions(examId);
    }
  };

  // Admin: Stop exam
  const handleStopExam = async (examId: string) => {
    try {
      const res = await fetch(`/api/admin/exams/${examId}/stop`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Шалгалт зогсов");
        fetchAdminItems();
      } else {
        toast.error("Алдаа");
      }
    } catch {
      toast.error("Алдаа");
    }
  };

  // Admin: Delete exam
  const handleDeleteExam = async (examId: string) => {
    try {
      const res = await fetch(`/api/admin/exams/${examId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Шалгалт устгагдлаа");
        if (expandedExamId === examId) {
          setExpandedExamId(null);
          setExpandedQuestions([]);
          setShowExpandedQuestions(false);
        }
        fetchAdminItems();
      } else {
        toast.error("Алдаа");
      }
    } catch {
      toast.error("Алдаа");
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) { toast.error("Код оруулна уу"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/exam", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "verify", code: code.trim() }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setExamInfo(data.exam);
      setState("exam-info");
    } catch { toast.error("Холболтын алдаа"); }
    finally { setLoading(false); }
  };

  const handleStartExam = async () => {
    if (!examInfo || !token) { if (!token) toast.error("Шалгалт өгөхийн тулд нэвтрэх шаардлагатай"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/exam?examId=${examInfo.id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); setState("enter-code"); return; }
      const q = data.questions || [];
      setQuestions(q);
      setTimeLeft((q.length > 0 ? examInfo.duration : 30) * 60);
      examStartTimeRef.current = Date.now();
      setElapsedTime(0);
      setTimerActive(true);
      setState("taking");
    } catch { toast.error("Асуулт ачааллахад алдаа"); }
    finally { setLoading(false); }
  };

  const handleSubmitExam = useCallback(async () => {
    if (!examInfo || !token || !(questions || []).length) return;
    setTimerActive(false); setLoading(true);
    try {
      const timeSpent = Math.floor((Date.now() - examStartTimeRef.current) / 1000);
      const answerArray = (questions || []).map((q) => answers[q.id] ?? -1);
      const res = await fetch("/api/exam", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: "submit", examId: examInfo.id, answers: answerArray, timeSpent }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setResult({ score: data.score, total: data.total, passed: data.passed, timeSpent });
      setState("result");
      fetch("/api/exam/history", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setExamHistory(d.history || [])).catch(() => {});
    } catch { toast.error("Алдаа"); }
    finally { setLoading(false); }
  }, [examInfo, token, questions, answers]);

  handleSubmitRef.current = handleSubmitExam;

  const resetExam = () => { setState("enter-code"); setCode(""); setExamInfo(null); setQuestions([]); setAnswers({}); setCurrentPage(1); setResult(null); setTimeLeft(0); setTimerActive(false); setElapsedTime(0); examStartTimeRef.current = 0; };

  const formatTime = (s: number) => { const m = Math.floor(s / 60); return `${m.toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`; };
  const formatTimeSpent = (s: number) => { const mins = Math.floor(s / 60); const secs = s % 60; return `${mins} мин ${secs} сек`; };
  const answeredCount = Object.keys(answers).length;

  // Admin: Create exam/quiz from template
  const handleCreateFromTemplate = async (template: ExamTemplate) => {
    setCreatingFromTemplate(template.id);
    try {
      const isQuiz = template.type === "quiz";
      const endpoint = isQuiz ? "/api/admin/quizzes" : "/api/admin/exams";
      const body = isQuiz ? {
        title: template.title,
        description: template.description,
        category: "general",
        questions: template.questions.map(q => ({
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correct: q.correct,
        })),
      } : {
        title: template.title,
        duration: template.duration,
        questions: template.questions.map(q => ({
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correct: q.correct,
        })),
      };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Алдаа"); setCreatingFromTemplate(null); return; }
      if (isQuiz) {
        setCreatedCode("QUIZ");
        toast.success(`Сорил үүссэн: ${template.title}`);
      } else {
        setCreatedCode(data.exam.code);
        setCreatedTitle(template.title);
        toast.success(`Шалгалт үүссэн! Код: ${data.exam.code}`);
      }
      fetchAdminItems();
      setTimeout(() => { setCreatingFromTemplate(null); setCreatedCode(""); setCreatedTitle(""); }, 5000);
    } catch { toast.error("Алдаа"); setCreatingFromTemplate(null); }
  };

  // Admin: Add question (custom)
  const addQuestion = () => setAdminQuestions([...adminQuestions, { question: "", optionA: "", optionB: "", optionC: "", optionD: "", correct: "0" }]);
  const removeQuestion = (i: number) => { if (adminQuestions.length > 1) setAdminQuestions(adminQuestions.filter((_, idx) => idx !== i)); };
  const updateQ = (i: number, field: string, val: string) => { const nq = [...adminQuestions]; nq[i] = { ...nq[i], [field]: val }; setAdminQuestions(nq); };

  // Admin: Custom create
  const handleCustomCreate = async () => {
    if (!examTitle.trim()) { toast.error(activeCreateType === "exam" ? "Шалгалтын нэр оруулна уу" : "Сорилын нэр оруулна уу"); return; }
    const valid = adminQuestions.filter(q => q.question.trim() && q.optionA.trim() && q.optionB.trim() && q.optionC.trim() && q.optionD.trim());
    if (valid.length < 1) { toast.error("Дор хаяж 1 асуулт оруулна уу"); return; }
    setCustomCreating(true);
    try {
      const isQuiz = activeCreateType === "quiz";
      const endpoint = isQuiz ? "/api/admin/quizzes" : "/api/admin/exams";
      const body = isQuiz ? {
        title: examTitle,
        description: quizDescription,
        category: "",
        questions: valid.map(q => ({ ...q, correct: parseInt(q.correct) })),
      } : {
        title: examTitle,
        duration: parseInt(examDuration) || 30,
        endDate: examEndDate || null,
        questions: valid.map(q => ({ ...q, correct: parseInt(q.correct) })),
      };
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Алдаа"); return; }
      if (isQuiz) {
        setCreatedCode("QUIZ");
        setCreatedTitle(examTitle);
        toast.success(`Сорил үүссэн: ${examTitle}`);
      } else {
        setCreatedCode(data.exam.code);
        setCreatedTitle(examTitle);
        toast.success(`Шалгалт үүссэн! Код: ${data.exam.code}`);
      }
      fetchAdminItems();
      setExamTitle(""); setExamDuration("30"); setExamEndDate(""); setQuizDescription("");
      setAdminQuestions([{ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correct: "0" }]);
      setShowCustomCreate(false);
    } catch { toast.error("Алдаа"); }
    finally { setCustomCreating(false); }
  };

  const resetCustomForm = () => {
    setExamTitle(""); setExamDuration("30"); setExamEndDate(""); setQuizDescription("");
    setAdminQuestions([{ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correct: "0" }]);
    setActiveCreateType("exam");
  };

  const copyCode = (c: string) => {
    navigator.clipboard.writeText(c);
    toast.success("Код хуулагдлаа!");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-brand-900 to-brand-800 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-brand-700/50 px-4 py-2 rounded-full mb-6">
              <Lock className="w-4 h-4 text-brand-300" />
              <span className="text-brand-200 text-sm font-medium">Кодтой шалгалт</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">Шалгалт</h1>
            <p className="text-brand-200 text-lg max-w-2xl mx-auto">Админ өгсөн кодоор шалгалтанд орох. Шалгалт идэвхтэй үед л орох боломжтой.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 pb-12">
        {/* ─── Admin: Template Selection + Custom Create ─── */}
        {isAdmin && state === "enter-code" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="shadow-xl border-brand-200">
              <CardHeader className="bg-brand-50 rounded-t-xl">
                <CardTitle className="text-xl text-brand-900 flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Админ: Шалгалт үүсгэх
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Success Message */}
                {createdCode && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-xl">
                    <div className="text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-green-800 font-medium">{createdTitle}</p>
                      {createdCode === "QUIZ" ? (
                        <p className="text-green-700 text-sm mt-1">Сорил амжилттай үүслээ! Сорилууд хуудаснаас харагдана.</p>
                      ) : (
                        <>
                          <p className="text-green-700 text-sm mt-1">Шалгалт үүслээ! Код:</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="text-2xl font-bold tracking-[0.3em] text-green-900 font-mono">{createdCode}</span>
                            <Button size="sm" variant="outline" className="text-green-700 border-green-300 hover:bg-green-100" onClick={() => copyCode(createdCode)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                <Tabs defaultValue="exam" className="w-full" onValueChange={(v) => setActiveCreateType(v as "exam" | "quiz")}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="exam" className="gap-1.5">
                      <FileEdit className="w-4 h-4" />
                      Шалгалт
                    </TabsTrigger>
                    <TabsTrigger value="quiz" className="gap-1.5">
                      <ClipboardList className="w-4 h-4" />
                      Мэдлэг сорих
                    </TabsTrigger>
                  </TabsList>

                  {/* Шалгалт Templates */}
                  <TabsContent value="exam">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {examTemplates.filter(t => t.type === "exam").map((template) => (
                        <motion.div key={template.id} whileHover={{ y: -2 }}>
                          <Card className="h-full border-2 hover:border-brand-400 transition-all group cursor-pointer" style={{ borderColor: creatingFromTemplate === template.id ? "#124D1C" : undefined }}>
                            <CardContent className="p-5 flex flex-col h-full">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                                  {iconMap[template.icon] || <Shield className="w-6 h-6" />}
                                </div>
                                <div className="min-w-0">
                                  <h3 className="font-bold text-brand-900 text-sm leading-tight">{template.title}</h3>
                                  <Badge variant="secondary" className="text-xs mt-1 bg-brand-100 text-brand-700">
                                    {template.questions.length} асуулт
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-4 flex-1">{template.description}</p>
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{template.duration} мин</span>
                                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{template.passingScore}%</span>
                                </div>
                              </div>
                              <Button
                                onClick={() => handleCreateFromTemplate(template)}
                                disabled={creatingFromTemplate === template.id}
                                className="w-full bg-brand-600 hover:bg-brand-700 text-white"
                              >
                                {creatingFromTemplate === template.id ? (
                                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Үүсгэж байна...</>
                                ) : (
                                  "Сонгох"
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Мэдлэг сорих Templates */}
                  <TabsContent value="quiz">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {examTemplates.filter(t => t.type === "quiz").map((template) => (
                        <motion.div key={template.id} whileHover={{ y: -2 }}>
                          <Card className="h-full border-2 hover:border-amber-400 transition-all group cursor-pointer" style={{ borderColor: creatingFromTemplate === template.id ? "#d97706" : undefined }}>
                            <CardContent className="p-5 flex flex-col h-full">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                  {iconMap[template.icon] || <ClipboardList className="w-6 h-6" />}
                                </div>
                                <div className="min-w-0">
                                  <h3 className="font-bold text-amber-900 text-sm leading-tight">{template.title}</h3>
                                  <Badge variant="secondary" className="text-xs mt-1 bg-amber-100 text-amber-700">
                                    {template.questions.length} асуулт
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-4 flex-1">{template.description}</p>
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{template.duration} мин</span>
                                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{template.passingScore}%</span>
                                </div>
                              </div>
                              <Button
                                onClick={() => handleCreateFromTemplate(template)}
                                disabled={creatingFromTemplate === template.id}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                              >
                                {creatingFromTemplate === template.id ? (
                                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Үүсгэж байна...</>
                                ) : (
                                  "Сонгох"
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-muted-foreground">эсвэл</span>
                  </div>
                </div>

                {/* Custom Create Toggle */}
                {!showCustomCreate ? (
                  <Button variant="outline" onClick={() => { setShowCustomCreate(true); resetCustomForm(); }} className="w-full border-dashed border-2 border-brand-300 text-brand-700 hover:bg-brand-50 hover:border-brand-400">
                    <Plus className="w-4 h-4 mr-2" /> Шинээр үүсгэх
                  </Button>
                ) : (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="border-2 border-brand-200 rounded-xl p-5 bg-brand-50/30">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-brand-900 flex items-center gap-2"><FileEdit className="w-4 h-4" /> {activeCreateType === "exam" ? "Шинэ шалгалт" : "Шинэ сорил"} үүсгэх</h3>
                      <Button size="sm" variant="ghost" onClick={() => { setShowCustomCreate(false); resetCustomForm(); }} className="text-muted-foreground"><XCircle className="w-4 h-4" /></Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label>{activeCreateType === "exam" ? "Шалгалтын нэр" : "Сорилын нэр"}</Label>
                        <Input value={examTitle} onChange={e => setExamTitle(e.target.value)} placeholder={activeCreateType === "exam" ? "Жишээ: ХАБЭА үндсэн шалгалт" : "Жишээ: Гал түймэрээс сэргийлэх"} />
                      </div>
                      {activeCreateType === "exam" ? (
                        <div>
                          <Label>Хугацаа (минут)</Label>
                          <Input type="number" value={examDuration} onChange={e => setExamDuration(e.target.value)} placeholder="30" />
                        </div>
                      ) : (
                        <div>
                          <Label>Тайлбар</Label>
                          <Input value={quizDescription} onChange={e => setQuizDescription(e.target.value)} placeholder="Сорилын тайлбар" />
                        </div>
                      )}
                    </div>

                    {/* End Date field for exam type */}
                    {activeCreateType === "exam" && (
                      <div className="mb-4">
                        <Label className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Зогсоох огноо</Label>
                        <Input type="date" value={examEndDate} onChange={e => setExamEndDate(e.target.value)} className="mt-1" />
                        <p className="text-xs text-muted-foreground mt-1">Энэ огноонд шалгалт автоматаар зогсох болно</p>
                      </div>
                    )}

                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Асуултууд ({adminQuestions.length})</Label>
                        <Button type="button" size="sm" variant="outline" onClick={addQuestion}><Plus className="w-4 h-4 mr-1" /> Асуулт нэмэх</Button>
                      </div>
                      {adminQuestions.map((q, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 space-y-3 border">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-brand-700">Асуулт {i + 1}</span>
                            <Button type="button" size="sm" variant="ghost" onClick={() => removeQuestion(i)} className="text-red-500 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <Textarea value={q.question} onChange={e => updateQ(i, "question", e.target.value)} placeholder="Асуултын текст..." rows={2} />
                          <div className="grid grid-cols-2 gap-2">
                            <Input value={q.optionA} onChange={e => updateQ(i, "optionA", e.target.value)} placeholder="A) Хариулт" />
                            <Input value={q.optionB} onChange={e => updateQ(i, "optionB", e.target.value)} placeholder="B) Хариулт" />
                            <Input value={q.optionC} onChange={e => updateQ(i, "optionC", e.target.value)} placeholder="C) Хариулт" />
                            <Input value={q.optionD} onChange={e => updateQ(i, "optionD", e.target.value)} placeholder="D) Хариулт" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">Зөв хариулт:</Label>
                            <Select value={q.correct} onValueChange={v => updateQ(i, "correct", v)}>
                              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">A</SelectItem>
                                <SelectItem value="1">B</SelectItem>
                                <SelectItem value="2">C</SelectItem>
                                <SelectItem value="3">D</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button onClick={handleCustomCreate} disabled={customCreating || !examTitle.trim()} className="w-full mt-4 bg-brand-600 hover:bg-brand-700">
                      {customCreating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Үүсгэж байна...</> : <><Plus className="w-4 h-4 mr-2" />{activeCreateType === "exam" ? "Шалгалт" : "Сорил"} үүсгэх</>}
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Created items list */}
            {((adminExams || []).length > 0 || (adminQuizzes || []).length > 0) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                <Card className="border-brand-200">
                  <CardHeader className="bg-brand-50 rounded-t-xl">
                    <CardTitle className="text-lg text-brand-900 flex items-center gap-2">
                      <Eye className="w-5 h-5" /> Үүссэн шалгалтууд, сорилууд
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {/* Exams - Expandable List */}
                    {(adminExams || []).length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-brand-600 uppercase mb-3">Шалгалтууд ({(adminExams || []).length})</p>
                        <div className="space-y-2">
                          {(adminExams || []).map((e: any) => (
                            <div key={e.id}>
                              {/* Clickable header row */}
                              <button
                                onClick={() => handleToggleExpand(e.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left ${expandedExamId === e.id ? "bg-brand-50 border-2 border-brand-300" : "bg-gray-50 hover:bg-brand-50 border border-transparent"}`}
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-brand-900 truncate">{e.title}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {e.questionCount} асуулт · {e.duration} мин
                                    {e.endDate ? ` · Зогсоох: ${new Date(e.endDate).toLocaleDateString("mn-MN")}` : ""}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 ml-3 shrink-0">
                                  <Badge variant={e.isActive ? "default" : "secondary"} className={e.isActive ? "bg-green-100 text-green-800" : ""}>
                                    {e.isActive ? "Идэвхтэй" : "Идэвхгүй"}
                                  </Badge>
                                  <span className="text-sm font-mono font-bold tracking-wider text-brand-700 bg-brand-100 px-2 py-1 rounded">{e.code}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(ev) => { ev.stopPropagation(); copyCode(e.code); }}
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </Button>
                                  {expandedExamId === e.id ? (
                                    <ChevronUp className="w-4 h-4 text-brand-600" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </div>
                              </button>

                              {/* Expanded Detail Panel */}
                              <AnimatePresence>
                                {expandedExamId === e.id && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-2 ml-2 mr-2 p-4 bg-white border-2 border-brand-200 rounded-xl">
                                      {/* Exam Info Header */}
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                                        <div className="bg-brand-50 rounded-lg p-3">
                                          <p className="text-xs text-muted-foreground mb-1">Нэр</p>
                                          <p className="text-sm font-semibold text-brand-900 truncate">{e.title}</p>
                                        </div>
                                        <div className="bg-brand-50 rounded-lg p-3">
                                          <p className="text-xs text-muted-foreground mb-1">Код</p>
                                          <p className="text-sm font-mono font-bold text-brand-700 tracking-wider">{e.code}</p>
                                        </div>
                                        <div className="bg-brand-50 rounded-lg p-3">
                                          <p className="text-xs text-muted-foreground mb-1">Хугацаа</p>
                                          <p className="text-sm font-semibold text-brand-900">{e.duration} минут</p>
                                        </div>
                                        <div className="bg-brand-50 rounded-lg p-3">
                                          <p className="text-xs text-muted-foreground mb-1">Асуултын тоо</p>
                                          <p className="text-sm font-semibold text-brand-900">{e.questionCount}</p>
                                        </div>
                                        <div className="bg-brand-50 rounded-lg p-3">
                                          <p className="text-xs text-muted-foreground mb-1">Статус</p>
                                          <Badge variant={e.isActive ? "default" : "secondary"} className={e.isActive ? "bg-green-100 text-green-800" : ""}>
                                            {e.isActive ? "Идэвхтэй" : "Идэвхгүй"}
                                          </Badge>
                                        </div>
                                        <div className="bg-brand-50 rounded-lg p-3">
                                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Зогсоох огноо</p>
                                          <p className="text-sm font-semibold text-brand-900">
                                            {e.endDate ? new Date(e.endDate).toLocaleDateString("mn-MN") : "Тодорхойгүй"}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Questions Section */}
                                      <div className="border-t pt-3">
                                        <button
                                          onClick={() => setShowExpandedQuestions(!showExpandedQuestions)}
                                          className="w-full flex items-center justify-between py-2 text-sm font-semibold text-brand-800 hover:text-brand-600 transition-colors"
                                        >
                                          <span className="flex items-center gap-2">
                                            <ClipboardList className="w-4 h-4" />
                                            Асуултууд харах ({expandedQuestions.length})
                                          </span>
                                          {showExpandedQuestions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>

                                        <AnimatePresence>
                                          {showExpandedQuestions && (
                                            <motion.div
                                              initial={{ opacity: 0, height: 0 }}
                                              animate={{ opacity: 1, height: "auto" }}
                                              exit={{ opacity: 0, height: 0 }}
                                              transition={{ duration: 0.2 }}
                                              className="overflow-hidden"
                                            >
                                              {expandedQuestionsLoading ? (
                                                <div className="flex items-center justify-center py-8">
                                                  <Loader2 className="w-6 h-6 text-brand-500 animate-spin mr-2" />
                                                  <span className="text-sm text-muted-foreground">Ачааллаж байна...</span>
                                                </div>
                                              ) : expandedQuestions.length > 0 ? (
                                                <div className="space-y-4 mt-3 max-h-96 overflow-y-auto pr-1">
                                                  {expandedQuestions.map((q, idx) => (
                                                    <div key={q.id} className="bg-gray-50 rounded-lg p-3 border">
                                                      <p className="text-sm font-medium text-brand-900 mb-2">
                                                        {idx + 1}. {q.question}
                                                      </p>
                                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                        {[
                                                          { label: "A", text: q.optionA, idx: 0 },
                                                          { label: "B", text: q.optionB, idx: 1 },
                                                          { label: "C", text: q.optionC, idx: 2 },
                                                          { label: "D", text: q.optionD, idx: 3 },
                                                        ].map((opt) => (
                                                          <div
                                                            key={opt.label}
                                                            className={`text-sm px-3 py-2 rounded-lg border transition-colors ${
                                                              opt.idx === q.correct
                                                                ? "bg-green-100 border-green-400 text-green-900 font-semibold"
                                                                : "bg-white border-gray-200 text-gray-700"
                                                            }`}
                                                          >
                                                            <span className="font-bold mr-1.5">{opt.label})</span>
                                                            {opt.text}
                                                            {opt.idx === q.correct && (
                                                              <CheckCircle className="w-3.5 h-3.5 inline-block ml-1.5 text-green-600" />
                                                            )}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              ) : (
                                                <p className="text-sm text-muted-foreground text-center py-4">Асуулт олдсонгүй</p>
                                              )}
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                                        {e.isActive && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            onClick={() => handleStopExam(e.id)}
                                          >
                                            <XCircle className="w-4 h-4 mr-1.5" /> Зогсоох
                                          </Button>
                                        )}
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                          onClick={() => handleDeleteExam(e.id)}
                                        >
                                          <Trash2 className="w-4 h-4 mr-1.5" /> Устгах
                                        </Button>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quizzes - keep as flat list */}
                    {(adminQuizzes || []).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-amber-600 uppercase mb-2">Сорилууд ({(adminQuizzes || []).length})</p>
                        {(adminQuizzes || []).slice(0, 10).map((q: any) => (
                          <div key={q.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-amber-50 transition-colors mb-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-brand-900 truncate">{q.title}</p>
                              <p className="text-xs text-muted-foreground">{q.questionCount} асуулт</p>
                            </div>
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 ml-3 shrink-0">
                              <ClipboardList className="w-3 h-3 mr-1" /> Сорил
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Enter Code */}
          {state === "enter-code" && (
            <motion.div key="enter-code" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card className="shadow-xl">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl text-brand-900">Шалгалтын код оруулна уу</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-brand-600" />
                      </div>
                      <p className="text-muted-foreground text-sm">Админ тань өгсөн шалгалтын код оруулж шалгалтанд ороорой</p>
                    </div>
                    <div>
                      <Label>Шалгалтын код</Label>
                      <Input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Жишээ: ABC123" className="text-center text-lg tracking-widest font-mono" onKeyDown={e => e.key === "Enter" && handleVerifyCode()} />
                    </div>
                    <Button onClick={handleVerifyCode} className="w-full bg-brand-600 hover:bg-brand-700" disabled={loading || !code.trim()}>
                      {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Шалгаж байна...</> : "Шалгалт орох"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Exam History */}
              {(examHistory || []).length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-brand-900 mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5" /> Шалгалтын түүх
                  </h3>
                  <div className="space-y-3">
                    {examHistory.map((h: any) => (
                      <Card key={h.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <p className="font-medium text-brand-900">{h.examTitle || "Шалгалт"}</p>
                              <p className="text-sm text-muted-foreground">{new Date(h.createdAt).toLocaleDateString("mn-MN")}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={h.passed ? "default" : "destructive"} className={h.passed ? "bg-green-100 text-green-800" : ""}>
                                {h.passed ? "Тэнсэв" : "Амжилтгүй"}
                              </Badge>
                              <span className="text-lg font-bold">{h.score}/{h.total}</span>
                              <a href={`/api/exam/export/${h.id}`} target="_blank" rel="noopener">
                                <Button size="sm" variant="outline"><Download className="w-4 h-4" /></Button>
                              </a>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Exam Info */}
          {state === "exam-info" && examInfo && (
            <motion.div key="exam-info" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card className="shadow-xl">
                <CardHeader><CardTitle className="text-xl text-brand-900">{examInfo.title}</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-brand-50 rounded-xl p-4 text-center">
                      <Shield className="w-6 h-6 text-brand-600 mx-auto mb-2" /><p className="text-2xl font-bold text-brand-900">{examInfo.questionCount}</p><p className="text-sm text-muted-foreground">Асуулт</p>
                    </div>
                    <div className="bg-brand-50 rounded-xl p-4 text-center">
                      <Clock className="w-6 h-6 text-brand-600 mx-auto mb-2" /><p className="text-2xl font-bold text-brand-900">{examInfo.duration}</p><p className="text-sm text-muted-foreground">Минут</p>
                    </div>
                  </div>
                  {!user && <div className="bg-amber-50 border border-amber-200 rounded-xl p-4"><p className="text-amber-800 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" /> Шалгалт өгөхийн тулд нэвтрэх шаардлагатай.</p></div>}
                  {user && <div className="bg-amber-50 border border-amber-200 rounded-xl p-4"><p className="text-amber-800 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" /> Шалгалт эхлэхдээ цаг хязгаар идэвхжинэ. Бэлэн болсон үедээ "Эхлэх" товч дээр дарна уу.</p></div>}
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={resetExam} className="flex-1"><ArrowLeft className="w-4 h-4 mr-2" /> Буцах</Button>
                    <Button onClick={handleStartExam} className="flex-1 bg-brand-600 hover:bg-brand-700" disabled={loading || !user}>
                      {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Ачааллаж байна...</> : <>Шалгалт эхлэх <ChevronRight className="w-4 h-4 ml-2" /></>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Taking Exam */}
          {state === "taking" && (
            <motion.div key="taking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="shadow-xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-brand-900">{examInfo?.title}</h2>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-sm bg-brand-50 text-brand-700 border-brand-200"><Clock className="w-4 h-4 mr-1" />{formatTime(elapsedTime)}</Badge>
                      <Badge variant={timeLeft < 300 ? "destructive" : "secondary"} className="text-sm"><Clock className="w-4 h-4 mr-1" />{formatTime(timeLeft)}</Badge>
                      <span className="text-sm text-muted-foreground">Хуудас {currentPage}/{totalPages}</span>
                    </div>
                  </div>
                  <Progress value={(answeredCount / (questions || []).length) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Хариулсан: {answeredCount}/{(questions || []).length}</p>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-16"><Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" /><p className="text-muted-foreground">Асуултууд ачааллаж байна...</p></div>
                  ) : (
                    <div className="space-y-6">
                      {(currentQuestions || []).map((q, idx) => {
                        const gi = (currentPage - 1) * QUESTIONS_PER_PAGE + idx;
                        return (
                          <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="bg-gray-50 rounded-xl p-4">
                            <p className="font-medium text-brand-900 mb-3">{gi + 1}. {q.questionText}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {[{ key: 0, label: "A", text: q.optionA }, { key: 1, label: "B", text: q.optionB }, { key: 2, label: "C", text: q.optionC }, { key: 3, label: "D", text: q.optionD }].map((opt) => (
                                <button key={opt.key} onClick={() => setAnswers({ ...answers, [q.id]: opt.key })}
                                  className={`text-left p-3 rounded-lg border-2 transition-all text-sm ${answers[q.id] === opt.key ? "border-brand-500 bg-brand-50 text-brand-900" : "border-gray-200 hover:border-brand-300 hover:bg-brand-50/50"}`}>
                                  <span className="font-bold mr-2">{opt.label})</span>{opt.text}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        );
                      })}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <Button variant="outline" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4 mr-1" /> Өмнөх</Button>
                        <div className="flex gap-1 flex-wrap justify-center">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === currentPage ? "bg-brand-600 text-white" : "bg-gray-100 hover:bg-brand-100 text-gray-700"}`}>{p}</button>
                          ))}
                        </div>
                        {currentPage < totalPages ? (
                          <Button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}>Дараах <ChevronRight className="w-4 h-4 ml-1" /></Button>
                        ) : (
                          <Button onClick={handleSubmitExam} className="bg-brand-600 hover:bg-brand-700" disabled={loading}>{loading ? "Илгээж байна..." : "Дуусгах"}</Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Result */}
          {state === "result" && result && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <Card className="shadow-xl text-center">
                <CardContent className="py-12">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                    className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{ backgroundColor: result.passed ? "#dcfce7" : "#fef2f2" }}>
                    {result.passed ? <CheckCircle className="w-12 h-12 text-green-600" /> : <XCircle className="w-12 h-12 text-red-500" />}
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">{result.passed ? "Тэнсэв!" : "Амжилтгүй"}</h2>
                  <p className="text-muted-foreground mb-2">{result.passed ? "Баяр хүргэж байна! Та шалгалтыг тэнцэв." : "Дахин оролдохыг зөвлөж байна."}</p>
                  <p className="text-sm text-muted-foreground mb-6 flex items-center justify-center gap-1.5"><Clock className="w-4 h-4" /> Цаг зарцуулсан: {formatTimeSpent(result.timeSpent)}</p>
                  <div className="flex justify-center gap-8 mb-8">
                    <div><p className="text-3xl font-bold text-brand-600">{result.score}</p><p className="text-sm text-muted-foreground">Зөв</p></div>
                    <div><p className="text-3xl font-bold text-red-500">{result.total - result.score}</p><p className="text-sm text-muted-foreground">Буруу</p></div>
                    <div><p className="text-3xl font-bold text-brand-900">{result.total}</p><p className="text-sm text-muted-foreground">Нийт</p></div>
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={resetExam}><ArrowLeft className="w-4 h-4 mr-2" /> Буцах</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

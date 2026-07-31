
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
import { useAuthStore } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  Shield, Lock, Clock, ChevronRight, ChevronLeft, CheckCircle, XCircle,
  ArrowLeft, Loader2, Plus, Trash2, Copy, Download, Eye, AlertTriangle,
} from "lucide-react";

interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

type ExamState = "enter-code" | "exam-info" | "taking" | "result";

const QUESTIONS_PER_PAGE = 10;

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
  const [result, setResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [examHistory, setExamHistory] = useState<any[]>([]);
  const handleSubmitRef = useRef<() => void>(() => {});

  // Admin state
  const [examTitle, setExamTitle] = useState("");
  const [examDuration, setExamDuration] = useState("30");
  const [adminQuestions, setAdminQuestions] = useState<{ question: string; optionA: string; optionB: string; optionC: string; optionD: string; correct: string }[]>([
    { question: "", optionA: "", optionB: "", optionC: "", optionD: "", correct: "0" },
  ]);
  const [createdCode, setCreatedCode] = useState("");
  const [creating, setCreating] = useState(false);

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const currentQuestions = questions.slice((currentPage - 1) * QUESTIONS_PER_PAGE, currentPage * QUESTIONS_PER_PAGE);

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

  // Load exam history for logged-in users
  useEffect(() => {
    if (token) {
      fetch("/api/exam/history", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => setExamHistory(d.history || []))
        .catch(() => {});
    }
  }, [token, state]);

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
      setQuestions(data.questions);
      setTimeLeft((data.questions.length > 0 ? examInfo.duration : 30) * 60);
      setTimerActive(true);
      setState("taking");
    } catch { toast.error("Асуулт ачааллахад алдаа"); }
    finally { setLoading(false); }
  };

  const handleSubmitExam = useCallback(async () => {
    if (!examInfo || !token || questions.length === 0) return;
    setTimerActive(false); setLoading(true);
    try {
      const answerArray = questions.map((q) => answers[q.id] ?? -1);
      const res = await fetch("/api/exam", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: "submit", examId: examInfo.id, answers: answerArray }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setResult({ score: data.score, total: data.total, passed: data.passed });
      setState("result");
      // Refresh history
      fetch("/api/exam/history", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setExamHistory(d.history || [])).catch(() => {});
    } catch { toast.error("Алдаа"); }
    finally { setLoading(false); }
  }, [examInfo, token, questions, answers]);

  handleSubmitRef.current = handleSubmitExam;

  const resetExam = () => { setState("enter-code"); setCode(""); setExamInfo(null); setQuestions([]); setAnswers({}); setCurrentPage(1); setResult(null); setTimeLeft(0); setTimerActive(false); };

  const formatTime = (s: number) => { const m = Math.floor(s / 60); return `${m.toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`; };
  const answeredCount = Object.keys(answers).length;

  // Admin: Add question
  const addQuestion = () => setAdminQuestions([...adminQuestions, { question: "", optionA: "", optionB: "", optionC: "", optionD: "", correct: "0" }]);
  const removeQuestion = (i: number) => { if (adminQuestions.length > 1) setAdminQuestions(adminQuestions.filter((_, idx) => idx !== i)); };
  const updateQ = (i: number, field: string, val: string) => { const nq = [...adminQuestions]; nq[i] = { ...nq[i], [field]: val }; setAdminQuestions(nq); };

  // Admin: Create exam
  const handleCreateExam = async () => {
    if (!examTitle.trim()) { toast.error("Шалгалтын нэр оруулна уу"); return; }
    const valid = adminQuestions.filter(q => q.question.trim() && q.optionA.trim() && q.optionB.trim() && q.optionC.trim() && q.optionD.trim());
    if (valid.length < 1) { toast.error("Дор хаяж 1 асуулт оруулна уу"); return; }
    setCreating(true);
    try {
      const body = { title: examTitle, duration: parseInt(examDuration) || 30, questions: valid.map(q => ({ ...q, correct: parseInt(q.correct) })) };
      const res = await fetch("/api/admin/exams", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Алдаа"); return; }
      setCreatedCode(data.exam.code);
      toast.success(`Шалгалт үүссэн! Код: ${data.exam.code}`);
      setExamTitle(""); setExamDuration("30"); setAdminQuestions([{ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correct: "0" }]);
    } catch { toast.error("Алдаа"); }
    finally { setCreating(false); }
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

      <div className="max-w-4xl mx-auto px-4 -mt-8 pb-12">
        {/* ─── Admin: Create Exam Section ─── */}
        {isAdmin && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="shadow-xl border-brand-200">
              <CardHeader className="bg-brand-50 rounded-t-xl">
                <CardTitle className="text-xl text-brand-900 flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Админ: Шалгалт үүсгэх
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Шалгалтын нэр</Label>
                    <Input value={examTitle} onChange={e => setExamTitle(e.target.value)} placeholder="Жишээ: ХАБЭА үндсэн шалгалт" />
                  </div>
                  <div>
                    <Label>Хугацаа (минут)</Label>
                    <Input type="number" value={examDuration} onChange={e => setExamDuration(e.target.value)} placeholder="30" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Асуултууд ({adminQuestions.length})</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addQuestion}><Plus className="w-4 h-4 mr-1" /> Асуулт нэмэх</Button>
                  </div>

                  {adminQuestions.map((q, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3 border">
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

                <div className="flex gap-3 pt-2">
                  <Button onClick={handleCreateExam} disabled={creating || !examTitle.trim()} className="flex-1 bg-brand-600 hover:bg-brand-700">
                    {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Үүсгэж байна...</> : <><Plus className="w-4 h-4 mr-2" /> Шалгалт үүсгэх</>}
                  </Button>
                </div>

                {createdCode && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-green-800 font-medium text-center">
                      Шалгалт үүслээ! Код: <span className="text-xl font-bold tracking-widest">{createdCode}</span>
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
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
              {examHistory.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-brand-900 mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5" /> Шалгалтын түүх
                  </h3>
                  <div className="space-y-3">
                    {examHistory.map((h: any) => (
                      <Card key={h.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
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
                  {!user && <div className="bg-amber-50 border border-amber-200 rounded-xl p-4"><p className="text-amber-800 text-sm">⚠️ Шалгалт өгөхийн тулд нэвтрэх шаардлагатай.</p></div>}
                  {user && <div className="bg-amber-50 border border-amber-200 rounded-xl p-4"><p className="text-amber-800 text-sm">⚠️ Шалгалт эхлэхдээ цаг хязгаар идэвхжинэ. Бэлэн болсон үедээ "Эхлэх" товч дээр дарна уу.</p></div>}
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
                      <Badge variant={timeLeft < 300 ? "destructive" : "secondary"} className="text-sm"><Clock className="w-4 h-4 mr-1" />{formatTime(timeLeft)}</Badge>
                      <span className="text-sm text-muted-foreground">Хуудас {currentPage}/{totalPages}</span>
                    </div>
                  </div>
                  <Progress value={(answeredCount / questions.length) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Хариулсан: {answeredCount}/{questions.length}</p>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-16"><Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" /><p className="text-muted-foreground">Асуултууд ачааллаж байна...</p></div>
                  ) : (
                    <div className="space-y-6">
                      {currentQuestions.map((q, idx) => {
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
                  <p className="text-muted-foreground mb-6">{result.passed ? "Баяр хүргэж байна! Та шалгалтыг тэнцэв." : "Дахин оролдохыг зөвлөж байна."}</p>
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

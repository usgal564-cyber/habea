
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  Shield,
  Lock,
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
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
  const [state, setState] = useState<ExamState>("enter-code");
  const [code, setCode] = useState("");
  const [examInfo, setExamInfo] = useState<{ id: string; title: string; timeLimit: number; questionCount: number } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const handleSubmitRef = useRef<() => void>(() => {});

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const currentQuestions = questions.slice(
    (currentPage - 1) * QUESTIONS_PER_PAGE,
    currentPage * QUESTIONS_PER_PAGE
  );

  // Timer effect
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          handleSubmitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      toast.error("Код оруулна уу");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      setExamInfo(data.exam);
      setState("exam-info");
    } catch {
      toast.error("Холболтын алдаа");
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async () => {
    if (!examInfo || !token) {
      if (!token) {
        toast.error("Шалгалт өгөхийн тулд нэвтрэх шаардлагатай");
      }
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/exam?examId=${examInfo.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        setState("enter-code");
        return;
      }
      setQuestions(data.questions);
      setTimeLeft((data.timeLimit || 30) * 60);
      setTimerActive(true);
      setState("taking");
    } catch {
      toast.error("Асуулт ачааллахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExam = useCallback(async () => {
    if (!examInfo || !token || questions.length === 0) return;
    setTimerActive(false);
    setLoading(true);
    try {
      const answerArray = questions.map((q) => answers[q.id] ?? -1);
      const res = await fetch("/api/exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "submit",
          examId: examInfo.id,
          answers: answerArray,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      setResult({ score: data.score, total: data.total, passed: data.passed });
      setState("result");
    } catch {
      toast.error("Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }, [examInfo, token, questions, answers]);

  // Keep ref in sync
  handleSubmitRef.current = handleSubmitExam;

  const resetExam = () => {
    setState("enter-code");
    setCode("");
    setExamInfo(null);
    setQuestions([]);
    setAnswers({});
    setCurrentPage(1);
    setResult(null);
    setTimeLeft(0);
    setTimerActive(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;

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
            <p className="text-brand-200 text-lg max-w-2xl mx-auto">
              Админ өгсөн кодоор шалгалтанд орох. Шалгалт идэвхтэй үед л орох боломжтой.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <AnimatePresence mode="wait">
          {/* Enter Code */}
          {state === "enter-code" && (
            <motion.div
              key="enter-code"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
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
                      <p className="text-muted-foreground text-sm">
                        Админ тань өгсөн шалгалтын код оруулж шалгалтанд ороорой
                      </p>
                    </div>
                    <div>
                      <Label>Шалгалтын код</Label>
                      <Input
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="Жишээ: ABC123"
                        className="text-center text-lg tracking-widest font-mono"
                        onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
                      />
                    </div>
                    <Button
                      onClick={handleVerifyCode}
                      className="w-full bg-brand-600 hover:bg-brand-700"
                      disabled={loading || !code.trim()}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Шалгаж байна...
                        </>
                      ) : (
                        "Шалгалт орох"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Exam Info */}
          {state === "exam-info" && examInfo && (
            <motion.div
              key="exam-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-brand-900">{examInfo.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-brand-50 rounded-xl p-4 text-center">
                      <Shield className="w-6 h-6 text-brand-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-brand-900">{examInfo.questionCount}</p>
                      <p className="text-sm text-muted-foreground">Асуулт</p>
                    </div>
                    <div className="bg-brand-50 rounded-xl p-4 text-center">
                      <Clock className="w-6 h-6 text-brand-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-brand-900">{examInfo.timeLimit}</p>
                      <p className="text-sm text-muted-foreground">Минут</p>
                    </div>
                  </div>

                  {!user && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-amber-800 text-sm">
                        ⚠️ Шалгалт өгөхийн тулд нэвтрэх шаардлагатай. Дээрх цэсээс "Нэвтрэх" товч дээр дарна уу.
                      </p>
                    </div>
                  )}

                  {user && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-amber-800 text-sm">
                        ⚠️ Шалгалт эхлэхдээ цаг хязгаар идэвхжинэ. Бэлэн болсон үедээ &quot;Эхлэх&quot; товч дээр дарна уу.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={resetExam} className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Буцах
                    </Button>
                    <Button
                      onClick={handleStartExam}
                      className="flex-1 bg-brand-600 hover:bg-brand-700"
                      disabled={loading || !user}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Ачааллаж байна...
                        </>
                      ) : (
                        <>
                          Шалгалт эхлэх <ChevronRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Taking Exam */}
          {state === "taking" && (
            <motion.div
              key="taking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="shadow-xl">
                <CardHeader className="pb-2">
                  {/* Timer + Progress */}
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-brand-900">{examInfo?.title}</h2>
                    <div className="flex items-center gap-3">
                      <Badge variant={timeLeft < 300 ? "destructive" : "secondary"} className="text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTime(timeLeft)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Хуудас {currentPage} / {totalPages}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={(answeredCount / questions.length) * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Хариулсан: {answeredCount} / {questions.length}
                  </p>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-16">
                      <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
                      <p className="text-muted-foreground">Асуултууд ачааллаж байна...</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {currentQuestions.map((q, idx) => {
                        const globalIdx = (currentPage - 1) * QUESTIONS_PER_PAGE + idx;
                        return (
                          <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="bg-gray-50 rounded-xl p-4"
                          >
                            <p className="font-medium text-brand-900 mb-3">
                              {globalIdx + 1}. {q.questionText}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {[
                                { key: 0, label: "A", text: q.optionA },
                                { key: 1, label: "B", text: q.optionB },
                                { key: 2, label: "C", text: q.optionC },
                                { key: 3, label: "D", text: q.optionD },
                              ].map((opt) => (
                                <button
                                  key={opt.key}
                                  onClick={() =>
                                    setAnswers({ ...answers, [q.id]: opt.key })
                                  }
                                  className={`text-left p-3 rounded-lg border-2 transition-all text-sm ${
                                    answers[q.id] === opt.key
                                      ? "border-brand-500 bg-brand-50 text-brand-900"
                                      : "border-gray-200 hover:border-brand-300 hover:bg-brand-50/50"
                                  }`}
                                >
                                  <span className="font-bold mr-2">{opt.label})</span>
                                  {opt.text}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        );
                      })}

                      {/* Page Navigation */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" /> Өмнөх
                        </Button>
                        <div className="flex gap-1 flex-wrap justify-center">
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((p) => (
                            <button
                              key={p}
                              onClick={() => setCurrentPage(p)}
                              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                p === currentPage
                                  ? "bg-brand-600 text-white"
                                  : "bg-gray-100 hover:bg-brand-100 text-gray-700"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                        {currentPage < totalPages ? (
                          <Button
                            onClick={() =>
                              setCurrentPage(Math.min(totalPages, currentPage + 1))
                            }
                          >
                            Дараах <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        ) : (
                          <Button
                            onClick={handleSubmitExam}
                            className="bg-brand-600 hover:bg-brand-700"
                            disabled={loading}
                          >
                            {loading ? "Илгээж байна..." : "Дуусгах"}
                          </Button>
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
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="shadow-xl text-center">
                <CardContent className="py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{
                      backgroundColor: result.passed ? "#dcfce7" : "#fef2f2",
                    }}
                  >
                    {result.passed ? (
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    ) : (
                      <XCircle className="w-12 h-12 text-red-500" />
                    )}
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">
                    {result.passed ? "Тэнсэв!" : "Амжилтгүй"}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {result.passed
                      ? "Баяр хүргэж байна! Та шалгалтыг тэнцэв."
                      : "Дахин оролдохыг зөвлөж байна."}
                  </p>
                  <div className="flex justify-center gap-8 mb-8">
                    <div>
                      <p className="text-3xl font-bold text-brand-600">
                        {result.score}
                      </p>
                      <p className="text-sm text-muted-foreground">Зөв</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-red-500">
                        {result.total - result.score}
                      </p>
                      <p className="text-sm text-muted-foreground">Буруу</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-brand-900">
                        {result.total}
                      </p>
                      <p className="text-sm text-muted-foreground">Нийт</p>
                    </div>
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={resetExam}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Буцах
                    </Button>
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

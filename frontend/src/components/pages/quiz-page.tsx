
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ListChecks,
  Loader2,
  HelpCircle,
  Trophy,
  ArrowLeft,
  Lock,
  CreditCard,
  ShieldCheck,
  Wallet,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/* ─── Types ─────────────────────────────────────────────── */

type QuizListItem = {
  id: string;
  title: string;
  description: string;
  slug: string;
  questionCount: number;
  price: number;
};

type Question = {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  questionOrder: number;
};

type QuizResult = {
  attemptId: string;
  score: number;
  total: number;
  passed: boolean;
};

/* ─── Constants ─────────────────────────────────────────── */

const QUESTIONS_PER_PAGE = 20;
const QUIZ_PRICE = 5000; // ₮ per quiz

/* ─── Animation Variants ────────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

/* ─── Quiz Card Skeleton ────────────────────────────────── */

function QuizCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="mt-2 h-4 w-full" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-9 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Step 1: Quiz Selection ────────────────────────────── */

function QuizSelection({ onSelect }: { onSelect: (quiz: QuizListItem) => void }) {
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token } = useAuthStore();

  // Admin states
  const isAdmin = user && (user.role === "ADMIN" || user.role === "MANAGER" || user.role === "TEACHER");
  const [showAdminCreate, setShowAdminCreate] = useState(false);
  const [adminTitle, setAdminTitle] = useState("");
  const [adminDesc, setAdminDesc] = useState("");
  const [adminQuestions, setAdminQuestions] = useState<{ question: string; optionA: string; optionB: string; optionC: string; optionD: string; correct: string }[]>([
    { question: "", optionA: "", optionB: "", optionC: "", optionD: "", correct: "0" },
  ]);
  const [adminCreating, setAdminCreating] = useState(false);

  const refreshQuizzes = useCallback(() => {
    fetch("/api/quiz")
      .then(r => r.json())
      .then(d => { if (d.quizzes) setQuizzes(d.quizzes.map((q: QuizListItem) => ({ ...q, price: QUIZ_PRICE }))); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const res = await fetch("/api/quiz");
        const data = await res.json();
        if (data.quizzes && data.quizzes.length > 0) {
          setQuizzes(data.quizzes.map((q: QuizListItem) => ({ ...q, price: QUIZ_PRICE })));
        }
      } catch {
        toast.error("Алдаа", { description: "Сорилуудыг ачааллахад алдаа гарлаа." });
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuizzes();
  }, []);

  const handleStartQuiz = (quiz: QuizListItem) => {
    if (!user || !token) {
      toast.error("Нэвтрэх шаардлагатай", {
        description: "Сорил өгөхийн тулд нэвтэрнө үү.",
      });
      return;
    }
    onSelect(quiz);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
          <Brain className="size-4" />
          Мэдлэг сорих
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
          Сорилууд
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          ХАБЭА-ын бүх чиглэлээр мэдлэг сорих сорилууд. Төлбөр төлсний дараа сорил өгөх боломжтой.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 text-sm text-amber-800">
          <CreditCard className="size-4" />
          Сорил бүрд: {QUIZ_PRICE.toLocaleString()}₮
        </div>
      </div>

      {/* Admin: Create Quiz Section */}
      {isAdmin && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card className="border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50 rounded-t-xl">
              <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Админ: Шинэ сорил үүсгэх
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {!showAdminCreate ? (
                <Button variant="outline" onClick={() => setShowAdminCreate(true)} className="w-full border-dashed border-2 border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400">
                  <Plus className="w-4 h-4 mr-2" /> Сорил нэмэх
                </Button>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-amber-900">Сорилын мэдээлэл</h3>
                    <Button size="sm" variant="ghost" onClick={() => setShowAdminCreate(false)} className="text-muted-foreground"><XCircle className="w-4 h-4" /></Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Сорилын нэр</label>
                      <Input value={adminTitle} onChange={e => setAdminTitle(e.target.value)} placeholder="Жишээ: Гал түймэрээс сэргийлэх" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Тайлбар</label>
                      <Input value={adminDesc} onChange={e => setAdminDesc(e.target.value)} placeholder="Сорилын товч тайлбар" />
                    </div>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1 mb-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-700">Асуултууд ({adminQuestions.length})</label>
                      <Button type="button" size="sm" variant="outline" onClick={() => setAdminQuestions([...adminQuestions, { question: "", optionA: "", optionB: "", optionC: "", optionD: "", correct: "0" }])}><Plus className="w-4 h-4 mr-1" /> Асуулт нэмэх</Button>
                    </div>
                    {adminQuestions.map((q, i) => (
                      <div key={i} className="bg-white rounded-xl p-4 space-y-3 border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-amber-700">Асуулт {i + 1}</span>
                          <Button type="button" size="sm" variant="ghost" onClick={() => { if (adminQuestions.length > 1) setAdminQuestions(adminQuestions.filter((_, idx) => idx !== i)); }} className="text-red-500 hover:text-red-700">
                            <RotateCcw className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <Input value={q.question} onChange={e => { const nq = [...adminQuestions]; nq[i] = { ...nq[i], question: e.target.value }; setAdminQuestions(nq); }} placeholder="Асуултын текст" />
                        <div className="grid grid-cols-2 gap-2">
                          <Input value={q.optionA} onChange={e => { const nq = [...adminQuestions]; nq[i] = { ...nq[i], optionA: e.target.value }; setAdminQuestions(nq); }} placeholder="A) Хариулт" />
                          <Input value={q.optionB} onChange={e => { const nq = [...adminQuestions]; nq[i] = { ...nq[i], optionB: e.target.value }; setAdminQuestions(nq); }} placeholder="B) Хариулт" />
                          <Input value={q.optionC} onChange={e => { const nq = [...adminQuestions]; nq[i] = { ...nq[i], optionC: e.target.value }; setAdminQuestions(nq); }} placeholder="C) Хариулт" />
                          <Input value={q.optionD} onChange={e => { const nq = [...adminQuestions]; nq[i] = { ...nq[i], optionD: e.target.value }; setAdminQuestions(nq); }} placeholder="D) Хариулт" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Зөв хариулт:</span>
                          <select value={q.correct} onChange={e => { const nq = [...adminQuestions]; nq[i] = { ...nq[i], correct: e.target.value }; setAdminQuestions(nq); }} className="border rounded-lg px-3 py-1.5 text-sm">
                            <option value="0">A</option>
                            <option value="1">B</option>
                            <option value="2">C</option>
                            <option value="3">D</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button onClick={async () => {
                    if (!adminTitle.trim()) { toast.error("Сорилын нэр оруулна уу"); return; }
                    const valid = adminQuestions.filter(q => q.question.trim() && q.optionA.trim() && q.optionB.trim() && q.optionC.trim() && q.optionD.trim());
                    if (valid.length < 1) { toast.error("Дор хаяж 1 асуулт оруулна уу"); return; }
                    setAdminCreating(true);
                    try {
                      const res = await fetch("/api/admin/quizzes", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({
                          title: adminTitle,
                          description: adminDesc,
                          category: "",
                          questions: valid.map(q => ({ ...q, correct: parseInt(q.correct) })),
                        }),
                      });
                      const data = await res.json();
                      if (!res.ok) { toast.error(data.error || "Алдаа"); return; }
                      toast.success(`Сорил үүссэн: ${adminTitle}`);
                      setAdminTitle(""); setAdminDesc("");
                      setAdminQuestions([{ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correct: "0" }]);
                      setShowAdminCreate(false);
                      refreshQuizzes();
                    } catch { toast.error("Алдаа"); }
                    finally { setAdminCreating(false); }
                  }} disabled={adminCreating || !adminTitle.trim()} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                    {adminCreating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Үүсгэж байна...</> : <><Plus className="w-4 h-4 mr-2" /> Сорил үүсгэх</>}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quiz Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <QuizCardSkeleton key={i} />
          ))}
        </div>
      ) : quizzes.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {quizzes.map((quiz) => (
            <motion.div key={quiz.id} variants={itemVariants}>
              <Card className="group relative h-full overflow-hidden border-brand-100 bg-white transition-all duration-300 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-100/50">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 to-brand-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight text-brand-900 transition-colors group-hover:text-brand-700">
                        {quiz.title}
                      </CardTitle>
                      <CardDescription className="mt-1.5 line-clamp-2">
                        {quiz.description}
                      </CardDescription>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
                      <HelpCircle className="size-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-brand-50 text-brand-700 hover:bg-brand-100"
                      >
                        <ListChecks className="mr-1 size-3" />
                        {quiz.questionCount} асуулт
                      </Badge>
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                        {quiz.price.toLocaleString()}₮
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      className="bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500"
                      onClick={() => handleStartQuiz(quiz)}
                    >
                      <Lock className="size-4 mr-1" />
                      Төлбөр төлөх
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
            <Brain className="size-10 text-brand-300" />
          </div>
          <h3 className="text-xl font-semibold text-brand-900">Сорил олдсонгүй</h3>
          <p className="mt-2 text-muted-foreground">
            Одоогоор идэвхтэй сорил байхгүй байна. Дараа дахин шалгана уу.
          </p>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Step 2: Payment Dialog ──────────────────────────────── */

function PaymentGate({
  quiz,
  onPaid,
  onBack,
}: {
  quiz: QuizListItem;
  onPaid: () => void;
  onBack: () => void;
}) {
  const { token } = useAuthStore();
  const [paying, setPaying] = useState(false);

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await fetch("/api/quiz/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quizId: quiz.id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Төлбөр амжилттай");
        onPaid();
      } else {
        toast.error("Төлбөр амжилтгүй", { description: data.error || "Дахин оролдоно уу" });
      }
    } catch {
      toast.error("Холболтын алдаа");
    } finally {
      setPaying(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onBack()}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-brand-900 font-bold text-xl flex items-center gap-2">
            <Wallet className="w-5 h-5 text-brand-600" />
            Төлбөр төлөх
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Quiz Info */}
          <div className="bg-brand-50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Сорил</p>
            <p className="text-lg font-bold text-brand-900">{quiz.title}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <ListChecks className="w-4 h-4" />
                {quiz.questionCount} асуулт
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between bg-amber-50 rounded-xl p-4 border border-amber-200">
            <span className="text-sm font-medium text-amber-800">Төлбөрийн дүн:</span>
            <span className="text-2xl font-bold text-amber-900">{quiz.price.toLocaleString()}₮</span>
          </div>

          {/* Payment Info */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-muted-foreground space-y-2">
            <p className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              Төлбөр амжилттай хийгдсэний дараа сорил эхлүүлнэ
            </p>
            <p className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-600" />
              70% бөгөөд тэнцсэн тохиолдод сертификат олгогдоно
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1" disabled={paying}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Буцах
            </Button>
            <Button
              onClick={handlePay}
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white"
              disabled={paying}
            >
              {paying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Төлбөр хийгдэж байна...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-1" />
                  {quiz.price.toLocaleString()}₮ төлөх
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Step 3: Quiz Taking ───────────────────────────────── */

function QuizTaking({
  quiz,
  onFinish,
  onBack,
}: {
  quiz: QuizListItem;
  onFinish: (answers: number[]) => void;
  onBack: () => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQuestions = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/quiz?slug=${quiz.slug}&page=${page}&limit=${QUESTIONS_PER_PAGE}`
        );
        const data = await res.json();
        if (data.quiz && data.questions) {
          setQuestions(data.questions);
          setTotalPages(data.pagination.totalPages);
        } else {
          toast.error("Алдаа", {
            description: "Асуултуудыг ачааллахад алдаа гарлаа.",
          });
        }
      } catch {
        toast.error("Холболтын алдаа");
      } finally {
        setIsLoading(false);
      }
    },
    [quiz.slug]
  );

  useEffect(() => {
    fetchQuestions(1);
  }, [fetchQuestions]);

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchQuestions(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const allAnswers: number[] = [];
      for (let p = 1; p <= totalPages; p++) {
        const res = await fetch(
          `/api/quiz?slug=${quiz.slug}&page=${p}&limit=${QUESTIONS_PER_PAGE}`
        );
        const data = await res.json();
        if (data.questions) {
          for (const q of data.questions) {
            allAnswers.push(answers[q.id] ?? -1);
          }
        }
      }
      onFinish(allAnswers);
    } catch {
      toast.error("Алдаа", {
        description: "Хариултуудыг илгээхэд алдаа гарлаа.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-700 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Буцах
        </button>
        <h2 className="text-lg font-bold text-brand-900">{quiz.title}</h2>
      </div>

      <Card className="border-brand-100">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Хуудас {currentPage} / {totalPages}
            </span>
            <span className="text-muted-foreground">
              Хариулсан: {answeredCount}
            </span>
          </div>
          <Progress value={(answeredCount / (quiz.questionCount || 20)) * 100} className="h-2" />
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="size-8 animate-spin text-brand-500" />
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((q, idx) => {
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
                          onClick={() => handleSelectAnswer(q.id, opt.key)}
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

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Өмнөх
                </Button>
                <div className="flex gap-1 flex-wrap justify-center">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
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
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  >
                    Дараах <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleFinish}
                    className="bg-brand-600 hover:bg-brand-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Илгээж байна...
                      </>
                    ) : (
                      "Дуусгах"
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Step 4: Results ─────────────────────────────────── */

function QuizResults({
  quiz,
  result,
  onRetry,
  onBackToList,
}: {
  quiz: QuizListItem;
  result: QuizResult;
  onRetry: () => void;
  onBackToList: () => void;
}) {
  const percentage = Math.round((result.score / result.total) * 100);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <Card className="border-brand-100 shadow-lg">
        <CardContent className="py-12 text-center">
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
              <Trophy className="w-12 h-12 text-green-600" />
            ) : (
              <XCircle className="w-12 h-12 text-red-500" />
            )}
          </motion.div>

          <h2 className="text-2xl font-bold mb-2 text-brand-900">
            {result.passed ? "Баяр хүргэе! Тэнцэв" : "Амжилтгүй"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {quiz.title}
          </p>

          <div className="flex justify-center gap-8 mb-8">
            <div>
              <p className="text-3xl font-bold text-brand-600">{result.score}</p>
              <p className="text-sm text-muted-foreground">Зөв</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-500">{result.total - result.score}</p>
              <p className="text-sm text-muted-foreground">Буруу</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-brand-900">{percentage}%</p>
              <p className="text-sm text-muted-foreground">Үзүүлэлт</p>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={onBackToList}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Буцах
            </Button>
            <Button onClick={onRetry} className="bg-brand-600 hover:bg-brand-700">
              <RotateCcw className="w-4 h-4 mr-2" />
              Дахин оролдох
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Main Component ──────────────────────────────────────── */

type Step = "selection" | "payment" | "taking" | "results";

export default function QuizPage() {
  const [step, setStep] = useState<Step>("selection");
  const [selectedQuiz, setSelectedQuiz] = useState<QuizListItem | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectQuiz = useCallback((quiz: QuizListItem) => {
    setSelectedQuiz(quiz);
    setResult(null);
    setStep("payment");
  }, []);

  const handlePaid = useCallback(() => {
    setStep("taking");
  }, []);

  const handleFinish = useCallback(
    async (answers: number[]) => {
      if (!selectedQuiz) return;

      setIsSubmitting(true);
      try {
        const res = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quizId: selectedQuiz.id,
            answers,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setResult({
            attemptId: data.attemptId,
            score: data.score,
            total: data.total,
            passed: data.passed,
          });
          setStep("results");

          if (data.passed) {
            toast.success("Баяр хүргэе!", {
              description: `Та ${data.score}/${data.total} оноо авч тэнцлээ!`,
            });
          } else {
            toast.error("Тэнцээгүй", {
              description: `Та ${data.score}/${data.total} оноо авсан байна. 70% шаардлагатай.`,
            });
          }
        } else {
          toast.error("Алдаа", {
            description: data.error || "Хариултуудыг илгээхэд алдаа гарлаа.",
          });
        }
      } catch {
        toast.error("Холболтын алдаа");
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedQuiz]
  );

  const handleRetry = useCallback(() => {
    setResult(null);
    setStep("payment");
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedQuiz(null);
    setResult(null);
    setStep("selection");
  }, []);

  return (
    <section className="w-full">
      {step === "selection" && <QuizSelection onSelect={handleSelectQuiz} />}

      {step === "payment" && selectedQuiz && (
        <PaymentGate quiz={selectedQuiz} onPaid={handlePaid} onBack={handleBackToList} />
      )}

      {step === "taking" && selectedQuiz && (
        <QuizTaking
          quiz={selectedQuiz}
          onFinish={handleFinish}
          onBack={handleBackToList}
        />
      )}

      {step === "results" && selectedQuiz && result && (
        <QuizResults
          quiz={selectedQuiz}
          result={result}
          onRetry={handleRetry}
          onBackToList={handleBackToList}
        />
      )}

      {/* Submit overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl">
              <Loader2 className="size-10 animate-spin text-brand-600" />
              <p className="text-lg font-medium text-brand-900">
                Хариултуудыг шалгаж байна...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

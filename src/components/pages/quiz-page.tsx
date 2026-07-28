"use client";

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
  Clock,
  Target,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

/* ─── Types ─────────────────────────────────────────────── */

type QuizListItem = {
  id: string;
  title: string;
  description: string;
  slug: string;
  questionCount: number;
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
const OPTION_LABELS = ["A", "B", "C", "D"];
const OPTION_KEYS: ("optionA" | "optionB" | "optionC" | "optionD")[] = [
  "optionA",
  "optionB",
  "optionC",
  "optionD",
];

/* ─── Animation Variants ────────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
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

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const res = await fetch("/api/quiz");
        const data = await res.json();
        if (data.quizzes && data.quizzes.length > 0) {
          setQuizzes(data.quizzes);
        }
      } catch {
        toast.error("Алдаа", { description: "Сорилуудыг ачааллахад алдаа гарлаа." });
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuizzes();
  }, []);

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
          ХАБЭА-ын бүх чиглэлээр мэдлэг сорих сорилууд. Сорилоо сонгоод эхлэнэ үү.
        </p>
      </div>

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
              <Card className="group relative h-full overflow-hidden border-brand-100 bg-white transition-all duration-300 hover:border-brand-300 hover:cursor-pointer hover:shadow-lg hover:shadow-brand-100/50">
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
                    <Badge
                      variant="secondary"
                      className="bg-brand-50 text-brand-700 hover:bg-brand-100"
                    >
                      <ListChecks className="mr-1 size-3" />
                      {quiz.questionCount} асуулт
                    </Badge>
                    <Button
                      size="sm"
                      className="bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500"
                      onClick={() => onSelect(quiz)}
                    >
                      Эхлэх
                      <ChevronRight className="size-4" />
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

/* ─── Step 2: Quiz Taking ───────────────────────────────── */

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

  // Fetch first page
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
      // Fetch all pages to build ordered answer array
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

  const answeredOnPage = questions.filter(
    (q) => answers[q.id] !== undefined
  ).length;
  const progressPercent =
    totalPages > 0
      ? ((currentPage - 1) / totalPages) * 100 +
        (answeredOnPage / (questions.length || 1) / totalPages) * 100
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Top Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-brand-600 hover:bg-brand-50 hover:text-brand-800"
            onClick={onBack}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-brand-900 sm:text-2xl">
              {quiz.title}
            </h2>
            <p className="text-sm text-muted-foreground">{quiz.description}</p>
          </div>
        </div>
        <Badge className="w-fit bg-brand-50 text-brand-700 hover:bg-brand-100">
          <ListChecks className="mr-1 size-3.5" />
          Хуудас {currentPage} / {totalPages}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Хуудасны дэвсгэр: {currentPage} / {totalPages}
          </span>
          <span className="font-medium text-brand-700">
            Энэ хуудас: {answeredOnPage}/{questions.length} хариулсан
          </span>
        </div>
        <Progress
          value={progressPercent}
          className="h-2.5 bg-brand-100"
        />
      </div>

      {/* Questions */}
      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="mb-4 h-5 w-3/4" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-10 w-full" />
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4"
          >
            {questions.map((question, qIdx) => {
              const globalIndex =
                (currentPage - 1) * QUESTIONS_PER_PAGE + qIdx + 1;
              const selectedAnswer = answers[question.id];

              return (
                <motion.div
                  key={question.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="overflow-hidden border-brand-100 bg-white">
                    <CardContent className="p-5 sm:p-6">
                      {/* Question Number & Text */}
                      <div className="mb-4 flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                          {globalIndex}
                        </span>
                        <p className="text-base font-medium leading-relaxed text-foreground sm:text-lg">
                          {question.questionText}
                        </p>
                      </div>

                      {/* Options */}
                      <div className="ml-10 space-y-2.5">
                        {OPTION_KEYS.map((key, optIdx) => {
                          const isSelected = selectedAnswer === optIdx;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() =>
                                handleSelectAnswer(question.id, optIdx)
                              }
                              className={[
                                "flex w-full items-start gap-3 rounded-lg border-2 px-4 py-3 text-left text-sm transition-all duration-200 sm:text-base",
                                isSelected
                                  ? "border-brand-500 bg-brand-50 text-brand-900 shadow-sm ring-1 ring-brand-200"
                                  : "border-transparent bg-muted/50 text-foreground hover:border-brand-200 hover:bg-brand-50/50",
                              ].join(" ")}
                            >
                              <span
                                className={[
                                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                                  isSelected
                                    ? "border-brand-600 bg-brand-600 text-white"
                                    : "border-muted-foreground/30 text-muted-foreground",
                                ].join(" ")}
                              >
                                {OPTION_LABELS[optIdx]}
                              </span>
                              <span className="pt-0.5 leading-relaxed">
                                {question[key]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Page Navigation */}
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        {/* Previous Button */}
        <Button
          variant="outline"
          className="border-brand-200 text-brand-700 hover:bg-brand-50 hover:text-brand-800"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
        >
          <ChevronLeft className="size-4" />
          Өмнөх
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => handlePageChange(page)}
              disabled={isLoading}
              className={[
                "flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-all disabled:opacity-50",
                page === currentPage
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-brand-50 hover:text-brand-700",
              ].join(" ")}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next / Finish Button */}
        {currentPage < totalPages ? (
          <Button
            className="bg-brand-600 text-white hover:bg-brand-700"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={isLoading}
          >
            Дараах
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button
            className="bg-brand-600 text-white hover:bg-brand-700"
            onClick={handleFinish}
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Дуусгах
          </Button>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Step 3: Results ───────────────────────────────────── */

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
  const isPassed = result.passed;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mx-auto max-w-lg"
    >
      <Card className="overflow-hidden border-2 bg-white">
        {/* Top Accent */}
        <div
          className={[
            "h-2",
            isPassed
              ? "bg-gradient-to-r from-brand-500 to-brand-700"
              : "bg-gradient-to-r from-red-400 to-red-600",
          ].join(" ")}
        />

        <CardContent className="p-8 sm:p-10">
          <div className="flex flex-col items-center text-center">
            {/* Icon Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
              className={[
                "mb-6 flex h-24 w-24 items-center justify-center rounded-full",
                isPassed
                  ? "bg-brand-100 text-brand-600"
                  : "bg-red-100 text-red-500",
              ].join(" ")}
            >
              {isPassed ? (
                <Trophy className="size-12" />
              ) : (
                <XCircle className="size-12" />
              )}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={[
                "text-2xl font-bold sm:text-3xl",
                isPassed ? "text-brand-800" : "text-red-700",
              ].join(" ")}
            >
              {isPassed ? "Тэнцлээ!" : "Тэнцээгүй"}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-2 text-muted-foreground"
            >
              {quiz.title}
            </motion.p>

            {/* Score Circle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative my-8 flex h-36 w-36 items-center justify-center"
            >
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke-width="8"
                  className="stroke-brand-100"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke-width="8"
                  stroke-linecap="round"
                  className={isPassed ? "stroke-brand-600" : "stroke-red-500"}
                  stroke-dasharray={`${2 * Math.PI * 52}`}
                  stroke-dashoffset={`${2 * Math.PI * 52 * (1 - percentage / 100)}`}
                  style={{ transition: "stroke-dashoffset 1.5s ease-out 0.8s" }}
                />
              </svg>
              <div className="text-center">
                <span
                  className={[
                    "text-3xl font-bold",
                    isPassed ? "text-brand-700" : "text-red-600",
                  ].join(" ")}
                >
                  {percentage}%
                </span>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="grid w-full grid-cols-3 gap-4"
            >
              <div className="rounded-lg bg-brand-50 p-3">
                <div className="flex items-center justify-center gap-1.5 text-brand-600">
                  <Target className="size-4" />
                  <CheckCircle2 className="size-4" />
                </div>
                <p className="mt-1 text-xl font-bold text-brand-800">
                  {result.score}
                </p>
                <p className="text-xs text-muted-foreground">Зөв</p>
              </div>
              <div className="rounded-lg bg-red-50 p-3">
                <div className="flex items-center justify-center gap-1.5 text-red-500">
                  <XCircle className="size-4" />
                </div>
                <p className="mt-1 text-xl font-bold text-red-700">
                  {result.total - result.score}
                </p>
                <p className="text-xs text-muted-foreground">Буруу</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center justify-center text-muted-foreground">
                  <Clock className="size-4" />
                </div>
                <p className="mt-1 text-xl font-bold text-foreground">
                  {result.total}
                </p>
                <p className="text-xs text-muted-foreground">Нийт</p>
              </div>
            </motion.div>

            {/* Threshold note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4 text-sm text-muted-foreground"
            >
              Тэнсэх хамгийн бага оноо: <span className="font-semibold">70%</span>
            </motion.p>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Button
                variant="outline"
                className="flex-1 border-brand-200 text-brand-700 hover:bg-brand-50 hover:text-brand-800"
                onClick={onBackToList}
              >
                <ListChecks className="size-4" />
                Сорилын жагсаалт
              </Button>
              <Button
                className="flex-1 bg-brand-600 text-white hover:bg-brand-700"
                onClick={onRetry}
              >
                <RotateCcw className="size-4" />
                Дахин оролдох
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Main Component ──────────────────────────────────────── */

type Step = "selection" | "taking" | "results";

export default function QuizPage() {
  const [step, setStep] = useState<Step>("selection");
  const [selectedQuiz, setSelectedQuiz] = useState<QuizListItem | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectQuiz = useCallback((quiz: QuizListItem) => {
    setSelectedQuiz(quiz);
    setResult(null);
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
    setStep("taking");
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedQuiz(null);
    setResult(null);
    setStep("selection");
  }, []);

  return (
    <section className="w-full">
      {step === "selection" && <QuizSelection onSelect={handleSelectQuiz} />}

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

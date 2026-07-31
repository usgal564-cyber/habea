
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Send,
  Star,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  RotateCcw,
  LogIn,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/hooks/use-auth";

interface SurveyQuestion {
  id: string;
  question: string;
  type: "rating" | "yesno" | "text";
  label?: string;
}

const surveyQuestions: SurveyQuestion[] = [
  {
    id: "q1",
    question: "Сургалтын чанарыг та юу гэж үзэж байна?",
    type: "rating",
    label: "Сургалтын чанар",
  },
  {
    id: "q2",
    question: "Сургагчийн мэдлэг, туршлагад сэтгэл ханамжтай байна уу?",
    type: "rating",
    label: "Сургагчийн туршлага",
  },
  {
    id: "q3",
    question: "Сургалтын материалын тухай та юу гэж үзэж байна?",
    type: "rating",
    label: "Сургалтын материал",
  },
  {
    id: "q4",
    question: "Сургалтын цаг хугацаа хангалттай байсан уу?",
    type: "yesno",
    label: "Цаг хугацаа",
  },
  {
    id: "q5",
    question: "Дахин суралцах хүсэлтээ та бий юу?",
    type: "yesno",
    label: "Дахин суралцах",
  },
  {
    id: "q6",
    question: "Манай зөвлөх үйлчилгээний талаар үнэлгээ өгнө үү",
    type: "rating",
    label: "Зөвлөх үйлчилгээ",
  },
  {
    id: "q7",
    question: "Нийтлэг сэтгэгдэл, санал хүсэлтээ бичнэ үү",
    type: "text",
    label: "Сэтгэгдэл",
  },
];

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="hover:scale-125 transition-transform"
        >
          <Star
            className={cn(
              "w-7 h-7 transition-colors",
              star <= value
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300 hover:text-yellow-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function RadioYesNo({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => onChange("yes")}
        className={cn(
          "px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 border",
          value === "yes"
            ? "bg-brand-600 text-white border-brand-600 shadow-md"
            : "bg-white text-brand-700 border-brand-200 hover:bg-brand-50"
        )}
      >
        <ThumbsUp className="w-4 h-4" />
        Тийм
      </button>
      <button
        type="button"
        onClick={() => onChange("no")}
        className={cn(
          "px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 border",
          value === "no"
            ? "bg-red-500 text-white border-red-500 shadow-md"
            : "bg-white text-red-600 border-red-200 hover:bg-red-50"
        )}
      >
        <ThumbsDown className="w-4 h-4" />
        Үгүй
      </button>
    </div>
  );
}

function SimpleBarChart({ responses }: { responses: Record<string, string | number> }) {
  // Only show rating-type questions in the chart
  const ratingQuestions = surveyQuestions.filter((q) => q.type === "rating");
  const maxRating = 5;

  return (
    <div className="space-y-4">
      {ratingQuestions.map((q, i) => {
        const val = (responses[q.id] as number) || 0;
        const percent = (val / maxRating) * 100;
        return (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-foreground">
                {q.label || q.question}
              </span>
              <span className="text-sm font-bold text-brand-600">
                {val}/{maxRating}
              </span>
            </div>
            <div className="h-4 bg-brand-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.1, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        );
      })}
      {/* Average */}
      {(() => {
        const ratingVals = ratingQuestions
          .map((q) => responses[q.id] as number)
          .filter((v) => typeof v === "number" && v > 0);
        const avg = ratingVals.length
          ? ratingVals.reduce((a, b) => a + b, 0) / ratingVals.length
          : 0;
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="mt-6 pt-4 border-t border-brand-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-bold text-foreground">
                Дундаж үнэлгээ
              </span>
              <span className="text-lg font-bold text-brand-600">
                {avg.toFixed(1)}/{maxRating}
              </span>
            </div>
            <div className="h-5 bg-brand-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-600 to-brand-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(avg / maxRating) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
}

export default function SurveyPage() {
  const { user, token } = useAuthStore();
  const [responses, setResponses] = useState<Record<string, string | number>>({});
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [submittedResponses, setSubmittedResponses] = useState<Record<string, string | number>>({});

  // Fetch profile when logged in to auto-fill
  useEffect(() => {
    if (!token) return;
    setProfileLoading(true);
    fetch("/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        const p: UserProfile = data.user;
        const fullName = `${p.lastName || ""} ${p.firstName || ""}`.trim();
        setUserForm({
          name: fullName,
          email: p.email || "",
          phone: p.phone || "",
        });
      })
      .catch(() => {
        // If profile fetch fails, use email from JWT
        if (user?.email) {
          setUserForm((prev) => ({ ...prev, email: user.email }));
        }
      })
      .finally(() => setProfileLoading(false));
  }, [token, user?.email]);

  const setResponse = (questionId: string, value: string | number) => {
    setResponses({ ...responses, [questionId]: value });
  };

  const handleSubmit = async () => {
    if (Object.keys(responses).length < surveyQuestions.length) {
      toast.error("Бүх асуултад хариулт өгнө үү.");
      return;
    }
    if (!userForm.name) {
      toast.error("Нэрээ оруулна уу.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: userForm.name,
          email: userForm.email,
          phone: userForm.phone,
          responses: JSON.stringify(responses),
        }),
      });
      if (res.ok) {
        setSubmittedResponses({ ...responses });
        setIsComplete(true);
        toast.success(
          "Сэтгэл ханамжийн судалгаанд хувь нэмэр оруулсанд баярлалаа!"
        );
      } else {
        toast.error("Алдаа гарлаа. Дахин оролдоно уу.");
      }
    } catch {
      toast.error("Серверийн алдаа гарлаа.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSurvey = () => {
    setResponses({});
    setIsComplete(false);
    setSubmittedResponses({});
  };

  const completedCount = Object.keys(responses).length;
  const totalCount = surveyQuestions.length;
  const progressPercent = (completedCount / totalCount) * 100;

  // Not logged in → show login prompt
  if (!user || !token) {
    return (
      <div className="min-h-screen">
        <section className="relative bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-20 w-80 h-80 bg-brand-400 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-700/50 border border-brand-600/30 mb-6">
                <BarChart3 className="w-4 h-4 text-brand-300" />
                <span className="text-sm font-medium text-brand-200">
                  Сэтгэл ханамж
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Сэтгэл Ханамжийн Судалгаа
              </h1>
              <p className="text-brand-200/80 max-w-2xl mx-auto text-lg">
                Манай үйлчилгээний талаарх таны сэтгэл ханамжийг
                мэдэхийн хүсвэл доорх судалгааг бөглөнө үү
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-20 lg:py-28 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-lg mx-auto text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-brand-100 flex items-center justify-center">
                <LogIn className="w-12 h-12 text-brand-600" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Нэвтрэх шаардлагатай
              </h2>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Судалгаанд хариулахын тулд та нэвтэрч орно уу.
                Нэвтэрсний дараа мэдээлэл автоматаар бөглөгдөнө.
              </p>
              <p className="text-sm text-muted-foreground">
                Дээрх цэсний &quot;Нэвтрэх&quot; товч дээр дарна уу.
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  // Results view
  if (isComplete) {
    return (
      <div className="min-h-screen">
        <section className="relative bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-20 w-80 h-80 bg-brand-400 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-700/50 border border-brand-600/30 mb-6">
                <BarChart3 className="w-4 h-4 text-brand-300" />
                <span className="text-sm font-medium text-brand-200">
                  Сэтгэл ханамж
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Сэтгэл Ханамжийн Судалгаа
              </h1>
            </motion.div>
          </div>
        </section>

        <section className="py-20 lg:py-28 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center mb-10"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-brand-100 flex items-center justify-center">
                  <ThumbsUp className="w-12 h-12 text-brand-600" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Баярлалаа!
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Таны сэтгэл ханамжийн судалгаанд хувь нэмэр
                  оруулсанд бид баярлалаа.
                </p>
              </motion.div>

              {/* Bar Chart Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="border-brand-100 bg-gradient-to-br from-white to-brand-50/30">
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-brand-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">
                          Таны үнэлгээний үр дүн
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Судалгааны дүнг харуулж байна
                        </p>
                      </div>
                    </div>
                    <SimpleBarChart responses={submittedResponses} />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-center mt-8"
              >
                <Button
                  onClick={resetSurvey}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-6 rounded-xl text-base"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Дахин судалгаа өгөх
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Survey form
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-80 h-80 bg-brand-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-brand-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-700/50 border border-brand-600/30 mb-6">
              <BarChart3 className="w-4 h-4 text-brand-300" />
              <span className="text-sm font-medium text-brand-200">
                Сэтгэл ханамж
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Сэтгэл Ханамжийн Судалгаа
            </h1>
            <p className="text-brand-200/80 max-w-2xl mx-auto text-lg">
              Манай үйлчилгээний талаарх таны сэтгэл ханамжийг
              мэдэхийн хүсвэл доорх судалгааг бөглөнө үү
            </p>
          </motion.div>
        </div>
      </section>

      {/* Survey Content */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Questions Column */}
            <div className="lg:col-span-2">
              {/* Progress Bar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
              >
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground font-medium">
                    Хариулсан: {completedCount}/{totalCount}
                  </span>
                  <span className="font-semibold text-brand-600">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <div className="h-3 bg-brand-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              </motion.div>

              {/* Questions */}
              <div className="space-y-4">
                {surveyQuestions.map((q, index) => {
                  const isAnswered = responses[q.id] !== undefined;
                  return (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.05 + index * 0.05,
                      }}
                    >
                      <Card
                        className={cn(
                          "transition-all duration-200",
                          isAnswered
                            ? "border-brand-300 bg-brand-50/30"
                            : "border-brand-100"
                        )}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3 mb-4">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold transition-colors duration-200",
                                isAnswered
                                  ? "bg-brand-500 text-white"
                                  : "bg-brand-100 text-brand-700"
                              )}
                            >
                              {isAnswered ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : (
                                index + 1
                              )}
                            </div>
                            <p className="text-foreground font-medium text-sm leading-relaxed pt-1">
                              {q.question}
                            </p>
                          </div>

                          {/* Rating */}
                          {q.type === "rating" && (
                            <div className="ml-11">
                              <StarRatingInput
                                value={(responses[q.id] as number) || 0}
                                onChange={(val) => setResponse(q.id, val)}
                              />
                            </div>
                          )}

                          {/* Yes/No */}
                          {q.type === "yesno" && (
                            <div className="ml-11">
                              <RadioYesNo
                                value={responses[q.id] as string | undefined}
                                onChange={(val) => setResponse(q.id, val)}
                              />
                            </div>
                          )}

                          {/* Text */}
                          {q.type === "text" && (
                            <div className="ml-11">
                              <Textarea
                                value={(responses[q.id] as string) || ""}
                                onChange={(e) =>
                                  setResponse(q.id, e.target.value)
                                }
                                placeholder="Таны сэтгэгдэл..."
                                rows={3}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* User Info Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:sticky lg:top-24"
              >
                <Card className="border-brand-100 bg-gradient-to-br from-white to-brand-50/30">
                  <CardContent className="p-6">
                    {profileLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <User className="w-4 h-4 text-brand-600" />
                          <h2 className="text-lg font-bold text-foreground">
                            Мэдээллээ шалгана уу
                          </h2>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>
                              Нэр <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              value={userForm.name}
                              onChange={(e) =>
                                setUserForm({
                                  ...userForm,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Таны овог нэр"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Имэйл</Label>
                            <Input
                              type="email"
                              value={userForm.email}
                              onChange={(e) =>
                                setUserForm({
                                  ...userForm,
                                  email: e.target.value,
                                })
                              }
                              placeholder="email@example.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Утас</Label>
                            <Input
                              value={userForm.phone}
                              onChange={(e) =>
                                setUserForm({
                                  ...userForm,
                                  phone: e.target.value,
                                })
                              }
                              placeholder="+976 XXXX XXXX"
                            />
                          </div>

                          <AnimatePresence>
                            {completedCount === totalCount && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-3 rounded-xl bg-brand-50 border border-brand-100"
                              >
                                <p className="text-sm text-brand-700 font-medium text-center">
                                  Бүх асуултад хариулт өгсөн!
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || completedCount < totalCount}
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-6 text-base font-semibold rounded-xl mt-2"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Илгээж байна...
                              </>
                            ) : (
                              <>
                                Илгээх
                                <Send className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </Button>

                          <p className="text-xs text-muted-foreground text-center">
                            {completedCount}/{totalCount} асуултад хариулт өгсөн
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

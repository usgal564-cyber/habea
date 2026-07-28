"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Send,
  Star,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SurveyQuestion {
  id: string;
  question: string;
  type: "rating" | "yesno" | "text";
}

const surveyQuestions: SurveyQuestion[] = [
  {
    id: "q1",
    question: "Сургалтын чанарыг та юу гэж үзэж байна?",
    type: "rating",
  },
  {
    id: "q2",
    question: "Сургагчийн мэдлэг, туршлагад сэтгэл ханамжтай байна уу?",
    type: "rating",
  },
  {
    id: "q3",
    question: "Сургалтын материалын тухай та юу гэж үзэж байна?",
    type: "rating",
  },
  {
    id: "q4",
    question: "Сургалтын цаг хугацаа хангалттай байсан уу?",
    type: "yesno",
  },
  {
    id: "q5",
    question: "Дахин суралцах хүсэлтээ та бий юу?",
    type: "yesno",
  },
  {
    id: "q6",
    question: "Манай зөвлөх үйлчилгээний талаар үнэлгээ өгнө үү",
    type: "rating",
  },
  {
    id: "q7",
    question: "Нийтлэг сэтгэгдэл, санал хүсэлтээ бичнэ үү",
    type: "text",
  },
];

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

export default function SurveyPage() {
  const [responses, setResponses] = useState<
    Record<string, string | number>
  >({});
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userForm,
          responses: JSON.stringify(responses),
        }),
      });
      if (res.ok) {
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
    setUserForm({ name: "", email: "", phone: "", company: "" });
    setIsComplete(false);
  };

  const completedCount = Object.keys(responses).length;
  const totalCount = surveyQuestions.length;
  const progressPercent = (completedCount / totalCount) * 100;

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
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-lg mx-auto text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-brand-100 flex items-center justify-center">
                <ThumbsUp className="w-12 h-12 text-brand-600" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Баярлалаа!
              </h2>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Таны сэтгэл ханамжийн судалгаанд хувь нэмэр
                оруулсанд бид баярлалаа. Таны санал хүсэлтийг
                манай үйлчилгээг сайжруулахад ашиглах болно.
              </p>
              <Button
                onClick={resetSurvey}
                className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-6 rounded-xl text-base"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Дахин судалгаа өгөх
              </Button>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

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
                                onChange={(val) =>
                                  setResponse(q.id, val)
                                }
                              />
                            </div>
                          )}

                          {/* Yes/No */}
                          {q.type === "yesno" && (
                            <div className="ml-11">
                              <RadioYesNo
                                value={responses[q.id] as string | undefined}
                                onChange={(val) =>
                                  setResponse(q.id, val)
                                }
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
                    <h2 className="text-lg font-bold text-foreground mb-4">
                      Мэдээллээ оруулна уу
                    </h2>
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
                      <div className="space-y-2">
                        <Label>Компани</Label>
                        <Input
                          value={userForm.company}
                          onChange={(e) =>
                            setUserForm({
                              ...userForm,
                              company: e.target.value,
                            })
                          }
                          placeholder="Байгууллагын нэр"
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
                              Бүх асуултад хариулт өгсөн! 🎉
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white py-6 text-base font-semibold rounded-xl mt-2"
                      >
                        {isSubmitting
                          ? "Илгээж байна..."
                          : "Илгээх"}
                        <Send className="w-4 h-4 ml-2" />
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        {completedCount}/{totalCount} асуултад хариулт өгсөн
                      </p>
                    </div>
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

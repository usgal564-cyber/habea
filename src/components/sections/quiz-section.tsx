"use client";

import { motion } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
}

const quizTypes = [
  {
    id: "habea-officer",
    title: "ХАБЭА АЖИЛТАН МЭРГЭШҮҮЛЭХ",
    subtitle: "Сургалтын сорил",
    icon: Brain,
    color: "text-brand-600",
    bgColor: "bg-brand-50",
  },
  {
    id: "employer",
    title: "АЖИЛ ОЛГОГЧ ЭЗДИЙН СУРГАЛТ",
    subtitle: "Сургалтын сорил",
    icon: AlertTriangle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    id: "all-staff",
    title: "НИЙТ АЖИЛТНЫ СУРГАЛТ",
    subtitle: "Сургалтын сорил",
    icon: CheckCircle2,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
  },
  {
    id: "risk-workplace",
    title: "ЭРСДЭЛТЭЙ АЖЛЫН БАЙРНЫ СУРГАЛТ",
    subtitle: "Сургалтын сорил",
    icon: Trophy,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
];

export default function QuizSection() {
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", phone: "" });
  const [showForm, setShowForm] = useState(false);

  const loadQuiz = async (quizType: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/quiz?type=${quizType}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
        setAnswers({});
        setCurrentQuestion(0);
        setIsSubmitted(false);
        setScore(0);
        setSelectedQuiz(quizType);
      }
    } catch {
      toast.error("Сорил ачааллахад алдаа гарлаа.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectAnswer = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const submitQuiz = () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error("Бүх асуултад хариулт өгнө үү.");
      return;
    }
    setShowForm(true);
  };

  const finalSubmit = async () => {
    if (!userForm.name) {
      toast.error("Нэрээ оруулна уу.");
      return;
    }
    try {
      // Calculate score (option 0 is always correct in our data)
      const correctCount = questions.filter(
        (q) => answers[q.id] === 0
      ).length;
      const calculatedScore = correctCount;
      const calculatedTotal = questions.length;
      setScore(calculatedScore);
      setTotal(calculatedTotal);
      setIsSubmitted(true);
      setShowForm(false);

      await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizType: selectedQuiz,
          name: userForm.name,
          email: userForm.email || undefined,
          phone: userForm.phone || undefined,
          answers: JSON.stringify(answers),
          score: calculatedScore,
          total: calculatedTotal,
          passed: calculatedScore >= calculatedTotal * 0.7,
        }),
      });
    } catch {
      toast.error("Алдаа гарлаа.");
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setIsSubmitted(false);
    setScore(0);
    setTotal(0);
    setShowForm(false);
    setSelectedQuiz(null);
  };

  const currentQ = questions[currentQuestion];
  const passed = isSubmitted && score >= total * 0.7;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <section id="quiz" className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 mb-4">
            <Brain className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-medium text-brand-700">
              Мэдлэг сорих
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Мэдлэг Сорих Сорил
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Сургалтанд хамрагдсан эрдмийнхээ мэдлэгийг шалгах сорилууд
          </p>
        </motion.div>

        {/* Quiz Selection */}
        {!selectedQuiz && (
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {quizTypes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => loadQuiz(quiz.id)}
                  disabled={isLoading}
                  className="w-full text-left"
                >
                  <Card className="hover:shadow-xl hover:border-brand-200 transition-all duration-300 hover:-translate-y-1 h-full group">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                            quiz.bgColor
                          )}
                        >
                          <quiz.icon className={cn("w-6 h-6", quiz.color)} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground group-hover:text-brand-700 transition-colors">
                            {quiz.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {quiz.subtitle}
                          </p>
                          <Badge
                            variant="secondary"
                            className="mt-3 bg-brand-50 text-brand-700"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            5 асуулт
                          </Badge>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-600 transition-colors mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quiz Questions */}
        {selectedQuiz && questions.length > 0 && !isSubmitted && (
          <div className="max-w-3xl mx-auto">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>
                  Асуулт {currentQuestion + 1} / {questions.length}
                </span>
                <span>
                  Хариулсан: {Object.keys(answers).length}/{questions.length}
                </span>
              </div>
              <div className="w-full h-2 bg-brand-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-brand-500 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Question Card */}
            <Card className="border-brand-100 shadow-lg">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {currentQ.question}
                  </h3>
                </div>
                <div className="space-y-3">
                  {currentQ.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectAnswer(currentQ.id, idx)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3",
                        answers[currentQ.id] === idx
                          ? "border-brand-500 bg-brand-50"
                          : "border-gray-200 hover:border-brand-300 hover:bg-brand-50/30"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold transition-colors",
                          answers[currentQ.id] === idx
                            ? "bg-brand-500 text-white"
                            : "bg-gray-100 text-gray-500"
                        )}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-foreground">{option}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentQuestion(Math.max(0, currentQuestion - 1))
                }
                disabled={currentQuestion === 0}
                className="border-brand-200"
              >
                Өмнөх
              </Button>
              <div className="flex gap-3">
                {currentQuestion < questions.length - 1 ? (
                  <Button
                    onClick={() =>
                      setCurrentQuestion(
                        Math.min(questions.length - 1, currentQuestion + 1)
                      )
                    }
                    className="bg-brand-600 hover:bg-brand-700 text-white"
                  >
                    Дараагийх
                  </Button>
                ) : (
                  <Button
                    onClick={submitQuiz}
                    className="bg-brand-600 hover:bg-brand-700 text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Бүртгүүлэх
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User Form Modal (inline) */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle>Мэдээллээ оруулна уу</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Овог нэр *</Label>
                  <Input
                    required
                    value={userForm.name}
                    onChange={(e) =>
                      setUserForm({ ...userForm, name: e.target.value })
                    }
                    placeholder="Таны овог нэр"
                  />
                </div>
                <div className="space-y-2">
                  <Label>И-мэйл</Label>
                  <Input
                    type="email"
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm({ ...userForm, email: e.target.value })
                    }
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Утас</Label>
                  <Input
                    value={userForm.phone}
                    onChange={(e) =>
                      setUserForm({ ...userForm, phone: e.target.value })
                    }
                    placeholder="+976 XXXX XXXX"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    Буцах
                  </Button>
                  <Button
                    onClick={finalSubmit}
                    className="flex-1 bg-brand-600 hover:bg-brand-700 text-white"
                  >
                    Илгээх
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Result */}
        {isSubmitted && (
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <Card
                className={cn(
                  "border-2",
                  passed ? "border-brand-400" : "border-red-300"
                )}
              >
                <CardContent className="p-8">
                  <div
                    className={cn(
                      "w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center",
                      passed ? "bg-brand-100" : "bg-red-100"
                    )}
                  >
                    {passed ? (
                      <Trophy className="w-10 h-10 text-brand-600" />
                    ) : (
                      <XCircle className="w-10 h-10 text-red-500" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {passed ? "Та тэнцлээ! 🎉" : "Дахин оролдоно уу"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {passed
                      ? "Та 70% ба түүнээс дээш оноо авсан байна."
                      : "Та 70% ба түүнээс доош оноо авсан байна. Дахин оролдоно уу."}
                  </p>
                  <div className="flex justify-center gap-8 mb-8">
                    <div className="text-center">
                      <div
                        className={cn(
                          "text-4xl font-bold",
                          passed ? "text-brand-600" : "text-red-500"
                        )}
                      >
                        {score}/{total}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Зөв хариулт
                      </p>
                    </div>
                    <div className="text-center">
                      <div
                        className={cn(
                          "text-4xl font-bold",
                          passed ? "text-brand-600" : "text-red-500"
                        )}
                      >
                        {Math.round((score / total) * 100)}%
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Оноо
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={resetQuiz}
                    className="bg-brand-600 hover:bg-brand-700 text-white"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Дахин сорил өгөх
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}

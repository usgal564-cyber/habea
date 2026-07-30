
import {
  BarChart3,
  Send,
  Star,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Meh,
  Frown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SurveyQuestion {
  id: string;
  question: string;
  type: "rating" | "yesno" | "text";
  options?: string[];
}

const surveyQuestions: SurveyQuestion[] = [
  {
    id: "q1",
    question: "Манай сургалтын чанарыг та юу гэж үзэж байна?",
    type: "rating",
    options: ["Маш муу", "Муу", "Дунд зэрэг", "Сайн", "Маш сайн"],
  },
  {
    id: "q2",
    question: "Сургалтын агуулга нь практик ажилд ашигтай байсан уу?",
    type: "yesno",
  },
  {
    id: "q3",
    question: "Сургалтын хугацаа хангалттай байсан уу?",
    type: "yesno",
  },
  {
    id: "q4",
    question: "Багшийн мэдлэг, туршлагад та  сэтгэл ханамжтай байна уу?",
    type: "rating",
    options: ["Маш муу", "Муу", "Дунд зэрэг", "Сайн", "Маш сайн"],
  },
  {
    id: "q5",
    question: "Сургалтын орчин нөхцөл, тоног төхөөрөмж ямар байсан?",
    type: "rating",
    options: ["Маш муу", "Муу", "Дунд зэрэг", "Сайн", "Маш сайн"],
  },
  {
    id: "q6",
    question: "Та манай үйлчилгээг бусдад зөвлөх үү?",
    type: "yesno",
  },
  {
    id: "q7",
    question: "Дэвшүүлэх санал, хүсэлтээ бичнэ үү",
    type: "text",
  },
];

const MoodIcon = ({ index }: { index: number }) => {
  const Icon = [Frown, Meh, Smile][index] || Frown;
  return <Icon className="w-4 h-4" />;
};

export default function SurveySection() {
  const [responses, setResponses] = useState<Record<string, string | number>>({});
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
      <section id="survey" className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-brand-100 flex items-center justify-center">
              <ThumbsUp className="w-12 h-12 text-brand-600" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Баярлалаа!
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Таны сэтгэл ханамжийн судалгаанд хувь нэмэр оруулсанд бид
              баярлалаа. Таны санал хүсэлтийг манай үйлчилгээг сайжруулахад
              ашиглах болно.
            </p>
            <Button
              onClick={resetSurvey}
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              Дахин судалгаа өгөх
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="survey" className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-500">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 mb-4">
            <BarChart3 className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-medium text-brand-700">
              Сэтгэл ханамж
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Сэтгэл Ханамжийн Судалгаа
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Манай үйлчилгээний талаарх таны сэтгэл ханамжийг мэдэхийн хүсвэл
            доорх судалгааг бөглөнө үү
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Survey Questions */}
          <div className="lg:col-span-2 space-y-4">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Хариулсан: {completedCount}/{totalCount}</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-2 bg-brand-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {surveyQuestions.map((q, index) => (
              <div
                key={q.id}
                className="animate-in fade-in slide-in-from-bottom duration-500"
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "both" }}
              >
                <Card
                  className={cn(
                    "transition-all duration-200",
                    responses[q.id] !== undefined
                      ? "border-brand-200 bg-brand-50/20"
                      : "border-brand-100"
                  )}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold",
                          responses[q.id] !== undefined
                            ? "bg-brand-500 text-white"
                            : "bg-brand-100 text-brand-700"
                        )}
                      >
                        {index + 1}
                      </div>
                      <p className="text-foreground font-medium text-sm leading-relaxed pt-1">
                        {q.question}
                      </p>
                    </div>

                    {/* Rating Type */}
                    {q.type === "rating" && q.options && (
                      <div className="flex flex-wrap gap-2 ml-11">
                        {q.options.map((option, optIdx) => (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => setResponse(q.id, optIdx)}
                            className={cn(
                              "px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1",
                              responses[q.id] === optIdx
                                ? "bg-brand-600 text-white shadow-md"
                                : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                            )}
                          >
                            <MoodIcon index={optIdx} />
                            {option}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Yes/No Type */}
                    {q.type === "yesno" && (
                      <div className="flex gap-3 ml-11">
                        <button
                          type="button"
                          onClick={() => setResponse(q.id, "yes")}
                          className={cn(
                            "px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                            responses[q.id] === "yes"
                              ? "bg-brand-600 text-white shadow-md"
                              : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                          )}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Тийм
                        </button>
                        <button
                          type="button"
                          onClick={() => setResponse(q.id, "no")}
                          className={cn(
                            "px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                            responses[q.id] === "no"
                              ? "bg-red-500 text-white shadow-md"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          )}
                        >
                          <ThumbsDown className="w-4 h-4" />
                          Үгүй
                        </button>
                      </div>
                    )}

                    {/* Text Type */}
                    {q.type === "text" && (
                      <div className="ml-11">
                        <Input
                          value={(responses[q.id] as string) || ""}
                          onChange={(e) => setResponse(q.id, e.target.value)}
                          placeholder="Таны хариулт..."
                          className="bg-brand-50/30 border-brand-200"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* User Info & Submit */}
          <div className="lg:col-span-1 animate-in fade-in slide-in-from-right duration-500">
            <div className="sticky top-24">
              <Card className="border-brand-100 bg-gradient-to-br from-white to-brand-50/30">
                <CardHeader>
                  <CardTitle className="text-lg">Мэдээллээ оруулна уу</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Овог нэр *</Label>
                    <Input
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
                  <div className="space-y-2">
                    <Label>Байгууллага</Label>
                    <Input
                      value={userForm.company}
                      onChange={(e) =>
                        setUserForm({ ...userForm, company: e.target.value })
                      }
                      placeholder="Байгууллагын нэр"
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white py-6 text-base font-semibold rounded-xl mt-4"
                  >
                    {isSubmitting
                      ? "Илгээж байна..."
                      : "Илгээх"}
                    <Send className="w-4 h-4 ml-2" />
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-2">
                    {completedCount}/{totalCount} асуултад хариулт өгсөн
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

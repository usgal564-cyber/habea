
import {
  MessageSquare,
  Send,
  Star,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

const feedbackCategories = [
  { id: "training", label: "Сургалт", icon: "📚" },
  { id: "service", label: "Үйлчилгээ", icon: "🔧" },
  { id: "website", label: "Веб сайт", icon: "🌐" },
  { id: "other", label: "Бусад", icon: "💡" },
];

const existingFeedback = [
  {
    name: "Бат-Эрдэнэ",
    category: "training",
    message:
      "ХАБЭА сургалт маш сайн байсан. Багш нар мэргэжлийн өндөр түвшинтэй.",
    rating: 5,
    date: "2024-12-15",
  },
  {
    name: "Оюунтүүлэн",
    category: "service",
    message:
      "Захиалгын үйлчилгээ нь хурдан, чанартай байсан. Баярлалаа!",
    rating: 4,
    date: "2024-12-10",
  },
  {
    name: "Төгс-Баяр",
    category: "training",
    message:
      "ISO 45001 сургалт маш практик байсан. Ажил дээрээ ашиглах боломжтой.",
    rating: 5,
    date: "2024-12-05",
  },
];

export default function FeedbackSection() {
  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    message: "",
  });
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.name || !feedbackForm.message || !feedbackForm.category) {
      toast.error("Заавал бөглөх талбарыг бөглөнө үү.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackForm),
      });
      if (res.ok) {
        toast.success("Санал хүсэлт амжилттай илгээгдлээ! Баярлалаа.");
        setFeedbackForm({
          name: "",
          email: "",
          phone: "",
          category: "",
          message: "",
        });
        setRating(0);
      } else {
        toast.error("Алдаа гарлаа. Дахин оролдоно уу.");
      }
    } catch {
      toast.error("Серверийн алдаа гарлаа.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="feedback" className="py-20 lg:py-28 bg-brand-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-500"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 border border-brand-200 mb-4">
            <MessageSquare className="w-4 h-4 text-brand-700" />
            <span className="text-sm font-medium text-brand-700">
              Санал хүсэлт
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Санал Хүсэлт
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Таны санал хүсэлт бидэнд маш чухал. Үйлчилгээгээ сайжруулахад
            туслах болно.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Existing Feedback */}
          <div className="animate-in fade-in slide-in-from-left duration-500">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Бусдын санал хүсэлт
            </h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin pr-2">
              {existingFeedback.map((fb, i) => (
                <div
                  key={i}
                  className="animate-in fade-in slide-in-from-bottom duration-500"
                  style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700">
                            {fb.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {fb.name}
                            </p>
                            <Badge
                              variant="secondary"
                              className="text-xs bg-brand-50 text-brand-700"
                            >
                              {feedbackCategories.find(
                                (c) => c.id === fb.category
                              )?.label || fb.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-4 h-4 ${
                                idx < fb.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {fb.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {fb.date}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Form */}
          <div className="animate-in fade-in slide-in-from-right duration-500">
            <Card className="border-brand-100 bg-gradient-to-br from-white to-brand-50/30">
              <CardHeader>
                <CardTitle className="text-xl">
                  Санал хүсэлт илгээх
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Category Selection */}
                  <div className="space-y-2">
                    <Label>Ангилал *</Label>
                    <div className="flex flex-wrap gap-2">
                      {feedbackCategories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() =>
                            setFeedbackForm({
                              ...feedbackForm,
                              category: cat.id,
                            })
                          }
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                            feedbackForm.category === cat.id
                              ? "bg-brand-600 text-white shadow-md"
                              : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                          }`}
                        >
                          <span>{cat.icon}</span>
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Овог нэр *</Label>
                      <Input
                        required
                        value={feedbackForm.name}
                        onChange={(e) =>
                          setFeedbackForm({
                            ...feedbackForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="Таны овог нэр"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>И-мэйл</Label>
                      <Input
                        type="email"
                        value={feedbackForm.email}
                        onChange={(e) =>
                          setFeedbackForm({
                            ...feedbackForm,
                            email: e.target.value,
                          })
                        }
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Утас</Label>
                    <Input
                      value={feedbackForm.phone}
                      onChange={(e) =>
                        setFeedbackForm({
                          ...feedbackForm,
                          phone: e.target.value,
                        })
                      }
                      placeholder="+976 XXXX XXXX"
                    />
                  </div>

                  {/* Rating */}
                  <div className="space-y-2">
                    <Label>Үнэлгээ</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300 hover:text-yellow-300"
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Санал хүсэлт *</Label>
                    <Textarea
                      required
                      rows={4}
                      value={feedbackForm.message}
                      onChange={(e) =>
                        setFeedbackForm({
                          ...feedbackForm,
                          message: e.target.value,
                        })
                      }
                      placeholder="Таны санал хүсэлт..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white py-6 text-base font-semibold rounded-xl"
                  >
                    {isSubmitting
                      ? "Илгээж байна..."
                      : "Илгээх"}
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

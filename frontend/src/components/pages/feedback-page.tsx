import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Star,
  Quote,
  Trash2,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/hooks/use-auth";

const feedbackCategories = [
  { id: "training", label: "Сургалт" },
  { id: "service", label: "Үйлчилгээ" },
  { id: "exam", label: "Шалгалт" },
  { id: "other", label: "Бусад" },
];

interface FeedbackItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  rating: number;
  category: string;
  createdAt: string;
}

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (val: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={cn(
            "transition-transform",
            !readonly && "hover:scale-125"
          )}
        >
          <Star
            className={cn(
              "w-5 h-5 transition-colors",
              star <= value
                ? "text-yellow-400 fill-yellow-400"
                : readonly
                  ? "text-gray-300"
                  : "text-gray-300 hover:text-yellow-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const { user, token } = useAuthStore();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    message: "",
  });
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Server-side feedback list
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin =
    user?.role === "ADMIN" ||
    user?.role === "MANAGER" ||
    user?.role === "TEACHER";

  const fetchFeedback = useCallback(async () => {
    setLoadingFeedback(true);
    try {
      const res = await fetch("/api/feedback");
      if (res.ok) {
        const data = await res.json();
        setFeedbackList(data.feedback || []);
      }
    } catch {
      // silent fail
    } finally {
      setLoadingFeedback(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleDelete = async (id: string) => {
    if (!token) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Амжилттай устгагдлаа.");
        fetchFeedback();
      } else {
        toast.error("Устгахад алдаа гарлаа.");
      }
    } catch {
      toast.error("Серверийн алдаа гарлаа.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message || !form.category) {
      toast.error("Заавал бөглөх талбарыг бөглөнө үү.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rating }),
      });
      if (res.ok) {
        toast.success(
          "Санал хүсэлт амжилттай илгээгдлээ! Баярлалаа."
        );
        setForm({ name: "", email: "", phone: "", category: "", message: "" });
        setRating(0);
        // Refresh feedback list from server
        fetchFeedback();
      } else {
        toast.error("Алдаа гарлаа. Дахин оролдоно уу.");
      }
    } catch {
      toast.error("Серверийн алдаа гарлаа.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("mn-MN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-brand-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-brand-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-700/50 border border-brand-600/30 mb-6">
              <MessageSquare className="w-4 h-4 text-brand-300" />
              <span className="text-sm font-medium text-brand-200">
                Санал хүсэлт
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Санал Хүсэлт
            </h1>
            <p className="text-brand-200/80 max-w-2xl mx-auto text-lg">
              Таны санал хүсэлт бидэнд маш чухал. Үйлчилгээгээ
              сайжруулахад туслах болно.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* LEFT: Feedback List from Server */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl font-bold text-foreground mb-6">
                Бусдын санал хүсэлт
              </h2>

              {loadingFeedback ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4 mt-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : feedbackList.length === 0 ? (
                <Card className="border-brand-100">
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-brand-300" />
                    </div>
                    <p className="text-muted-foreground">
                      Одоогоор санал хүсэлт байхгүй байна.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Та эхлэлч болж саналаа илгээх боломжтой!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {feedbackList.map((fb, i) => (
                      <motion.div
                        key={fb.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                      >
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700">
                                  {fb.name?.charAt(0) || "?"}
                                </div>
                                <div>
                                  <p className="font-medium text-foreground text-sm">
                                    {fb.name}
                                  </p>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-brand-50 text-brand-700 mt-0.5"
                                  >
                                    {feedbackCategories.find(
                                      (c) => c.id === fb.category
                                    )?.label || fb.category}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <StarRating value={fb.rating} readonly />
                                {isAdmin && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                                    onClick={() => handleDelete(fb.id)}
                                    disabled={deletingId === fb.id}
                                  >
                                    {deletingId === fb.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="relative">
                              <Quote className="w-5 h-5 text-brand-200 absolute -top-1 -left-1" />
                              <p className="text-sm text-foreground/80 leading-relaxed pl-5">
                                {fb.message}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                              {formatDate(fb.createdAt)}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>

            {/* RIGHT: Feedback Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-brand-100 bg-gradient-to-br from-white to-brand-50/30">
                <CardContent className="p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                      <Send className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">
                        Санал хүсэлт илгээх
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Таны санал бидэнд чухал
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Category Pills */}
                    <div className="space-y-2">
                      <Label>
                        Ангилал <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {feedbackCategories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() =>
                              setForm({ ...form, category: cat.id })
                            }
                            className={cn(
                              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                              form.category === cat.id
                                ? "bg-brand-600 text-white shadow-md"
                                : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                            )}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Нэр <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        required
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder="Таны овог нэр"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Имэйл</Label>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Утас</Label>
                        <Input
                          value={form.phone}
                          onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                          }
                          placeholder="+976 XXXX XXXX"
                        />
                      </div>
                    </div>

                    {/* Rating Stars */}
                    <div className="space-y-2">
                      <Label>Үнэлгээ</Label>
                      <StarRating value={rating} onChange={setRating} />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Санал <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        required
                        rows={4}
                        value={form.message}
                        onChange={(e) =>
                          setForm({ ...form, message: e.target.value })
                        }
                        placeholder="Таны санал хүсэлт..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-brand-600 hover:bg-brand-700 text-white py-6 text-base font-semibold rounded-xl"
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
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

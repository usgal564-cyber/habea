
import {
  ClipboardList,
  Shield,
  FileCheck,
  Users,
  BookOpen,
  HardHat,
  Wrench,
  Building2,
  Send,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const serviceTypes = [
  {
    id: "habea-consult",
    title: "ХАБЭА зөвлөгөө",
    description:
      "Ажлын байраны эрүүл мэнд, аюулгүй байдал, байгаль орчны менежментийн системийн зөвлөгөө өгөх",
    icon: Shield,
    features: [
      "ХАБЭА бодлогын боловсруулалт",
      "Ажлын байрны үнэлгээ",
      "Эрсдэлийн менежмент",
      "Үйл ажиллагааны төлөвлөлт",
    ],
  },
  {
    id: "audit",
    title: "Аудит үйлчилгээ",
    description:
      "ХАБЭА менежментийн системийн дотоод аудит, гадаад аудит хийх үйлчилгээ",
    icon: FileCheck,
    features: [
      "ISO стандартын аудит",
      "Дотоод аудитын хийх",
      "Баталгаажуулалтын аудит",
      "Тайлан бэлтгэх",
    ],
  },
  {
    id: "training-service",
    title: "Сургалт зохион байгуулах",
    description:
      "Байгууллагын хэрэгцээ шаардлагаар өөриймшүүлсэн сургалт зохион байгуулах",
    icon: BookOpen,
    features: [
      "Тусгай сургалт",
      "Компанийн сургалт",
      "Онлайн сургалт",
      "Практик сургалт",
    ],
  },
  {
    id: "risk-assessment",
    title: "Эрсдэлийн үнэлгээ",
    description:
      "Ажлын байрны эрсдэлийн үнэлгээ хийх, аюулгүй байдлын арга хэмжээ тодорхойлох",
    icon: ClipboardList,
    features: [
      "Ажлын байрны судалгаа",
      "Эрсдэлийн тодорхойлолт",
      "Аюулгүй байдлын төлөвлөгөө",
      "Хяналтын арга хэмжээ",
    ],
  },
  {
    id: "safety-equipment",
    title: "Хамгаалах хэрэгсэл",
    description:
      "Ажлын байраны хамгаалах хэрэгслийн зөвлөгөө, сонгох үйлчилгээ",
    icon: HardHat,
    features: [
      "Хувцас хэрэглэл",
      "Нүүр царайны хамгаалалт",
      "Бийр хамгаалалт",
      "Бусад хэрэгсэл",
    ],
  },
  {
    id: "construction-safety",
    title: "Барилгын аюулгүй байдал",
    description:
      "Барилгын ажлын байраны аюулгүй байдлын зөвлөгөө, хяналт",
    icon: Wrench,
    features: [
      "Барилгын талбайн хяналт",
      "Өндөрт ажиллах",
      "Цахилгааны аюулгүй байдал",
      "Машин механизмын ашиглалт",
    ],
  },
];

export default function ServiceSection() {
  const [selectedService, setSelectedService] = useState("");
  const [orderForm, setOrderForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) {
      toast.error("Үйлчилгээний төрөл сонгоно уу.");
      return;
    }
    if (!orderForm.name || !orderForm.email || !orderForm.phone) {
      toast.error("Заавал бөглөх талбарыг бөглөнө үү.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/service-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderForm,
          serviceType: selectedService,
        }),
      });
      if (res.ok) {
        toast.success(
          "Захиалга амжилттай илгээгдлээ! Бид тантай холбогдох болно."
        );
        setOrderForm({
          name: "",
          email: "",
          phone: "",
          company: "",
          description: "",
        });
        setSelectedService("");
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
    <section id="service" className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-500"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 mb-4">
            <ClipboardList className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-medium text-brand-700">
              Захиалгын үйлчилгээ
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Захиалгын Үйлчилгээний Төрлүүд
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Байгууллагын ХАБЭА-ийн бүх төрлийн үйлчилгээг захиалгаар үзүүлнэ
          </p>
        </div>

        {/* Service Types Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {serviceTypes.map((service, index) => (
            <div
              key={service.id}
              className="animate-in fade-in slide-in-from-bottom duration-500"
              style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "both" }}
            >
              <Card
                className={cn(
                  "h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                  selectedService === service.id
                    ? "border-brand-400 ring-2 ring-brand-100 bg-brand-50/30"
                    : "hover:border-brand-200"
                )}
                onClick={() => setSelectedService(service.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                      <service.icon className="w-6 h-6 text-brand-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {service.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {service.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                        <span className="text-xs text-foreground/70">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Order Form */}
        <div
          className="animate-in fade-in slide-in-from-bottom duration-500"
        >
          <Card className="max-w-3xl mx-auto border-brand-100 bg-gradient-to-br from-white to-brand-50/30">
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                  <Send className="w-5 h-5 text-brand-600" />
                </div>
                <CardTitle className="text-2xl">Захиалга Илгээх</CardTitle>
              </div>
              <p className="text-muted-foreground">
                Дээрх үйлчилгээний төрлөөс сонгож захиалгаа илгээгээрэй
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Selected service */}
                <div className="p-4 rounded-xl bg-brand-50/50 border border-brand-100">
                  <Label className="text-sm text-muted-foreground">
                    Сонгосон үйлчилгээ
                  </Label>
                  <p className="font-medium text-foreground mt-1">
                    {selectedService
                      ? serviceTypes.find((s) => s.id === selectedService)?.title
                      : "Дээрх үйлчилгээнүүдээс сонгоно уу..."}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Овог нэр *</Label>
                    <Input
                      required
                      value={orderForm.name}
                      onChange={(e) =>
                        setOrderForm({ ...orderForm, name: e.target.value })
                      }
                      placeholder="Таны овог нэр"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>И-мэйл *</Label>
                    <Input
                      type="email"
                      required
                      value={orderForm.email}
                      onChange={(e) =>
                        setOrderForm({ ...orderForm, email: e.target.value })
                      }
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Утас *</Label>
                    <Input
                      required
                      value={orderForm.phone}
                      onChange={(e) =>
                        setOrderForm({ ...orderForm, phone: e.target.value })
                      }
                      placeholder="+976 XXXX XXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Байгууллага</Label>
                    <Input
                      value={orderForm.company}
                      onChange={(e) =>
                        setOrderForm({ ...orderForm, company: e.target.value })
                      }
                      placeholder="Байгууллагын нэр"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Нэмэлт тайлбар</Label>
                  <Textarea
                    rows={4}
                    value={orderForm.description}
                    onChange={(e) =>
                      setOrderForm({
                        ...orderForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Тухайн үйлчилгээний талаар дэлгэрэнгүй..."
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedService}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white py-6 text-base font-semibold rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? "Илгээж байна..." : "Захиалга илгээх"}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

"use client";

import {
  Handshake,
  Globe,
  Building2,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  CheckCircle2,
  Send,
  Users,
  Award,
  Heart,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

const goals = [
  {
    icon: Shield,
    title: "Аюулгүй байдал",
    desc: "Ажилтнуудын эрүүл мэнд, аюулгүй байдал, байгаль орчныг хамгаалах",
  },
  {
    icon: Users,
    title: "Мэргэжлийн бэлтгэл",
    desc: "ХАБЭА-ийн салбарт мэргэжлийн бэлтгэл, сургалт зохион байгуулах",
  },
  {
    icon: Heart,
    title: "Эрүүл мэнд",
    desc: "Эрсдэлтэй ажлын байрны мэргэжлийн өвчлөөс урьдчилан сэргийлэх",
  },
  {
    icon: Award,
    title: "Чанарын стандарт",
    desc: "ISO олон улсын стандартын дагуу үйл ажиллагааг явуулах",
  },
];

const relationships = [
  "Хөдөлмөрийн болон нийгмийн хамгааллын яам",
  "Улсын хяналтын ерөнхий газар",
  "Монголын ХАБЭА холбоо",
  "Мэргэжлийн боловсрол, сургалтын байгууллагууд",
  "Уул уурхай, үйлдвэрлэлийн салбарын аж ахуйн нэгжүүд",
];

const partners = [
  { name: "Монголын ХАБЭА Холбоо", type: "Төрийн бус байгууллага" },
  { name: "Хөдөлмөрийн Хяналтын Газар", type: "Төрийн байгууллага" },
  { name: "Мэргэжлийн Сургалтын Төв", type: "Боловсролын байгууллага" },
  { name: "Олон Улсын ХАБЭА Байгууллагууд", type: "Олон улсын байгууллага" },
];

export default function AboutSection() {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      if (res.ok) {
        toast.success("Амжилттай илгээлээ! Бид тантай холбогдох болно.");
        setContactForm({ name: "", email: "", phone: "", company: "", message: "" });
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
    <section id="about" className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-500"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 mb-4">
            <Building2 className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-medium text-brand-700">Бидний тухай</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            ХАБЭА Бага Дунд Аж Ахуйн Нэгж
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Ажлын байраны аюулгүй байдал, эрүүл мэнд, байгаль орчны талаар
            сургалт, зөвлөгөө, үйлчилгээ үзүүлдэг мэргэжлийн байгууллага
          </p>
        </div>

        {/* Goals */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {goals.map((goal, index) => (
            <div
              key={goal.title}
              className="animate-in fade-in slide-in-from-bottom duration-500"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "both" }}
            >
              <Card className="h-full hover:shadow-lg hover:border-brand-200 transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                    <goal.icon className="w-7 h-7 text-brand-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {goal.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {goal.desc}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Relationships & Partners */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          <div
            className="animate-in fade-in slide-in-from-left duration-500"
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <Handshake className="w-5 h-5 text-brand-600" />
                  </div>
                  <CardTitle className="text-xl">Манай Харилцаа Холбоо</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {relationships.map((rel, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-brand-500 mt-0.5 shrink-0" />
                      <span className="text-foreground/80">{rel}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div
            className="animate-in fade-in slide-in-from-right duration-500"
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-brand-600" />
                  </div>
                  <CardTitle className="text-xl">Хамтрагч Байгуулгууд</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {partners.map((partner, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 rounded-xl bg-brand-50/50 hover:bg-brand-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-brand-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {partner.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {partner.type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Form */}
        <div
          id="contact"
          className="animate-in fade-in slide-in-from-bottom duration-500"
        >
          <Card className="border-brand-100 bg-gradient-to-br from-white to-brand-50/30">
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-brand-600" />
                </div>
                <CardTitle className="text-2xl">Холбоо Бариах</CardTitle>
              </div>
              <p className="text-muted-foreground max-w-md mx-auto">
                Бидэнд асуух зүйл байвал доорх маягтад бөглөн илгээгээрэй
              </p>
            </CardHeader>
            <CardContent className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Овог нэр *</Label>
                    <Input
                      id="contact-name"
                      required
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, name: e.target.value })
                      }
                      placeholder="Таны овог нэр"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">И-мэйл *</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, email: e.target.value })
                      }
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Утас</Label>
                    <Input
                      id="contact-phone"
                      value={contactForm.phone}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, phone: e.target.value })
                      }
                      placeholder="+976 XXXX XXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-company">Байгууллага</Label>
                    <Input
                      id="contact-company"
                      value={contactForm.company}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, company: e.target.value })
                      }
                      placeholder="Байгууллагын нэр"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message">Зурвас *</Label>
                  <Textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        message: e.target.value,
                      })
                    }
                    placeholder="Таны зурвас..."
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white py-6 text-base font-semibold rounded-xl"
                >
                  {isSubmitting ? "Илгээж байна..." : "Илгээх"}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </form>

              {/* Contact Info */}
              <div className="mt-8 grid sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50/50">
                  <Phone className="w-5 h-5 text-brand-600 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Утас</p>
                    <p className="text-sm font-medium text-foreground">
                      +976 7700-1234
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50/50">
                  <Mail className="w-5 h-5 text-brand-600 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">И-мэйл</p>
                    <p className="text-sm font-medium text-foreground">
                      info@habea.mn
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50/50">
                  <MapPin className="w-5 h-5 text-brand-600 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Хаяг</p>
                    <p className="text-sm font-medium text-foreground">
                      УБ, БЗД
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

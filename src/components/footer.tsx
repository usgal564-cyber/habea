"use client";

import { Shield, Phone, Mail, MapPin, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-brand-950 text-brand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">ХАБЭА</span>
                <span className="block text-xs text-brand-300 -mt-1">
                  Бага Дунд Аж Ахуйн Нэгж
                </span>
              </div>
            </div>
            <p className="text-brand-300/70 text-sm leading-relaxed">
              Ажлын байраны аюулгүй байдал, эрүүл мэнд, байгаль орчны
              талаар сургалт, зөвлөгөө үзүүлдэг мэргэжлийн байгууллага.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Цахим холбоос</h4>
            <ul className="space-y-2">
              {[
                { label: "Нүүр", id: "home" },
                { label: "Бидний тухай", id: "about" },
                { label: "Сургалт", id: "training" },
                { label: "Мэдлэг сорих", id: "quiz" },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigate(link.id)}
                    className="text-brand-300/70 hover:text-brand-200 text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Үйлчилгээ</h4>
            <ul className="space-y-2">
              {[
                { label: "Шалгалт", id: "exam" },
                { label: "Захиалгын үйлчилгээ", id: "service" },
                { label: "Санал хүсэлт", id: "feedback" },
                { label: "Сэтгэл ханамж", id: "survey" },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigate(link.id)}
                    className="text-brand-300/70 hover:text-brand-200 text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Холбоо барих</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-brand-300/70">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                +976 7700-1234
              </li>
              <li className="flex items-center gap-3 text-sm text-brand-300/70">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                info@habea.mn
              </li>
              <li className="flex items-start gap-3 text-sm text-brand-300/70">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                Улаанбаатар хот, Баянзүрх дүүрэг
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-brand-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-brand-400/60 text-sm">
            © 2025 ХАБЭА Бага Дунд Аж Ахуйн Нэгж. Бүх
            эрх хуулиар хамгаалагдсан.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollToTop}
            className="text-brand-400 hover:text-brand-200 hover:bg-brand-800/40"
          >
            <ArrowUp className="w-4 h-4 mr-1" />
            Дээш очих
          </Button>
        </div>
      </div>
    </footer>
  );
}

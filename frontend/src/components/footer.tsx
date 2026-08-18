import {
  Phone,
  Mail,
  MapPin,
  ArrowUp,
  Facebook,
  Instagram,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FooterProps {
  onNavigate: (pageId: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const quickLinks = [
    { label: "Нүүр", id: "home" },
    { label: "Сургалт", id: "training" },
    { label: "Мэдлэг сорих", id: "quiz" },
    { label: "Шалгалт", id: "exam" },
  ];

  const serviceLinks = [
    { label: "Зөвлөх үйлчилгээ", id: "consulting" },
    { label: "Санал хүсэлт", id: "feedback" },
    { label: "Сэтгэл ханамж", id: "survey" },
  ];

  return (
    <footer className="bg-brand-950 text-brand-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/logo.png"
                alt="ХАБЭА"
                className="w-10 h-10 rounded-xl object-contain shadow-lg"
              />
              <div>
                <span className="text-lg font-bold text-white">
                  ХАБЭА
                </span>
                <span className="block text-xs text-brand-300 -mt-1">
                  Бага Дунд Аж Ахуйн Нэгж
                </span>
              </div>
            </div>
            <p className="text-brand-300/70 text-sm leading-relaxed mb-6">
              Ажлын байраны аюулгүй байдал, эрүүл мэнд,
              байгаль орчны талаар сургалт, зөвлөгөө
              үзүүлдэг мэргэжлийн байгууллага.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-5">
              Цахим холбоос
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigate(link.id)}
                    className="text-brand-300/70 hover:text-brand-200 text-sm transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="text-white font-semibold mb-5">Үйлчилгээ</h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigate(link.id)}
                    className="text-brand-300/70 hover:text-brand-200 text-sm transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-5">Холбоо барих</h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3 text-sm text-brand-300/70">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>
                  Улаанбаатар хот, Баянзүрх дүүрэг
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-brand-300/70">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+976 7700-1234</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-brand-300/70">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>info@habea.mn</span>
              </li>
            </ul>

            {/* Social Media Icons */}
            <div className="flex gap-3 mt-6">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-brand-800/60 flex items-center justify-center text-brand-300 hover:bg-brand-700 hover:text-white transition-all duration-200 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-brand-800/60 flex items-center justify-center text-brand-300 hover:bg-brand-700 hover:text-white transition-all duration-200 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-brand-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-brand-400/60 text-sm">
            © 2025 ХАБЭА Бага Дунд Аж Ахуйн Нэгж. Бүх
            эрх хуулиар хамгаалагдсан.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollToTop}
            className="text-brand-400 hover:text-brand-200 hover:bg-brand-800/40 hover:scale-105 transition-all"
          >
            <ArrowUp className="w-4 h-4 mr-1" />
            Дээш очих
          </Button>
        </div>
      </div>
    </footer>
  );
}

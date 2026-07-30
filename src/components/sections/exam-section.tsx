
import {
  FileText,
  Download,
  Eye,
  BookOpen,
  ClipboardList,
  FileCheck,
  Lock,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const examMaterials = [
  {
    category: "ХАБЭА-ийн сургалтын хичээлийн материал",
    icon: BookOpen,
    materials: [
      {
        title: "ХАБЭА-ийн үндсэн ойлголт",
        type: "PDF",
        size: "2.4 MB",
        pages: 45,
      },
      {
        title: "Ажлын байраны аюулгүй байдлын дүрмүүд",
        type: "PDF",
        size: "1.8 MB",
        pages: 32,
      },
      {
        title: "Хэрэглээний заавар, зөвлөмж",
        type: "PDF",
        size: "3.1 MB",
        pages: 56,
      },
    ],
  },
  {
    category: "Мэргэжлийн гэрчилгээний шалгалтын материал",
    icon: ClipboardList,
    materials: [
      {
        title: "Шалгалтын дүрэм, журам",
        type: "PDF",
        size: "1.2 MB",
        pages: 18,
      },
      {
        title: "Шалгалтын жишээ асуулт, хариулт",
        type: "PDF",
        size: "2.6 MB",
        pages: 40,
      },
      {
        title: "Шалгалтын дүнгийн тооцоолол",
        type: "PDF",
        size: "0.8 MB",
        pages: 12,
      },
    ],
  },
  {
    category: "ISO стандартын материал",
    icon: FileCheck,
    materials: [
      {
        title: "MNS ISO 45001:2018 стандарт",
        type: "PDF",
        size: "4.5 MB",
        pages: 78,
      },
      {
        title: "MNS ISO 14001:2015 стандарт",
        type: "PDF",
        size: "3.9 MB",
        pages: 65,
      },
      {
        title: "MNS ISO 9001:2016 стандарт",
        type: "PDF",
        size: "3.7 MB",
        pages: 60,
      },
    ],
  },
];

export default function ExamSection() {
  return (
    <section id="exam" className="py-20 lg:py-28 bg-brand-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-500"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 border border-brand-200 mb-4">
            <FileText className="w-4 h-4 text-brand-700" />
            <span className="text-sm font-medium text-brand-700">Шалгалт</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Шалгалтын Материал
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Шалгалт өгөхөд хэрэгтэй бүх материал, заавар, дүрмүүд
          </p>
        </div>

        {/* Material Categories */}
        <div className="space-y-8 max-w-4xl mx-auto">
          {examMaterials.map((cat, catIdx) => (
            <div
              key={cat.category}
              className="animate-in fade-in slide-in-from-bottom duration-500"
              style={{ animationDelay: `${catIdx * 0.1}s`, animationFillMode: "both" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                  <cat.icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {cat.category}
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.materials.map((material, matIdx) => (
                  <div
                    key={material.title}
                    className="animate-in fade-in slide-in-from-bottom duration-500"
                    style={{ animationDelay: `${catIdx * 0.1 + matIdx * 0.05}s`, animationFillMode: "both" }}
                  >
                    <Card className="hover:shadow-lg hover:border-brand-200 transition-all duration-300 group h-full">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
                            <FileText className="w-5 h-5 text-brand-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground text-sm leading-snug">
                              {material.title}
                            </h4>
                          </div>
                        </div>
                        <Separator className="mb-3" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                          <span>{material.pages} хуудас</span>
                          <span>{material.size}</span>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full border-brand-200 hover:bg-brand-50 text-brand-700 hover:text-brand-800 text-sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Үзэх
                          <Lock className="w-3 h-3 ml-auto" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info Note */}
        <div
          className="mt-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom duration-500"
        >
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-brand-100/50 border border-brand-200">
            <div className="w-10 h-10 rounded-xl bg-brand-200 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-brand-700" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                Материалыг хэрхэн авах вэ?
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Шалгалтын материалуудыг бүртгүүлсний дараа татаж авах боломжтой.
                Сургалтанд хамрагдаж байгаа сурагчид нэвтэрч материал татаж авах
                боломжтой. Нэвтрэх мэдээллээ хэрэглэж орно уу.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

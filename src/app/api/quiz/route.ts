import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const quizQuestions: Record<string, Array<{ id: string; question: string; options: string[] }>> = {
  "habea-officer": [
    {
      id: "ho1",
      question: "ХАБЭА гэдэг нь юуны товчилголт вэ?",
      options: ["Хор хөнөөлийн аюулгүй байдал, эрүүл мэнд", "Хот байгуулалтын эрх зүй", "Хувийн аюулгүй байдлын ажил", "Хамтын ажиллагааны бодлого"],
    },
    {
      id: "ho2",
      question: "Ажил олгогч нь ХАБЭА-ийн бодлоготой хамгийн түрүүнд юу хийх ёстой вэ?",
      options: ["ХАБЭА-ийн бодлогыг батлан гаргах", "Ажилтанд цалин өгөх", "Шинэ тоног төхөөрөмж авах", "Маркетинг хийх"],
    },
    {
      id: "ho3",
      question: "ХАБЭА ажилтны үндсэн үүрэг нь юу вэ?",
      options: ["Аюулгүй байдлын хяналт тавих, зөвлөгөө өгөх", "Барилгын ажил хийх", "Нягтлан бодох", "Хүнс нийлүүлэх"],
    },
    {
      id: "ho4",
      question: "Монгол улсад ХАБЭА-ийн тухай хууль хэзээ батлагдсан бэ?",
      options: ["2008 он", "1990 он", "2015 он", "2000 он"],
    },
    {
      id: "ho5",
      question: "ХАБЭА-ийн гурвалсан системд юу ордог вэ?",
      options: ["Эрүүл мэнд, аюулгүй байдал, байгаль орчин", "Эдийн засаг, нийгэм, соёл", "Уул уурхай, үйлдвэр, үйлчилгээ", "Шүүх, цагдаа, прокурор"],
    },
  ],
  employer: [
    {
      id: "e1",
      question: "Ажил олгогчийн ХАБЭА-ийн хууль ёсны үүрэг хэд бэ?",
      options: ["8 үүрэг", "3 үүрэг", "5 үүрэг", "10 үүрэг"],
    },
    {
      id: "e2",
      question: "Ажилтанд ХАБЭА-ийн сургалт заавал хийлгэх эсэхийг хуульчилсан байна уу?",
      options: ["Тийм, заавал сургалт хийлгэх", "Үгүй, хийхгүй ч болно", "Зөвхөн том аж ахуйн нэгж", "Тийм, гэхдээ зөвхөн 1 удаа"],
    },
    {
      id: "e3",
      question: "Ажлын байранд ажиллагсдад хамгаалах хэрэгслийг хэн өгдөг вэ?",
      options: ["Ажил олгогч", "Ажилтан өөрөө", "Засгийн газар", "Үйлдвэрийн холбоо"],
    },
    {
      id: "e4",
      question: "ХАБЭА-ийн бодлогод юу заавал багтана?",
      options: ["Ажилтны эрүүл мэнд, аюулгүй байдлын зорилго", "Борлуулалтын төлөвлөгөө", "Маркетингийн стратеги", "Санхүүчилгээний төсөл"],
    },
    {
      id: "e5",
      question: "Ажил олгогч хэдэн жилийн дотор ХАБЭА бодлогоо шинэчлэх ёстой вэ?",
      options: ["2 жил", "5 жил", "10 жил", "Шинэчлэх шаардлагагүй"],
    },
  ],
  "all-staff": [
    {
      id: "as1",
      question: "Ажилтан хэрэглэх хамгаалах хэрэгслийг хаана авдаг вэ?",
      options: ["Ажил олгогчоос үнэгүй авдаг", "Өөрөө худалдаж авдаг", "Төрийн бус байгууллагаас", "Интернетээс"],
    },
    {
      id: "as2",
      question: "Гал түймэр гарах үед хамгийн түрүүнд юу хийх хэрэгтэй вэ?",
      options: ["Мэдээлэх, гал унтраах", "Цуглуулах зөвлөгөө өгөх", "Зураг авах", "Сошиал сүлжээнд нийтлэх"],
    },
    {
      id: "as3",
      question: "Ажлын байрны аюулгүй байдлын зөвлөгч хэн байдаг вэ?",
      options: ["ХАБЭА мэргэжилтэн", "Нягтлан бодогч", "Хүнсний технологич", "Барилгын инженер"],
    },
    {
      id: "as4",
      question: "Ажлын байранд гарсан гэмтлийн талаар хэнийг мэдэгдэх ёстой вэ?",
      options: ["Шууд удирдлагад, ХАБЭА ажилтанд", "Ажилтнаа л", "Ямар ч хүнд мэдэгдэхүү", "Хэвлэл мэдээллээр"],
    },
    {
      id: "as5",
      question: "Эхний тусламж үзүүлэх дараалал юу вэ?",
      options: ["Аюулгүй байдал, шууд тусламж, эрчимтүүлэгдэх", "Зураг авах, бичих", "Утасдүүлэх", "Яаралтай зугтах"],
    },
  ],
  "risk-workplace": [
    {
      id: "rw1",
      question: "Эрсдэлтэй ажлын байр гэж юуныг хэлдэг вэ?",
      options: ["Ажилтны эрүүл мэндэд аюул төрүүлэх нөхцөлтэй ажлын байр", "Тухайн тийм ажил байхгүй", "Зөвхөн уул уурхайн ажил", "Зөвхөн барилгын ажил"],
    },
    {
      id: "rw2",
      question: "Эрсдэлтэй ажлын байранд ажиллахын тулд юу шаардлагатай вэ?",
      options: ["Мэргэжлийн үнэмлэх, сургалт", "Зөвхөн хүссэн хүн ажиллаж болно", "Дээд боловсрол", "Гадаад улсын паспорт"],
    },
    {
      id: "rw3",
      question: "Хими, биологийн хор agents-д тохирох хамгаалалт юу вэ?",
      options: ["Нүүрний хамгаалалт, бээлий, хамгаалах хувцас", "Зөвхөн цамц өмсөх", "Ямар ч хамгаалалт байхгүй", "Зөвхөн малгай"],
    },
    {
      id: "rw4",
      question: "Өндөрт ажиллах үед ямар аюул оршино?",
      options: ["Унаж гэмтэх", "Хүйтнээс өвдөх", "Цахилгаанд цохих", "Бүх хариулт зөв"],
    },
    {
      id: "rw5",
      question: "Дуу чимээгийн түвшинг хязгаарлах нь ямар ач холбогдолтой вэ?",
      options: ["Чихний хүндэрлөөс урьдчилан сэргийлэх", "Ажлын бүтээмж багасгах", "Ямар ч ач холбогдолгүй", "Зөвхөн үзэмжинд нөлөөтэй"],
    },
  ],
};

const quizSubmitSchema = z.object({
  quizType: z.string().min(1),
  name: z.string().min(1, "Нэрээ оруулна уу"),
  email: z.string().optional(),
  phone: z.string().optional(),
  answers: z.string(),
  score: z.number(),
  total: z.number(),
  passed: z.boolean(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type || !quizQuestions[type]) {
      return NextResponse.json(
        { error: "Буруу сорилын төрөл" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      questions: quizQuestions[type],
    });
  } catch (error) {
    console.error("Quiz GET error:", error);
    return NextResponse.json(
      { error: "Серверийн алдаа" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = quizSubmitSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Мэдээллийн алдаа", details: result.error.errors },
        { status: 400 }
      );
    }

    const attempt = await db.quizAttempt.create({
      data: {
        quizType: result.data.quizType,
        name: result.data.name,
        email: result.data.email || null,
        phone: result.data.phone || null,
        answers: result.data.answers,
        score: result.data.score,
        total: result.data.total,
        passed: result.data.passed,
      },
    });

    return NextResponse.json(
      { message: "Сорил амжилттай бүртгэгдлээ", id: attempt.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Quiz POST error:", error);
    return NextResponse.json(
      { error: "Серверийн алдаа" },
      { status: 500 }
    );
  }
}

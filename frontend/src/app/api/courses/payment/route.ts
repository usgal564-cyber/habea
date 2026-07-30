import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { z } from "zod/v4";

const paymentSchema = z.object({
  courseId: z.string().min(1, "Сургалтын ID заавал байх ёстой"),
});

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Токен хүчингүй" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId } = paymentSchema.parse(body);

    // Check if course exists
    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: "Сургалт олдсонгүй" }, { status: 404 });
    }

    // Check if user has a registration
    const registration = await db.courseRegistration.findUnique({
      where: { userId_courseId: { userId: payload.userId, courseId } },
    });

    if (!registration) {
      return NextResponse.json({ error: "Эхлээд бүртгүүлэх шаардлагатай" }, { status: 400 });
    }

    // Mark as confirmed (payment successful simulation)
    await db.courseRegistration.update({
      where: { id: registration.id },
      data: { status: "confirmed" },
    });

    return NextResponse.json({
      message: "Төлбөр амжилттай хийгдлээ",
      paid: true,
      courseId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Төлбөр хийхэд алдаа гарлаа" }, { status: 500 });
  }
}

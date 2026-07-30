import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { z } from "zod/v4";

const paymentSchema = z.object({
  quizId: z.string().min(1, "Сорилын ID заавал байх ёстой"),
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
    const { quizId } = paymentSchema.parse(body);

    // Check if quiz exists
    const quiz = await db.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      return NextResponse.json({ error: "Сорил олдсонгүй" }, { status: 404 });
    }

    // Check if user already has a recent attempt (within 24 hours) - avoid double payment
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAttempt = await db.quizAttempt.findFirst({
      where: {
        userId: payload.userId,
        quizId,
        createdAt: { gte: oneDayAgo },
      },
    });

    if (recentAttempt) {
      return NextResponse.json({
        message: "Та саяхан төлбөр төлсөн байна, сорилд хандах боломжтой",
        alreadyPaid: true,
      });
    }

    // In a real application, this would integrate with a payment gateway
    // For now, we simulate the payment as successful
    return NextResponse.json({
      message: "Төлбөр амжилттай хийгдлээ",
      paid: true,
      quizId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Төлбөр хийхэд алдаа гарлаа" }, { status: 500 });
  }
}

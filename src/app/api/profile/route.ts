import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request);
    if (!token) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Токен хүчингүй" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");

    if (!section) {
      const user = await db.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          address: true,
          secondaryPhone: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 });

      return NextResponse.json({ user });
    }

    if (section === "quizzes") {
      const results = await db.quizAttempt.findMany({
        where: { userId: payload.userId },
        orderBy: { createdAt: "desc" },
        include: {
          quiz: { select: { title: true } },
        },
      });

      return NextResponse.json({
        results: results.map((r) => ({
          id: r.id,
          quizId: r.quizId,
          score: r.score,
          total: r.total,
          passed: r.passed,
          createdAt: r.createdAt.toISOString(),
          quiz: r.quiz,
        })),
      });
    }

    if (section === "exams") {
      const results = await db.examAttempt.findMany({
        where: { userId: payload.userId },
        orderBy: { createdAt: "desc" },
        include: {
          exam: { select: { title: true } },
        },
      });

      return NextResponse.json({
        results: results.map((r) => ({
          id: r.id,
          examId: r.examId,
          score: r.score,
          total: r.total,
          passed: r.passed,
          createdAt: r.createdAt.toISOString(),
          exam: r.exam,
        })),
      });
    }

    if (section === "courses") {
      const registrations = await db.courseRegistration.findMany({
        where: { userId: payload.userId },
        orderBy: { createdAt: "desc" },
        include: {
          course: { select: { title: true, category: true, duration: true } },
        },
      });

      return NextResponse.json({
        registrations: registrations.map((r) => ({
          id: r.id,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
          course: r.course,
        })),
      });
    }

    return NextResponse.json({ error: "Тодорхойгүй хүсэлт" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}

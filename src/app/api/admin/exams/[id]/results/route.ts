import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

  try {
    const { id } = await params;
    const exam = await db.exam.findUnique({
      where: { id },
      include: {
        attempts: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!exam) return NextResponse.json({ error: "Шалгалт олдсонгүй" }, { status: 404 });

    const questions = JSON.parse(exam.questions);
    const results = exam.attempts.map((a) => ({
      id: a.id,
      userName: a.userName,
      score: a.score,
      total: a.total,
      passed: a.passed,
      answers: JSON.parse(a.answers),
      createdAt: a.createdAt,
    }));

    return NextResponse.json({
      exam: { ...exam, questions, attempts: undefined },
      results,
      stats: {
        total: results.length,
        passed: results.filter((r) => r.passed).length,
        failed: results.filter((r) => !r.passed).length,
        average: results.length > 0
          ? Math.round(results.reduce((s, r) => s + (r.score / r.total) * 100, 0) / results.length)
          : 0,
      },
    });
  } catch {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

// POST: Verify exam code and get questions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, action } = body;

    if (action === "verify") {
      const exam = await db.exam.findUnique({ where: { code } });
      if (!exam) {
        return NextResponse.json({ error: "Буруу код байна" }, { status: 404 });
      }
      if (!exam.isActive) {
        return NextResponse.json({ error: "Шалгалт идэвхгүй байна" }, { status: 403 });
      }
      return NextResponse.json({
        exam: {
          id: exam.id,
          title: exam.title,
          timeLimit: exam.timeLimit,
          questionCount: JSON.parse(exam.questions).length,
        },
      });
    }

    if (action === "submit") {
      const { examId, answers } = body;
      const token = getTokenFromHeader(request);
      if (!token) {
        return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
      }
      const payload = verifyToken(token);
      if (!payload) {
        return NextResponse.json({ error: "Токен хүчингүй" }, { status: 401 });
      }

      const exam = await db.exam.findUnique({ where: { id: examId } });
      if (!exam) return NextResponse.json({ error: "Шалгалт олдсонгүй" }, { status: 404 });
      if (!exam.isActive) return NextResponse.json({ error: "Шалгалт идэвхгүй байна" }, { status: 403 });

      const questions = JSON.parse(exam.questions);
      let score = 0;
      questions.forEach((q: { correctIndex: number }, idx: number) => {
        if (idx < answers.length && answers[idx] === q.correctIndex) {
          score++;
        }
      });

      const passed = score / questions.length >= 0.7;
      const user = await db.user.findUnique({ where: { id: payload.userId } });

      const attempt = await db.examAttempt.create({
        data: {
          examId,
          userId: payload.userId,
          userName: user ? `${user.lastName} ${user.firstName}` : "Тодорхойгүй",
          answers: JSON.stringify(answers),
          score,
          total: questions.length,
          passed,
        },
      });

      return NextResponse.json({ attemptId: attempt.id, score, total: questions.length, passed });
    }

    return NextResponse.json({ error: "Үйлдэл тодорхойгүй" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}

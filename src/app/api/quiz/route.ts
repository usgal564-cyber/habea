import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!slug) {
      // List all quizzes
      const quizzes = await db.quiz.findMany({
        select: { id: true, title: true, description: true, slug: true, questionCount: true },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json({ quizzes });
    }

    const quiz = await db.quiz.findUnique({
      where: { slug },
      include: {
        questions: {
          orderBy: { questionOrder: "asc" },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Сорил олдсонгүй" }, { status: 404 });
    }

    const totalPages = Math.ceil(quiz.questions.length / limit);
    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    const pageQuestions = quiz.questions.slice(startIdx, endIdx);

    const questionsWithoutAnswers = pageQuestions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      questionOrder: q.questionOrder,
    }));

    return NextResponse.json({
      quiz: { id: quiz.id, title: quiz.title, description: quiz.description, slug: quiz.slug, questionCount: quiz.questionCount },
      questions: questionsWithoutAnswers,
      pagination: { page, totalPages, totalQuestions: quiz.questions.length, limit },
    });
  } catch {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quizId, answers } = body;

    if (!quizId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Мэдээлэл буруу байна" }, { status: 400 });
    }

    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { orderBy: { questionOrder: "asc" } } },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Сорил олдсонгүй" }, { status: 404 });
    }

    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (idx < answers.length && answers[idx] === q.correctIndex) {
        score++;
      }
    });

    const passed = score / quiz.questions.length >= 0.7;

    const token = getTokenFromHeader(request);
    let userId: string | null = null;
    if (token) {
      const payload = verifyToken(token);
      if (payload) userId = payload.userId;
    }

    const attempt = await db.quizAttempt.create({
      data: {
        quizId,
        userId,
        answers: JSON.stringify(answers),
        score,
        total: quiz.questions.length,
        passed,
      },
    });

    return NextResponse.json({ attemptId: attempt.id, score, total: quiz.questions.length, passed });
  } catch {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}

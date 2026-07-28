import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { z } from "zod/v4";

function verifyAdmin(request: NextRequest) {
  const token = getTokenFromHeader(request);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== "ADMIN") return null;
  return payload;
}

// GET: List all exams
export async function GET(request: NextRequest) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

  try {
    const exams = await db.exam.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { attempts: true } } },
    });
    return NextResponse.json({ exams });
  } catch {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}

// POST: Create exam
export async function POST(request: NextRequest) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

  try {
    const body = await request.json();
    const { title, questions, timeLimit, code } = body;

    const examSchema = z.object({
      title: z.string().min(1),
      questions: z.string().min(1),
      timeLimit: z.number().optional(),
      code: z.string().min(6),
    });
    const data = examSchema.parse(body);

    const existing = await db.exam.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: "Энэ кодтой шалгалт аль хэдийн байна" }, { status: 409 });
    }

    const exam = await db.exam.create({
      data: {
        title: data.title,
        questions: data.questions,
        timeLimit: data.timeLimit || 30,
        code: data.code,
        createdBy: admin.userId,
      },
    });

    return NextResponse.json({ exam }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}

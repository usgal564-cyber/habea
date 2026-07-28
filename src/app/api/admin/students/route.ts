import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

function verifyAdmin(request: NextRequest) {
  const token = getTokenFromHeader(request);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== "ADMIN") return null;
  return payload;
}

export async function GET(request: NextRequest) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

  try {
    const users = await db.user.findMany({
      where: { role: "USER" },
      orderBy: { createdAt: "desc" },
      include: {
        courseRegistrations: {
          include: { course: true },
        },
        examAttempts: {
          include: { exam: true },
        },
        quizAttempts: {
          include: { quiz: true },
        },
      },
    });

    const students = users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      address: u.address,
      secondaryPhone: u.secondaryPhone,
      createdAt: u.createdAt,
      courseCount: u.courseRegistrations.length,
      examAttemptCount: u.examAttempts.length,
      quizAttemptCount: u.quizAttempts.length,
      courses: u.courseRegistrations.map((cr) => ({
        title: cr.course.title,
        status: cr.status,
        enrolledAt: cr.createdAt,
      })),
      examScores: u.examAttempts.map((ea) => ({
        examTitle: ea.exam.title,
        score: ea.score,
        total: ea.total,
        passed: ea.passed,
        date: ea.createdAt,
      })),
    }));

    return NextResponse.json({ students });
  } catch {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}

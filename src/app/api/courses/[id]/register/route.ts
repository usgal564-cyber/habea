import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromHeader(request);
    if (!token) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Токен хүчингүй" }, { status: 401 });

    const { id } = await params;

    const existing = await db.courseRegistration.findUnique({
      where: { userId_courseId: { userId: payload.userId, courseId: id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Та аль хэдийн бүртгүүлсэн байна" }, { status: 409 });
    }

    const registration = await db.courseRegistration.create({
      data: {
        userId: payload.userId,
        courseId: id,
      },
    });

    return NextResponse.json({ registration, message: "Амжилттай бүртгэгдлээ" });
  } catch {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}

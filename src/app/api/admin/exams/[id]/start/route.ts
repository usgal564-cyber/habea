import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

  try {
    const { id } = await params;
    const exam = await db.exam.findUnique({ where: { id } });
    if (!exam) return NextResponse.json({ error: "Шалгалт олдсонгүй" }, { status: 404 });

    const updated = await db.exam.update({
      where: { id },
      data: { isActive: true },
    });

    return NextResponse.json({ exam: updated, message: "Шалгалт эхэллээ" });
  } catch {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

  try {
    const { id } = await params;
    await db.examAttempt.deleteMany({ where: { examId: id } });
    await db.exam.delete({ where: { id } });
    return NextResponse.json({ message: "Шалгалт устгагдлаа" });
  } catch {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}

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

// GET: List all courses
export async function GET(request: NextRequest) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

  try {
    const courses = await db.course.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { registrations: true } } },
    });
    return NextResponse.json({ courses });
  } catch {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}

// POST: Create a course
export async function POST(request: NextRequest) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

  try {
    const body = await request.json();

    const courseSchema = z.object({
      title: z.string().min(2, "Сургалтын нэр оруулна уу"),
      category: z.string().min(1, "Ангилал сонгоно уу"),
      description: z.string().min(5, "Тайлбар оруулна уу"),
      duration: z.string().min(1, "Хугацаа оруулна уу"),
      price: z.number().optional().nullable(),
      maxStudents: z.number().optional().nullable(),
    });

    const data = courseSchema.parse(body);

    const course = await db.course.create({
      data: {
        title: data.title,
        category: data.category,
        description: data.description,
        duration: data.duration,
        price: data.price ?? null,
        maxStudents: data.maxStudents ?? null,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}

// DELETE: Delete a course
export async function DELETE(request: NextRequest) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("id");

    if (!courseId) {
      return NextResponse.json({ error: "Course ID шаардлагатай" }, { status: 400 });
    }

    await db.courseRegistration.deleteMany({ where: { courseId } });
    await db.course.delete({ where: { id: courseId } });

    return NextResponse.json({ message: "Сургалт устгагдлаа" });
  } catch {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}

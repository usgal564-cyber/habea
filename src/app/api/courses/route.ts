import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: List all courses
export async function GET() {
  try {
    const courses = await db.course.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { registrations: true } } },
    });
    return NextResponse.json({ courses });
  } catch {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}

// POST: Create course (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, category, description, duration, price, maxStudents } = body;

    const course = await db.course.create({
      data: {
        title,
        category,
        description,
        duration,
        price: price || null,
        maxStudents: maxStudents || null,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}

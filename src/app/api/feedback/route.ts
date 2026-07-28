import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const feedbackSchema = z.object({
  name: z.string().min(1, "Нэрээ оруулна уу"),
  email: z.string().optional(),
  phone: z.string().optional(),
  category: z.string().min(1, "Ангилал сонгоно уу"),
  message: z.string().min(1, "Санал хүсэлтээ бичнэ үү"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = feedbackSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Мэдээллийн алдаа", details: result.error.errors },
        { status: 400 }
      );
    }

    const feedback = await db.feedback.create({
      data: {
        name: result.data.name,
        email: result.data.email || null,
        phone: result.data.phone || null,
        category: result.data.category,
        message: result.data.message,
      },
    });

    return NextResponse.json(
      { message: "Амжилттай хадгалагдлаа", id: feedback.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Серверийн алдаа гарлаа" },
      { status: 500 }
    );
  }
}

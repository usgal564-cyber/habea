import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const surveySchema = z.object({
  name: z.string().min(1, "Нэрээ оруулна уу"),
  email: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  responses: z.string().min(1, "Хариулт байхгүй байна"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = surveySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Мэдээллийн алдаа", details: result.error.errors },
        { status: 400 }
      );
    }

    const survey = await db.surveyResponse.create({
      data: {
        name: result.data.name,
        email: result.data.email || null,
        phone: result.data.phone || null,
        company: result.data.company || null,
        responses: result.data.responses,
      },
    });

    return NextResponse.json(
      { message: "Амжилттай хадгалагдлаа", id: survey.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Survey error:", error);
    return NextResponse.json(
      { error: "Серверийн алдаа гарлаа" },
      { status: 500 }
    );
  }
}

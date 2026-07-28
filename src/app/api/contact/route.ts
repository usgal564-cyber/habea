import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Нэрээ оруулна уу"),
  email: z.string().email("Зөв и-мэйл хаяг оруулна уу"),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(1, "Зурвасаа бичнэ үү"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Мэдээллийн алдаа", details: result.error.errors },
        { status: 400 }
      );
    }

    const contact = await db.contactForm.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone || null,
        company: result.data.company || null,
        message: result.data.message,
      },
    });

    return NextResponse.json(
      { message: "Амжилттай хадгалагдлаа", id: contact.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Серверийн алдаа гарлаа" },
      { status: 500 }
    );
  }
}

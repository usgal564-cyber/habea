import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createToken } from "@/lib/auth";
import { z } from "zod/v4";

const registerSchema = z.object({
  firstName: z.string().min(2, "Нэр оруулна уу"),
  lastName: z.string().min(2, "Овог оруулна уу"),
  email: z.email("Зөв имэйл хаяг оруулна уу"),
  phone: z.string().min(8, "Утасны дугаар оруулна уу"),
  address: z.string().optional(),
  secondaryPhone: z.string().optional(),
  password: z.string().min(6, "Нууц үг дор хаяж 6 тэмдэгт байх ёстой"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "Энэ имэйл хаягаар бүртгэлтэй байна" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await db.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address || null,
        secondaryPhone: data.secondaryPhone || null,
        password: hashedPassword,
        role: "USER",
      },
    });

    const token = createToken({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({
      token,
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Бүртгэлээд алдаа гарлаа" }, { status: 500 });
  }
}

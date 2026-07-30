import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createToken } from "@/lib/auth";
import { z } from "zod/v4";

const loginSchema = z.object({
  email: z.email("Зөв имэйл хаяг оруулна уу"),
  password: z.string().min(1, "Нууц үг оруулна уу"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Имэйл эсвэл нууц үг буруу байна" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Имэйл эсвэл нууц үг буруу байна" }, { status: 401 });
    }

    const token = createToken({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({
      token,
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Нэвтрэхэд алдаа гарлаа" }, { status: 500 });
  }
}

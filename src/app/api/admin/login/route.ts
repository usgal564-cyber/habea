import { NextRequest, NextResponse } from "next/server";
import { createToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod/v4";

const adminLoginSchema = z.object({
  code: z.string().min(1, "Админ код оруулна уу"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = adminLoginSchema.parse(body);

    // Check admin code from environment or use default
    const adminCode = process.env.ADMIN_CODE || "HABEA2025ADMIN";

    if (code !== adminCode) {
      return NextResponse.json(
        { error: "Админ код буруу байна" },
        { status: 401 }
      );
    }

    // Find or create admin user
    let admin = await db.user.findFirst({ where: { role: "ADMIN" } });

    if (!admin) {
      admin = await db.user.create({
        data: {
          firstName: "Админ",
          lastName: "ХАБЭА",
          email: "admin@habea.mn",
          phone: "7700-0000",
          password: "admin_only_code_login",
          role: "ADMIN",
        },
      });
    }

    const token = createToken({
      userId: admin.id,
      email: admin.email,
      role: "ADMIN",
    });

    return NextResponse.json({
      token,
      user: {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Нэвтрэхэд алдаа гарлаа" }, { status: 500 });
  }
}

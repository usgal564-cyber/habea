import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const serviceOrderSchema = z.object({
  name: z.string().min(1, "Нэрээ оруулна уу"),
  email: z.string().email("Зөв и-мэйл хаяг оруулна уу"),
  phone: z.string().min(1, "Утсаа оруулна уу"),
  company: z.string().optional(),
  serviceType: z.string().min(1, "Үйлчилгээний төрөл сонгоно уу"),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = serviceOrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Мэдээллийн алдаа", details: result.error.errors },
        { status: 400 }
      );
    }

    const order = await db.serviceOrder.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone,
        company: result.data.company || null,
        serviceType: result.data.serviceType,
        description: result.data.description || null,
      },
    });

    return NextResponse.json(
      { message: "Захиалга амжилттай хадгалагдлаа", id: order.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Service order error:", error);
    return NextResponse.json(
      { error: "Серверийн алдаа гарлаа" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

const consultationSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  phone: z.string().min(8),
  company: z.string().optional(),
  serviceType: z.string().min(1),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = consultationSchema.parse(body);

    const request2 = await db.consultationRequest.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company || null,
        serviceType: data.serviceType,
        description: data.description || null,
      },
    });

    return NextResponse.json({ id: request2.id, message: "Амжилттай илгээгдлээ" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}

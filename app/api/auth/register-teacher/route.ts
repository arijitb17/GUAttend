import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    const hashedPassword = await hashPassword(password);

    // Create a teacher with role TEACHER but status = 'PENDING'
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.TEACHER,
      },
    });

    return NextResponse.json({
      message: "Teacher registration submitted. Awaiting admin approval.",
      userId: user.id,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to register teacher" }, { status: 500 });
  }
}

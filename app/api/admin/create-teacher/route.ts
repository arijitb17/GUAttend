import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import { hashPassword, verifyToken } from "@/lib/auth";
import type { JwtPayload } from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { token, name, email, password, departmentId } = await req.json();

    // Cast decoded to include role
    const decoded = verifyToken(token) as JwtPayload & { role?: string; id?: string };

    if (!decoded || decoded.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.TEACHER,
        teacher: {
          create: {
            departmentId,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Teacher created successfully",
      user,
    });
  } catch (error) {
    console.error("Teacher creation failed:", error);
    return NextResponse.json({ error: "Failed to create teacher" }, { status: 500 });
  }
}

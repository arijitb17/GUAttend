import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import type { JwtPayload } from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { token, teacherId, departmentId } = await req.json();

    const decoded = verifyToken(token) as JwtPayload & { role?: string; id?: string };

    if (!decoded || decoded.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!departmentId) {
      return NextResponse.json({ error: "Department ID is required" }, { status: 400 });
    }

    // Use upsert: update if exists, create if missing
    const teacher = await prisma.teacher.upsert({
      where: { userId: teacherId },
      update: { departmentId },
      create: { userId: teacherId, departmentId },
    });

    return NextResponse.json({
      message: "Teacher approved successfully",
      teacher,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to approve teacher" }, { status: 500 });
  }
}

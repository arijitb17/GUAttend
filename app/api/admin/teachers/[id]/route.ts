import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import type { JwtPayload } from "jsonwebtoken";

const prisma = new PrismaClient();

export async function DELETE(req: NextRequest, context: any) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token || "") as JwtPayload & { role?: string };

    if (!decoded || decoded.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = context.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { teacher: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.teacher) {
      await prisma.teacher.delete({ where: { id: user.teacher.id } });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("Failed to delete teacher:", error);
    return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 });
  }
}

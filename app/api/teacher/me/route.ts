import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    if (decoded.role !== "TEACHER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const teacher = await prisma.teacher.findUnique({
      where: { userId: decoded.id },
      include: { user: true, department: true, courses: true },
    });

    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

    return NextResponse.json({
      id: teacher.id,
      name: teacher.user.name,
      department: teacher.department.name,
      courses: teacher.courses.map(c => ({ id: c.id, name: c.name })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

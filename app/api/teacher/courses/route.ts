// app/api/teacher/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // 2️⃣ Decode JWT
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };


    if (decoded.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3️⃣ Fetch teacher using userId (User.id from JWT)
    const teacher = await prisma.teacher.findUnique({
      where: { userId: decoded.id }, // fetch from Teacher table using userId
      select: { id: true, userId: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }
    console.log("Teacher found:", teacher);

    // 4️⃣ Fetch courses assigned to this teacher
    const courses = await prisma.course.findMany({
      where: { teacherId: teacher.id },
      include: {
        semester: {
          include: {
            academicYear: {
              include: {
                program: {
                  include: { department: true },
                },
              },
            },
          },
        },
        students: {
          select: {
            id: true,
            user: { select: { name: true, email: true } },
          },
        },
        _count: {
          select: {
            students: true,
            attendance: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error in teacher/courses:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// app/api/teacher/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };

    if (decoded.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: decoded.id },
      select: { id: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // 1️⃣ Fetch courses
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
          select: { id: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // 2️⃣ Compute REAL session count per course
    const result = await Promise.all(
      courses.map(async (course) => {
        const sessions = await prisma.attendance.findMany({
          where: { courseId: course.id },
          select: { timestamp: true },
          distinct: ["timestamp"], // ✅ THIS IS THE KEY
        });

        return {
          ...course,
          _count: {
            students: course.students.length,
            attendance: sessions.length, // ✅ real sessions
          },
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in teacher/courses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

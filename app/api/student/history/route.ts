// app/api/student/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
}

export async function GET(request: NextRequest) {
  try {
    const decoded = verifyToken(request);
    if (decoded.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // ✅ Get student record
    const student = await prisma.student.findUnique({
      where: { userId: decoded.userId },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // ✅ Get all attendance records for this student with course details
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: student.id,
      },
      include: {
        course: {
          select: {
            name: true,
            code: true,      // 👈 use the real `code` field from DB
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // ✅ Format the records for frontend
    const formattedRecords = attendanceRecords.map((record) => ({
      id: record.id,
      course: record.course
        ? {
            name: record.course.name,
            code: record.course.code, 
          }
        : {
            name: "Unknown Course",
            code: "N/A",
          },
      status: record.status,
      timestamp: record.timestamp.toISOString(),
    }));

    return NextResponse.json(formattedRecords);
  } catch (error: any) {
    console.error("Student History API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

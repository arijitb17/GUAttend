// app/api/student/courses/[id]/attendance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface JWTPayload {
  userId: string;
  role: string;
}

export async function GET(request: NextRequest, context: any) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded: JWTPayload;

    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (decoded.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Access denied. Students only." },
        { status: 403 }
      );
    }

    const { id: courseId } = context.params;

    // ✅ Verify student exists
    const student = await prisma.student.findUnique({
      where: { userId: decoded.userId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student record not found" },
        { status: 404 }
      );
    }

    // ✅ Check enrollment
    const enrollment = await prisma.course.findFirst({
      where: {
        id: courseId,
        students: { some: { id: student.id } },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    // ✅ Fetch attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId: student.id, courseId },
      select: {
        id: true,
        status: true,
        timestamp: true,
        course: { select: { name: true } },
      },
      orderBy: { timestamp: "desc" },
    });

    // ✅ Calculate stats
    const totalSessions = attendanceRecords.length;
    const attended = attendanceRecords.filter((r) => r.status).length;
    const absent = totalSessions - attended;
    const attendanceRate =
      totalSessions > 0 ? (attended / totalSessions) * 100 : 0;

    return NextResponse.json(
      {
        records: attendanceRecords,
        statistics: {
          totalSessions,
          attended,
          absent,
          attendanceRate: Math.round(attendanceRate * 10) / 10,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance records" },
      { status: 500 }
    );
  }
}

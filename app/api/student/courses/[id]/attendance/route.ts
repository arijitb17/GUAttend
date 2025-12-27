// app/api/student/courses/[id]/attendance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

interface JWTPayload {
  userId: string;
  role: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
      }
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

    const { id: courseId } = await params;

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

    // ✅ Fetch attendance records for THIS student
    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId: student.id, courseId },
      select: {
        id: true,
        status: true,
        timestamp: true,
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            entryCode: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    // ✅ Get ALL attendance for the course (to calculate total sessions)
    const allCourseAttendance = await prisma.attendance.findMany({
      where: { courseId },
      select: { timestamp: true, studentId: true, status: true },
    });

    // ✅ Calculate unique dates (sessions) - SAME LOGIC AS OTHER APIs
    const uniqueDates = new Set(
      allCourseAttendance.map(record => 
        record.timestamp.toISOString().split('T')[0]
      )
    );
    const totalSessions = uniqueDates.size;

    // ✅ Calculate sessions student attended (deduplicate by date)
    const studentAttendedDates = new Set(
      allCourseAttendance
        .filter(record => record.studentId === student.id && record.status === true)
        .map(record => record.timestamp.toISOString().split('T')[0])
    );
    const attended = studentAttendedDates.size;

    const absent = totalSessions - attended;
    const attendanceRate = totalSessions > 0 ? (attended / totalSessions) * 100 : 0;

    // ✅ Deduplicate records by date (keep one per day) - SAME LOGIC
    const uniqueRecords = Array.from(
      attendanceRecords
        .reduce((map, record) => {
          const dateKey = record.timestamp.toISOString().split('T')[0];
          // Keep first occurrence for each date
          if (!map.has(dateKey)) {
            map.set(dateKey, record);
          }
          return map;
        }, new Map())
        .values()
    );

    return NextResponse.json(
      {
        records: uniqueRecords,
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
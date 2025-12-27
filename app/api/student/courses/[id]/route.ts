// app/api/student/courses/[id]/route.ts
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

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { name: true } },
          },
        },
        semester: {
          include: {
            academicYear: {
              include: {
                program: { select: { name: true } },
              },
            },
          },
        },
        _count: { 
          select: { 
            students: true,
          } 
        },
        students: {
          where: { id: student.id },
          select: { id: true },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    if (course.students.length === 0) {
      return NextResponse.json(
        { error: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    // ✅ Calculate unique sessions (one per day) - SAME LOGIC AS OTHER APIs
    const attendanceRecords = await prisma.attendance.findMany({
      where: { courseId: course.id },
      select: { timestamp: true },
    });

    // Deduplicate by date
    const uniqueDates = new Set(
      attendanceRecords.map(record => 
        record.timestamp.toISOString().split('T')[0]
      )
    );

    const { students: _ignored, ...courseData } = course;

    return NextResponse.json(
      {
        ...courseData,
        _count: {
          ...courseData._count,
          attendance: uniqueDates.size,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching course details:", error);
    return NextResponse.json(
      { error: "Failed to fetch course details" },
      { status: 500 }
    );
  }
}
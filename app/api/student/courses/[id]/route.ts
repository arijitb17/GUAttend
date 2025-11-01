// app/api/student/courses/[id]/route.ts
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

    // Verify student exists
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

    // Fetch course details
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
        _count: { select: { students: true, attendance: true } },
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

    // Check enrollment
    if (course.students.length === 0) {
      return NextResponse.json(
        { error: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    // Exclude `students` field before returning
    const { students: _, ...courseData } = course;

    return NextResponse.json(courseData, { status: 200 });
  } catch (error) {
    console.error("Error fetching course details:", error);
    return NextResponse.json(
      { error: "Failed to fetch course details" },
      { status: 500 }
    );
  }
}

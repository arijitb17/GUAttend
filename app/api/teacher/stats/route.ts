// app/api/teacher/stats/route.ts
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
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

    if (decoded.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: decoded.userId },
      select: { id: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Get total courses taught by this teacher
    const courses = await prisma.course.count({
      where: { teacherId: teacher.id },
    });

    // Get total unique students across all teacher's courses
    const coursesWithStudents = await prisma.course.findMany({
      where: { teacherId: teacher.id },
      select: {
        students: {
          select: { id: true },
        },
      },
    });
    
    const uniqueStudentIds = new Set(
      coursesWithStudents.flatMap(course => course.students.map(s => s.id))
    );
    const totalStudents = uniqueStudentIds.size;

    // Get total unique semesters where teacher has courses
    const semestersWithCourses = await prisma.course.findMany({
      where: { teacherId: teacher.id },
      select: {
        semesterId: true,
      },
      distinct: ['semesterId'],
    });
    const totalSemesters = semestersWithCourses.length;

    // Get total attendance records across all teacher's courses
    const totalAttendance = await prisma.attendance.count({
      where: {
        course: {
          teacherId: teacher.id,
        },
        status: true, // Only count present attendance
      },
    });

    return NextResponse.json({
      courses,
      totalStudents,
      totalSemesters,
      totalAttendance,
    });
  } catch (error) {
    console.error("Error in teacher/stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
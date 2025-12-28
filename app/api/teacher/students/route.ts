// app/api/teacher/students/route.ts
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
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };

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

    // Get filters from query params
    const { searchParams } = new URL(req.url);
    const courseIdFilter = searchParams.get("courseId");
    const programIdFilter = searchParams.get("programId");

    // Build where clause for courses
    const courseWhere: any = { teacherId: teacher.id };
    if (courseIdFilter) {
      courseWhere.id = courseIdFilter;
    }

    // Build where clause for students
    const studentWhere: any = {};
    if (programIdFilter) {
      studentWhere.programId = programIdFilter;
    }

    // Get all courses for this teacher with students
    const courses = await prisma.course.findMany({
      where: courseWhere,
      include: {
        students: {
          where: studentWhere, // Filter students by program if specified
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            program: {
              include: {
                department: true,
              },
            },
            courses: {
              where: { teacherId: teacher.id }, // Only teacher's courses
              select: {
                id: true,
                name: true,
                entryCode: true,
              },
            },
          },
        },
      },
    });

    // Get unique students across filtered courses
    const studentMap = new Map<string, any>();
    
    for (const course of courses) {
      for (const student of course.students) {
        if (!studentMap.has(student.id)) {
          // Count attendance ONLY for this teacher's courses
          const attendanceCount = await prisma.attendance.count({
            where: {
              studentId: student.id,
              course: {
                teacherId: teacher.id, // ← FIX: Only count attendance in YOUR courses
              },
            },
          });

          // Count courses taught by this teacher
          const coursesCount = await prisma.course.count({
            where: {
              teacherId: teacher.id,
              students: {
                some: {
                  id: student.id,
                },
              },
            },
          });

          studentMap.set(student.id, {
            id: student.id,
            user: student.user,
            program: student.program,
            faceEmbedding: !!student.faceEmbedding,
            courses: student.courses, // Include courses array
            _count: {
              courses: coursesCount, // Only YOUR courses
              attendance: attendanceCount, // Only attendance in YOUR courses
            },
          });
        } else {
          // If student already exists, merge courses to avoid duplicates
          const existing = studentMap.get(student.id);
          const existingCourseIds = new Set(existing.courses.map((c: any) => c.id));
          for (const studentCourse of student.courses) {
            if (!existingCourseIds.has(studentCourse.id)) {
              existing.courses.push(studentCourse);
            }
          }
        }
      }
    }

    const students = Array.from(studentMap.values());

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error in teacher/students:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
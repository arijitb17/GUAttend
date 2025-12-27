// app/api/teacher/courses/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Reuse Prisma client (important for Next.js dev + serverless)
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

const prisma =
  globalThis.__prisma__ ??
  new PrismaClient({
    log: ["error"],
  });

if (!globalThis.__prisma__) {
  globalThis.__prisma__ = prisma;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    /* -------------------------------------------------- */
    /* AUTH                                                */
    /* -------------------------------------------------- */

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    let decoded: any;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (decoded.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { courseId } = await params;

    /* -------------------------------------------------- */
    /* TEACHER CHECK                                       */
    /* -------------------------------------------------- */

    const teacher = await prisma.teacher.findUnique({
      where: { userId: decoded.userId },
      select: { id: true },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    /* -------------------------------------------------- */
    /* COURSE + RELATIONS                                  */
    /* -------------------------------------------------- */

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        semester: {
          include: {
            academicYear: {
              include: {
                program: {
                  include: {
                    department: true,
                  },
                },
              },
            },
          },
        },
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        students: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            program: {
              select: {
                name: true,
                department: {
                  select: { name: true },
                },
              },
            },
          },
          orderBy: {
            user: { name: "asc" },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    if (course.teacherId !== teacher.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    /* -------------------------------------------------- */
    /* TOTAL UNIQUE SESSIONS                                */
    /* -------------------------------------------------- */

    const uniqueSessions = await prisma.attendance.groupBy({
      by: ["timestamp"],
      where: { courseId },
    });

    const totalSessions = uniqueSessions.length;

    /* -------------------------------------------------- */
    /* STUDENT ATTENDANCE COUNTS (FIXED)                    */
    /* -------------------------------------------------- */

    const studentsWithAttendance = await Promise.all(
      course.students.map(async (student) => {
        // ✅ FIX: Count unique sessions attended, not total records
        const attendedSessions = await prisma.attendance.groupBy({
          by: ["timestamp"],
          where: {
            courseId,
            studentId: student.id,
            status: true,
          },
        });

        return {
          ...student,
          faceEmbedding: !!student.faceEmbedding,
          _count: {
            attendance: attendedSessions.length, // ✅ Count unique sessions
          },
        };
      })
    );

    /* -------------------------------------------------- */
    /* RECENT SESSIONS (optional list)                      */
    /* -------------------------------------------------- */

    const recentSessions = await prisma.attendance.findMany({
      where: { courseId },
      select: {
        id: true,
        timestamp: true,
        student: {
          select: {
            user: { select: { name: true } },
          },
        },
        status: true,
      },
      orderBy: { timestamp: "desc" },
      take: 50,
    });

    /* -------------------------------------------------- */
    /* FINAL RESPONSE                                      */
    /* -------------------------------------------------- */

    return NextResponse.json(
      {
        ...course,
        students: studentsWithAttendance,
        attendance: recentSessions,
        _count: {
          students: course.students.length,
          attendance: totalSessions, // ✅ CORRECT
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Teacher course detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
// app/api/teacher/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Reuse PrismaClient (important for serverless)
 */
declare global {
  // eslint-disable-next-line no-var
  var __global_prisma__: PrismaClient | undefined;
}
const prisma: PrismaClient =
  globalThis.__global_prisma__ ?? new PrismaClient();
if (!globalThis.__global_prisma__)
  (globalThis as any).__global_prisma__ = prisma;

type AttendancePoint = { day: string; present: number };
type MonthlyCourse = { month: string; courses: number };

export async function GET(req: NextRequest) {
  try {
    /* ---------------- AUTH ---------------- */
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

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

    /* ---------------- BASIC COUNTS ---------------- */

    const courses = await prisma.course.count({
      where: { teacherId: teacher.id },
    });

    const coursesWithStudents = await prisma.course.findMany({
      where: { teacherId: teacher.id },
      select: { students: { select: { id: true } } },
    });

    const totalStudents = new Set(
      coursesWithStudents.flatMap((c) => c.students.map((s) => s.id))
    ).size;

    const semesters = await prisma.course.findMany({
      where: { teacherId: teacher.id },
      select: { semesterId: true },
      distinct: ["semesterId"],
    });

    const totalSemesters = semesters.length;

    /* ---------------- ATTENDANCE DATA ---------------- */

    const teacherCourses = await prisma.course.findMany({
      where: { teacherId: teacher.id },
      select: { id: true },
    });
    const courseIds = teacherCourses.map((c) => c.id);

    if (courseIds.length === 0) {
      return NextResponse.json({
        courses,
        totalStudents,
        totalSemesters,
        totalAttendance: 0,
        attendanceTrend: [],
        monthlyCourses: [],
      });
    }

    const attendances = await prisma.attendance.findMany({
      where: {
        courseId: { in: courseIds },
      },
      select: {
        status: true,
        timestamp: true,
        courseId: true,
      },
    });

    /* ---------------- FIX: COUNT TOTAL SESSIONS PER COURSE ----------------
       For each course, count unique timestamps, then sum them up.
       This gives you total sessions across all courses.
    */
    const sessionsPerCourse = new Map<string, Set<string>>();
    
    for (const a of attendances) {
      const courseId = a.courseId;
      const sessionKey = a.timestamp.toISOString();
      
      if (!sessionsPerCourse.has(courseId)) {
        sessionsPerCourse.set(courseId, new Set());
      }
      sessionsPerCourse.get(courseId)!.add(sessionKey);
    }

    // Sum up all unique sessions across all courses
    let totalAttendance = 0;
    for (const sessions of sessionsPerCourse.values()) {
      totalAttendance += sessions.size;
    }

    /* ---------------- DAILY TREND ---------------- */
    const trendMap = new Map<string, number>();
    for (const a of attendances) {
      if (!a.status) continue;
      const day = a.timestamp.toISOString().slice(0, 10);
      trendMap.set(day, (trendMap.get(day) || 0) + 1);
    }

    const attendanceTrend: AttendancePoint[] = Array.from(trendMap.entries())
      .map(([day, present]) => ({ day, present }))
      .sort((a, b) => a.day.localeCompare(b.day));

    /* ---------------- MONTHLY ACTIVE COURSES ---------------- */
    const now = new Date();
    const monthsBack = 6;
    const monthlyBuckets = new Map<string, Set<string>>();

    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthlyBuckets.set(label, new Set());
    }

    for (const a of attendances) {
      const label = a.timestamp.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      if (monthlyBuckets.has(label)) {
        monthlyBuckets.get(label)!.add(a.courseId);
      }
    }

    const monthlyCourses: MonthlyCourse[] = Array.from(
      monthlyBuckets.entries()
    ).map(([month, set]) => ({
      month,
      courses: set.size,
    }));

    /* ---------------- RESPONSE ---------------- */
    return NextResponse.json({
      courses,
      totalStudents,
      totalSemesters,
      totalAttendance, // ✅ Now correctly counts sessions per course and sums them
      attendanceTrend,
      monthlyCourses,
    });
  } catch (error) {
    console.error("Error in teacher/stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
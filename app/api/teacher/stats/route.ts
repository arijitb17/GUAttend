// app/api/teacher/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Reuse a single PrismaClient instance across invocations to avoid
 * exhausting DB connections in serverless/hot-reload environments.
 */
declare global {
  // eslint-disable-next-line no-var
  var __global_prisma__: PrismaClient | undefined;
}
const prisma: PrismaClient = globalThis.__global_prisma__ ?? new PrismaClient();
if (!globalThis.__global_prisma__) (globalThis as any).__global_prisma__ = prisma;

type AttendancePoint = { day: string; present: number };
type MonthlyCourse = { month: string; courses: number };

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId?: string; role?: string };
    } catch (err) {
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

    // -------------------------
    // Basic counts (unchanged)
    // -------------------------
    const courses = await prisma.course.count({
      where: { teacherId: teacher.id },
    });

    const coursesWithStudents = await prisma.course.findMany({
      where: { teacherId: teacher.id },
      select: {
        students: {
          select: { id: true },
        },
      },
    });

    const uniqueStudentIds = new Set(
      coursesWithStudents.flatMap((course) => course.students.map((s) => s.id))
    );
    const totalStudents = uniqueStudentIds.size;

    const semestersWithCourses = await prisma.course.findMany({
      where: { teacherId: teacher.id },
      select: { semesterId: true },
      distinct: ["semesterId"],
    });
    const totalSemesters = semestersWithCourses.length;

    const totalAttendance = await prisma.attendance.count({
      where: {
        course: {
          teacherId: teacher.id,
        },
        status: true, // only present
      },
    });

    // -------------------------------------------------------
    // Chart data: attendanceTrend (by day) and monthlyCourses
    // -------------------------------------------------------
    // Strategy:
    //  - get teacher's courseIds
    //  - fetch attendances for a reasonable window (last 90 days)
    //  - group by date for attendanceTrend
    //  - build monthly buckets for last 6 months and count distinct courses with activity
    const now = new Date();
    const daysBack = 90;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysBack);

    const teacherCourses = await prisma.course.findMany({
      where: { teacherId: teacher.id },
      select: { id: true },
    });
    const courseIds = teacherCourses.map((c) => c.id);

    // If no courses, the queries return empty arrays naturally
    const attendanceWhere =
      courseIds.length > 0
        ? { courseId: { in: courseIds }, timestamp: { gte: startDate } }
        : { id: { equals: "__no_result__" } };

    const attendances = await prisma.attendance.findMany({
      where: attendanceWhere,
      select: { status: true, timestamp: true, courseId: true },
      orderBy: { timestamp: "asc" },
    });

    // attendanceTrend: group present counts by YYYY-MM-DD
    const trendMap = new Map<string, number>();
    for (const a of attendances) {
      const day = a.timestamp.toISOString().slice(0, 10);
      if (!trendMap.has(day)) trendMap.set(day, 0);
      if (a.status) trendMap.set(day, (trendMap.get(day) || 0) + 1);
    }
    const attendanceTrend: AttendancePoint[] = Array.from(trendMap.entries())
      .map(([day, present]) => ({ day, present }))
      .sort((a, b) => a.day.localeCompare(b.day));

    // monthlyCourses: distinct active courses per month (last 6 months)
    const monthsBack = 6;
    const monthlyBuckets = new Map<string, Set<string>>();
    for (let i = monthsBack - 1; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = dt.toLocaleString("default", { month: "short", year: "numeric" }); // e.g. "Nov 2025"
      monthlyBuckets.set(label, new Set());
    }

    for (const a of attendances) {
      const dt = a.timestamp;
      const label = dt.toLocaleString("default", { month: "short", year: "numeric" });
      if (monthlyBuckets.has(label)) {
        monthlyBuckets.get(label)!.add(a.courseId);
      }
    }

    const monthlyCourses: MonthlyCourse[] = Array.from(monthlyBuckets.entries()).map(([month, set]) => ({
      month,
      courses: set.size,
    }));

    return NextResponse.json({
      courses,
      totalStudents,
      totalSemesters,
      totalAttendance,
      attendanceTrend,
      monthlyCourses,
    });
  } catch (error) {
    console.error("Error in teacher/stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

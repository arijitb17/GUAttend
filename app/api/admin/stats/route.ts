// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Use Prisma count queries
    const [teachersCount, studentsCount, departmentsCount, programsCount, coursesCount] =
      await Promise.all([
        prisma.teacher.count(),
        prisma.student.count(),
        prisma.department.count(),
        prisma.program.count(),
        prisma.course.count(),
      ]);

    return NextResponse.json({
      teachers: teachersCount,
      students: studentsCount,
      departments: departmentsCount,
      programs: programsCount,
      courses: coursesCount,
      success: true,
    });
  } catch (err) {
    console.error("GET /api/admin/stats error:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

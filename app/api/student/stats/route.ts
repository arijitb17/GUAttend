// app/api/student/stats/route.ts
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

    if (decoded.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: decoded.userId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get total courses enrolled by student
    const totalCourses = await prisma.course.count({
      where: {
        students: {
          some: {
            id: student.id,
          },
        },
      },
    });

    // Get student's courses to calculate stats
    const studentCourses = await prisma.course.findMany({
      where: {
        students: {
          some: {
            id: student.id,
          },
        },
      },
      select: {
        id: true,
      },
    });

    const courseIds = studentCourses.map(c => c.id);

    // Total attendance records for this student
    const totalAttendanceRecords = await prisma.attendance.count({
      where: {
        studentId: student.id,
        courseId: {
          in: courseIds,
        },
      },
    });

    // Present attendance count
    const presentAttendance = await prisma.attendance.count({
      where: {
        studentId: student.id,
        status: true, // Present
      },
    });

    // Calculate attendance percentage
    const attendancePercentage = totalAttendanceRecords > 0 
      ? Math.round((presentAttendance / totalAttendanceRecords) * 100)
      : 0;

    // Total classes attended (present count)
    const totalPresent = presentAttendance;

    return NextResponse.json({
      totalCourses,
      attendancePercentage,
      totalPresent,
    });
  } catch (error) {
    console.error("Error in student/stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
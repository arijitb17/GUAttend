// app/api/student/stats/route.ts
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

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    if (!JWT_SECRET) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

    if (decoded.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: decoded.userId },
      include: {
        courses: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const totalCourses = student.courses.length;
    const enrolledCourseIds = student.courses.map(c => c.id);

    if (enrolledCourseIds.length === 0) {
      return NextResponse.json({
        totalCourses: 0,
        attendancePercentage: 0,
        totalPresent: 0,
      });
    }

    // ✅ Get attendance records ONLY for this student in enrolled courses
    const attendanceRecords = await prisma.attendance.findMany({
      where: { 
        studentId: student.id,
        courseId: { in: enrolledCourseIds }
      },
      select: {
        courseId: true,
        timestamp: true,
        status: true,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // ✅ Deduplicate: Keep only one record per course per day (SAME LOGIC AS HISTORY)
    const uniqueRecords = new Map<string, boolean>();
    
    attendanceRecords.forEach((record) => {
      const date = record.timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
      const key = `${record.courseId}-${date}`;
      
      // Keep the first occurrence (most recent due to desc order)
      if (!uniqueRecords.has(key)) {
        uniqueRecords.set(key, record.status);
      }
    });

    // Count total unique sessions
    const totalSessions = uniqueRecords.size;

    // Count present sessions
    const totalAttendedSessions = Array.from(uniqueRecords.values())
      .filter(status => status === true)
      .length;

    // Calculate attendance percentage
    const attendancePercentage = totalSessions > 0 
      ? Math.round((totalAttendedSessions / totalSessions) * 100 * 10) / 10
      : 0;

    return NextResponse.json({
      totalCourses,
      attendancePercentage,
      totalPresent: totalAttendedSessions,
    });
  } catch (error) {
    console.error("Error in student/stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
// app/api/teacher/reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
}

export async function GET(request: NextRequest) {
  try {
    const decoded = verifyToken(request);
    if (decoded.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const url = new URL(request.url);
    const courseId = url.searchParams.get("courseId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    console.log("Report params:", { courseId, startDate, endDate });

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID required" },
        { status: 400 }
      );
    }

    // Verify teacher owns this course
    const teacher = await prisma.teacher.findUnique({
      where: { userId: decoded.userId },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    console.log("Teacher found:", teacher.id);

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        teacherId: teacher.id,
      },
      include: {
        students: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found or access denied" }, { status: 404 });
    }

    console.log("Course found:", course.name, "Students:", course.students.length);

    // Build date filter
    const dateFilter: any = {
      courseId,
    };

    if (startDate) {
      dateFilter.timestamp = {
        ...dateFilter.timestamp,
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.timestamp = {
        ...dateFilter.timestamp,
        lte: end,
      };
    }

    // Get all attendance records for the course
    const attendanceRecords = await prisma.attendance.findMany({
      where: dateFilter,
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    console.log("Attendance records found:", attendanceRecords.length);

    // If no attendance records, return enrolled students with zero attendance
    if (attendanceRecords.length === 0) {
      const report = course.students.map((student) => ({
        studentName: student.user.name,
        studentEmail: student.user.email,
        totalSessions: 0,
        attended: 0,
        percentage: 0,
      }));

      report.sort((a, b) => a.studentName.localeCompare(b.studentName));
      return NextResponse.json(report);
    }

    // Get all unique session dates
    const allSessionDates = new Set(
      attendanceRecords.map((record) =>
        record.timestamp.toISOString().split("T")[0]
      )
    );
    const totalSessions = allSessionDates.size;

    console.log("Total unique sessions:", totalSessions);

    // Create a map for student statistics
    const studentStatsMap = new Map<string, {
      studentName: string;
      studentEmail: string;
      attended: number;
    }>();

    // Initialize all enrolled students
    course.students.forEach((student) => {
      studentStatsMap.set(student.id, {
        studentName: student.user.name,
        studentEmail: student.user.email,
        attended: 0,
      });
    });

    // Count attendance for each student
    attendanceRecords.forEach((record) => {
      const stats = studentStatsMap.get(record.studentId);
      if (stats && record.status === true) {
        stats.attended += 1;
      }
    });

    console.log("Student stats calculated");

    // Build the final report
    const report = Array.from(studentStatsMap.values()).map((stats) => {
      const percentage = totalSessions > 0 
        ? (stats.attended / totalSessions) * 100 
        : 0;
      
      return {
        studentName: stats.studentName,
        studentEmail: stats.studentEmail,
        totalSessions: totalSessions,
        attended: stats.attended,
        percentage: percentage,
      };
    });

    // Sort by name
    report.sort((a, b) => a.studentName.localeCompare(b.studentName));

    console.log("Report generated:", report.length, "students");

    return NextResponse.json(report);
  } catch (error: any) {
    console.error("Reports API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
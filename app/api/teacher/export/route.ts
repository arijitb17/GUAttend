// app/api/teacher/reports/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import * as XLSX from "xlsx";

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

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!courseId) {
      return NextResponse.json({ error: "Course ID required" }, { status: 400 });
    }

    // Verify teacher owns this course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        teacherId: teacher.id,
      },
      include: {
        students: {
          include: {
            user: true,
            attendance: {
              where: {
                courseId,
                ...(startDate && endDate
                  ? {
                      timestamp: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                      },
                    }
                  : {}),
              },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Prepare data for Excel
    const excelData = course.students.map(student => {
      const totalSessions = student.attendance.length;
      const attended = student.attendance.filter(a => a.status).length;
      const percentage = totalSessions > 0 ? (attended / totalSessions) * 100 : 0;

      return {
        "Student Name": student.user.name,
        "Email": student.user.email,
        "Total Sessions": totalSessions,
        "Attended": attended,
        "Absent": totalSessions - attended,
        "Attendance %": percentage.toFixed(2) + "%",
      };
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // Student Name
      { wch: 30 }, // Email
      { wch: 15 }, // Total Sessions
      { wch: 10 }, // Attended
      { wch: 10 }, // Absent
      { wch: 15 }, // Attendance %
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");

    // Generate buffer
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Return file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="attendance-report-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error in teacher/reports/export:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
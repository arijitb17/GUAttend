// app/api/student/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

// ✅ Singleton Prisma Client
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

interface JWTPayload {
  userId: string;
  role: string;
}

function verifyToken(request: NextRequest): JWTPayload {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authHeader.substring(7);
  
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded as JWTPayload;
}

export async function GET(request: NextRequest) {
  try {
    const decoded = verifyToken(request);
    if (decoded.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get student record with enrolled courses
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

    // ✅ Get the IDs of courses the student is enrolled in
    const enrolledCourseIds = student.courses.map((course) => course.id);

    // ✅ Get attendance records ONLY for enrolled courses
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: student.id,
        courseId: {
          in: enrolledCourseIds, // Only courses student is enrolled in
        },
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // ✅ Deduplicate: Keep only one record per course per day
    const uniqueRecords = new Map<string, typeof attendanceRecords[0]>();
    
    attendanceRecords.forEach((record) => {
      const date = record.timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
      const key = `${record.courseId}-${date}`;
      
      // Keep the first occurrence (most recent due to desc order)
      if (!uniqueRecords.has(key)) {
        uniqueRecords.set(key, record);
      }
    });

    const deduplicatedRecords = Array.from(uniqueRecords.values());

    // ✅ Format records to match frontend expectations (boolean status)
    const formattedRecords = deduplicatedRecords.map((record) => ({
      id: record.id,
      course: record.course
        ? {
            name: record.course.name,
            code: record.course.code,
          }
        : {
            name: "Unknown Course",
            code: "N/A",
          },
      status: record.status, // Keep as boolean for frontend
      timestamp: record.timestamp.toISOString(),
    }));

    // ✅ Return array directly (no wrapper object)
    return NextResponse.json(formattedRecords);

  } catch (error: any) {
    console.error("Student History API Error:", error);
    
    if (error.message === "Unauthorized" || error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
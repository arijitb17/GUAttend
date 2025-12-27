// ============================================================
// FILE 1: app/api/student/courses/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided. Please log in." },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log("Token decoded successfully:", { userId: decoded.userId || decoded.id, role: decoded.role });
    } catch (err) {
      console.error("Token verification failed:", err);
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Get user ID
    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid token payload" },
        { status: 401 }
      );
    }

    // Check if user has STUDENT role
    if (decoded.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Forbidden - Students only" },
        { status: 403 }
      );
    }

    // Get student with their courses
    const student = await prisma.student.findUnique({
      where: {
        userId: userId
      },
      include: {
        courses: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            },
            semester: {
              include: {
                academicYear: {
                  include: {
                    program: true
                  }
                }
              }
            },
            _count: {
              select: {
                students: true,
              }
            }
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // ✅ FIX: Calculate unique sessions for each course
    const coursesWithCorrectCounts = await Promise.all(
      student.courses.map(async (course) => {
        const uniqueSessions = await prisma.attendance.groupBy({
          by: ["timestamp"],
          where: { courseId: course.id },
        });

        return {
          ...course,
          _count: {
            ...course._count,
            attendance: uniqueSessions.length, // ✅ Unique sessions count
          },
        };
      })
    );

    return NextResponse.json(coursesWithCorrectCounts);
  } catch (error) {
    console.error("Error fetching student courses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
// app/api/student/me/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Get user ID (support both 'id' and 'userId' for compatibility)
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
        { error: "Forbidden - Access denied for non-students" },
        { status: 403 }
      );
    }

    // Fetch student data with related information
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        student: {
          include: {
            program: {
              include: {
                department: true,
              },
            },
            courses: {
              include: {
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
                semester: {
                  include: {
                    academicYear: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Return student information
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      student: {
        id: user.student.id,
        program: {
          id: user.student.program.id,
          name: user.student.program.name,
          department: {
            id: user.student.program.department.id,
            name: user.student.program.department.name,
          },
        },
        courses: user.student.courses.map(course => ({
          id: course.id,
          name: course.name,
          entryCode: course.entryCode,
          teacher: {
            name: course.teacher.user.name,
            email: course.teacher.user.email,
          },
          semester: {
            name: course.semester.name,
            academicYear: course.semester.academicYear.name,
          },
        })),
        hasFaceEmbedding: !!user.student.faceEmbedding,
      },
    });
  } catch (error) {
    console.error("Error in /api/student/me:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
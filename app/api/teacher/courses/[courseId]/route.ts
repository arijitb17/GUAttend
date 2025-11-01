// app/api/teacher/courses/[id]/route.ts
// Make sure this file is in: app/api/teacher/courses/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> } // ✅ Next.js 15: params is a Promise
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    if (decoded.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Forbidden - Teachers only" },
        { status: 403 }
      );
    }

    // ✅ Await params in Next.js 15
    const { courseId } = await params;

    // Fetch the teacher to verify they own this course
    const teacher = await prisma.teacher.findUnique({
      where: { userId: decoded.userId },
      select: { id: true },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    // Fetch course with all details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        semester: {
          include: {
            academicYear: {
              include: {
                program: {
                  include: {
                    department: true,
                  },
                },
              },
            },
          },
        },
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
        students: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            program: {
              select: {
                name: true,
                department: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            _count: {
              select: {
                attendance: {
                  where: {
                    courseId: courseId,
                  },
                },
              },
            },
          },
          orderBy: {
            user: {
              name: "asc",
            },
          },
        },
        attendance: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            timestamp: "desc",
          },
          distinct: ['timestamp'], // Get unique attendance sessions
          take: 50,
        },
        _count: {
          select: {
            students: true,
            attendance: true, // This counts total attendance records
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Verify the teacher owns this course
    if (course.teacherId !== teacher.id) {
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this course" },
        { status: 403 }
      );
    }

    // Calculate unique attendance sessions (by grouping timestamps)
    const uniqueSessions = await prisma.attendance.groupBy({
      by: ['timestamp'],
      where: { courseId: courseId },
      _count: true,
    });

    // Transform the data to include faceEmbedding as boolean
    const transformedCourse = {
      ...course,
      students: course.students.map((student) => ({
        ...student,
        faceEmbedding: !!student.faceEmbedding,
      })),
      _count: {
        ...course._count,
        attendance: uniqueSessions.length, // Override with unique session count
      },
    };

    return NextResponse.json(transformedCourse, { status: 200 });
  } catch (error) {
    console.error("Error fetching course details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
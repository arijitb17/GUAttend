// File: /app/api/teacher/courses/[courseId]/students/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Unauthorized - Teacher access only" },
        { status: 401 }
      );
    }

    // Await params (Next.js 15 requirement)
    const { courseId } = await params;

    // Fetch course details with all necessary relationships
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        teacher: {
          userId: decoded.id,
        },
      },
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
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or access denied" },
        { status: 404 }
      );
    }

    // Fetch students enrolled in this course
    const students = await prisma.student.findMany({
      where: {
        courses: {
          some: {
            id: courseId,
          },
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        program: {
          include: {
            department: true,
          },
        },
        _count: {
          select: {
            attendance: true,
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    // Get dataset path
    const datasetPath = path.join(process.cwd(), "dataset");

    // Check each student for photos and training status
    const studentsWithStatus = students.map((student) => {
      // Extract student ID from email (assuming email format: studentid@domain.com)
      const studentId = student.user.email.split("@")[0];
      const studentFolder = path.join(datasetPath, studentId);

      let hasPhotos = false;
      let photoCount = 0;

      // Check if student folder exists and has photos
      if (fs.existsSync(studentFolder)) {
        try {
          const files = fs.readdirSync(studentFolder);
          const imageFiles = files.filter((file) =>
            /\.(jpg|jpeg|png)$/i.test(file)
          );
          photoCount = imageFiles.length;
          hasPhotos = photoCount > 0;
        } catch (error) {
          console.error(`Error reading folder for ${studentId}:`, error);
        }
      }

      return {
        id: student.id,
        user: {
          name: student.user.name,
          email: student.user.email,
        },
        program: student.program,
        faceEmbedding: !!student.faceEmbedding,
        hasPhotos,
        photoCount,
        _count: student._count,
      };
    });

    // Return both course and students data
    return NextResponse.json({
      course,
      students: studentsWithStatus,
    });
  } catch (error) {
    console.error("Error fetching course students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Unauthorized - Teacher access only" },
        { status: 401 }
      );
    }

    const { courseId } = await params;
    const body = await request.json();
    const { studentId } = body;

    // Verify the course belongs to this teacher
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        teacher: {
          userId: decoded.id,
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or access denied" },
        { status: 404 }
      );
    }

    // Remove student from course
    await prisma.course.update({
      where: { id: courseId },
      data: {
        students: {
          disconnect: {
            id: studentId,
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Student removed from course successfully" 
    });
  } catch (error) {
    console.error("Error removing student:", error);
    return NextResponse.json(
      { error: "Failed to remove student" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
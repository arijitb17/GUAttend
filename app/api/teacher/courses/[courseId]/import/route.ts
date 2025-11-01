// app/api/teacher/courses/[courseId]/import/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { hashPassword } from "@/lib/auth";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface CSVStudent {
  name: string;
  email: string;
  dob: string; // Format: YYYY-MM-DD or DD/MM/YYYY
  programId: string;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const params = await context.params;
    const courseId = params.courseId;

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };

    if (decoded.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: decoded.id },
      select: { id: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Verify course belongs to teacher
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        teacherId: teacher.id,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const body = await req.json();
    const students: CSVStudent[] = body.students;

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: "Invalid students data" }, { status: 400 });
    }

    const results = {
      successful: [] as string[],
      failed: [] as { email: string; reason: string }[],
      existing: [] as string[],
    };

    for (const studentData of students) {
      try {
        // Validate required fields
        if (!studentData.name || !studentData.email || !studentData.dob || !studentData.programId) {
          results.failed.push({
            email: studentData.email || "unknown",
            reason: "Missing required fields",
          });
          continue;
        }

        // ✅ Store DOB with separators removed for consistency
        // Input: 2004-03-13 or 13/03/2004 -> Output: 20040313
        const dobPassword = studentData.dob.replace(/[-/]/g, "");
        
        // ✅ Use the hashPassword function from @/lib/auth
        const hashedPassword = await hashPassword(dobPassword);

        // Check if user already exists
        let user = await prisma.user.findUnique({
          where: { email: studentData.email.toLowerCase().trim() },
          include: { student: true },
        });

        if (user) {
          // User exists, check if student record exists
          if (user.student) {
            // Check if already enrolled in this course
            const enrollment = await prisma.course.findFirst({
              where: {
                id: courseId,
                students: {
                  some: { id: user.student.id },
                },
              },
            });

            if (enrollment) {
              results.existing.push(studentData.email);
              continue;
            }

            // Enroll existing student in course
            await prisma.course.update({
              where: { id: courseId },
              data: {
                students: {
                  connect: { id: user.student.id },
                },
              },
            });

            results.successful.push(studentData.email);
          } else {
            results.failed.push({
              email: studentData.email,
              reason: "User exists but is not a student",
            });
          }
        } else {
          // Create new user and student
          const newUser = await prisma.user.create({
            data: {
              name: studentData.name,
              email: studentData.email.toLowerCase().trim(),
              password: hashedPassword,
              role: "STUDENT",
              student: {
                create: {
                  programId: studentData.programId,
                  courses: {
                    connect: { id: courseId },
                  },
                },
              },
            },
          });

          results.successful.push(studentData.email);
        }
      } catch (error: any) {
        console.error(`Error processing ${studentData.email}:`, error);
        results.failed.push({
          email: studentData.email,
          reason: error.message || "Unknown error",
        });
      }
    }

    return NextResponse.json({
      message: "Import completed",
      results,
    });
  } catch (error) {
    console.error("Error importing students:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
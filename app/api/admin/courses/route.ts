import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import type { JwtPayload } from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token || "") as JwtPayload & { role?: string };

    if (!decoded || decoded.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const courses = await prisma.course.findMany({
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
        semester: {
          include: {
            academicYear: {
              include: {
                program: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token || "") as JwtPayload & { role?: string };

    if (!decoded || decoded.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, teacherId, programId, academicYear, semesterNumber } = await req.json();

    console.log("🔍 Looking for teacher with ID:", teacherId);

    // Check if teacher exists and log details
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: true,
        department: true,
      },
    });

    if (!teacher) {
      // Let's check if this ID exists as a User instead
      const user = await prisma.user.findUnique({
        where: { id: teacherId },
      });

      console.error("❌ Teacher not found with ID:", teacherId);
      console.log("All teachers in DB:", await prisma.teacher.findMany({
        select: { id: true, userId: true },
      }));

      if (user) {
        console.error("⚠️ This ID exists as a User, not a Teacher!");
        console.log("User details:", user);
        
        // Try to find the teacher record for this user
        const teacherByUserId = await prisma.teacher.findUnique({
          where: { userId: teacherId },
        });

        if (teacherByUserId) {
          console.log("✅ Found Teacher record by userId:", teacherByUserId);
          return NextResponse.json(
            { 
              error: "Teacher ID mismatch. Frontend is sending userId instead of teacherId.",
              hint: `Use teacherId: ${teacherByUserId.id} instead of ${teacherId}`,
            },
            { status: 400 }
          );
        }
      }

      return NextResponse.json(
        { error: "Teacher not found in database" },
        { status: 404 }
      );
    }

    console.log("✅ Found teacher:", teacher.user.name);

    // Find or create academic year
    let academicYearRecord = await prisma.academicYear.findFirst({
      where: {
        name: academicYear,
        programId: programId,
      },
    });

    if (!academicYearRecord) {
      academicYearRecord = await prisma.academicYear.create({
        data: {
          name: academicYear,
          programId: programId,
        },
      });
    }

    // Find or create semester
    const semesterName = `Semester ${semesterNumber}`;
    let semesterRecord = await prisma.semester.findFirst({
      where: {
        name: semesterName,
        academicYearId: academicYearRecord.id,
      },
    });

    if (!semesterRecord) {
      semesterRecord = await prisma.semester.create({
        data: {
          name: semesterName,
          academicYearId: academicYearRecord.id,
        },
      });
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        name,
        entryCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        teacherId: teacher.id,
        semesterId: semesterRecord.id,
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
        semester: {
          include: {
            academicYear: {
              include: {
                program: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ course });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
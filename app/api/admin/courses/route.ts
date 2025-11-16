import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import type { JwtPayload } from "jsonwebtoken";

const prisma = new PrismaClient();

// 🔹 Helper: derive short department code from department name
function getDeptCode(deptName?: string | null): string {
  if (!deptName) return "GEN";

  const stopWords = ["and", "of", "department", "dept.", "dept"];
  const words = deptName
    .split(/\s+/)
    .filter((w) => !stopWords.includes(w.toLowerCase()));

  if (words.length === 0) return "GEN";

  if (words.length === 1) {
    const w = words[0].replace(/[^a-zA-Z]/g, "");
    if (w.length >= 3) return w.slice(0, 3).toUpperCase();
    return w.toUpperCase();
  }

  return words
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

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

    const { name, teacherId, programId, academicYear, semesterNumber } =
      await req.json();

    if (!name || !teacherId || !programId || !academicYear || !semesterNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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
      console.log(
        "All teachers in DB:",
        await prisma.teacher.findMany({
          select: { id: true, userId: true },
        })
      );

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
              error:
                "Teacher ID mismatch. Frontend is sending userId instead of teacherId.",
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

    // 🔹 Validate / normalize semesterNumber
    const semNum = parseInt(semesterNumber, 10);
    if (Number.isNaN(semNum) || semNum <= 0) {
      return NextResponse.json(
        { error: "Invalid semester number" },
        { status: 400 }
      );
    }

    // 🔹 Get program + department (for department code)
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: { department: true },
    });

    if (!program || !program.department) {
      return NextResponse.json(
        { error: "Program or department not found" },
        { status: 404 }
      );
    }

    const deptCode = getDeptCode(program.department.name); // e.g. "IT"

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
    const semesterName = `Semester ${semNum}`;
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

    // 🔹 Generate course code: IT-701, IT-702, ...
    const existingCoursesCount = await prisma.course.count({
      where: {
        semesterId: semesterRecord.id,
      },
    });

    const index = existingCoursesCount + 1; // 1-based
    const indexPart = String(index).padStart(2, "0"); // 01, 02, 03...
    const courseCode = `${deptCode}-${semNum}${indexPart}`; // e.g. IT-701

    console.log("🆕 Generated course code:", courseCode);

    // Create course (with code + random entryCode)
    const course = await prisma.course.create({
      data: {
        name,
        code: courseCode,
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

    return NextResponse.json({ course });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}

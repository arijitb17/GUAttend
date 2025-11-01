import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const now = new Date();

    // Fetch all programs (for filters)
    const programs = await prisma.program.findMany({
      include: {
        department: true,
      },
    });

    // Fetch all student users with complete course and program relationships
    const users = await prisma.user.findMany({
      where: { role: Role.STUDENT },
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
            },
          },
        },
      },
    });

    const updatedUsers = await Promise.all(
      users.map(async (user) => {
        const student = user.student;
        if (!student) return user;

        const joinedAt = new Date(student.joinedAt);
        const yearsPassed =
          (now.getTime() - joinedAt.getTime()) / (1000 * 60 * 60 * 24 * 365);

        const programName = student.program?.name?.toLowerCase() || "";
        let programDuration = 4;

        if (programName.includes("bachelor")) programDuration = 3;
        if (programName.includes("integrated")) programDuration = 5;

        const shouldGraduate = yearsPassed >= programDuration;

        if (shouldGraduate && student.status !== "graduated") {
          await prisma.student.update({
            where: { id: student.id },
            data: { status: "graduated" },
          });
          student.status = "graduated";
        }

        return { ...user, student };
      })
    );

    const sorted = updatedUsers.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      students: sorted,
      programs, // send full program list too
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
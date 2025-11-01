import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> } // 👈 new type
) {
  try {
    const { id } = await context.params; // 👈 await the params
    if (!id)
      return NextResponse.json({ error: "ID required" }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const programs = await tx.program.findMany({
        where: { departmentId: id },
        select: { id: true },
      });
      const programIds = programs.map((p) => p.id);

      if (programIds.length > 0) {
        const academicYears = await tx.academicYear.findMany({
          where: { programId: { in: programIds } },
          select: { id: true },
        });
        const academicYearIds = academicYears.map((a) => a.id);

        if (academicYearIds.length > 0) {
          const semesters = await tx.semester.findMany({
            where: { academicYearId: { in: academicYearIds } },
            select: { id: true },
          });
          const semesterIds = semesters.map((s) => s.id);

          if (semesterIds.length > 0) {
            const courses = await tx.course.findMany({
              where: { semesterId: { in: semesterIds } },
              select: { id: true },
            });
            const courseIds = courses.map((c) => c.id);

            if (courseIds.length > 0) {
              await tx.attendance.deleteMany({
                where: { courseId: { in: courseIds } },
              });
              await tx.course.deleteMany({
                where: { id: { in: courseIds } },
              });
            }

            await tx.semester.deleteMany({
              where: { id: { in: semesterIds } },
            });
          }

          await tx.academicYear.deleteMany({
            where: { id: { in: academicYearIds } },
          });
        }

        const studentsCount = await tx.student.count({
          where: { programId: { in: programIds } },
        });

        if (studentsCount > 0) {
          throw new Error(
            `Cannot delete department: ${studentsCount} student(s) are enrolled in programs under this department. Please reassign or remove students first.`
          );
        }

        await tx.program.deleteMany({
          where: { id: { in: programIds } },
        });
      }

      const teachersCount = await tx.teacher.count({
        where: { departmentId: id },
      });

      if (teachersCount > 0) {
        throw new Error(
          `Cannot delete department: ${teachersCount} teacher(s) are assigned to this department. Please reassign or remove teachers first.`
        );
      }

      const deletedDept = await tx.department.delete({ where: { id } });

      return deletedDept;
    });

    return NextResponse.json({
      message: "Department and all related data deleted successfully",
      department: result,
    });
  } catch (err: any) {
    console.error("Delete error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete department" },
      { status: 500 }
    );
  }
}

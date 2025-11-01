import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Unauthorized - Teacher access only" },
        { status: 401 }
      );
    }

    // Get teacher with all their courses and the full hierarchy
    const teacher = await prisma.teacher.findUnique({
      where: { userId: decoded.id },
      include: {
        department: true,
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
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    // Build hierarchical structure
    const hierarchy: any = {
      departments: new Map(),
    };

    teacher.courses.forEach((course) => {
      const semester = course.semester;
      const academicYear = semester.academicYear;
      const program = academicYear.program;
      const department = program.department;

      // Add department
      if (!hierarchy.departments.has(department.id)) {
        hierarchy.departments.set(department.id, {
          ...department,
          programs: new Map(),
        });
      }

      const dept = hierarchy.departments.get(department.id);

      // Add program
      if (!dept.programs.has(program.id)) {
        dept.programs.set(program.id, {
          ...program,
          academicYears: new Map(),
        });
      }

      const prog = dept.programs.get(program.id);

      // Add academic year
      if (!prog.academicYears.has(academicYear.id)) {
        prog.academicYears.set(academicYear.id, {
          ...academicYear,
          semesters: new Map(),
        });
      }

      const year = prog.academicYears.get(academicYear.id);

      // Add semester
      if (!year.semesters.has(semester.id)) {
        year.semesters.set(semester.id, {
          ...semester,
          courses: [],
        });
      }

      const sem = year.semesters.get(semester.id);

      // Add course
      sem.courses.push({
        id: course.id,
        name: course.name,
        entryCode: course.entryCode,
      });
    });

    // Convert Maps to Arrays for JSON response
    const result = {
      departments: Array.from(hierarchy.departments.values()).map((dept: any) => ({
        id: dept.id,
        name: dept.name,
        programs: Array.from(dept.programs.values()).map((prog: any) => ({
          id: prog.id,
          name: prog.name,
          departmentId: prog.departmentId,
          academicYears: Array.from(prog.academicYears.values()).map((year: any) => ({
            id: year.id,
            name: year.name,
            programId: year.programId,
            semesters: Array.from(year.semesters.values()).map((sem: any) => ({
              id: sem.id,
              name: sem.name,
              academicYearId: sem.academicYearId,
              courses: sem.courses,
            })),
          })),
        })),
      })),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching teacher hierarchy:", error);
    return NextResponse.json(
      { error: "Failed to fetch hierarchy" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
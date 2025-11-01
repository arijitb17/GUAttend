import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Count teachers
    const teachers = await prisma.user.count({ where: { role: Role.TEACHER } });
    // Count students
    const students = await prisma.user.count({ where: { role: Role.STUDENT } });
    // Count departments
    const departments = await prisma.department.count();
    // Count programs
    const programs = await prisma.program.count();

    return NextResponse.json({ teachers, students, departments, programs });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

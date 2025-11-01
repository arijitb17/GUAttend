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

    const users = await prisma.user.findMany({
      where: { role: Role.TEACHER },
      include: { 
        teacher: { 
          include: { 
            department: true 
          } 
        } 
      },
    });

    // Map all teacher users (both pending and approved)
    const teachers = users.map((u) => ({
      id: u.teacher?.id || u.id, // ✅ Use Teacher.id if exists, fallback to User.id for pending
      userId: u.id, // Keep User ID for reference
      name: u.name,
      email: u.email,
      departmentId: u.teacher?.departmentId || null,
      departmentName: u.teacher?.department?.name || null,
      isPending: !u.teacher, // Helper flag to identify pending teachers
    }));

    console.log("Teachers fetched:", teachers); // Debug log

    return NextResponse.json({ teachers });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token || "") as JwtPayload & { role?: string };

    if (!decoded || decoded.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await req.json(); // This should be userId

    // First delete the teacher record (if exists)
    await prisma.teacher.deleteMany({
      where: { userId: id },
    });

    // Then delete the user record
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 });
  }
}
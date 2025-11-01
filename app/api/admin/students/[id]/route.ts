import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔧 Update type for new Next.js 15 RouteContext
interface Params {
  params: Promise<{ id: string }>;
}

// 🧱 Update student
export async function PATCH(req: Request, context: Params) {
  try {
    const { id } = await context.params; // 👈 must await params
    const { name, email, programId } = await req.json();

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        student: {
          update: { programId },
        },
      },
      include: { student: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

// 🧱 Delete student
export async function DELETE(_req: Request, context: Params) {
  try {
    const { id } = await context.params; // 👈 must await params
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}

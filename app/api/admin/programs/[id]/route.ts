import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> } // 👈 async params
) {
  const { id } = await context.params; // 👈 await it

  if (!id)
    return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    await prisma.program.delete({ where: { id } });
    return NextResponse.json({ message: "Program deleted" });
  } catch (error) {
    console.error("Delete program error:", error);
    return NextResponse.json(
      { error: "Program not found" },
      { status: 404 }
    );
  }
}

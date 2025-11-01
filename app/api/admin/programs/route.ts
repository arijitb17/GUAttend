import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const programs = await prisma.program.findMany();
    return NextResponse.json({ programs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, departmentId } = await req.json();
    if (!name || !departmentId)
      return NextResponse.json({ error: "Name and Department ID required" }, { status: 400 });

    const program = await prisma.program.create({
      data: { name, departmentId },
    });

    return NextResponse.json({ program });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const deleted = await prisma.program.delete({
      where: { id }, // string ID from Prisma schema
    });

    return NextResponse.json({ message: "Deleted successfully", program: deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

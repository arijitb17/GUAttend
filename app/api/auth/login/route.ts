// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { comparePassword, generateToken } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user (case-insensitive email)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Compare password (handles DOB format variations)
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      console.log(`Failed login attempt for ${email}`);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({ id: user.id, role: user.role });

    // Determine redirect URL based on role
    let redirectUrl = "/";
    if (user.role === "ADMIN") {
      redirectUrl = "/admin";
    } else if (user.role === "TEACHER") {
      redirectUrl = "/teacher";
    } else if (user.role === "STUDENT") {
      redirectUrl = "/student";
    }

    console.log(`Successful login: ${email} (${user.role})`);

    return NextResponse.json({
      token,
      role: user.role,
      name: user.name,
      email: user.email,
      redirectUrl,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
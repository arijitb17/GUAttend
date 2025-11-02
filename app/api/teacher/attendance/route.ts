// app/api/teacher/attendance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000"; // Set in Vercel env

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
}

export async function POST(request: NextRequest) {
  try {
    const decoded = verifyToken(request);
    if (decoded.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: decoded.userId },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const operation = url.searchParams.get("operation");

    switch (operation) {
      case "get-courses":
        return await getCourses(teacher.id);
      
      case "get-students":
        return await getStudents(request);
      
      case "train-student":
        return await trainStudent(request, teacher.id);
      
      case "run-training":
        return await runTraining(request);
      
      case "recognize":
        return await recognizeFaces(request);
      
      case "submit-attendance":
        return await submitAttendance(request);
      
      default:
        return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

async function getCourses(teacherId: string) {
  const courses = await prisma.course.findMany({
    where: { teacherId },
    include: {
      semester: {
        include: {
          academicYear: {
            include: { program: true },
          },
        },
      },
      students: true,
      _count: { select: { students: true } },
    },
    orderBy: { name: "asc" },
  });

  const formattedCourses = courses.map((course) => ({
    id: course.id,
    name: course.name,
    entryCode: course.entryCode,
    studentCount: course._count.students,
    semester: course.semester.name,
    program: course.semester.academicYear.program.name,
  }));

  return NextResponse.json(formattedCourses);
}

async function getStudents(request: NextRequest) {
  const body = await request.json();
  const { courseId } = body;

  if (!courseId) {
    return NextResponse.json({ error: "Course ID required" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      students: {
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { user: { name: "asc" } },
      },
    },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const formattedStudents = course.students.map((student) => ({
    id: student.id,
    name: student.user.name,
    email: student.user.email,
    hasFaceData: !!student.faceEmbedding,
  }));

  return NextResponse.json(formattedStudents);
}

async function trainStudent(request: NextRequest, teacherId: string) {
  const formData = await request.formData();
  const studentId = formData.get("studentId") as string;
  const courseId = formData.get("courseId") as string;
  const photos = formData.getAll("photos") as File[];

  if (!studentId || !courseId || photos.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
      courses: {
        some: {
          id: courseId,
          teacherId: teacherId,
        },
      },
    },
    include: { user: true },
  });

  if (!student) {
    return NextResponse.json(
      { error: "Student not found or not enrolled in course" },
      { status: 404 }
    );
  }

  try {
    // Forward to Python API
    const pythonFormData = new FormData();
    pythonFormData.append("studentId", studentId);
    pythonFormData.append("front", photos[0]);
    pythonFormData.append("left", photos[1]);
    pythonFormData.append("right", photos[2]);

    const response = await fetch(`${PYTHON_API_URL}/api/process-student`, {
      method: "POST",
      body: pythonFormData,
    });

    if (!response.ok) {
      throw new Error("Python API processing failed");
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      studentId,
      studentName: student.user.name,
      photosSaved: 3,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to process photos", details: error.message },
      { status: 500 }
    );
  }
}

async function runTraining(request: NextRequest) {
  const body = await request.json();
  const { courseId } = body;

  if (!courseId) {
    return NextResponse.json({ error: "Course ID required" }, { status: 400 });
  }

  try {
    // Call Python API
    const response = await fetch(`${PYTHON_API_URL}/api/train`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Training failed");
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: "Training completed successfully",
      results: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Training failed", details: error.message },
      { status: 500 }
    );
  }
}

async function recognizeFaces(request: NextRequest) {
  const formData = await request.formData();
  const courseId = formData.get("courseId") as string;
  const batchId = formData.get("batchId") as string;
  const frames = formData.getAll("frames") as File[];
  const autoSubmit = formData.get("autoSubmit") !== "false";

  if (!courseId || frames.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Forward to Python API
    const pythonFormData = new FormData();
    pythonFormData.append("courseId", courseId);
    frames.forEach((frame) => pythonFormData.append("frames", frame));

    const response = await fetch(`${PYTHON_API_URL}/api/recognize`, {
      method: "POST",
      body: pythonFormData,
    });

    if (!response.ok) {
      throw new Error("Recognition failed");
    }

    const results = await response.json();
    const recognizedStudentIds = results.recognizedStudents || [];

    // Get student details
    const students = await prisma.student.findMany({
      where: { id: { in: recognizedStudentIds } },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    const studentMap = new Map(
      students.map((s) => [s.id, { name: s.user.name, email: s.user.email }])
    );

    const enhancedResults = {
      ...results,
      recognizedStudents: recognizedStudentIds.map((id: string) => ({
        id,
        name: studentMap.get(id)?.name || "Unknown",
        email: studentMap.get(id)?.email || "",
      })),
      batchId,
      courseId,
      timestamp: new Date().toISOString(),
    };

    // Auto-submit attendance
    let attendanceResult = null;
    if (autoSubmit) {
      const attendanceDate = new Date();
      const startOfDay = new Date(attendanceDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(attendanceDate);
      endOfDay.setHours(23, 59, 59, 999);

      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          students: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
      });

      if (!course) {
        throw new Error("Course not found");
      }

      const recognizedIds = new Set(recognizedStudentIds);

      const attendanceRecords = await Promise.all(
        course.students.map(async (student) => {
          const isPresent = recognizedIds.has(student.id);

          const existingAttendance = await prisma.attendance.findFirst({
            where: {
              studentId: student.id,
              courseId: courseId,
              timestamp: { gte: startOfDay, lt: endOfDay },
            },
          });

          if (existingAttendance) {
            return await prisma.attendance.update({
              where: { id: existingAttendance.id },
              data: { status: isPresent, timestamp: attendanceDate },
              include: { student: { include: { user: true } } },
            });
          } else {
            return await prisma.attendance.create({
              data: {
                studentId: student.id,
                courseId: courseId,
                status: isPresent,
                timestamp: attendanceDate,
              },
              include: { student: { include: { user: true } } },
            });
          }
        })
      );

      const presentCount = attendanceRecords.filter((r) => r.status).length;
      attendanceResult = {
        success: true,
        totalStudents: attendanceRecords.length,
        present: presentCount,
        absent: attendanceRecords.length - presentCount,
        attendanceRate: ((presentCount / attendanceRecords.length) * 100).toFixed(1),
        records: attendanceRecords.map((r) => ({
          studentId: r.studentId,
          studentName: r.student.user.name,
          status: r.status,
          timestamp: r.timestamp,
        })),
      };
    }

    return NextResponse.json({
      ...enhancedResults,
      attendance: attendanceResult,
    });
  } catch (error: any) {
    console.error("Recognition error:", error);
    return NextResponse.json(
      {
        error: "Recognition failed",
        details: error.message,
        totalFaces: 0,
        recognizedStudents: [],
        averageConfidence: 0,
        detections: [],
      },
      { status: 500 }
    );
  }
}

async function submitAttendance(request: NextRequest) {
  const body = await request.json();
  const { courseId, recognitionResults, date } = body;

  if (!courseId || !recognitionResults) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const attendanceDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(attendanceDate);
    endOfDay.setHours(23, 59, 59, 999);

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { students: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const recognizedIds = new Set(
      recognitionResults.recognizedStudents.map((s: any) =>
        typeof s === "string" ? s : s.id
      )
    );

    const attendanceRecords = await Promise.all(
      course.students.map(async (student) => {
        const isPresent = recognizedIds.has(student.id);

        const existingAttendance = await prisma.attendance.findFirst({
          where: {
            studentId: student.id,
            courseId: courseId,
            timestamp: { gte: startOfDay, lt: endOfDay },
          },
        });

        if (existingAttendance) {
          return prisma.attendance.update({
            where: { id: existingAttendance.id },
            data: { status: isPresent, timestamp: attendanceDate },
          });
        } else {
          return prisma.attendance.create({
            data: {
              studentId: student.id,
              courseId: courseId,
              status: isPresent,
              timestamp: attendanceDate,
            },
          });
        }
      })
    );

    const presentCount = attendanceRecords.filter((r) => r.status).length;

    return NextResponse.json({
      success: true,
      message: "Attendance submitted successfully",
      statistics: {
        totalStudents: attendanceRecords.length,
        present: presentCount,
        absent: attendanceRecords.length - presentCount,
        attendanceRate: ((presentCount / attendanceRecords.length) * 100).toFixed(1),
      },
      timestamp: attendanceDate.toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to submit attendance", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const decoded = verifyToken(request);
    if (decoded.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const url = new URL(request.url);
    const operation = url.searchParams.get("operation");
    const courseId = url.searchParams.get("courseId");

    if (operation === "get-attendance-history") {
      if (!courseId) {
        return NextResponse.json({ error: "Course ID required" }, { status: 400 });
      }

      const attendance = await prisma.attendance.findMany({
        where: { courseId },
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
        orderBy: { timestamp: "desc" },
      });

      const groupedByDate = attendance.reduce((acc: any, record) => {
        const dateKey = record.timestamp.toISOString().split("T")[0];
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push({
          studentId: record.studentId,
          studentName: record.student.user.name,
          studentEmail: record.student.user.email,
          status: record.status,
          timestamp: record.timestamp,
        });
        return acc;
      }, {});

      return NextResponse.json({
        courseId,
        attendanceByDate: groupedByDate,
        totalRecords: attendance.length,
      });
    }

    return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
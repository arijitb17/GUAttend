// app/api/teacher/attendance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { writeFile, mkdir, readdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { spawn } from "child_process";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const DATASET_DIR = path.join(process.cwd(), "dataset");
const TEST_IMAGES_DIR = path.join(process.cwd(), "test-images");
const OUTPUT_DIR = path.join(process.cwd(), "output");

// Helper: Verify JWT Token
function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
}

// Helper: Execute Python Script
function executePythonScript(scriptName: string, args: string[] = []): Promise<string> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), scriptName);
    
    console.log(`Executing: python3 ${scriptPath}`);
    
    const pythonProcess = spawn("python3", [scriptPath, ...args]);

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      const output = data.toString();
      stdout += output;
      console.log("Python stdout:", output);
    });

    pythonProcess.stderr.on("data", (data) => {
      const output = data.toString();
      stderr += output;
      console.error("Python stderr:", output);
    });

    pythonProcess.on("close", (code) => {
      console.log(`Python script exited with code ${code}`);
      if (code !== 0) {
        reject(new Error(`Python script failed with code ${code}: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });

    pythonProcess.on("error", (error) => {
      console.error("Python process error:", error);
      reject(error);
    });
  });
}

// Helper: Ensure directories exist
async function ensureDirectories() {
  const dirs = [UPLOAD_DIR, DATASET_DIR, TEST_IMAGES_DIR, OUTPUT_DIR];
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }
}

// Helper: Clean directory
async function cleanDirectory(dirPath: string) {
  if (existsSync(dirPath)) {
    try {
      const files = await readdir(dirPath);
      await Promise.all(
        files.map((file) => unlink(path.join(dirPath, file)).catch(() => {}))
      );
    } catch (error) {
      console.error(`Error cleaning directory ${dirPath}:`, error);
    }
  }
}

// ============================================================================
// MAIN POST HANDLER - Routes all operations
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const decoded = verifyToken(request);
    if (decoded.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get teacher record
    const teacher = await prisma.teacher.findUnique({
      where: { userId: decoded.userId },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Determine operation from URL search params
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
        return NextResponse.json(
          { error: "Invalid operation" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPERATION: Get Courses
// ============================================================================
async function getCourses(teacherId: string) {
  const courses = await prisma.course.findMany({
    where: { teacherId },
    include: {
      semester: {
        include: {
          academicYear: {
            include: {
              program: true,
            },
          },
        },
      },
      students: true,
      _count: {
        select: { students: true },
      },
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

// ============================================================================
// OPERATION: Get Students for a Course
// ============================================================================
async function getStudents(request: NextRequest) {
  const body = await request.json();
  const { courseId } = body;

  if (!courseId) {
    return NextResponse.json(
      { error: "Course ID required" },
      { status: 400 }
    );
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      students: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          user: {
            name: "asc",
          },
        },
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

// ============================================================================
// OPERATION: Train Student (Upload Photos)
// ============================================================================
async function trainStudent(request: NextRequest, teacherId: string) {
  await ensureDirectories();

  const formData = await request.formData();
  const studentId = formData.get("studentId") as string;
  const courseId = formData.get("courseId") as string;
  const photos = formData.getAll("photos") as File[];

  if (!studentId || !courseId || photos.length === 0) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Verify student is in the course
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
    include: {
      user: true,
    },
  });

  if (!student) {
    return NextResponse.json(
      { error: "Student not found or not enrolled in course" },
      { status: 404 }
    );
  }

  // Create student directory in dataset
  const studentDir = path.join(DATASET_DIR, studentId);
  if (!existsSync(studentDir)) {
    await mkdir(studentDir, { recursive: true });
  }

  // Save photos
  const savedFiles = [];
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const buffer = Buffer.from(await photo.arrayBuffer());
    const filename = `${studentId}_${Date.now()}_${i}.jpg`;
    const filepath = path.join(studentDir, filename);
    await writeFile(filepath, buffer);
    savedFiles.push(filename);
  }

  return NextResponse.json({
    success: true,
    studentId,
    studentName: student.user.name,
    photosSaved: savedFiles.length,
    files: savedFiles,
  });
}

// ============================================================================
// OPERATION: Run Training Script
// ============================================================================
async function runTraining(request: NextRequest) {
  const body = await request.json();
  const { courseId } = body;

  if (!courseId) {
    return NextResponse.json(
      { error: "Course ID required" },
      { status: 400 }
    );
  }

  try {
    // Execute Python training script
    const output = await executePythonScript("train_faces.py");
    
    // Parse training results
    const lines = output.split("\n");
    let trainingResults: any = {
      studentsTrained: 0,
      imagesProcessed: 0,
      trainingSamples: 0
    };
    
    for (const line of lines) {
      if (line.includes("Students trained:")) {
        const match = line.match(/(\d+)/);
        if (match) trainingResults.studentsTrained = parseInt(match[1]);
      }
      if (line.includes("Total images processed:")) {
        const match = line.match(/(\d+)/);
        if (match) trainingResults.imagesProcessed = parseInt(match[1]);
      }
      if (line.includes("Total training samples:")) {
        const match = line.match(/(\d+)/);
        if (match) trainingResults.trainingSamples = parseInt(match[1]);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Training completed successfully",
      results: trainingResults,
      output: output.substring(0, 1000), // First 1000 chars for debugging
    });
  } catch (error: any) {
    console.error("Training error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Training failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPERATION: Recognize Faces
// ============================================================================
// Replace the recognizeFaces function in your route.ts

async function recognizeFaces(request: NextRequest) {
  await ensureDirectories();
  await cleanDirectory(TEST_IMAGES_DIR);

  const formData = await request.formData();
  const courseId = formData.get("courseId") as string;
  const batchId = formData.get("batchId") as string;
  const frames = formData.getAll("frames") as File[];
  const autoSubmit = formData.get("autoSubmit") !== "false"; // Default true

  if (!courseId || frames.length === 0) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Save frames to test-images directory
  const savedFrames = [];
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const buffer = Buffer.from(await frame.arrayBuffer());
    const filename = `frame_${i}_${Date.now()}.jpg`;
    const filepath = path.join(TEST_IMAGES_DIR, filename);
    await writeFile(filepath, buffer);
    savedFrames.push(filename);
  }

  try {
    // Execute Python recognition script
    const output = await executePythonScript("scripts/recognize.py");
    
    // Parse JSON output from Python script
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse recognition results");
    }

    const results = JSON.parse(jsonMatch[0]);

    // Check for errors in results
    if (results.error) {
      throw new Error(results.error);
    }

    // Get student details for recognized IDs
    const recognizedStudentIds = results.recognizedStudents || [];
    const students = await prisma.student.findMany({
      where: {
        id: { in: recognizedStudentIds },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const studentMap = new Map(
      students.map((s) => [s.id, { name: s.user.name, email: s.user.email }])
    );

    // Enhance results with student names
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

    // 🔥 AUTO-SUBMIT ATTENDANCE AFTER RECOGNITION
    let attendanceResult = null;
    if (autoSubmit) {
      try {
        console.log("🎯 Auto-submitting attendance for course:", courseId);
        
        const attendanceDate = new Date();
        const startOfDay = new Date(attendanceDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(attendanceDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Get all students in the course
        const course = await prisma.course.findUnique({
          where: { id: courseId },
          include: {
            students: {
              include: {
                user: {
                  select: { name: true, email: true }
                }
              }
            },
          },
        });

        if (!course) {
          throw new Error("Course not found");
        }

        // Create set of recognized student IDs
        const recognizedIds = new Set(recognizedStudentIds);

        // Create or update attendance records for all students
        const attendanceRecords = await Promise.all(
          course.students.map(async (student) => {
            const isPresent = recognizedIds.has(student.id);
            
            // Check if attendance already exists for today
            const existingAttendance = await prisma.attendance.findFirst({
              where: {
                studentId: student.id,
                courseId: courseId,
                timestamp: {
                  gte: startOfDay,
                  lt: endOfDay,
                },
              },
            });

            if (existingAttendance) {
              // Update existing record
              const updated = await prisma.attendance.update({
                where: { id: existingAttendance.id },
                data: {
                  status: isPresent,
                  timestamp: attendanceDate,
                },
                include: {
                  student: {
                    include: { user: true }
                  }
                }
              });
              console.log(`✏️  Updated attendance for ${updated.student.user.name}: ${isPresent ? 'Present' : 'Absent'}`);
              return updated;
            } else {
              // Create new record
              const created = await prisma.attendance.create({
                data: {
                  studentId: student.id,
                  courseId: courseId,
                  status: isPresent,
                  timestamp: attendanceDate,
                },
                include: {
                  student: {
                    include: { user: true }
                  }
                }
              });
              console.log(`✅ Created attendance for ${created.student.user.name}: ${isPresent ? 'Present' : 'Absent'}`);
              return created;
            }
          })
        );

        // Calculate statistics
        const presentCount = attendanceRecords.filter((r) => r.status).length;
        const absentCount = attendanceRecords.length - presentCount;

        attendanceResult = {
          success: true,
          totalStudents: attendanceRecords.length,
          present: presentCount,
          absent: absentCount,
          attendanceRate: ((presentCount / attendanceRecords.length) * 100).toFixed(1),
          records: attendanceRecords.map(r => ({
            studentId: r.studentId,
            studentName: r.student.user.name,
            status: r.status,
            timestamp: r.timestamp
          }))
        };

        console.log(`✅ Attendance submitted: ${presentCount}/${attendanceRecords.length} present`);
      } catch (attendanceError: any) {
        console.error("❌ Auto-submit attendance error:", attendanceError);
        attendanceResult = {
          success: false,
          error: attendanceError.message
        };
      }
    }

    return NextResponse.json({
      ...enhancedResults,
      attendance: attendanceResult, // Include attendance results
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

// ============================================================================
// OPERATION: Submit Attendance
// ============================================================================
async function submitAttendance(request: NextRequest) {
  const body = await request.json();
  const { courseId, recognitionResults, date } = body;

  if (!courseId || !recognitionResults) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const attendanceDate = date ? new Date(date) : new Date();
    
    // Set to start of day for comparison
    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(attendanceDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all students in the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        students: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Extract recognized student IDs
    const recognizedIds = new Set(
      recognitionResults.recognizedStudents.map((s: any) => 
        typeof s === 'string' ? s : s.id
      )
    );

    // Create or update attendance records for all students
    const attendanceRecords = await Promise.all(
      course.students.map(async (student) => {
        const isPresent = recognizedIds.has(student.id);
        
        // Check if attendance already exists for this student, course, and date
        const existingAttendance = await prisma.attendance.findFirst({
          where: {
            studentId: student.id,
            courseId: courseId,
            timestamp: {
              gte: startOfDay,
              lt: endOfDay,
            },
          },
        });

        if (existingAttendance) {
          // Update existing record
          return prisma.attendance.update({
            where: { id: existingAttendance.id },
            data: {
              status: isPresent,
              timestamp: attendanceDate,
            },
          });
        } else {
          // Create new record
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

    // Calculate statistics
    const presentCount = attendanceRecords.filter((r) => r.status).length;
    const absentCount = attendanceRecords.length - presentCount;

    return NextResponse.json({
      success: true,
      message: "Attendance submitted successfully",
      statistics: {
        totalStudents: attendanceRecords.length,
        present: presentCount,
        absent: absentCount,
        attendanceRate: ((presentCount / attendanceRecords.length) * 100).toFixed(1),
      },
      recognitionData: {
        totalFaces: recognitionResults.totalFaces,
        averageConfidence: recognitionResults.averageConfidence,
      },
      timestamp: attendanceDate.toISOString(),
    });
  } catch (error: any) {
    console.error("Submit attendance error:", error);
    return NextResponse.json(
      {
        error: "Failed to submit attendance",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET Handler - For retrieving attendance records
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const decoded = verifyToken(request);
    if (decoded.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const url = new URL(request.url);
    const operation = url.searchParams.get("operation");
    const courseId = url.searchParams.get("courseId");

    switch (operation) {
      case "get-attendance-history":
        if (!courseId) {
          return NextResponse.json(
            { error: "Course ID required" },
            { status: 400 }
          );
        }

        const attendance = await prisma.attendance.findMany({
          where: { courseId },
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: { timestamp: "desc" },
        });

        // Group by date
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

      default:
        return NextResponse.json(
          { error: "Invalid operation" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("GET API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { exec } from 'child_process';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // ✅ 1. Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    // ✅ 2. Fetch the student from the DB
    const student = await prisma.student.findUnique({
      where: { userId: decoded.userId },
      include: { user: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // ✅ 3. Parse form data
    const formData = await request.formData();
    const studentId = formData.get('studentId') as string;

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // ✅ 4. Create dataset folder
    const datasetDir = path.join(process.cwd(), 'dataset', studentId);
    if (!existsSync(datasetDir)) {
      await mkdir(datasetDir, { recursive: true });
    }

    // ✅ 5. Save uploaded images
    const poses = ['front', 'left', 'right'];
    let savedCount = 0;

    for (const pose of poses) {
      const file = formData.get(pose) as File;
      if (file) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = path.join(datasetDir, `${pose}.jpg`);
        await writeFile(filePath, buffer);
        savedCount++;
      }
    }

    if (savedCount === 0) {
      return NextResponse.json({ error: 'No photos were uploaded' }, { status: 400 });
    }

    // ✅ 6. Run Python script automatically
    const scriptPath = path.join(process.cwd(), 'scripts', 'process_student.py');
    const command = `python3 "${scriptPath}" ${studentId}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Python execution error: ${error.message}`);
        return;
      }
      if (stderr) console.error(`⚠️ Python stderr: ${stderr}`);
      console.log(`🐍 Python output:\n${stdout}`);
    });

    // ✅ 7. Return success response
    return NextResponse.json({
      message: `Successfully saved ${savedCount} photos. Face processing started in background.`,
      studentId,
      photosPath: `dataset/${studentId}/`,
      status: 'Processing in background',
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ✅ PUT route — Update face embedding in DB after training
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const body = await request.json();
    const { embeddingData } = body;

    if (!embeddingData) {
      return NextResponse.json({ error: 'Embedding data is required' }, { status: 400 });
    }

    const embeddingBuffer = Buffer.from(embeddingData);

    const student = await prisma.student.update({
      where: { userId: decoded.userId },
      data: { faceEmbedding: embeddingBuffer },
    });

    return NextResponse.json({
      message: 'Face embedding updated successfully',
      hasEmbedding: true,
    });
  } catch (error) {
    console.error('Embedding update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

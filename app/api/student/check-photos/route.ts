// app/api/student/check-photos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; id: string };
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get studentId from query params
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // Check if all three photos exist in dataset directory
    const datasetDir = path.join(process.cwd(), 'dataset', studentId);
    
    console.log('Checking photos in directory:', datasetDir);
    
    const poses = ['front', 'left', 'right'];
    let photoCount = 0;
    const existingPhotos: string[] = [];

    // Check if directory exists
    if (!existsSync(datasetDir)) {
      console.log('Dataset directory does not exist:', datasetDir);
      return NextResponse.json({
        hasPhotos: false,
        photoCount: 0,
        existingPhotos: [],
        totalRequired: 3,
        directoryExists: false
      });
    }

    for (const pose of poses) {
      const photoPath = path.join(datasetDir, `${pose}.jpg`);
      if (existsSync(photoPath)) {
        photoCount++;
        existingPhotos.push(pose);
        console.log('Found photo:', photoPath);
      } else {
        console.log('Missing photo:', photoPath);
      }
    }

    const hasPhotos = photoCount === 3;

    console.log(`Photo check result: ${photoCount}/3 photos found`);

    return NextResponse.json({
      hasPhotos,
      photoCount,
      existingPhotos,
      totalRequired: 3,
      directoryExists: true
    });

  } catch (error) {
    console.error('Check photos error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
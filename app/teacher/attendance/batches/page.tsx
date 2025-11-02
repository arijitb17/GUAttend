"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Student {
  id: string;
  name: string;
  email: string;
  hasFaceData: boolean;
}

interface RecognitionResult {
  totalFaces: number;
  recognizedStudents: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  averageConfidence: number;
  detections: Array<{
    imageIndex: number;
    faceIndex: number;
    bbox: number[];
    confidence: number;
    studentId: string | null;
  }>;
}

interface AttendanceHistory {
  [date: string]: Array<{
    studentId: string;
    studentName: string;
    studentEmail: string;
    status: boolean;
    timestamp: string;
  }>;
}

export default function AttendanceCapturePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [courseId, setCourseId] = useState<string>("");
  const [courseName, setCourseName] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [capturedFrames, setCapturedFrames] = useState<Blob[]>([]);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceHistory>({});
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const urlCourseId = searchParams.get("courseId");
    const urlCourseName = searchParams.get("courseName");
    
    const storedCourseId = localStorage.getItem("selectedCourseId");
    const storedCourseName = localStorage.getItem("selectedCourseName");

    const finalCourseId = urlCourseId || storedCourseId;
    const finalCourseName = urlCourseName || storedCourseName;

    if (!finalCourseId) {
      alert("No course selected. Please select a course first.");
      router.push("/teacher/attendance");
      return;
    }

    setCourseId(finalCourseId);
    setCourseName(finalCourseName || "");
    
    localStorage.setItem("selectedCourseId", finalCourseId);
    if (finalCourseName) {
      localStorage.setItem("selectedCourseName", finalCourseName);
    }

    fetchStudents(finalCourseId);
    fetchAttendanceHistory(finalCourseId);

    return () => {
      stopCamera();
    };
  }, []);

  async function fetchStudents(courseId: string) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/teacher/attendance?operation=get-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId }),
      });

      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  }

  async function fetchAttendanceHistory(courseId: string) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/teacher/attendance?operation=get-attendance-history&courseId=${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setAttendanceHistory(data.attendanceByDate || {});
      }
    } catch (error) {
      console.error("Failed to fetch attendance history:", error);
    }
  }

  async function startCamera() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 }, 
          facingMode: "user" 
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Camera error:", error);
      alert("Failed to access camera. Please grant camera permissions.");
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  }

  async function captureFrames() {
    if (!videoRef.current || !canvasRef.current || !courseId) {
      alert("Unable to capture. Please try again.");
      return;
    }

    setCapturing(true);
    setCapturedFrames([]);
    setRecognitionResult(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      setCapturing(false);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const frames: Blob[] = [];
    const numFrames = 8;
    const interval = 400;

    try {
      for (let i = 0; i < numFrames; i++) {
        await new Promise((resolve) => setTimeout(resolve, interval));

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create blob"));
          }, "image/jpeg", 0.95);
        });

        frames.push(blob);
      }

      setCapturedFrames(frames);
      setCapturing(false);

      await recognizeFaces(frames);
    } catch (error) {
      console.error("Capture error:", error);
      alert("Failed to capture frames");
      setCapturing(false);
    }
  }

  async function recognizeFaces(frames: Blob[]) {
    if (!courseId) return;

    try {
      setRecognizing(true);

      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("batchId", `batch_${Date.now()}`);

      frames.forEach((frame, index) => {
        formData.append("frames", frame, `frame_${index}.jpg`);
      });

      const token = localStorage.getItem("token");
      const res = await fetch("/api/teacher/attendance?operation=recognize", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        setRecognitionResult(result);
      } else {
        const error = await res.json();
        alert(`Recognition failed: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Recognition error:", error);
      alert("Failed to recognize faces. Please ensure training is complete.");
    } finally {
      setRecognizing(false);
    }
  }

  async function submitAttendance() {
    if (!recognitionResult || !courseId) return;

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");
      const res = await fetch("/api/teacher/attendance?operation=submit-attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: courseId,
          recognitionResults: recognitionResult,
          date: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        const result = await res.json();
        alert(
          `✔ Attendance submitted successfully!\n\n` +
          `Present: ${result.statistics.present}\n` +
          `Absent: ${result.statistics.absent}\n` +
          `Attendance Rate: ${result.statistics.attendanceRate}%`
        );
        
        await fetchAttendanceHistory(courseId);
        
        setCapturedFrames([]);
        setRecognitionResult(null);
        stopCamera();
      } else {
        const error = await res.json();
        alert(`Failed to submit attendance: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to submit attendance");
    } finally {
      setSubmitting(false);
    }
  }

  function goBack() {
    localStorage.removeItem("selectedCourseId");
    localStorage.removeItem("selectedCourseName");
    router.push("/teacher/attendance");
  }

  const trainedStudents = students.filter((s) => s.hasFaceData).length;
  const untrainedStudents = students.length - trainedStudents;

  if (!courseId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-4 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <button
                onClick={goBack}
                className="text-blue-400 hover:text-blue-300 mb-2 flex items-center text-sm font-medium transition-colors"
              >
                ← Back to Course Selection
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                Face Recognition Attendance
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">
                {courseName || "Course Attendance"}
              </p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full sm:w-auto px-4 py-2 bg-[#0a0a0a] border border-white/10 text-gray-300 rounded-lg hover:border-blue-500/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all font-medium text-sm sm:text-base"
            >
              {showHistory ? "Hide History" : "View History"}
            </button>
          </div>
        </div>

        {/* Student Stats */}
        {!showHistory && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Students</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{students.length}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6 backdrop-blur-md">
              <p className="text-green-400 text-xs sm:text-sm mb-1">Trained Students</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-300">{trainedStudents}</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6 backdrop-blur-md">
              <p className="text-yellow-400 text-xs sm:text-sm mb-1">Untrained Students</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-300">{untrainedStudents}</p>
            </div>
          </div>
        )}

        {/* Attendance History */}
        {showHistory && (
          <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)]">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
              Attendance History - {courseName}
            </h2>
            
            {Object.keys(attendanceHistory).length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl sm:text-6xl mb-4 block">📋</span>
                <p className="text-gray-400 text-sm sm:text-base">No attendance records yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(attendanceHistory)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([date, records]) => {
                    const presentCount = records.filter(r => r.status).length;
                    const totalCount = records.length;
                    const attendanceRate = ((presentCount / totalCount) * 100).toFixed(1);
                    
                    return (
                      <div key={date} className="bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden">
                        <div className="bg-[#1a1a1a]/60 px-3 sm:px-4 py-3 border-b border-white/10">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <h3 className="font-semibold text-white text-sm sm:text-base">
                              {new Date(date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </h3>
                            <div className="flex items-center space-x-3 sm:space-x-4">
                              <span className="text-xs sm:text-sm text-gray-400">
                                Present: <strong className="text-green-400">{presentCount}</strong> / {totalCount}
                              </span>
                              <span className="px-2 sm:px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs sm:text-sm font-medium">
                                {attendanceRate}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="divide-y divide-white/10">
                          {records.map((record) => (
                            <div
                              key={record.studentId}
                              className="px-3 sm:px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-white/5 transition-colors gap-2"
                            >
                              <div>
                                <p className="font-medium text-white text-sm sm:text-base">{record.studentName}</p>
                                <p className="text-xs sm:text-sm text-gray-400 break-all">{record.studentEmail}</p>
                              </div>
                              <span
                                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${
                                  record.status
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                                }`}
                              >
                                {record.status ? "✔ Present" : "✗ Absent"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Camera Section */}
        {!showHistory && (
          <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)]">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
              Camera Capture
            </h2>

            <div className="space-y-3 sm:space-y-4">
              {/* Video Preview */}
              <div className="relative bg-black rounded-lg overflow-hidden border border-white/10" style={{ aspectRatio: "16/9" }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
                    <div className="text-center px-4">
                      <span className="text-4xl sm:text-6xl mb-4 block">📸</span>
                      <p className="text-gray-300 text-base sm:text-lg mb-4">Camera is off</p>
                      <button
                        onClick={startCamera}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all font-medium text-sm sm:text-base"
                      >
                        Start Camera
                      </button>
                    </div>
                  </div>
                )}

                {(capturing || recognizing) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="text-center px-4">
                      <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-blue-500 mb-4 mx-auto"></div>
                      <p className="text-white text-base sm:text-lg font-semibold">
                        {capturing ? "Capturing frames..." : "Recognizing faces..."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                {cameraActive && (
                  <>
                    <button
                      onClick={captureFrames}
                      disabled={capturing || recognizing}
                      className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-base sm:text-lg transition-all ${
                        capturing || recognizing
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                      }`}
                    >
                      {capturing ? "Capturing..." : recognizing ? "Recognizing..." : "📸 Start Capture"}
                    </button>
                    <button
                      onClick={stopCamera}
                      disabled={capturing || recognizing}
                      className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all ${
                        capturing || recognizing
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                      } text-sm sm:text-base`}
                    >
                      Stop Camera
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recognition Results */}
        {recognitionResult && !showHistory && (
          <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)]">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
              Recognition Results
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
                <p className="text-blue-400 text-xs sm:text-sm mb-1">Total Faces</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-300">
                  {recognitionResult.totalFaces}
                </p>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
                <p className="text-green-400 text-xs sm:text-sm mb-1">Recognized</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-300">
                  {recognitionResult.recognizedStudents.length}
                </p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
                <p className="text-purple-400 text-xs sm:text-sm mb-1">Avg Confidence</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-300">
                  {(recognitionResult.averageConfidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Recognized Students List */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3">
                Present Students ({recognitionResult.recognizedStudents.length})
              </h3>
              {recognitionResult.recognizedStudents.length > 0 ? (
                <div className="space-y-2">
                  {recognitionResult.recognizedStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-green-500/10 border border-green-500/30 rounded-lg backdrop-blur-sm gap-2"
                    >
                      <div>
                        <p className="font-semibold text-white text-sm sm:text-base">
                          {student.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400 break-all">{student.email}</p>
                      </div>
                      <span className="px-2 sm:px-3 py-1 bg-green-600 text-white rounded-full text-xs sm:text-sm font-medium shadow-[0_0_15px_rgba(34,197,94,0.3)] whitespace-nowrap">
                        ✔ Present
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8 text-sm sm:text-base">
                  No students recognized
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={submitAttendance}
              disabled={submitting}
              className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all ${
                submitting
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              }`}
            >
              {submitting ? "Submitting..." : "✔ Submit Attendance"}
            </button>
          </div>
        )}

        {/* Instructions */}
        {!cameraActive && !recognitionResult && !showHistory && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6 backdrop-blur-sm">
            <h3 className="text-base sm:text-lg font-semibold text-blue-300 mb-3">
              📋 Instructions
            </h3>
            <ol className="space-y-2 text-blue-200 text-sm sm:text-base">
              <li>1. Make sure students have been trained (see green count above)</li>
              <li>2. Click "Start Camera" to activate the webcam</li>
              <li>3. Ensure students are visible in the camera frame</li>
              <li>4. Click "Start Capture" to capture 8 frames automatically</li>
              <li>5. Wait for face recognition to complete</li>
              <li>6. Review recognized students and submit attendance</li>
            </ol>
            {untrainedStudents > 0 && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg backdrop-blur-sm">
                <p className="text-xs sm:text-sm text-yellow-300">
                  <strong>⚠️ Warning:</strong> {untrainedStudents} student(s) haven't been trained yet. 
                  They won't be recognized during attendance capture.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
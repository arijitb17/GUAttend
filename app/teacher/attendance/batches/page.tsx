"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Camera,
  Users,
  Brain,
  History,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Square,
  Clock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/useToast";
import { ToastContainer } from "@/components/Toast";

interface Student {
  id: string;
  name: string;
  email: string;
  hasFaceData: boolean;
}

interface RecognitionStudent {
  id: string;
  name: string;
  email: string;
}

interface RecognitionDetection {
  imageIndex: number;
  faceIndex: number;
  bbox?: number[];
  confidence: number;
  studentId: string | null;
}

interface RecognitionResult {
  totalFaces: number;
  recognizedStudents: RecognitionStudent[];
  averageConfidence: number;
  detections: RecognitionDetection[];
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

interface SessionRecognition {
  timestamp: string;
  recognizedStudents: RecognitionStudent[];
  totalFaces: number;
  averageConfidence: number;
}

const SESSION_DURATION = 45 * 60 * 1000; // 45 minutes in milliseconds
const CAPTURE_INTERVAL = 2 * 60 * 1000; // Capture every 2 minutes

export default function AttendanceCapturePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, toast, removeToast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(false);

  const [courseId, setCourseId] = useState<string>("");
  const [courseName, setCourseName] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Session state
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(SESSION_DURATION);
  const [sessionRecognitions, setSessionRecognitions] = useState<SessionRecognition[]>([]);
  const [allRecognizedStudents, setAllRecognizedStudents] = useState<Set<string>>(new Set());
  
  const [cameraActive, setCameraActive] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentRecognition, setCurrentRecognition] = useState<RecognitionResult | null>(null);
  
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceHistory>({});
  const [showHistory, setShowHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Prevent duplicate execution in React strict mode
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    const urlCourseId = searchParams.get("courseId");
    const urlCourseName = searchParams.get("courseName");

    const storedCourseId = localStorage.getItem("selectedCourseId");
    const storedCourseName = localStorage.getItem("selectedCourseName");

    const finalCourseId = urlCourseId || storedCourseId;
    const finalCourseName = urlCourseName || storedCourseName;

    if (!finalCourseId) {
      toast.error("No course selected", "Please select a course first");
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
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (sessionActive && !sessionPaused && sessionStartTime) {
      countdownIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - sessionStartTime;
        const remaining = Math.max(0, SESSION_DURATION - elapsed);
        setTimeRemaining(remaining);

        if (remaining === 0) {
          endSession();
        }
      }, 1000);

      return () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      };
    }
  }, [sessionActive, sessionPaused, sessionStartTime]);

  function cleanup() {
    stopCamera();
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  }

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
        // Don't show toast on initial load - only on errors
      } else {
        toast.error("Failed to load students", "Unable to fetch student data");
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast.error("Error loading students", "Please refresh the page and try again");
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
      toast.error("Failed to load history", "Unable to fetch attendance history");
    }
  }

  async function startCamera() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
        toast.success("Camera started", "Ready to capture attendance");
      }
    } catch (error) {
      console.error("Camera error:", error);
      toast.error("Camera access denied", "Please grant camera permissions and try again");
      throw error;
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  }

  async function captureAndRecognize() {
    if (!videoRef.current || !canvasRef.current || !courseId) {
      console.error("Unable to capture. Missing refs or courseId.");
      return;
    }

    setCapturing(true);
    toast.info("Capturing frames...", "Taking snapshots for face recognition");

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
    const numFrames = 5;
    const interval = 300;

    try {
      // Capture frames
      for (let i = 0; i < numFrames; i++) {
        await new Promise((resolve) => setTimeout(resolve, interval));

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Failed to create blob"));
            },
            "image/jpeg",
            0.9
          );
        });

        frames.push(blob);
      }

      // Run recognition
      await recognizeFaces(frames);
    } catch (error) {
      console.error("Capture error:", error);
      toast.error("Capture failed", "Unable to capture frames. Please try again.");
    } finally {
      setCapturing(false);
    }
  }

  async function recognizeFaces(frames: Blob[]) {
    if (!courseId || frames.length === 0) {
      return;
    }

    try {
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

      if (!res.ok) {
        const error = await res.json();
        console.error("Recognition failed:", error);
        toast.error("Recognition failed", error.error || "Unable to recognize faces");
        return;
      }

      const result = await res.json();

      // Normalize recognized students
      const normalizedStudents = normalizeRecognitionResult(result);
      
      setCurrentRecognition(normalizedStudents);

      // Add to session recognitions
      const sessionRec: SessionRecognition = {
        timestamp: new Date().toISOString(),
        recognizedStudents: normalizedStudents.recognizedStudents,
        totalFaces: normalizedStudents.totalFaces,
        averageConfidence: normalizedStudents.averageConfidence,
      };

      setSessionRecognitions((prev) => [...prev, sessionRec]);

      // Update all recognized students
      const previousCount = allRecognizedStudents.size;
      const newRecognized = new Set(allRecognizedStudents);
      normalizedStudents.recognizedStudents.forEach((student) => {
        newRecognized.add(student.id);
      });
      setAllRecognizedStudents(newRecognized);

      // Show toast with results
      const newStudents = newRecognized.size - previousCount;
      if (newStudents > 0) {
        toast.success(
          `${newStudents} new student${newStudents > 1 ? 's' : ''} recognized`,
          `Total: ${newRecognized.size} present, ${normalizedStudents.totalFaces} faces detected`
        );
      } else if (normalizedStudents.totalFaces > 0) {
        toast.info(
          "Scan complete",
          `${normalizedStudents.totalFaces} faces detected, no new students`
        );
      } else {
        toast.warning("No faces detected", "Make sure students are visible in the camera");
      }

    } catch (error) {
      console.error("Recognition error:", error);
      toast.error("Recognition error", "An error occurred during face recognition");
    }
  }

  function normalizeRecognitionResult(result: any): RecognitionResult {
    function findStudentByCandidate(candidate: string | null | undefined) {
      if (!candidate) return null;
      const s = String(candidate).trim();
      const found =
        students.find((st) => st.id === s) ||
        students.find((st) => st.id.toLowerCase() === s.toLowerCase()) ||
        students.find((st) => (st.name || "").toLowerCase() === s.toLowerCase()) ||
        students.find((st) => (st.email || "").toLowerCase() === s.toLowerCase());
      return found || null;
    }

    const rawRec = result.recognizedStudents || [];
    const normalized: RecognitionStudent[] = rawRec.map((item: any) => {
      if (!item) return { id: "unknown", name: "unknown", email: "" };

      if (typeof item === "string") {
        const idStr = item.trim();
        const found = findStudentByCandidate(idStr);
        if (found) return { id: found.id, name: found.name, email: found.email };
        return { id: idStr, name: idStr, email: "" };
      }

      if (typeof item === "object") {
        const possibleFields = [
          item.id,
          item.studentId,
          item.student_id,
          item.name,
          item.studentName,
        ].filter(Boolean);

        for (const cand of possibleFields) {
          const found = findStudentByCandidate(cand);
          if (found) return { id: found.id, name: found.name, email: found.email };
        }

        const fallbackId = item.id ?? item.studentId ?? "unknown";
        const fallbackName = item.name ?? item.studentName ?? String(fallbackId);
        const fallbackEmail = item.email ?? item.studentEmail ?? "";
        return {
          id: String(fallbackId),
          name: String(fallbackName),
          email: String(fallbackEmail),
        };
      }

      return { id: String(item), name: String(item), email: "" };
    });

    const rawDetections: any[] = result.detections || [];
    const normalizedDetections: RecognitionDetection[] = rawDetections.map((d: any) => ({
      imageIndex: d.imageIndex ?? d.frameIndex ?? 0,
      faceIndex: d.faceIndex ?? 0,
      bbox: d.bbox ?? undefined,
      confidence:
        typeof d.confidence === "number"
          ? d.confidence
          : parseFloat(d.confidence) || 0,
      studentId: d.studentId ?? d.id ?? null,
    }));

    return {
      totalFaces: Number(result.totalFaces ?? normalizedDetections.length ?? 0),
      recognizedStudents: normalized,
      averageConfidence:
        typeof result.averageConfidence === "number"
          ? result.averageConfidence
          : parseFloat(result.averageConfidence) || 0,
      detections: normalizedDetections,
    };
  }

  async function startSession() {
    const trainedStudents = students.filter((s) => s.hasFaceData);
    
    if (trainedStudents.length === 0) {
      toast.error("No trained students", "Please train the model first before starting a session");
      return;
    }

    try {
      // Start camera
      await startCamera();

      // Initialize session
      setSessionActive(true);
      setSessionPaused(false);
      setSessionStartTime(Date.now());
      setTimeRemaining(SESSION_DURATION);
      setSessionRecognitions([]);
      setAllRecognizedStudents(new Set());
      setCurrentRecognition(null);

      toast.success("Session started", "45-minute attendance session is now active");

      // Wait a moment for camera to initialize
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Start first capture immediately
      captureAndRecognize();

      // Set up periodic captures
      captureIntervalRef.current = setInterval(() => {
        if (!sessionPaused) {
          captureAndRecognize();
        }
      }, CAPTURE_INTERVAL);

      // Set up session end timer
      sessionTimerRef.current = setTimeout(() => {
        endSession();
      }, SESSION_DURATION);

    } catch (error) {
      console.error("Failed to start session:", error);
      toast.error("Session start failed", "Please check camera permissions and try again");
      setSessionActive(false);
    }
  }

  function pauseSession() {
    setSessionPaused(true);
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    toast.warning("Session paused", "Camera capture has been stopped");
  }

  function resumeSession() {
    setSessionPaused(false);
    
    // Resume captures
    captureIntervalRef.current = setInterval(() => {
      if (!sessionPaused) {
        captureAndRecognize();
      }
    }, CAPTURE_INTERVAL);
    
    toast.success("Session resumed", "Camera capture has restarted");
  }

  function endSession() {
    cleanup();
    setSessionActive(false);
    setSessionPaused(false);
    
    if (allRecognizedStudents.size > 0) {
      toast.success(
        "Session ended",
        `${allRecognizedStudents.size} student${allRecognizedStudents.size > 1 ? 's' : ''} recognized. Please review and submit attendance.`,
        7000
      );
    } else {
      toast.warning("Session ended", "No students were recognized during this session");
    }
  }

  async function submitAttendance() {
    if (allRecognizedStudents.size === 0 || !courseId) {
      toast.error("Cannot submit", "No students were recognized during this session");
      return;
    }

    try {
      setSubmitting(true);

      // Create final recognition result from all recognized students
      const finalRecognizedStudents = Array.from(allRecognizedStudents)
        .map((studentId) => {
          const student = students.find((s) => s.id === studentId);
          if (student) {
            return {
              id: student.id,
              name: student.name,
              email: student.email,
            };
          }
          return null;
        })
        .filter((s) => s !== null) as RecognitionStudent[];

      const avgConfidence =
        sessionRecognitions.reduce((sum, rec) => sum + rec.averageConfidence, 0) /
        Math.max(sessionRecognitions.length, 1);

      const finalResult: RecognitionResult = {
        totalFaces: sessionRecognitions.reduce((sum, rec) => sum + rec.totalFaces, 0),
        recognizedStudents: finalRecognizedStudents,
        averageConfidence: avgConfidence,
        detections: [],
      };

      const token = localStorage.getItem("token");
      const res = await fetch("/api/teacher/attendance?operation=submit-attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: courseId,
          recognitionResults: finalResult,
          date: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(
          "Attendance submitted successfully!",
          `Present: ${result.statistics.present}, Absent: ${result.statistics.absent}, Rate: ${result.statistics.attendanceRate}%`,
          7000
        );

        await fetchAttendanceHistory(courseId);

        // Reset session data
        setSessionRecognitions([]);
        setAllRecognizedStudents(new Set());
        setCurrentRecognition(null);
      } else {
        const error = await res.json();
        toast.error("Submission failed", error.error || "Unable to submit attendance");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Submission error", "An error occurred while submitting attendance");
    } finally {
      setSubmitting(false);
    }
  }

  function goBack() {
    if (sessionActive) {
      const shouldLeave = window.confirm(
        "A session is currently active. Are you sure you want to leave? Attendance will not be saved."
      );
      if (!shouldLeave) return;
    }
    
    cleanup();
    localStorage.removeItem("selectedCourseId");
    localStorage.removeItem("selectedCourseName");
    router.push("/teacher/attendance");
  }

  function formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  const trainedStudents = students.filter((s) => s.hasFaceData).length;
  const untrainedStudents = students.length - trainedStudents;
  const recognizedCount = allRecognizedStudents.size;
  const attendanceRate = students.length > 0 
    ? ((recognizedCount / students.length) * 100).toFixed(1)
    : "0.0";

  if (!courseId) {
    return (
      <div className="flex justify-center items-center min-h-[240px] text-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
          <p className="text-slate-500 mt-3 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const historyEntries = Object.entries(attendanceHistory).sort(([a], [b]) =>
    b.localeCompare(a)
  );

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <div className="space-y-6 text-slate-900 px-3 sm:px-4 md:px-6 py-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="w-full md:w-auto">
            <Button
              variant="ghost"
              onClick={goBack}
              disabled={sessionActive && !sessionPaused}
              className="px-0 h-auto mb-2 text-slate-600 hover:text-slate-900 hover:bg-transparent text-xs sm:text-sm flex items-center gap-1"
            >
              ← <span>Back to Attendance Setup</span>
            </Button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2 flex-wrap">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
                <Camera size={18} />
              </span>
              <span>AI Attendance Session</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1">
              {courseName || "Automated 45-minute attendance capture"}
            </p>
          </div>

          <div className="w-full md:w-auto flex justify-end gap-2">
            {!sessionActive && (
              <Button
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
                className="inline-flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm"
              >
                <History size={16} />
                <span>{showHistory ? "Hide History" : "View History"}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Session Timer & Stats */}
        {sessionActive && (
          <Card className="border-2 border-indigo-500 bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-lg">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 font-medium">SESSION TIME REMAINING</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      {formatTime(timeRemaining)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-center px-4 py-2 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-600">Recognized</p>
                    <p className="text-xl font-bold text-emerald-600">{recognizedCount}</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-600">Rate</p>
                    <p className="text-xl font-bold text-indigo-600">{attendanceRate}%</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-600">Scans</p>
                    <p className="text-xl font-bold text-purple-600">{sessionRecognitions.length}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!sessionPaused ? (
                    <Button
                      onClick={pauseSession}
                      className="bg-amber-500 hover:bg-amber-600 text-black"
                    >
                      <Pause size={16} className="mr-1" />
                      Pause
                    </Button>
                  ) : (
                    <Button
                      onClick={resumeSession}
                      className="bg-emerald-500 hover:bg-emerald-600 text-black"
                    >
                      <Play size={16} className="mr-1" />
                      Resume
                    </Button>
                  )}
                  <Button
                    onClick={endSession}
                    variant="outline"
                    className="border-rose-300 text-rose-600 hover:bg-rose-50"
                  >
                    <Square size={16} className="mr-1" />
                    End Session
                  </Button>
                </div>
              </div>

              {sessionPaused && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
                  ⏸️ Session paused. Camera capture is stopped. Click "Resume" to continue.
                </div>
              )}

              {capturing && (
                <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-900 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
                  Capturing and recognizing faces...
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats when not in session */}
        {!sessionActive && !showHistory && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <p className="text-[11px] sm:text-xs font-semibold tracking-wide text-slate-500 uppercase flex items-center gap-1">
                  <Users size={14} /> Total Students
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 text-slate-900">
                  {students.length}
                </p>
              </CardContent>
            </Card>
            <Card className="border border-emerald-200 bg-emerald-50 rounded-2xl shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <p className="text-[11px] sm:text-xs font-semibold tracking-wide text-emerald-700 uppercase flex items-center gap-1">
                  <CheckCircle2 size={14} /> Trained Students
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 text-emerald-800">
                  {trainedStudents}
                </p>
              </CardContent>
            </Card>
            <Card className="border border-amber-200 bg-amber-50 rounded-2xl shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <p className="text-[11px] sm:text-xs font-semibold tracking-wide text-amber-700 uppercase flex items-center gap-1">
                  <AlertCircle size={14} /> Untrained Students
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 text-amber-800">
                  {untrainedStudents}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Attendance History */}
        {showHistory && (
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
            <CardHeader className="pb-3 px-4 sm:px-5 pt-4 sm:pt-5">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                <History size={20} className="text-indigo-500" />
                <span>Attendance History</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-5 pb-4 sm:pb-5">
              {historyEntries.length === 0 ? (
                <div className="text-center py-10 sm:py-12">
                  <p className="text-3xl sm:text-4xl mb-3">📋</p>
                  <p className="text-slate-500 text-sm sm:text-base">
                    No attendance records yet for this course.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historyEntries.map(([date, records]) => {
                    const presentCount = records.filter((r) => r.status).length;
                    const totalCount = records.length;
                    const attendanceRate = ((presentCount / totalCount) * 100).toFixed(1);

                    return (
                      <Card
                        key={date}
                        className="border border-slate-200 bg-slate-50 rounded-2xl overflow-hidden"
                      >
                        <CardHeader className="px-4 sm:px-5 py-3 border-b border-slate-200">
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 sm:gap-3">
                            <div>
                              <p className="font-semibold text-slate-900 text-sm sm:text-base">
                                {new Date(date).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                              <p className="text-[11px] sm:text-xs text-slate-500">
                                {courseName || "Course attendance"}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <span className="text-[11px] sm:text-xs md:text-sm text-slate-600">
                                Present:{" "}
                                <span className="font-semibold text-emerald-600">
                                  {presentCount}
                                </span>{" "}
                                / {totalCount}
                              </span>
                              <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs md:text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                {attendanceRate}% attendance
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="divide-y divide-slate-200">
                            {records.map((record) => (
                              <div
                                key={`${record.studentId}-${record.timestamp}`}
                                className="px-4 sm:px-5 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 hover:bg-white text-sm"
                              >
                                <div>
                                  <p className="font-medium text-slate-900">
                                    {record.studentName}
                                  </p>
                                  <p className="text-xs text-slate-500 break-all">
                                    {record.studentEmail}
                                  </p>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                                    record.status
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-rose-50 text-rose-700 border-rose-200 border"
                                  }`}
                                >
                                  {record.status ? "✔ Present" : "✗ Absent"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Session Area */}
        {!showHistory && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Camera View */}
            <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
              <CardHeader className="pb-3 px-4 sm:px-5 pt-4 sm:pt-5">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
                  <Camera size={18} className="text-indigo-500" />
                  <span>Live Camera Feed</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-5 pb-4 sm:pb-5">
                {/* Video Preview */}
                <div
                  className="relative bg-black rounded-xl overflow-hidden border border-slate-200 w-full"
                  style={{ aspectRatio: "16/9" }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {!cameraActive && !sessionActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                      <div className="text-center px-4">
                        <p className="text-4xl mb-3">📷</p>
                        <p className="text-slate-100 text-sm mb-4">
                          Ready to start automated attendance
                        </p>
                        <p className="text-xs text-slate-300 mb-4 max-w-xs mx-auto">
                          Session will run for 45 minutes with automatic face capture every 2 minutes
                        </p>
                        <Button
                          onClick={startSession}
                          disabled={trainedStudents === 0}
                          className="bg-indigo-600 hover:bg-indigo-700 text-black px-6 py-3 shadow-lg text-base"
                        >
                          <Play size={18} className="mr-2" />
                          Start 45-Min Session
                        </Button>
                        {trainedStudents === 0 && (
                          <p className="text-xs text-rose-300 mt-3">
                            ⚠️ No trained students. Please train the model first.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {capturing && (
                    <div className="absolute top-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                      <span className="text-sm font-medium">Capturing...</span>
                    </div>
                  )}

                  {sessionActive && !capturing && (
                    <div className="absolute top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full" />
                      <span className="text-sm font-medium">Live</span>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                {!sessionActive && (
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-xs sm:text-sm text-indigo-900">
                    <div className="flex items-center gap-2 font-semibold mb-2">
                      <Brain size={14} />
                      <span>How Automated Sessions Work</span>
                    </div>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Click "Start 45-Min Session" to begin</li>
                      <li>Camera activates automatically</li>
                      <li>First face capture happens immediately</li>
                      <li>Automatic captures every 2 minutes thereafter</li>
                      <li>Session runs for 45 minutes total</li>
                      <li>Review recognized students after session ends</li>
                      <li>Click "Submit Attendance" to finalize</li>
                      <li>You can pause/resume or end early if needed</li>
                    </ol>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recognition Results */}
            <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
              <CardHeader className="pb-3 px-4 sm:px-5 pt-4 sm:pt-5">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
                  <Users size={18} className="text-emerald-500" />
                  <span>Session Attendance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-5 pb-4 sm:pb-5">
                {!sessionActive && allRecognizedStudents.size === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-4xl mb-3">👥</p>
                    <p className="text-slate-500 text-sm">
                      Start a session to see recognized students
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Session Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                        <p className="text-xs font-semibold text-emerald-700 uppercase">
                          Total Present
                        </p>
                        <p className="text-2xl font-bold text-emerald-800 mt-1">
                          {recognizedCount}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-600 uppercase">
                          Absent
                        </p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">
                          {students.length - recognizedCount}
                        </p>
                      </div>
                    </div>

                    {/* Recognized Students List */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center justify-between">
                        <span>Present Students ({recognizedCount})</span>
                        {currentRecognition && (
                          <span className="text-xs text-slate-500 font-normal">
                            Last scan: {currentRecognition.totalFaces} faces detected
                          </span>
                        )}
                      </h3>
                      {recognizedCount === 0 ? (
                        <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                          <p className="text-sm text-slate-500">
                            No students recognized yet
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Waiting for first capture...
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                          {Array.from(allRecognizedStudents).map((studentId) => {
                            const student = students.find((s) => s.id === studentId);
                            if (!student) return null;

                            return (
                              <div
                                key={studentId}
                                className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5"
                              >
                                <div>
                                  <p className="text-sm font-medium text-slate-900">
                                    {student.name}
                                  </p>
                                  <p className="text-xs text-slate-600 break-all">
                                    {student.email}
                                  </p>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-semibold whitespace-nowrap">
                                  ✔ Present
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Manual Submit - available during or after session */}
                    {allRecognizedStudents.size > 0 && (
                      <div className="space-y-2">
                        <Button
                          onClick={submitAttendance}
                          disabled={submitting}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-black py-3 rounded-xl font-semibold"
                        >
                          {submitting ? "Submitting..." : "Submit Attendance"}
                        </Button>
                        {sessionActive && (
                          <p className="text-xs text-center text-slate-500">
                            💡 You can submit now or wait until the session ends
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
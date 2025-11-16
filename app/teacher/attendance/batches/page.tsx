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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          facingMode: "user",
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
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Failed to create blob"));
            },
            "image/jpeg",
            0.95
          );
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

      if (!res.ok) {
        const error = await res.json();
        alert(`Recognition failed: ${error.error || "Unknown error"}`);
        return;
      }

      const result = await res.json();
      console.log("RAW /api/recognize response:", result);
      console.log("Loaded students (before normalize):", students);

      // if no students loaded yet, fetch them
      if ((!students || students.length === 0) && typeof fetchStudents === "function") {
        try {
          await fetchStudents(courseId);
          console.log("Fetched students for normalization:", students);
        } catch (e) {
          console.warn("fetchStudents failed during normalization:", e);
        }
      }

      // helper to match recognized IDs to known students
      function findStudentByCandidate(candidate: string | null | undefined) {
        if (!candidate) return null;
        const s = String(candidate).trim();
        const found =
          students.find((st) => st.id === s) ||
          students.find((st) => st.id.toLowerCase() === s.toLowerCase()) ||
          students.find((st) => (st.name || "").toLowerCase() === s.toLowerCase()) ||
          students.find((st) => (st.email || "").toLowerCase() === s.toLowerCase()) ||
          students.find(
            (st) =>
              (st.id || "").toLowerCase().includes(s.toLowerCase()) ||
              (st.name || "").toLowerCase().includes(s.toLowerCase()) ||
              (st.email || "").toLowerCase().includes(s.toLowerCase())
          );
        return found || null;
      }

      // normalize recognized students
      const rawRec = result.recognizedStudents || [];
      const normalized: RecognitionStudent[] = rawRec.map((item: any, idx: number) => {
        console.log(`recognizedStudents[${idx}] raw:`, item);

        if (!item) return { id: "unknown", name: "unknown", email: "" };

        // case 1: backend returned a string ID
        if (typeof item === "string") {
          const idStr = item.trim();
          const found = findStudentByCandidate(idStr);
          if (found) return { id: found.id, name: found.name, email: found.email };
          console.warn("Unmatched recognized ID:", idStr);
          return { id: idStr, name: idStr, email: "" };
        }

        // case 2: backend returned object
        if (typeof item === "object") {
          const possibleFields = [
            item.id,
            item.studentId,
            item.student_id,
            item.name,
            item.studentName,
            item.displayName,
            item.email,
            item.studentEmail,
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

        // fallback for unexpected type
        return { id: String(item), name: String(item), email: "" };
      });

      // normalize detections
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

      // preliminary result
      const normalizedResult: RecognitionResult = {
        totalFaces: Number(result.totalFaces ?? normalizedDetections.length ?? 0),
        recognizedStudents: normalized,
        averageConfidence:
          typeof result.averageConfidence === "number"
            ? result.averageConfidence
            : parseFloat(result.averageConfidence) || 0,
        detections: normalizedDetections,
      };

      // ✅ resolve missing names (call backend only if needed)
      const missingIds = normalized
        .filter((s) => s && (!s.name || s.name === s.id))
        .map((s) => s.id)
        .filter((id) => id && id !== "unknown");

      if (missingIds.length > 0) {
        console.log("Resolving missing IDs from backend:", missingIds);
        try {
          const token2 = localStorage.getItem("token");
          const resp = await fetch("/api/teacher/attendance?operation=resolve-ids", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token2}`,
            },
            body: JSON.stringify({ ids: missingIds }),
          });

          if (resp.ok) {
            const resolved = (await resp.json()) as Array<{
              id: string;
              name?: string;
              email?: string;
            }>;

            const map = new Map(resolved.map((r) => [r.id, r]));
            const merged = normalized.map((s) => {
              const r = map.get(s.id);
              if (r) {
                return {
                  id: r.id,
                  name: r.name || s.id,
                  email: r.email || "",
                };
              }
              return s;
            });

            const mergedResult = { ...normalizedResult, recognizedStudents: merged };
            console.log("✅ Merged recognitionResult (with resolved IDs):", mergedResult);
            setRecognitionResult(mergedResult);
            return;
          } else {
            console.warn("resolve-ids request failed; using fallback normalized data");
          }
        } catch (e) {
          console.warn("resolve-ids call error:", e);
        }
      }

      // fallback: just use normalized result
      console.log("✅ Normalized recognitionResult (set to state):", normalizedResult);
      setRecognitionResult(normalizedResult);
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
    <div className="space-y-8 text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            onClick={goBack}
            className="px-0 h-auto mb-2 text-slate-600 hover:text-slate-900 hover:bg-transparent text-sm flex items-center gap-1"
          >
            ← <span>Back to Attendance Setup</span>
          </Button>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
              <Camera size={18} />
            </span>
            <span>Face Recognition Attendance</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            {courseName || "Course attendance capture using AI-based face recognition."}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowHistory(!showHistory)}
          className="inline-flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 text-sm"
        >
          <History size={16} />
          <span>{showHistory ? "Hide History" : "View History"}</span>
        </Button>
      </div>

      {/* Top stats (when NOT viewing history) */}
      {!showHistory && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Total Students
              </p>
              <p className="text-2xl sm:text-3xl font-bold mt-1 text-slate-900">
                {students.length}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-emerald-200 bg-emerald-50 rounded-2xl shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase flex items-center gap-1">
                <CheckCircle2 size={14} /> Trained Students
              </p>
              <p className="text-2xl sm:text-3xl font-bold mt-1 text-emerald-800">
                {trainedStudents}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-amber-200 bg-amber-50 rounded-2xl shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs font-semibold tracking-wide text-amber-700 uppercase flex items-center gap-1">
                <AlertCircle size={14} /> Untrained Students
              </p>
              <p className="text-2xl sm:text-3xl font-bold mt-1 text-amber-800">
                {untrainedStudents}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance History (toggle view) */}
      {showHistory && (
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <History size={20} className="text-indigo-500" />
              <span>Attendance History</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {historyEntries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-slate-500 text-sm md:text-base">
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
                      <CardHeader className="px-4 py-3 border-b border-slate-200">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-900 text-sm md:text-base">
                              {new Date(date).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-xs text-slate-500">
                              {courseName || "Course attendance"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs md:text-sm text-slate-600">
                              Present:{" "}
                              <span className="font-semibold text-emerald-600">
                                {presentCount}
                              </span>{" "}
                              / {totalCount}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs md:text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200">
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
                              className="px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 hover:bg-white"
                            >
                              <div>
                                <p className="font-medium text-sm md:text-base text-slate-900">
                                  {record.studentName}
                                </p>
                                <p className="text-xs md:text-sm text-slate-500 break-all">
                                  {record.studentEmail}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                                  record.status
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-rose-50 text-rose-700 border border-rose-200"
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

      {/* Camera + Recognition side-by-side (when not viewing history) */}
      {!showHistory && (
        <div className="grid gap-6 lg:grid-cols-[3fr,2fr] items-start">
          {/* Camera Card */}
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-[0_6px_18px_rgba(79,70,229,0.6)]">
                  <Camera size={18} />
                </div>
                <div>
                  <CardTitle className="text-base md:text-lg">
                    Camera Capture
                  </CardTitle>
                  <p className="text-xs md:text-sm text-slate-500">
                    Capture frames and run face recognition.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video Preview */}
              <div
                className="relative bg-black rounded-xl overflow-hidden border border-slate-200"
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

                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                    <div className="text-center px-4">
                      <p className="text-4xl mb-2">📷</p>
                      <p className="text-slate-100 text-sm md:text-base mb-3">
                        Camera is currently off
                      </p>
                      <Button
                        onClick={startCamera}
                        className="bg-indigo-600 hover:bg-indigo-700 text-slate-800 text-sm md:text-base px-5 py-2.5 shadow-[0_10px_25px_rgba(79,70,229,0.55)]"
                      >
                        Start Camera
                      </Button>
                    </div>
                  </div>
                )}

                {(capturing || recognizing) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="text-center px-4">
                      <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-t-4 border-indigo-500 mb-3 mx-auto" />
                      <p className="text-white text-sm md:text-base font-medium">
                        {capturing
                          ? "Capturing frames..."
                          : "Running face recognition..."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                {cameraActive ? (
                  <>
                      <Button
    onClick={captureFrames}
    disabled={capturing || recognizing}
    className={`flex-1 h-auto py-3 sm:py-4 px-4 sm:px-5 justify-start text-left rounded-2xl border transition-all duration-300
      ${
        capturing || recognizing
          ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed shadow-none"
          : "bg-white border-slate-300 hover:bg-slate-50 text-slate-800 shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
      }`}
  >
    <div className="flex items-center gap-3 sm:gap-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl border
          ${
            capturing || recognizing
              ? "bg-slate-200 border-slate-300 text-slate-500"
              : "bg-slate-100 border-slate-300 text-slate-700"
          }`}
      >
        <span className="text-lg">📸</span>
      </div>

      <div className="flex-1">
        <p className="text-sm sm:text-base font-semibold leading-tight text-slate-800">
          {capturing
            ? "Capturing..."
            : recognizing
            ? "Recognizing..."
            : "Start Capture"}
        </p>

        <p
          className={`mt-0.5 text-xs sm:text-[13px] leading-snug
            ${
              capturing || recognizing
                ? "text-slate-500"
                : "text-slate-600"
            }`}
        >
          Capture multiple frames for accurate face recognition.
        </p>
      </div>
    </div>
  </Button>

  {/* Stop Camera */}
  <Button
    variant="outline"
    onClick={stopCamera}
    disabled={capturing || recognizing}
    className={`h-auto py-3 sm:py-4 px-4 sm:px-5 rounded-2xl text-sm md:text-base border transition-all duration-300
      ${
        capturing || recognizing
          ? "border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
          : "border-rose-300 text-rose-600 hover:bg-rose-50 hover:border-rose-400"
      }`}
  >
    Stop Camera
  </Button>
                  </>
                ) : (
                  <div className="text-xs md:text-sm text-slate-500">
                    Click <span className="font-semibold">“Start Camera”</span> to
                    begin capturing frames.
                  </div>
                )}
              </div>

              {/* Instructions */}
              {!cameraActive && !recognitionResult && (
                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs md:text-sm text-slate-700 space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <Brain size={14} className="text-indigo-500" />
                    <span>How to use camera-based attendance</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1.5">
                    <li>Ensure students are trained (see trained count above).</li>
                    <li>Click <strong>“Start Camera”</strong> and position students in view.</li>
                    <li>Click <strong>“Start Capture”</strong> to capture 8 frames.</li>
                    <li>Wait for recognition to finish and review the result.</li>
                    <li>Submit attendance when you’re satisfied.</li>
                  </ol>
                  {untrainedStudents > 0 && (
                    <div className="mt-2 px-3 py-2 rounded-lg bg-amber-100 text-amber-900 border border-amber-200 text-[11px] md:text-xs">
                      ⚠ {untrainedStudents} student(s) are not trained yet and will not be
                      recognized during capture.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recognition & Submit Card */}
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Brain size={18} className="text-indigo-500" />
                <span>Recognition Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!recognitionResult ? (
                <p className="text-sm md:text-base text-slate-500">
                  Capture frames to see recognized students and their attendance.
                </p>
              ) : (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                        Total Faces
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-slate-900 mt-1">
                        {recognitionResult.totalFaces}
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-[11px] font-semibold tracking-wide text-emerald-700 uppercase">
                        Recognized
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-emerald-800 mt-1">
                        {recognitionResult.recognizedStudents.length}
                      </p>
                    </div>
                    <div className="rounded-xl border border-purple-200 bg-purple-50 p-3">
                      <p className="text-[11px] font-semibold tracking-wide text-purple-700 uppercase">
                        Avg Confidence
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-purple-800 mt-1">
                        {(recognitionResult.averageConfidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Recognized students list */}
                  <div>
                    <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-2">
                      Present Students (
                      {recognitionResult.recognizedStudents.length})
                    </h3>
                    {recognitionResult.recognizedStudents.length === 0 ? (
                      <p className="text-sm text-slate-500 py-4 text-center border border-dashed border-slate-200 rounded-xl">
                        No students recognized in this capture.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                        {recognitionResult.recognizedStudents.map((student) => (
                          <div
                            key={student.id}
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
                            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                              ✔ Present
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit button */}
                  <Button
                    onClick={submitAttendance}
                    disabled={submitting}
                    className={`w-full mt-2 text-sm md:text-base font-semibold ${
                      submitting
                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-green-400 shadow-[0_10px_25px_rgba(79,70,229,0.4)]"
                    }`}
                  >
                    {submitting ? "Submitting..." : "✔ Submit Attendance"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

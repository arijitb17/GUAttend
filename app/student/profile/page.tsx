"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Book,
  Calendar,
  Building,
  Loader,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Course {
  id: string;
  name: string;
  entryCode: string;
  teacher: {
    name: string;
    email: string;
  };
  semester: {
    name: string;
    academicYear: string;
  };
}

interface StudentData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  student: {
    id: string;
    program: {
      id: string;
      name: string;
      department: {
        id: string;
        name: string;
      };
    };
    courses: Course[];
    hasFaceEmbedding: boolean;
  };
}

interface Photos {
  front: File | null;
  left: File | null;
  right: File | null;
}

interface Previews {
  front: string | null;
  left: string | null;
  right: string | null;
}

type PoseKey = "front" | "left" | "right";
type UploadStatus = "idle" | "uploading" | "success" | "error";

const poses: Array<{ key: PoseKey; label: string; instruction: string }> = [
  { key: "front", label: "Front View", instruction: "Look straight at the camera" },
  { key: "left", label: "Left Profile", instruction: "Turn your head slightly to the left" },
  { key: "right", label: "Right Profile", instruction: "Turn your head slightly to the right" },
];

const StudentProfilePage: React.FC = () => {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [hasUploadedPhotos, setHasUploadedPhotos] = useState<boolean>(false);
  const [checkingPhotos, setCheckingPhotos] = useState<boolean>(false);

  const [photos, setPhotos] = useState<Photos>({
    front: null,
    left: null,
    right: null,
  });

  const [previews, setPreviews] = useState<Previews>({
    front: null,
    left: null,
    right: null,
  });

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const [activeCamera, setActiveCamera] = useState<PoseKey | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch student data on mount
  useEffect(() => {
    fetchStudentData();
  }, []);

  // Check for uploaded photos when student is loaded
  useEffect(() => {
    if (student?.student?.id) {
      checkUploadedPhotos();
    }
  }, [student]);

  const fetchStudentData = async (): Promise<void> => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setAuthError("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/student/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch student data");
      }

      const data: StudentData = await response.json();
      setStudent(data);
      setAuthError(null);
    } catch (error) {
      console.error("Error fetching student data:", error);
      setAuthError(
        error instanceof Error ? error.message : "An error occurred while loading your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const checkUploadedPhotos = async (): Promise<void> => {
    if (!student?.student?.id) return;

    try {
      setCheckingPhotos(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `/api/student/check-photos?studentId=${student.student.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHasUploadedPhotos(data.hasPhotos || false);
      }
    } catch (error) {
      console.error("Error checking photos:", error);
    } finally {
      setCheckingPhotos(false);
    }
  };

  // Camera controls
  const startCamera = async (pose: PoseKey): Promise<void> => {
    try {
      setMessage("");
      setUploadStatus("idle");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      });

      streamRef.current = stream;
      setActiveCamera(pose);

      // slight delay to ensure video element is rendered
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera error:", err);
      setMessage("Camera access denied. Please enable camera permissions.");
      setUploadStatus("error");
      setActiveCamera(null);
    }
  };

  const stopCamera = (): void => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setActiveCamera(null);
  };

  const capturePhoto = (): void => {
    if (!videoRef.current || !activeCamera) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob || !activeCamera) return;
        const file = new File([blob], `${activeCamera}.jpg`, {
          type: "image/jpeg",
        });
        handlePhotoSelect(activeCamera, file);
        stopCamera();
      },
      "image/jpeg",
      0.95
    );
  };

  const handleFileUpload = (pose: PoseKey, event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      handlePhotoSelect(pose, file);
    }
  };

  const handlePhotoSelect = (pose: PoseKey, file: File): void => {
    setPhotos((prev) => ({ ...prev, [pose]: file }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews((prev) => ({ ...prev, [pose]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (pose: PoseKey): void => {
    setPhotos((prev) => ({ ...prev, [pose]: null }));
    setPreviews((prev) => ({ ...prev, [pose]: null }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!student) return;

    const uploadedPhotos = Object.values(photos).filter((p) => p !== null);

    if (uploadedPhotos.length === 0) {
      setMessage("Please upload at least one photo.");
      setUploadStatus("error");
      return;
    }

    setUploadStatus("uploading");
    setMessage("Uploading photos and processing face data...");

    const formData = new FormData();
    formData.append("studentId", student.student.id);

    Object.entries(photos).forEach(([pose, file]) => {
      if (file) {
        formData.append(pose, file);
      }
    });

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/student/upload-photos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Server returned an invalid response. Please check if the API endpoint exists."
        );
      }

      const data = await response.json();

      if (response.ok) {
        setUploadStatus("success");
        setMessage(
          data.message || "Photos uploaded successfully! Face processing has started."
        );

        // Update local student state
        setStudent((prev) =>
          prev
            ? {
                ...prev,
                student: { ...prev.student, hasFaceEmbedding: true },
              }
            : prev
        );

        // Clear photos shortly after success
        setTimeout(() => {
          setPhotos({ front: null, left: null, right: null });
          setPreviews({ front: null, left: null, right: null });
          setUploadStatus("idle");
          setMessage("");
        }, 3000);
      } else {
        throw new Error(data.error || "Upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Upload failed. Please try again."}`
      );
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-900">
        <div className="text-center space-y-3">
          <Loader className="animate-spin mx-auto" size={32} />
          <p className="text-sm text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Auth error state
  if (authError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-900 px-4">
        <Card className="max-w-md w-full border border-red-200 bg-red-50/80 shadow-[0_8px_30px_rgba(220,38,38,0.15)]">
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle size={20} />
            </div>
            <CardTitle className="text-base md:text-lg text-red-800">
              Authentication Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <p className="text-sm text-red-700">{authError}</p>
            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={() => (window.location.href = "/login")}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) return null;

  const hasFace = hasUploadedPhotos || student.student.hasFaceEmbedding;

  return (
    <div className="space-y-8 text-slate-900">
      {/* Header + Basic Info */}
      <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(15,23,42,0.12)]">
        <CardContent className="p-5 md:p-6 space-y-6">
          {/* Top row: Title + status chip */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-[0_4px_12px_rgba(15,23,42,0.35)]">
                <User size={20} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  Student Profile
                </h1>
                <p className="text-sm md:text-base text-slate-600 mt-1">
                  View your basic details and set up face recognition for attendance.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
                <Calendar size={14} />
                Joined{" "}
                {new Date(student.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {hasFace ? (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-xs font-medium text-emerald-700">
                  <CheckCircle size={14} />
                  Face recognition active
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-xs font-medium text-amber-700">
                  <AlertCircle size={14} />
                  Face recognition not set up
                </span>
              )}
            </div>
          </div>

          {/* Grid: Basic info + Status/Program */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: basic info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <User size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Name</p>
                  <p className="text-sm md:text-base font-semibold text-slate-900 truncate">
                    {student.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Mail size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm md:text-base font-semibold text-slate-900 truncate">
                    {student.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: program + department + face status */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                  <Book size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Program</p>
                  <p className="text-sm md:text-base font-semibold text-slate-900 truncate">
                    {student.student.program.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                  <Building size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Department</p>
                  <p className="text-sm md:text-base font-semibold text-slate-900 truncate">
                    {student.student.program.department.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enrolled courses summary */}
          {student.student.courses.length > 0 && (
            <div className="mt-2">
              <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Enrolled Courses ({student.student.courses.length})
              </h3>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 max-h-52 overflow-y-auto">
                <div className="space-y-2">
                  {student.student.courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs sm:text-sm border-b last:border-b-0 border-slate-200/60 pb-2 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {course.name}
                        </p>
                        <p className="text-slate-500">
                          {course.teacher.name} • {course.semester.name} (
                          {course.semester.academicYear})
                        </p>
                      </div>
                      <span className="inline-flex mt-1 sm:mt-0 items-center gap-1 self-start sm:self-center px-2 py-0.5 rounded-full border border-slate-200 bg-white text-[11px] text-slate-600 font-medium">
                        {course.entryCode}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main grid: Face status + upload section */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr,2fr] gap-6">
        {/* Face recognition status card */}
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(15,23,42,0.08)]">
          <CardHeader className="pb-3 flex flex-row items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle size={18} />
            </div>
            <CardTitle className="text-base md:text-lg">
              Face Recognition Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {checkingPhotos ? (
              <div className="flex items-center gap-2 text-slate-600">
                <Loader className="animate-spin" size={18} />
                <span className="text-sm">Checking your photo status…</span>
              </div>
            ) : hasFace ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="text-emerald-600 mt-0.5" size={18} />
                  <p className="text-sm text-slate-700">
                    Your face data is registered. You can still update your photos below
                    for better recognition if needed.
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                  Tip: Use clear lighting and avoid heavy filters or obstructions (caps,
                  masks, etc.) for best accuracy.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-amber-500 mt-0.5" size={18} />
                  <p className="text-sm text-slate-700">
                    Face recognition is not set up yet. Upload 1–3 photos to enable
                    automatic attendance.
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  You can upload photos from your gallery or capture them live with your
                  device camera.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photo Upload / Camera section */}
<Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
  <CardHeader className="pb-3">
    <CardTitle className="text-base md:text-lg flex items-center justify-between gap-2">
      <span>
        {hasFace ? "Update Face Photos" : "Upload Face Photos"}
      </span>
      <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
        Face Data
      </span>
    </CardTitle>
  </CardHeader>

  <CardContent className="space-y-5">
    <p className="text-xs md:text-sm text-slate-600">
      Upload photos from three angles for accurate recognition. You can either{" "}
      <span className="font-medium text-slate-900">capture from camera</span> or{" "}
      <span className="font-medium text-slate-900">upload existing images</span>.
    </p>

    {/* Camera View */}
    {activeCamera && (
      <div className="rounded-xl border border-slate-200 bg-slate-950/95 text-slate-50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div>
            <p className="text-sm font-semibold text-white">
              {poses.find((p) => p.key === activeCamera)?.label}
            </p>
            <p className="text-[11px] text-slate-300">
              {poses.find((p) => p.key === activeCamera)?.instruction}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 bg-white text-slate-900 hover:bg-slate-200"
            onClick={stopCamera}
          >
            Close
          </Button>
        </div>

        <div className="px-4 pt-4 pb-3 space-y-3">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-lg bg-black max-h-[320px] object-contain"
          />
          <Button
            className="w-full bg-indigo-100 hover:bg-indigo-200 text-slate-900 font-semibold"
            onClick={capturePhoto}
          >
            Capture Photo
          </Button>
        </div>
      </div>
    )}

    {/* Pose Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {poses.map(({ key, label, instruction }) => (
        <div
          key={key}
          className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-3"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">{label}</p>
            <p className="text-[11px] text-slate-500">{instruction}</p>
          </div>

          {previews[key] ? (
            <div className="space-y-2">
              <div className="relative">
                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
  <img
    src={previews[key] || ""}
    alt={label}
    className="absolute inset-0 w-full h-full object-cover"
  />
</div>

                <button
                  onClick={() => removePhoto(key)}
                  className="absolute top-2 right-2 rounded-full bg-slate-900 text-slate-900 text-xs px-1.5 py-0.5 hover:bg-black"
                >
                  ×
                </button>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <CheckCircle size={12} />
                Photo ready
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* CAMERA BUTTON */}
              <Button
                size="sm"
                className="w-full bg-indigo-100 hover:bg-indigo-200 text-slate-900 font-semibold text-xs"
                onClick={() => startCamera(key)}
                disabled={activeCamera !== null}
              >
                <Camera size={14} className="mr-1.5" />
                Use Camera
              </Button>

              {/* UPLOAD BUTTON */}
              <label className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold text-xs py-1.5 cursor-pointer hover:bg-slate-100">
                <Upload size={14} />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(key, e)}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      ))}
    </div>

    {/* Status Message */}
    {message && uploadStatus !== "idle" && (
      <div
        className={`rounded-xl px-3 py-2 text-xs sm:text-sm flex items-center gap-2 ${
          uploadStatus === "success"
            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
            : uploadStatus === "error"
            ? "bg-rose-50 text-rose-800 border border-rose-200"
            : uploadStatus === "uploading"
            ? "bg-sky-50 text-sky-800 border border-sky-200"
            : "bg-slate-50 text-slate-700 border border-slate-200"
        }`}
      >
        {uploadStatus === "success" && <CheckCircle size={16} />}
        {uploadStatus === "error" && <AlertCircle size={16} />}
        {uploadStatus === "uploading" && <Loader size={16} className="animate-spin" />}
        <span>{message}</span>
      </div>
    )}

    {/* SUBMIT BUTTON */}
    <Button
      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-sm md:text-base py-2.5"
      onClick={handleSubmit}
      disabled={
        uploadStatus === "uploading" ||
        Object.values(photos).every((p) => p === null)
      }
    >
      {uploadStatus === "uploading" ? "Processing..." : "Submit Photos"}
    </Button>

    <p className="text-[11px] text-slate-500 text-center">
      Your photos are used only for the face-recognition attendance system and stored securely.
    </p>
  </CardContent>
</Card>

      </div>
    </div>
  );
};

export default StudentProfilePage;

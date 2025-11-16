"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Users,
  CheckCircle2,
  AlertCircle,
  Camera,
  GraduationCap,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Course {
  id: string;
  name: string;
  entryCode: string;
}

interface Semester {
  id: string;
  name: string;
  academicYearId: string;
  courses: Course[];
}

interface AcademicYear {
  id: string;
  name: string;
  programId: string;
  semesters: Semester[];
}

interface Program {
  id: string;
  name: string;
  departmentId: string;
  academicYears: AcademicYear[];
}

interface Department {
  id: string;
  name: string;
  programs: Program[];
}

interface Hierarchy {
  departments: Department[];
}

interface Student {
  id: string;
  user: {
    name: string;
    email: string;
  };
  faceEmbedding: Buffer | null;
  photoCount?: number;
  hasPhotos?: boolean;
}

/* ---------- Shared stat card styles (like TeacherOverview) ---------- */

const STAT_STYLES = [
  {
    bg: "from-indigo-400/30 via-indigo-400/10 to-transparent",
    iconBg:
      "bg-gradient-to-br from-indigo-500 to-sky-400 shadow-[0_8px_20px_-4px_rgba(79,70,229,0.4)]",
  },
  {
    bg: "from-emerald-400/30 via-emerald-400/10 to-transparent",
    iconBg:
      "bg-gradient-to-br from-emerald-500 to-lime-400 shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)]",
  },
  {
    bg: "from-amber-400/30 via-amber-400/10 to-transparent",
    iconBg:
      "bg-gradient-to-br from-amber-500 to-orange-400 shadow-[0_8px_20px_-4px_rgba(245,158,11,0.4)]",
  },
  {
    bg: "from-purple-400/30 via-purple-400/10 to-transparent",
    iconBg:
      "bg-gradient-to-br from-purple-500 to-pink-400 shadow-[0_8px_20px_-4px_rgba(168,85,247,0.4)]",
  },
];

/* ---------- Helpers for IT-701 style code ---------- */

function getDeptCode(deptName: string): string {
  const stopWords = ["and", "of", "department", "dept.", "dept"];
  const words = deptName
    .split(/\s+/)
    .filter((w) => !stopWords.includes(w.toLowerCase()));

  if (words.length === 0) return "GEN";

  if (words.length === 1) {
    const w = words[0].replace(/[^a-zA-Z]/g, "");
    if (w.length >= 3) return w.slice(0, 3).toUpperCase();
    return w.toUpperCase();
  }

  return words
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function getSemesterNumber(semName: string): number {
  const match = semName.match(/\d+/);
  if (!match) return 0;
  return parseInt(match[0], 10);
}

function buildDisplayCourseCode(
  deptName: string,
  semName: string,
  index: number
): string {
  const deptCode = getDeptCode(deptName || "GEN");
  const semNum = getSemesterNumber(semName || "0");
  const subjectIndex = String(index + 1).padStart(2, "0"); // 01, 02, 03...
  // Example: IT-701 for 7th sem, 1st subject
  return `${deptCode}-${semNum}${subjectIndex}`;
}

/* --------------------------------------------------- */

export default function TeacherAttendance() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<"select" | "students">("select");

  // Hierarchy data
  const [hierarchy, setHierarchy] = useState<Hierarchy | null>(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);

  // Selection states
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Filtered data based on selections
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [filteredAcademicYears, setFilteredAcademicYears] = useState<AcademicYear[]>([]);
  const [filteredSemesters, setFilteredSemesters] = useState<Semester[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  // Students
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);

  // Load hierarchy on mount
  useEffect(() => {
    fetchHierarchy();
  }, []);

  // Update filtered programs when department changes
  useEffect(() => {
    if (selectedDepartment && hierarchy) {
      const dept = hierarchy.departments.find((d) => d.id === selectedDepartment);
      setFilteredPrograms(dept?.programs || []);
      setSelectedProgram("");
      setSelectedAcademicYear("");
      setSelectedSemester("");
      setSelectedCourse(null);
    }
  }, [selectedDepartment, hierarchy]);

  // Update filtered academic years when program changes
  useEffect(() => {
    if (selectedProgram) {
      const program = filteredPrograms.find((p) => p.id === selectedProgram);
      setFilteredAcademicYears(program?.academicYears || []);
      setSelectedAcademicYear("");
      setSelectedSemester("");
      setSelectedCourse(null);
    }
  }, [selectedProgram, filteredPrograms]);

  // Update filtered semesters when academic year changes
  useEffect(() => {
    if (selectedAcademicYear) {
      const year = filteredAcademicYears.find((y) => y.id === selectedAcademicYear);
      setFilteredSemesters(year?.semesters || []);
      setSelectedSemester("");
      setSelectedCourse(null);
    }
  }, [selectedAcademicYear, filteredAcademicYears]);

  // Update filtered courses when semester changes
  useEffect(() => {
    if (selectedSemester) {
      const semester = filteredSemesters.find((s) => s.id === selectedSemester);
      setFilteredCourses(semester?.courses || []);
      setSelectedCourse(null);
    }
  }, [selectedSemester, filteredSemesters]);

  async function fetchHierarchy() {
    setLoadingHierarchy(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/teacher/hierarchy", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setHierarchy(data);
      } else {
        alert("Failed to fetch course hierarchy");
      }
    } catch (error) {
      console.error("Failed to fetch hierarchy:", error);
      alert("Error loading course data");
    } finally {
      setLoadingHierarchy(false);
    }
  }

  async function fetchCourseStudents(courseId: string) {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/teacher/courses/${courseId}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();

        const studentsData: Student[] = data.students || [];

        if (!Array.isArray(studentsData)) {
          console.error("Invalid students data format:", data);
          alert("Error: Invalid data format received from server");
          setLoading(false);
          return;
        }

        const updatedStudents = await Promise.all(
          studentsData.map(async (student) => {
            try {
              const photoRes = await fetch(
                `/api/student/check-photos?studentId=${student.id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (photoRes.ok) {
                const photoData = await photoRes.json();
                return {
                  ...student,
                  hasPhotos: photoData.hasPhotos,
                  photoCount: photoData.photoCount,
                };
              } else {
                return { ...student, hasPhotos: false, photoCount: 0 };
              }
            } catch (err) {
              console.error(`Photo check failed for ${student.id}:`, err);
              return { ...student, hasPhotos: false, photoCount: 0 };
            }
          })
        );

        setStudents(updatedStudents);
        setCurrentView("students");
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Failed to fetch students:", errorData);
        alert("Failed to fetch students: " + (errorData.error || res.statusText));
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      alert(
        "Error fetching students: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCourseSelect(course: Course) {
    setSelectedCourse(course);
    fetchCourseStudents(course.id);
  }

  async function handleTrainStudents() {
    if (!selectedCourse) return;

    const untrainedStudents = students.filter((s) => !s.faceEmbedding);
    const studentsWithoutPhotos = students.filter((s) => !s.hasPhotos);

    if (studentsWithoutPhotos.length > 0) {
      const studentNames = studentsWithoutPhotos.map((s) => s.user.name).join(", ");
      alert(
        `⚠️ Warning: The following students don't have photos:\n${studentNames}\n\nPlease ensure they have captured photos using photo.py first.`
      );
      return;
    }

    if (untrainedStudents.length === 0) {
      alert("ℹ️ All students are already trained!");
      return;
    }

    setTraining(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/train", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ " + data.message);
        fetchCourseStudents(selectedCourse.id);
      } else {
        alert("❌ " + (data.error || "Training failed"));
      }
    } catch (error) {
      console.error("Training error:", error);
      alert("Error while running training script");
    } finally {
      setTraining(false);
    }
  }

  function handleCaptureAttendance() {
    if (!selectedCourse) return;

    const trainedStudents = students.filter((s) => s.faceEmbedding);

    if (trainedStudents.length === 0) {
      alert("⚠️ No students are trained yet! Please train the model first.");
      return;
    }

    localStorage.setItem("selectedCourseId", selectedCourse.id);
    localStorage.setItem("selectedCourseName", selectedCourse.name);

    router.push(
      `/teacher/attendance/batches?courseId=${selectedCourse.id}&courseName=${encodeURIComponent(
        selectedCourse.name
      )}`
    );
  }

  function resetSelection() {
    setSelectedDepartment("");
    setSelectedProgram("");
    setSelectedAcademicYear("");
    setSelectedSemester("");
    setSelectedCourse(null);
    setFilteredPrograms([]);
    setFilteredAcademicYears([]);
    setFilteredSemesters([]);
    setFilteredCourses([]);
    setStudents([]);
    setCurrentView("select");
  }

  const trainedCount = students.filter((s) => s.faceEmbedding).length;
  const withPhotosCount = students.filter((s) => s.hasPhotos).length;
  const untrainedCount = students.length - trainedCount;

  if (loadingHierarchy) {
    return (
      <div className="flex justify-center items-center min-h-[240px] text-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
          <p className="text-slate-500 mt-3 text-sm">Loading course data...</p>
        </div>
      </div>
    );
  }

  // For course-code generation in selection grid
  const selectedDeptName =
    hierarchy?.departments.find((d) => d.id === selectedDepartment)?.name || "";
  const selectedSemName =
    filteredSemesters.find((s) => s.id === selectedSemester)?.name || "";

  const statCards = [
    { title: "Total Students", value: students.length, icon: Users },
    { title: "Trained", value: trainedCount, icon: CheckCircle2 },
    { title: "Have Photos", value: withPhotosCount, icon: Camera },
    { title: "Not Trained", value: untrainedCount, icon: AlertCircle },
  ];

  return (
    <div className="space-y-10 text-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight flex items-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white text-xl shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
              <Camera size={18} />
            </span>
            <span>Attendance Management</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
            {currentView === "select"
              ? "Choose a course and get your AI attendance ready in a few clicks."
              : `Managing: ${selectedCourse?.name}`}
          </p>
        </div>

        {currentView !== "select" && (
          <Button
            variant="outline"
            onClick={resetSelection}
            className="text-sm border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            ← Back to course selection
          </Button>
        )}
      </div>

      {/* When selecting course */}
      {currentView === "select" && (
        <div className="grid gap-6 lg:grid-cols-[2fr,1.4fr]">
          {/* Left: Course selection card */}
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <BookOpen className="text-indigo-500" size={20} />
                <span>Select Course</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 sm:space-y-6">
              {/* Department Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  1. Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                >
                  <option value="">-- Choose Department --</option>
                  {hierarchy?.departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Program Selection */}
              {selectedDepartment && filteredPrograms.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    2. Program
                  </label>
                  <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  >
                    <option value="">-- Choose Program --</option>
                    {filteredPrograms.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Academic Year Selection */}
              {selectedProgram && filteredAcademicYears.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    3. Academic Year
                  </label>
                  <select
                    value={selectedAcademicYear}
                    onChange={(e) => setSelectedAcademicYear(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  >
                    <option value="">-- Choose Academic Year --</option>
                    {filteredAcademicYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Semester Selection */}
              {selectedAcademicYear && filteredSemesters.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    4. Semester
                  </label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  >
                    <option value="">-- Choose Semester --</option>
                    {filteredSemesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Course Selection */}
              {selectedSemester && filteredCourses.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    5. Course
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {filteredCourses.map((course, index) => {
                      const displayCode = buildDisplayCourseCode(
                        selectedDeptName,
                        selectedSemName,
                        index
                      );
                      return (
                        <button
                          type="button"
                          key={course.id}
                          onClick={() => handleCourseSelect(course)}
                          className="text-left p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300 hover:shadow-[0_10px_25px_rgba(15,23,42,0.08)] transition-all"
                        >
                          <p className="text-xs sm:text-sm font-mono text-indigo-600 mb-1">
                            {displayCode}
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-slate-900">
                            {course.name}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {loading && (
                <div className="text-center pt-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                  <p className="text-slate-500 mt-2 text-sm">Loading students...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Workflow / Help (mirrors overview bottom card style) */}
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.6)]">
                <Sparkles size={18} />
              </div>
              <CardTitle className="text-base md:text-lg">
                How AI Attendance Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-2 text-sm md:text-[15px] text-slate-700">
                <li>Select your course using the filters on the left.</li>
                <li>
                  Ensure students have uploaded photos so the model can recognize them.
                </li>
                <li>
                  Click <strong>Train Model</strong> to generate or update face embeddings.
                </li>
                <li>
                  Once trained, use <strong>Capture Attendance</strong> to start a live
                  recognition session.
                </li>
                <li>
                  All attendance is automatically linked to this course for reporting.
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      )}

      {/* When in students view */}
      {currentView === "students" && selectedCourse && (
        <>
          {/* Top layout: Stats + Actions (similar to overview top layout) */}
          <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr]">
            {/* Stats with gradient style like TeacherOverview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {statCards.map((card, index) => {
                const Icon = card.icon;
                const style = STAT_STYLES[index];
                return (
                  <Card
                    key={card.title}
                    className="relative overflow-hidden border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition-all duration-300"
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${style.bg} opacity-90`}
                    />
                    <CardContent className="relative p-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                          {card.title}
                        </p>
                        <p className="text-3xl font-bold mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                          {card.value}
                        </p>
                      </div>
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${style.iconBg} text-white`}
                      >
                        <Icon size={22} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Actions card (like Quick Actions) */}
            <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg drop-shadow-sm">
                  <span>Attendance Actions</span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                    Session
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleTrainStudents}
                  disabled={training || students.length === 0}
                  className={`w-full justify-start h-auto py-3 px-4 border border-slate-200 bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_4px_12px_rgba(16,185,129,0.5)] rounded-xl transition-all ${
                    training || students.length === 0
                      ? "opacity-70 cursor-not-allowed shadow-none bg-slate-100 text-slate-400 border-slate-200"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-700/90 text-white">
                      <PlayCircle size={18} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold leading-tight text-slate-900">
                        {training ? "Training in progress..." : "Train Model"}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                        Prepare or update embeddings for all untrained students.
                      </p>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={handleCaptureAttendance}
                  disabled={loading || trainedCount === 0}
                  className={`w-full justify-start h-auto py-3 px-4 border border-slate-200 bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_4px_12px_rgba(79,70,229,0.5)] rounded-xl transition-all ${
                    loading || trainedCount === 0
                      ? "opacity-70 cursor-not-allowed shadow-none bg-slate-100 text-slate-400 border-slate-200"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-700/90 text-white">
                      <Camera size={18} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold leading-tight text-slate-900">
  Capture Attendance
</p>
<p className="text-xs text-slate-600 mt-0.5 leading-snug">
  Open the camera-based recognition screen for this course.
</p>

                    </div>
                  </div>
                </Button>

                {/* Training progress bar */}
                {training && (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs sm:text-sm text-emerald-900 space-y-2">
                    <p className="font-semibold flex items-center gap-2">
                      <span className="inline-flex h-4 w-4 rounded-full bg-emerald-500" />
                      Training embeddings for {untrainedCount} untrained student
                      {untrainedCount === 1 ? "" : "s"}...
                    </p>
                    <p className="text-emerald-800/80">
                      Keep this page open while the training runs on the server.
                    </p>
                    <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                      <div className="h-full w-3/4 bg-emerald-500/90 animate-pulse rounded-full" />
                    </div>
                  </div>
                )}

                {trainedCount === 0 && students.length > 0 && !training && (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs sm:text-sm text-amber-900">
                    <p className="font-semibold flex items-center gap-2">
                      <AlertCircle size={14} />
                      No students are trained yet.
                    </p>
                    <p className="mt-1">
                      Ensure photos are available and click{" "}
                      <span className="font-semibold">“Train Model”</span> before capturing
                      attendance.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom layout: Training table + Next steps (like overview bottom layout) */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Student Training Table */}
            <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <GraduationCap className="text-indigo-500" size={20} />
                  <span>Student Training Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <p className="text-slate-500 text-center py-8 text-sm sm:text-base">
                    No students enrolled in this course.
                  </p>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="min-w-full text-xs sm:text-sm">
                      <thead className="bg-slate-50 border-y border-slate-200">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-500">
                            #
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-500">
                            Student
                          </th>
                          <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left font-semibold text-slate-500">
                            Email
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-500">
                            Photos
                          </th>
                          <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left font-semibold text-slate-500">
                            Count
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-500">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {students.map((student, idx) => (
                          <tr
                            key={student.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-3 sm:px-6 py-3 text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="px-3 sm:px-6 py-3">
                              <div>
                                <p className="font-medium text-slate-900">
                                  {student.user.name}
                                </p>
                                <p className="md:hidden text-xs text-slate-500 mt-0.5">
                                  {student.user.email}
                                </p>
                              </div>
                            </td>
                            <td className="hidden md:table-cell px-3 sm:px-6 py-3 text-xs text-slate-600 font-mono">
                              {student.user.email}
                            </td>
                            <td className="px-3 sm:px-6 py-3">
                              {student.hasPhotos ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  ✅
                                  <span className="hidden sm:inline ml-1">Available</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                  ❌
                                  <span className="hidden sm:inline ml-1">Missing</span>
                                </span>
                              )}
                            </td>
                            <td className="hidden sm:table-cell px-3 sm:px-6 py-3 text-xs text-slate-600">
                              {student.photoCount || 0}
                            </td>
                            <td className="px-3 sm:px-6 py-3">
                              {student.faceEmbedding ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  ✅
                                  <span className="hidden sm:inline ml-1">Trained</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                  ⏳
                                  <span className="hidden sm:inline ml-1">Pending</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next steps / Info (styled like overview’s bottom card) */}
            <Card className="border border-indigo-200 bg-indigo-50 rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
              <CardContent className="p-4 sm:p-5 text-sm sm:text-base text-indigo-900 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <span>📋 Next Steps</span>
                </h3>
                <ol className="list-decimal pl-5 space-y-1.5">
                  {trainedCount === 0 ? (
                    <>
                      <li>Ensure each student has captured photos using your photo tool.</li>
                      <li>
                        Click <span className="font-semibold">“Train Model”</span> to
                        generate embeddings.
                      </li>
                      <li>
                        After training, use{" "}
                        <span className="font-semibold">“Capture Attendance”</span> to record
                        today&apos;s class.
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        Use the <span className="font-semibold">“Capture Attendance”</span>{" "}
                        action to start a live session.
                      </li>
                      <li>Ask students to look at the camera for accurate detection.</li>
                      <li>Review your attendance reports from the Reports section.</li>
                    </>
                  )}
                </ol>
                {untrainedCount > 0 && (
                  <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs sm:text-sm text-amber-900">
                    <p className="font-semibold flex items-center gap-2">
                      <AlertCircle size={14} />
                      Some students are still untrained.
                    </p>
                    <p className="mt-1">
                      {untrainedCount} student
                      {untrainedCount === 1 ? " has" : "s have"} no embeddings yet. They
                      may not be recognized during capture.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

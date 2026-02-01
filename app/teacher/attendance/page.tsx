"use client";

import { useEffect, useState, useMemo } from "react";
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
  Search,
  X,
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

interface FlattenedCourse extends Course {
  departmentName: string;
  programName: string;
  academicYearName: string;
  semesterName: string;
  displayPath: string;
  searchText: string;
}

/* ---------- Shared stat card styles ---------- */

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
  const subjectIndex = String(index + 1).padStart(2, "0");
  return `${deptCode}-${semNum}${subjectIndex}`;
}

/* --------------------------------------------------- */

export default function TeacherAttendance() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<"select" | "students">("select");

  const [hierarchy, setHierarchy] = useState<Hierarchy | null>(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<FlattenedCourse | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);

  // Flatten all courses into a searchable list
  const allCourses = useMemo(() => {
    if (!hierarchy) return [];

    const courses: FlattenedCourse[] = [];
    
    hierarchy.departments.forEach((dept) => {
      dept.programs.forEach((program) => {
        program.academicYears.forEach((year) => {
          year.semesters.forEach((semester) => {
            semester.courses.forEach((course, index) => {
              const displayCode = buildDisplayCourseCode(dept.name, semester.name, index);
              const displayPath = `${dept.name} → ${program.name} → ${year.name} → ${semester.name}`;
              const searchText = `${course.name} ${displayCode} ${dept.name} ${program.name} ${year.name} ${semester.name}`.toLowerCase();
              
              courses.push({
                ...course,
                departmentName: dept.name,
                programName: program.name,
                academicYearName: year.name,
                semesterName: semester.name,
                displayPath,
                searchText,
              });
            });
          });
        });
      });
    });

    return courses;
  }, [hierarchy]);

  // Filter courses based on search
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return allCourses;
    
    const query = searchQuery.toLowerCase();
    return allCourses.filter((course) => course.searchText.includes(query));
  }, [allCourses, searchQuery]);

  useEffect(() => {
    fetchHierarchy();
  }, []);

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

  function handleCourseSelect(course: FlattenedCourse) {
    setSelectedCourse(course);
    setSearchQuery("");
    setShowDropdown(false);
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
    setSelectedCourse(null);
    setSearchQuery("");
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

  const statCards = [
    { title: "Total Students", value: students.length, icon: Users },
    { title: "Trained", value: trainedCount, icon: CheckCircle2 },
    { title: "Have Photos", value: withPhotosCount, icon: Camera },
    { title: "Not Trained", value: untrainedCount, icon: AlertCircle },
  ];

  return (
    <div className="space-y-8 text-slate-900 px-3 sm:px-4 md:px-6 py-4 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight flex items-center gap-2 flex-wrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
            <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-900 text-white text-lg shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
              <Camera size={18} />
            </span>
            <span>Attendance Management</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
            {currentView === "select"
              ? "Search and select your course to get started."
              : `Managing: ${selectedCourse?.name}`}
          </p>
        </div>

        {currentView !== "select" && (
          <div className="w-full md:w-auto flex justify-end">
            <Button
              variant="outline"
              onClick={resetSelection}
              className="text-xs sm:text-sm border-slate-300 text-slate-700 hover:bg-slate-50 h-9 px-3"
            >
              ← Back to course selection
            </Button>
          </div>
        )}
      </div>

      {/* Course selection view */}
      {currentView === "select" && (
        <div className="grid gap-6 lg:grid-cols-[2fr,1.4fr]">
          {/* Left: Streamlined Course Search */}
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
            <CardHeader className="pb-4 px-4 sm:px-5 pt-4 sm:pt-5">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <BookOpen className="text-indigo-500" size={20} />
                <span>Select Course</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-5 pb-4 sm:pb-5">
              {/* Search Input */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by course name, code, department, program..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setShowDropdown(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* Dropdown Results */}
                {showDropdown && filteredCourses.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    {filteredCourses.slice(0, 20).map((course) => {
                      const displayCode = buildDisplayCourseCode(
                        course.departmentName,
                        course.semesterName,
                        0
                      );
                      return (
                        <button
                          key={course.id}
                          onClick={() => handleCourseSelect(course)}
                          className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b border-slate-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                                  {displayCode}
                                </span>
                                <span className="font-semibold text-slate-900 truncate">
                                  {course.name}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 truncate">
                                {course.displayPath}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {filteredCourses.length > 20 && (
                      <div className="px-4 py-2 text-xs text-slate-500 text-center bg-slate-50">
                        Showing 20 of {filteredCourses.length} results. Keep typing to narrow down...
                      </div>
                    )}
                  </div>
                )}

                {showDropdown && searchQuery && filteredCourses.length === 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-center text-slate-500 text-sm">
                    No courses found matching "{searchQuery}"
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-600 mb-1">Total Courses</p>
                  <p className="text-2xl font-bold text-slate-900">{allCourses.length}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-600 mb-1">Departments</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {hierarchy?.departments.length || 0}
                  </p>
                </div>
              </div>

              {loading && (
                <div className="text-center pt-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                  <p className="text-slate-500 mt-2 text-sm">Loading students...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Help card */}
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
            <CardHeader className="flex flex-row items-center gap-2 pb-3 px-4 sm:px-5 pt-4 sm:pt-5">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.6)]">
                <Sparkles size={18} />
              </div>
              <CardTitle className="text-sm sm:text-base md:text-lg">
                How AI Attendance Works
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5">
              <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm md:text-[15px] text-slate-700">
                <li>
                  <strong>Search for your course</strong> using the smart search bar - type any part of the course name, code, or department.
                </li>
                <li>
                  <strong>Select from results</strong> - courses appear instantly as you type.
                </li>
                <li>
                  Ensure students have uploaded photos so the model can recognize them.
                </li>
                <li>
                  Click <strong>Train Model</strong> to generate or update face embeddings.
                </li>
                <li>
                  Once trained, use <strong>Capture Attendance</strong> to start a live recognition session.
                </li>
              </ol>

              <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-xs text-indigo-900">
                  <strong>💡 Pro Tip:</strong> You can search by course code (e.g., "IT-701"), course name, department, or any combination!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Students view - Same as before */}
      {currentView === "students" && selectedCourse && (
        <>
          {/* Top: stats + actions */}
          <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
                    <CardContent className="relative p-4 sm:p-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] sm:text-xs font-semibold tracking-wide text-slate-600 uppercase">
                          {card.title}
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                          {card.value}
                        </p>
                      </div>
                      <div
                        className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl ${style.iconBg} text-white`}
                      >
                        <Icon size={20} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Actions */}
            <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
              <CardHeader className="pb-3 px-4 sm:px-5 pt-4 sm:pt-5">
                <CardTitle className="flex items-center justify-between text-sm sm:text-lg drop-shadow-sm">
                  <span>Attendance Actions</span>
                  <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                    Session
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 sm:px-5 pb-4 sm:pb-5">
                <Button
                  onClick={handleTrainStudents}
                  disabled={training || students.length === 0}
                  className={`w-full justify-start h-auto py-2.5 sm:py-3 px-3 sm:px-4 border border-slate-200 bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_4px_12px_rgba(16,185,129,0.5)] rounded-xl transition-all text-xs sm:text-sm ${
                    training || students.length === 0
                      ? "opacity-70 cursor-not-allowed shadow-none bg-slate-100 text-slate-400 border-slate-200"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 w-full">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-emerald-700/90 text-white shrink-0">
                      <PlayCircle size={16} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold leading-tight text-slate-900">
                        {training ? "Training in progress..." : "Train Model"}
                      </p>
                      <p className="hidden sm:block text-xs text-slate-600 mt-0.5 leading-snug">
                        Prepare or update embeddings for all untrained students.
                      </p>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={handleCaptureAttendance}
                  disabled={loading || trainedCount === 0}
                  className={`w-full justify-start h-auto py-2.5 sm:py-3 px-3 sm:px-4 border border-slate-200 bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_4px_12px_rgba(79,70,229,0.5)] rounded-xl transition-all text-xs sm:text-sm ${
                    loading || trainedCount === 0
                      ? "opacity-70 cursor-not-allowed shadow-none bg-slate-100 text-slate-400 border-slate-200"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 w-full">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-indigo-700/90 text-white shrink-0">
                      <Camera size={16} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold leading-tight text-slate-900">
                        Capture Attendance
                      </p>
                      <p className="hidden sm:block text-xs text-slate-600 mt-0.5 leading-snug">
                        Open the camera-based recognition screen for this course.
                      </p>
                    </div>
                  </div>
                </Button>

                {training && (
                  <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs sm:text-sm text-emerald-900 space-y-2">
                    <p className="font-semibold flex items-center gap-2">
                      <span className="inline-flex h-3 w-3 rounded-full bg-emerald-500" />
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
                  <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs sm:text-sm text-amber-900">
                    <p className="font-semibold flex items-center gap-2">
                      <AlertCircle size={14} />
                      No students are trained yet.
                    </p>
                    <p className="mt-1">
                      Ensure photos are available and click{" "}
                      <span className="font-semibold">"Train Model"</span> before capturing
                      attendance.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom: table + next steps */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Student Training Table */}
            <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
              <CardHeader className="pb-3 px-4 sm:px-5 pt-4 sm:pt-5">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                  <GraduationCap className="text-indigo-500" size={20} />
                  <span>Student Training Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 sm:px-4 pb-4 sm:pb-5">
                {students.length === 0 ? (
                  <p className="text-slate-500 text-center py-8 text-sm sm:text-base px-4">
                    No students enrolled in this course.
                  </p>
                ) : (
                  <div className="w-full max-w-full overflow-x-auto overflow-y-visible rounded-xl scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    <table className="min-w-max table-auto text-xs sm:text-sm">
                      <thead className="bg-slate-50 border-y border-slate-200">
                        <tr>
                          <th className="px-3 sm:px-4 md:px-5 py-3 text-left font-semibold text-slate-500">
                            #
                          </th>
                          <th className="px-3 sm:px-4 md:px-5 py-3 text-left font-semibold text-slate-500">
                            Student
                          </th>
                          <th className="hidden md:table-cell px-3 sm:px-4 md:px-5 py-3 text-left font-semibold text-slate-500">
                            Email
                          </th>
                          <th className="px-3 sm:px-4 md:px-5 py-3 text-left font-semibold text-slate-500">
                            Photos
                          </th>
                          <th className="hidden sm:table-cell px-3 sm:px-4 md:px-5 py-3 text-left font-semibold text-slate-500">
                            Count
                          </th>
                          <th className="px-3 sm:px-4 md:px-5 py-3 text-left font-semibold text-slate-500">
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
                            <td className="px-3 sm:px-4 md:px-5 py-3 text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="px-3 sm:px-4 md:px-5 py-3">
                              <div>
                                <p className="font-medium text-slate-900">
                                  {student.user.name}
                                </p>
                                <p className="md:hidden text-[11px] text-slate-500 mt-0.5 break-all">
                                  {student.user.email}
                                </p>
                              </div>
                            </td>
                            <td className="hidden md:table-cell px-3 sm:px-4 md:px-5 py-3 text-xs text-slate-600 font-mono break-all">
                              {student.user.email}
                            </td>
                            <td className="px-3 sm:px-4 md:px-5 py-3">
                              {student.hasPhotos ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  ✅
                                  <span className="hidden sm:inline ml-1">Available</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                  ❌
                                  <span className="hidden sm:inline ml-1">Missing</span>
                                </span>
                              )}
                            </td>
                            <td className="hidden sm:table-cell px-3 sm:px-4 md:px-5 py-3 text-xs text-slate-600">
                              {student.photoCount || 0}
                            </td>
                            <td className="px-3 sm:px-4 md:px-5 py-3">
                              {student.faceEmbedding ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  ✅
                                  <span className="hidden sm:inline ml-1">Trained</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
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

            {/* Next steps */}
            <Card className="border border-indigo-200 bg-indigo-50 rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
              <CardContent className="p-4 sm:p-5 text-xs sm:text-sm md:text-base text-indigo-900 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <span>📋 Next Steps</span>
                </h3>
                <ol className="list-decimal pl-5 space-y-1.5">
                  {trainedCount === 0 ? (
                    <>
                      <li>Ensure each student has captured photos using your photo tool.</li>
                      <li>
                        Click <span className="font-semibold">"Train Model"</span> to
                        generate embeddings.
                      </li>
                      <li>
                        After training, use{" "}
                        <span className="font-semibold">"Capture Attendance"</span> to record
                        today&apos;s class.
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        Use the <span className="font-semibold">"Capture Attendance"</span>{" "}
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
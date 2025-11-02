"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Users, CheckCircle2, AlertCircle, Camera, GraduationCap } from "lucide-react";

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
      const dept = hierarchy.departments.find(d => d.id === selectedDepartment);
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
      const program = filteredPrograms.find(p => p.id === selectedProgram);
      setFilteredAcademicYears(program?.academicYears || []);
      setSelectedAcademicYear("");
      setSelectedSemester("");
      setSelectedCourse(null);
    }
  }, [selectedProgram, filteredPrograms]);

  // Update filtered semesters when academic year changes
  useEffect(() => {
    if (selectedAcademicYear) {
      const year = filteredAcademicYears.find(y => y.id === selectedAcademicYear);
      setFilteredSemesters(year?.semesters || []);
      setSelectedSemester("");
      setSelectedCourse(null);
    }
  }, [selectedAcademicYear, filteredAcademicYears]);

  // Update filtered courses when semester changes
  useEffect(() => {
    if (selectedSemester) {
      const semester = filteredSemesters.find(s => s.id === selectedSemester);
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
          console.error('Invalid students data format:', data);
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
        console.error('Failed to fetch students:', errorData);
        alert("Failed to fetch students: " + (errorData.error || res.statusText));
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      alert("Error fetching students: " + (error instanceof Error ? error.message : 'Unknown error'));
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
    
    const untrainedStudents = students.filter(s => !s.faceEmbedding);
    const studentsWithoutPhotos = students.filter(s => !s.hasPhotos);

    if (studentsWithoutPhotos.length > 0) {
      const studentNames = studentsWithoutPhotos.map(s => s.user.name).join(", ");
      alert(`⚠️ Warning: The following students don't have photos:\n${studentNames}\n\nPlease ensure they have captured photos using photo.py first.`);
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
    
    const trainedStudents = students.filter(s => s.faceEmbedding);
    
    if (trainedStudents.length === 0) {
      alert("⚠️ No students are trained yet! Please train the model first.");
      return;
    }

    localStorage.setItem("selectedCourseId", selectedCourse.id);
    localStorage.setItem("selectedCourseName", selectedCourse.name);

    router.push(`/teacher/attendance/batches?courseId=${selectedCourse.id}&courseName=${encodeURIComponent(selectedCourse.name)}`);
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

  const trainedCount = students.filter(s => s.faceEmbedding).length;
  const withPhotosCount = students.filter(s => s.hasPhotos).length;

  if (loadingHierarchy) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-400 mt-4">Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Attendance Management
          </h1>
          <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
            {currentView === "select" 
              ? "Select a course to manage attendance"
              : `Managing: ${selectedCourse?.name}`}
          </p>
        </div>
        {currentView !== "select" && (
          <button
            onClick={resetSelection}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-[#1a1a1a]/60 border border-white/10 text-white rounded-lg sm:rounded-xl hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all backdrop-blur-md font-medium text-sm sm:text-base"
          >
            ← Back to Selection
          </button>
        )}
      </div>

      {/* Course Selection View */}
      {currentView === "select" && (
        <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-xl sm:rounded-2xl backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)] p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
            <BookOpen className="text-blue-500" size={20} />
            <span className="sm:text-xl">Select Course</span>
          </h2>
          
          <div className="space-y-4 sm:space-y-6">
            {/* Department Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                1. Select Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[#0a0a0a] border border-white/10 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white text-sm sm:text-base"
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  2. Select Program
                </label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[#0a0a0a] border border-white/10 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white text-sm sm:text-base"
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  3. Select Academic Year
                </label>
                <select
                  value={selectedAcademicYear}
                  onChange={(e) => setSelectedAcademicYear(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[#0a0a0a] border border-white/10 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white text-sm sm:text-base"
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  4. Select Semester
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[#0a0a0a] border border-white/10 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white text-sm sm:text-base"
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  5. Select Course
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => handleCourseSelect(course)}
                      className="p-4 sm:p-6 bg-[#0a0a0a] border border-white/10 rounded-lg sm:rounded-xl hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] cursor-pointer transition-all"
                    >
                      <h3 className="text-base sm:text-lg font-semibold mb-2">
                        {course.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Entry Code:{" "}
                        <span className="font-mono bg-[#1a1a1a] border border-white/10 px-2 py-1 rounded text-gray-300">
                          {course.entryCode}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {loading && (
            <div className="text-center mt-6">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-400 mt-2 text-sm">Loading students...</p>
            </div>
          )}
        </div>
      )}

      {/* Students View */}
      {currentView === "students" && selectedCourse && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="relative p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[#1a1a1a]/60 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all duration-300">
              <div className="absolute -top-3 sm:-top-4 right-3 sm:right-4 bg-gradient-to-br from-blue-500 to-blue-600 p-2 sm:p-3 rounded-lg sm:rounded-xl text-white shadow-lg">
                <Users size={20} className="sm:w-6 sm:h-6" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase mt-2">
                Total Students
              </p>
              <p className="text-2xl sm:text-4xl font-bold text-white mt-2 sm:mt-3">{students.length}</p>
            </div>

            <div className="relative p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[#1a1a1a]/60 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all duration-300">
              <div className="absolute -top-3 sm:-top-4 right-3 sm:right-4 bg-gradient-to-br from-green-500 to-green-600 p-2 sm:p-3 rounded-lg sm:rounded-xl text-white shadow-lg">
                <CheckCircle2 size={20} className="sm:w-6 sm:h-6" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase mt-2">
                Trained
              </p>
              <p className="text-2xl sm:text-4xl font-bold text-white mt-2 sm:mt-3">{trainedCount}</p>
            </div>

            <div className="relative p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[#1a1a1a]/60 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all duration-300">
              <div className="absolute -top-3 sm:-top-4 right-3 sm:right-4 bg-gradient-to-br from-yellow-500 to-yellow-600 p-2 sm:p-3 rounded-lg sm:rounded-xl text-white shadow-lg">
                <Camera size={20} className="sm:w-6 sm:h-6" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase mt-2">
                Have Photos
              </p>
              <p className="text-2xl sm:text-4xl font-bold text-white mt-2 sm:mt-3">{withPhotosCount}</p>
            </div>

            <div className="relative p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[#1a1a1a]/60 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all duration-300">
              <div className="absolute -top-3 sm:-top-4 right-3 sm:right-4 bg-gradient-to-br from-red-500 to-red-600 p-2 sm:p-3 rounded-lg sm:rounded-xl text-white shadow-lg">
                <AlertCircle size={20} className="sm:w-6 sm:h-6" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase mt-2">
                Not Trained
              </p>
              <p className="text-2xl sm:text-4xl font-bold text-white mt-2 sm:mt-3">{students.length - trainedCount}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={handleTrainStudents}
              disabled={training || students.length === 0}
              className={`px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-medium text-base sm:text-lg transition-all ${
                training || students.length === 0
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              }`}
            >
              {training ? "⏳ Training..." : "🧠 Train Model"}
            </button>
            <button
              onClick={handleCaptureAttendance}
              disabled={loading || trainedCount === 0}
              className={`px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-medium text-base sm:text-lg transition-all ${
                loading || trainedCount === 0
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              }`}
            >
              📸 Capture Attendance
            </button>
          </div>

          {trainedCount === 0 && students.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 backdrop-blur-sm">
              <p className="text-yellow-300 font-medium text-sm sm:text-base">
                ⚠️ No students are trained yet. Please train the model first.
              </p>
            </div>
          )}

          {/* Student Training Table */}
          <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-xl sm:rounded-2xl backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)] p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="text-blue-500" size={20} />
              <span>Student Training Status</span>
            </h2>
            {students.length === 0 ? (
              <p className="text-gray-400 text-center py-8 text-sm sm:text-base">
                No students enrolled in this course.
              </p>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full text-xs sm:text-sm">
                    <thead className="bg-[#0a0a0a]/60">
                      <tr>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-300">
                          #
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-300">
                          Student Name
                        </th>
                        <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-300">
                          Email
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-300">
                          Photos
                        </th>
                        <th className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-300">
                          Count
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-300">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {students.map((student, idx) => (
                        <tr key={student.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-400">{idx + 1}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-white">
                            <div>
                              <div>{student.user.name}</div>
                              <div className="md:hidden text-xs text-gray-500 mt-1">{student.user.email}</div>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-gray-400 font-mono text-xs">
                            {student.user.email}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            {student.hasPhotos ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                ✅
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                                ❌
                              </span>
                            )}
                          </td>
                          <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-gray-400 text-xs">
                            {student.photoCount || 0}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            {student.faceEmbedding ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                ✅ <span className="hidden sm:inline ml-1">Trained</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                ⏳ <span className="hidden sm:inline ml-1">Pending</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
            <h3 className="text-base sm:text-lg font-semibold text-blue-300 mb-3">
              📋 Next Steps
            </h3>
            <ol className="space-y-2 text-blue-200 text-sm sm:text-base">
              {trainedCount === 0 ? (
                <>
                  <li>1. ✅ Ensure students have captured their photos using photo.py</li>
                  <li>2. 🧠 Click "Train Model" to train the AI</li>
                  <li>3. 📸 After training, click "Capture Attendance" to mark attendance</li>
                </>
              ) : (
                <>
                  <li>✅ Training complete! You can now capture attendance</li>
                  <li>📸 Click "Capture Attendance" to open the camera and recognize students</li>
                  <li>📊 View attendance history after submitting records</li>
                </>
              )}
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
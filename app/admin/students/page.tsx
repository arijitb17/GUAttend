"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Upload,
  UserPlus,
  Users,
  CheckCircle,
  GraduationCap,
  Eye,
  Edit,
  Trash2,
  Loader2,
  X,
  Award,
  BookOpen,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Department {
  id: string;
  name: string;
}

interface Program {
  id: string;
  name: string;
  department?: Department;
}

interface Semester {
  id: string;
  name: string;
  academicYear: {
    id: string;
    name: string;
    program: Program;
  };
}

interface Course {
  id: string;
  name: string;
  entryCode: string;
  semester?: Semester;
}

interface StudentProfile {
  id: string;
  programId: string;
  program?: Program;
  status: string;
  courses?: Course[];
}

interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  graduated: boolean;
  student?: StudentProfile;
}

type ModalType = "view" | "edit" | "graduate" | "delete" | null;
type StatusFilter = "all" | "active" | "graduated";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [programFilter, setProgramFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    programId: "",
  });
  const [programs, setPrograms] = useState<Program[]>([]);

  async function fetchStudents() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/students");
      const data = await res.json();

      const studentsList: Student[] = data.students || [];

      const mappedStudents = studentsList.map((s) => ({
        ...s,
        graduated: s.student?.status === "graduated",
      }));

      setStudents(mappedStudents);

      const programList: Program[] = (data.programs || []).map((p: Program) => ({
        id: p.id,
        name: p.name,
        department: p.department,
      }));

      setPrograms(programList);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  const graduatedCount = students.filter((s) => s.graduated).length;
  const activeCount = students.length - graduatedCount;

  const getProgramsForStudent = (student: Student): Program[] => {
    const result: Program[] = [];
    const programIds = new Set<string>();

    if (student.student?.program) {
      result.push(student.student.program);
      programIds.add(student.student.program.id);
    }

    student.student?.courses?.forEach((course) => {
      const courseProgram = course.semester?.academicYear?.program;
      if (courseProgram && !programIds.has(courseProgram.id)) {
        result.push(courseProgram);
        programIds.add(courseProgram.id);
      }
    });

    return result;
  };

  // Filters: search + program + status
  const filteredStudents = students.filter((student) => {
    const programName = student.student?.program?.name || "";
    const departmentName = student.student?.program?.department?.name || "";
    const courseNames = student.student?.courses?.map((c) => c.name).join(" ") || "";

    const term = searchTerm.toLowerCase();

    const matchesSearch =
      !term ||
      student.name.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term) ||
      programName.toLowerCase().includes(term) ||
      departmentName.toLowerCase().includes(term) ||
      courseNames.toLowerCase().includes(term);

    const studentPrimaryProgramId = student.student?.programId || "";
    const matchesPrimaryProgram = programFilter
      ? studentPrimaryProgramId === programFilter
      : true;

    const enrolledInProgramCourse =
      programFilter &&
      student.student?.courses?.some((course) => {
        const courseProgramId = course.semester?.academicYear?.program?.id;
        return courseProgramId === programFilter;
      });

    const matchesProgram = programFilter
      ? matchesPrimaryProgram || !!enrolledInProgramCourse
      : true;

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? !student.graduated
        : student.graduated;

    return matchesSearch && matchesProgram && matchesStatus;
  });

  // Program distribution for mini chart
  const programStats = programs
    .map((program) => {
      const count = students.filter((s) => {
        const primary = s.student?.programId === program.id;
        const inCourses = s.student?.courses?.some(
          (c) => c.semester?.academicYear?.program?.id === program.id
        );
        return primary || inCourses;
      }).length;
      return { program, count };
    })
    .filter((p) => p.count > 0);

  const maxProgramCount =
    programStats.length > 0
      ? Math.max(...programStats.map((p) => p.count))
      : 1;

  const openModal = (type: ModalType, student: Student) => {
    setSelectedStudent(student);
    setModalType(type);

    if (type === "edit") {
      setEditForm({
        name: student.name,
        email: student.email,
        programId: student.student?.programId || "",
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedStudent(null);
    setEditForm({ name: "", email: "", programId: "" });
  };

  const handleEdit = async () => {
    if (!selectedStudent) return;
    try {
      const res = await fetch(`/api/admin/students/${selectedStudent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        await fetchStudents();
        closeModal();
      }
    } catch (error) {
      console.error("Failed to update student:", error);
    }
  };

  const handleGraduate = async () => {
    if (!selectedStudent) return;
    try {
      const res = await fetch(
        `/api/admin/students/${selectedStudent.id}/graduate`,
        { method: "POST" }
      );
      if (res.ok) {
        await fetchStudents();
        closeModal();
      }
    } catch (error) {
      console.error("Failed to graduate student:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    try {
      const res = await fetch(`/api/admin/students/${selectedStudent.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchStudents();
        closeModal();
      }
    } catch (error) {
      console.error("Failed to delete student:", error);
    }
  };

  return (
    <div className="space-y-8 text-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.15)]">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white text-lg shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
              S
            </span>
            <span>Students</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Manage enrolled students, their programs, status and course mapping.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            className="w-full sm:w-auto border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-emerald-500" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Filters + Status Pills */}
      <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search by name, email, program, department or course..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="w-full md:w-72 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/70"
            >
              <option value="">All Programs</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                  {program.department && ` (${program.department.name})`}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter pills */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-full bg-slate-100 p-1 border border-slate-200">
              {(["all", "active", "graduated"] as StatusFilter[]).map((status) => {
                const isActive = statusFilter === status;
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-6 py-1 text-xs sm:text-sm rounded-full transition-all ${
                      isActive
                        ? "bg-slate-900 text-slate-900 shadow-[0_4px_14px_rgba(15,23,42,0.4)]"
                        : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    {status === "all"
                      ? "All"
                      : status === "active"
                      ? "Active"
                      : "Graduated"}
                  </button>
                );
              })}
            </div>

            {programFilter && (
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500">
                <span>Filtering by program:</span>
                <span className="px-2 py-1 rounded-full bg-slate-900 text-white text-xs">
                  {programs.find((p) => p.id === programFilter)?.name || "Unknown"}
                </span>
                <button
                  onClick={() => setProgramFilter("")}
                  className="text-slate-700 underline-offset-2 hover:underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats + Program distribution chart */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1.3fr] gap-4 sm:gap-6">
        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            {
              label: "Total Students",
              value: students.length,
              icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
              gradient: "from-sky-500 to-indigo-500",
            },
            {
              label: "Active",
              value: activeCount,
              icon: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
              gradient: "from-emerald-500 to-lime-500",
            },
            {
              label: "Graduated",
              value: graduatedCount,
              icon: <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />,
              gradient: "from-purple-500 to-pink-500",
            },
          ].map((stat, i) => (
            <Card
              key={i}
              className="border border-slate-200 bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
            >
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`h-11 w-11 rounded-xl bg-gradient-to-br ${stat.gradient} text-white flex items-center justify-center shadow-[0_6px_18px_rgba(15,23,42,0.45)]`}
                >
                  {stat.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Students List */}
      <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-[0_4px_14px_rgba(15,23,42,0.6)]">
              <Users className="w-4 h-4" />
            </div>
            <CardTitle className="text-base sm:text-lg">
              Students List
            </CardTitle>
          </div>
          <span className="text-xs sm:text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Showing {filteredStudents.length} of {students.length}
          </span>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm sm:text-base">
              {programFilter
                ? `No students found in ${
                    programs.find((p) => p.id === programFilter)?.name ||
                    "this program"
                  }`
                : searchTerm
                ? "No students found matching your search"
                : "No students found"}
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {filteredStudents.map((student) => {
                const studentPrograms = getProgramsForStudent(student);

                return (
                  <div
                    key={student.id}
                    className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 hover:bg-white hover:shadow-[0_8px_22px_rgba(15,23,42,0.08)] transition-all"
                  >
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full">
                      <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-[0_4px_14px_rgba(15,23,42,0.7)]">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                          {student.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 break-all">
                          {student.email}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
                          {student.student?.program && (
                            <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium border border-violet-200">
                              Primary: {student.student.program.name}
                            </span>
                          )}

                          {studentPrograms
                            .filter((p) => p.id !== student.student?.programId)
                            .map((program) => (
                              <span
                                key={program.id}
                                className="px-2 py-1 bg-sky-100 text-sky-700 rounded-full text-xs border border-sky-200"
                              >
                                {program.name}
                              </span>
                            ))}

                          <span
                            className={`px-2 py-1 rounded-full text-xs border ${
                              student.graduated
                                ? "bg-amber-100 text-amber-700 border-amber-200"
                                : "bg-emerald-100 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {student.graduated ? "Graduated" : "Active"}
                          </span>

                          {student.student?.courses &&
                            student.student.courses.length > 0 && (
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs flex items-center gap-1 border border-slate-200">
                                <BookOpen className="w-3 h-3" />
                                {student.student.courses.length}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
  {/* View */}
  <Button
    variant="outline"
    size="icon"
    onClick={() => openModal("view", student)}
    className="custom-btn border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    title="View details"
  >
    <Eye className="w-4 h-4" />
  </Button>

  {/* Edit */}
  <Button
    variant="outline"
    size="icon"
    onClick={() => openModal("edit", student)}
    className="custom-btn border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    title="Edit student"
  >
    <Edit className="w-4 h-4" />
  </Button>

  {/* Graduate */}
  {!student.graduated && (
    <Button
      variant="outline"
      size="icon"
      onClick={() => openModal("graduate", student)}
      className="custom-btn border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
      title="Mark as graduated"
    >
      <Award className="w-4 h-4" />
    </Button>
  )}

  {/* Delete */}
  <Button
    variant="outline"
    size="icon"
    onClick={() => openModal("delete", student)}
    className="custom-btn border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
    title="Delete student"
  >
    <Trash2 className="w-4 h-4" />
  </Button>
</div>

                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {modalType && selectedStudent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto text-slate-900">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* View Modal */}
            {modalType === "view" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-5 h-5 text-slate-700" />
                  <h3 className="text-lg sm:text-xl font-semibold">
                    Student Details
                  </h3>
                </div>
                <div className="space-y-3 text-sm sm:text-base text-slate-700">
                  <p>
                    <span className="text-slate-500">Name:</span>{" "}
                    {selectedStudent.name}
                  </p>
                  <p className="break-all">
                    <span className="text-slate-500">Email:</span>{" "}
                    {selectedStudent.email}
                  </p>
                  <p>
                    <span className="text-slate-500">Primary Program:</span>{" "}
                    {selectedStudent.student?.program?.name || "—"}
                  </p>
                  {selectedStudent.student?.program?.department && (
                    <p>
                      <span className="text-slate-500">Department:</span>{" "}
                      {selectedStudent.student.program.department.name}
                    </p>
                  )}
                  <p>
                    <span className="text-slate-500">Status:</span>{" "}
                    {selectedStudent.graduated ? "Graduated" : "Active"}
                  </p>
                  <p>
                    <span className="text-slate-500">Joined:</span>{" "}
                    {new Date(
                      selectedStudent.createdAt
                    ).toLocaleDateString()}
                  </p>
                  {selectedStudent.student?.courses &&
                    selectedStudent.student.courses.length > 0 && (
                      <div>
                        <span className="text-slate-500">
                          Enrolled Courses:
                        </span>
                        <div className="mt-2 space-y-2">
                          {selectedStudent.student.courses.map((course) => (
                            <div
                              key={course.id}
                              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                            >
                              <div className="font-medium text-slate-900">
                                {course.name}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                Code: {course.entryCode}
                              </div>
                              {course.semester?.academicYear?.program && (
                                <div className="text-xs text-violet-600 mt-1">
                                  Program:{" "}
                                  {
                                    course.semester.academicYear.program
                                      .name
                                  }
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
                <div className="mt-6 text-right">
                  <Button
                    variant="outline"
                    onClick={closeModal}
                    className="border-slate-200 text-slate-700 hover:bg-slate-100"
                  >
                    Close
                  </Button>
                </div>
              </>
            )}

            {/* Edit Modal */}
            {modalType === "edit" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Edit className="w-5 h-5 text-slate-700" />
                  <h3 className="text-lg sm:text-xl font-semibold">
                    Edit Student
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      Primary Program
                    </label>
                    <select
                      value={editForm.programId}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          programId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                    >
                      <option value="">Select Program</option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.name}
                          {program.department &&
                            ` (${program.department.name})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={closeModal}
                    className="border-slate-200 text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEdit}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-900"
                  >
                    Save
                  </Button>
                </div>
              </>
            )}

            {/* Graduate Modal */}
            {modalType === "graduate" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <GraduationCap className="w-5 h-5 text-violet-600" />
                  <h3 className="text-lg sm:text-xl font-semibold">
                    Mark as Graduated
                  </h3>
                </div>
                <p className="text-slate-700 mb-6 text-sm sm:text-base">
                  Are you sure you want to mark{" "}
                  <span className="font-semibold">
                    {selectedStudent.name}
                  </span>{" "}
                  as graduated?
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={closeModal}
                    className="border-slate-200 text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGraduate}
                    className="bg-violet-600 hover:bg-violet-500 text-slate-900"
                  >
                    Confirm
                  </Button>
                </div>
              </>
            )}

            {/* Delete Modal */}
            {modalType === "delete" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg sm:text-xl font-semibold">
                    Delete Student
                  </h3>
                </div>
                <p className="text-slate-700 mb-6 text-sm sm:text-base">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    {selectedStudent.name}
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={closeModal}
                    className="border-slate-200 text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-500 text-slate-900"
                  >
                    Delete
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [programFilter, setProgramFilter] = useState<string>("");
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
      const res = await fetch("/api/admin/students");
      const data = await res.json();

      const studentsList: Student[] = data.students || [];
      
      // Map graduated status from student.status
      const mappedStudents = studentsList.map(s => ({
        ...s,
        graduated: s.student?.status === "graduated"
      }));
      
      console.log('Fetched students:', mappedStudents.length);
      console.log('Sample student with courses:', mappedStudents.find(s => s.student?.courses?.length));
      
      setStudents(mappedStudents);

      const programList = (data.programs || []).map(
        (p: Program) => ({
          id: p.id,
          name: p.name,
          department: p.department,
        })
      );

      console.log('Available programs:', programList);
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

  const filteredStudents = students.filter((student) => {
    // Search filter
    const programName = student.student?.program?.name || "";
    const departmentName = student.student?.program?.department?.name || "";
    const courseNames = student.student?.courses?.map(c => c.name).join(" ") || "";
    
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      programName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courseNames.toLowerCase().includes(searchTerm.toLowerCase());

    // Program filter - NEW LOGIC:
    // Show student if:
    // 1. No filter is applied (show all), OR
    // 2. Their primary program matches the filter, OR
    // 3. They're enrolled in ANY course from that program
    if (!programFilter) {
      return matchesSearch;
    }

    const studentPrimaryProgramId = student.student?.programId || "";
    const matchesPrimaryProgram = studentPrimaryProgramId === programFilter;

    // Check if student is enrolled in any course from the filtered program
    const enrolledInProgramCourse = student.student?.courses?.some(course => {
      const courseProgramId = course.semester?.academicYear?.program?.id;
      return courseProgramId === programFilter;
    }) || false;

    const matchesProgram = matchesPrimaryProgram || enrolledInProgramCourse;

    console.log('Filter check for:', student.name, {
      primaryProgramId: studentPrimaryProgramId,
      filterProgramId: programFilter,
      matchesPrimary: matchesPrimaryProgram,
      enrolledInProgramCourse: enrolledInProgramCourse,
      coursePrograms: student.student?.courses?.map(c => ({
        courseName: c.name,
        programId: c.semester?.academicYear?.program?.id,
        programName: c.semester?.academicYear?.program?.name
      })),
      finalMatch: matchesProgram
    });

    return matchesSearch && matchesProgram;
  });

  const graduatedCount = students.filter((s) => s.graduated).length;
  const activeCount = students.length - graduatedCount;

  // Get unique programs that students have courses in
  const getProgramsForStudent = (student: Student): Program[] => {
    const programs: Program[] = [];
    const programIds = new Set<string>();

    // Add primary program
    if (student.student?.program) {
      programs.push(student.student.program);
      programIds.add(student.student.program.id);
    }

    // Add programs from courses
    student.student?.courses?.forEach(course => {
      const courseProgram = course.semester?.academicYear?.program;
      if (courseProgram && !programIds.has(courseProgram.id)) {
        programs.push(courseProgram);
        programIds.add(courseProgram.id);
      }
    });

    return programs;
  };

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
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-gray-400 mt-1">
            Manage enrolled students and their information
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1f1f1f]/80 border border-white/10 hover:bg-[#2a2a2a] text-white rounded-lg font-medium transition-all duration-200">
            <Upload className="w-5 h-5 text-green-400" />
            Export Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1f1f1f]/80 border border-white/10 hover:bg-[#2a2a2a] text-white rounded-lg font-medium transition-all duration-200">
            <UserPlus className="w-5 h-5 text-blue-400" />
            Add Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search students by name, email, program, department, or course..."
              className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={programFilter}
            onChange={(e) => {
              console.log('Filter changed to:', e.target.value);
              setProgramFilter(e.target.value);
            }}
            className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[200px]"
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
        
        {programFilter && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
            <span>Showing students enrolled in courses from:</span>
            <span className="px-2 py-1 bg-blue-900/40 text-blue-300 rounded-full">
              {programs.find(p => p.id === programFilter)?.name || "Unknown"}
            </span>
            <button
              onClick={() => setProgramFilter("")}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Total Students",
            value: students.length,
            color: "text-blue-400",
            icon: <Users className="w-6 h-6 text-blue-400" />,
          },
          {
            label: "Active",
            value: activeCount,
            color: "text-green-400",
            icon: <CheckCircle className="w-6 h-6 text-green-400" />,
          },
          {
            label: "Graduated",
            value: graduatedCount,
            color: "text-purple-400",
            icon: <GraduationCap className="w-6 h-6 text-purple-400" />,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_0_20px_rgba(255,255,255,0.05)] flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-wide">
                {stat.label}
              </p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
                {stat.value}
              </p>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Students Table */}
      <div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Students List
          </h2>
          <span className="text-sm text-gray-300 bg-[#1f1f1f] px-3 py-1 rounded-full border border-white/10">
            Showing {filteredStudents.length} of {students.length}
          </span>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {programFilter 
                ? `No students found taking courses from ${programs.find(p => p.id === programFilter)?.name || "this program"}` 
                : searchTerm 
                  ? "No students found matching your search" 
                  : "No students found"}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredStudents.map((student) => {
                const studentPrograms = getProgramsForStudent(student);
                
                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 bg-[#1a1a1a]/80 border border-white/10 rounded-xl hover:bg-[#232323] transition-all duration-200"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-white/5 text-blue-400 rounded-full p-3 border border-white/10">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">
                          {student.name}
                        </h3>
                        <p className="text-sm text-gray-500">{student.email}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {/* Primary Program Badge */}
                          {student.student?.program && (
                            <span className="px-2 py-1 bg-purple-900/40 text-purple-300 rounded-full text-xs font-medium border border-purple-500/30">
                              Primary: {student.student.program.name}
                            </span>
                          )}
                          
                          {/* Other Programs (from courses) */}
                          {studentPrograms
                            .filter(p => p.id !== student.student?.programId)
                            .map(program => (
                              <span 
                                key={program.id}
                                className="px-2 py-1 bg-blue-900/40 text-blue-300 rounded-full text-xs border border-blue-500/30"
                              >
                                {program.name}
                              </span>
                            ))
                          }
                          
                          {/* Status Badge */}
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              student.graduated
                                ? "bg-yellow-900/40 text-yellow-300"
                                : "bg-green-900/40 text-green-300"
                            }`}
                          >
                            {student.graduated ? "Graduated" : "Active"}
                          </span>
                          
                          {/* Course Count */}
                          {student.student?.courses && student.student.courses.length > 0 && (
                            <span className="px-2 py-1 bg-gray-900/40 text-gray-300 rounded-full text-xs flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {student.student.courses.length} {student.student.courses.length === 1 ? 'course' : 'courses'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal("view", student)}
                        className="px-3 py-1 text-sm bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal("edit", student)}
                        className="px-3 py-1 text-sm bg-gray-500/10 text-gray-300 rounded-lg border border-white/10 hover:bg-gray-500/20 transition"
                        title="Edit student"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {!student.graduated && (
                        <button
                          onClick={() => openModal("graduate", student)}
                          className="px-3 py-1 text-sm bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20 hover:bg-purple-500/20 transition"
                          title="Mark as graduated"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openModal("delete", student)}
                        className="px-3 py-1 text-sm bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition"
                        title="Delete student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modalType && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* View Modal */}
            {modalType === "view" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-5 h-5 text-blue-400" />
                  <h3 className="text-xl font-semibold">Student Details</h3>
                </div>
                <div className="space-y-3 text-gray-300">
                  <p>
                    <span className="text-gray-400">Name:</span>{" "}
                    {selectedStudent.name}
                  </p>
                  <p>
                    <span className="text-gray-400">Email:</span>{" "}
                    {selectedStudent.email}
                  </p>
                  <p>
                    <span className="text-gray-400">Primary Program:</span>{" "}
                    {selectedStudent.student?.program?.name || "—"}
                  </p>
                  {selectedStudent.student?.program?.department && (
                    <p>
                      <span className="text-gray-400">Department:</span>{" "}
                      {selectedStudent.student.program.department.name}
                    </p>
                  )}
                  <p>
                    <span className="text-gray-400">Status:</span>{" "}
                    {selectedStudent.graduated ? "Graduated" : "Active"}
                  </p>
                  <p>
                    <span className="text-gray-400">Joined:</span>{" "}
                    {new Date(selectedStudent.createdAt).toLocaleDateString()}
                  </p>
                  {selectedStudent.student?.courses && selectedStudent.student.courses.length > 0 && (
                    <div>
                      <span className="text-gray-400">Enrolled Courses:</span>
                      <div className="mt-2 space-y-2">
                        {selectedStudent.student.courses.map((course) => (
                          <div
                            key={course.id}
                            className="px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm"
                          >
                            <div className="font-medium">{course.name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Code: {course.entryCode}
                            </div>
                            {course.semester?.academicYear?.program && (
                              <div className="text-xs text-purple-400 mt-1">
                                Program: {course.semester.academicYear.program.name}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-6 text-right">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {/* Edit Modal */}
            {modalType === "edit" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Edit className="w-5 h-5 text-gray-300" />
                  <h3 className="text-xl font-semibold">Edit Student</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Primary Program
                    </label>
                    <select
                      value={editForm.programId}
                      onChange={(e) =>
                        setEditForm({ ...editForm, programId: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white"
                    >
                      <option value="">Select Program</option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.name}
                          {program.department && ` (${program.department.name})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white"
                  >
                    Save
                  </button>
                </div>
              </>
            )}

            {/* Graduate Modal */}
            {modalType === "graduate" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <GraduationCap className="w-5 h-5 text-purple-400" />
                  <h3 className="text-xl font-semibold">Mark as Graduated</h3>
                </div>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to mark{" "}
                  <span className="font-semibold text-white">
                    {selectedStudent.name}
                  </span>{" "}
                  as graduated?
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGraduate}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white"
                  >
                    Confirm
                  </button>
                </div>
              </>
            )}

            {/* Delete Modal */}
            {modalType === "delete" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  <h3 className="text-xl font-semibold">Delete Student</h3>
                </div>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-white">
                    {selectedStudent.name}
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
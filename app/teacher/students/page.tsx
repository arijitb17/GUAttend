"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { Search, Upload, X, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/useToast";
import { ToastContainer } from "@/components/Toast";

interface StudentCourseRef {
  id: string;
  name: string;
}

interface Student {
  id: string;
  user: {
    name: string;
    email: string;
  };
  program: {
    name: string;
    department: {
      name: string;
    };
  };
  faceEmbedding: boolean;
  _count: {
    courses: number;
    attendance: number;
  };
  courses?: StudentCourseRef[];
}

interface Course {
  id: string;
  name: string;
  entryCode: string;
  _count: {
    students: number;
    attendance: number;
  };
}

interface Program {
  id: string;
  name: string;
  department: {
    name: string;
  };
}

export default function TeacherStudents() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [importing, setImporting] = useState(false);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("");
  
  // Use the toast hook instead of manual state management
  const { toasts, toast, removeToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        router.push("/login");
        return;
      }

      const [studentsRes, coursesRes, programsRes] = await Promise.all([
        fetch("/api/teacher/students", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/teacher/courses", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/programs", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (studentsRes.status === 401 || coursesRes.status === 401) {
        setError("Session expired. Please log in again.");
        router.push("/login");
        return;
      }

      if (!studentsRes.ok || !coursesRes.ok) {
        throw new Error("Failed to fetch data from server");
      }

      const studentsData = await studentsRes.json();
      const coursesData = await coursesRes.json();
      const programsData = programsRes.ok ? await programsRes.json() : [];

      setStudents(studentsData);
      setCourses(coursesData);
      setPrograms(programsData);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  const filteredStudents = students.filter((student) => {
    const query = searchTerm.toLowerCase();
    return (
      student.user.name.toLowerCase().includes(query) ||
      student.user.email.toLowerCase().includes(query) ||
      student.program.name.toLowerCase().includes(query)
    );
  });

  const courseFilteredStudents =
    selectedCourseFilter === ""
      ? filteredStudents
      : filteredStudents.filter((student) =>
          student.courses?.some((c) => c.id === selectedCourseFilter)
        );

  async function handleImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setImporting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const courseId = formData.get("courseId") as string;
      const programId = formData.get("programId") as string;
      const file = formData.get("file") as File;

      if (!courseId) {
        toast.error("Course Required", "Please select a course before importing.");
        setImporting(false);
        return;
      }

      if (!programId) {
        toast.error("Program Required", "Please select a program before importing.");
        setImporting(false);
        return;
      }

      if (!file) {
        toast.error("File Required", "Please select a file to import.");
        setImporting(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication Error", "Please log in again.");
        router.push("/login");
        return;
      }

      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
        header: 1,
      }) as any[][];

      const studentsToImport: {
        name: string;
        email: string;
        dob: string;
        programId: string;
      }[] = [];

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;

        const [name, dob, email] = row;
        if (!name || !dob) continue;

        const studentEmail =
          email ||
          `${String(name).toLowerCase().replace(/\s+/g, ".")}@student.com`;

        let parsedDob: string;
        if (typeof dob === "number") {
          const excelEpoch = new Date(1899, 11, 30);
          const daysSinceEpoch = Math.floor(dob);
          const date = new Date(excelEpoch);
          date.setDate(excelEpoch.getDate() + daysSinceEpoch);
          parsedDob = date.toISOString().split("T")[0];
        } else {
          let dateStr = String(dob).trim();
          dateStr = dateStr.replace(/\//g, "-");
          const parts = dateStr.split("-");
          if (parts.length === 3) {
            let [day, month, year] = parts;
            if (year.length === 2) {
              const currentYear = new Date().getFullYear();
              const century = Math.floor(currentYear / 100) * 100;
              year = String(century + parseInt(year, 10));
            }
            parsedDob = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
          } else {
            console.warn(`Skipping student ${name} - invalid DOB: ${dob}`);
            continue;
          }
        }

        studentsToImport.push({
          name: String(name).trim(),
          email: studentEmail.toLowerCase().trim(),
          dob: parsedDob,
          programId,
        });
      }

      if (studentsToImport.length === 0) {
        toast.warning("No Valid Data", "No valid student records found in the file.");
        setImporting(false);
        return;
      }

      const response = await fetch("/api/teacher/students/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ students: studentsToImport, courseId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to import students");
      }

      const { created, updated, enrolled, skipped, errors } = result;

      toast.success(
        "Import Successful!",
        `Created: ${created}, Updated: ${updated}, Enrolled: ${enrolled}, Skipped: ${skipped}`
      );

      if (errors && errors.length > 0) {
        toast.warning(
          "Some Issues Occurred",
          `${errors.length} student(s) had errors. Check console for details.`
        );
        console.error("Import errors:", errors);
      }

      await fetchData();
      if (formRef.current) formRef.current.reset();
    } catch (err: any) {
      console.error("Import error:", err);
      toast.error("Import Failed", err.message || "An error occurred during import");
    } finally {
      setImporting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
          <p className="text-sm text-slate-600 font-medium">Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
        <Card className="max-w-md w-full border border-rose-200 bg-white rounded-2xl shadow-lg">
          <CardContent className="py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 mb-4">
              <AlertCircle className="h-7 w-7 text-rose-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Data</h3>
            <p className="text-sm text-slate-600 mb-6">{error}</p>
            <Button
              onClick={fetchData}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-2"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Student Management
            </h1>
            <p className="text-sm md:text-base text-slate-500 mt-1">
              Import, view, and manage your students
            </p>
          </div>
        </div>

        <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.55)]">
              <Upload size={18} />
            </div>
            <div>
              <CardTitle className="text-base md:text-lg">Import Students</CardTitle>
              <p className="text-xs md:text-[13px] text-slate-500 mt-0.5">
                Upload an Excel file to create student accounts and enroll them into a course.
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <form ref={formRef} onSubmit={handleImport} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Excel File (.xlsx)
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Columns: <span className="font-mono">Name</span>,{" "}
                  <span className="font-mono">DOB (dd/mm/yyyy or dd-mm-yyyy)</span>,{" "}
                  <span className="font-mono">Email (optional)</span>
                </p>
                <input
                  type="file"
                  name="file"
                  accept=".xlsx,.xls"
                  required
                  disabled={importing}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Program
                  </label>
                  <select
                    name="programId"
                    required
                    disabled={importing}
                    className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60"
                  >
                    <option value="">-- Select Program --</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name} ({program.department.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Course
                  </label>
                  <select
                    name="courseId"
                    required
                    disabled={importing}
                    className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60"
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-slate-500">
                  Newly imported students will receive login credentials by email.
                </p>
                <Button
                  type="submit"
                  disabled={importing}
                  variant="outline"
                  className="bg-slate-100 border border-slate-300 text-slate-900 text-sm px-4 py-2 rounded-xl hover:bg-slate-200 hover:border-slate-400 shadow-sm disabled:opacity-60 disabled:shadow-none"
                >
                  {importing ? "Importing…" : "Import Students"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search + Course filter card */}
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardContent className="py-3">
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search students by name, email, or program…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="w-full md:w-64">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Filter by Course
                </label>
                <select
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <option value="">All Courses</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="border border-slate-300 bg-white rounded-2xl shadow-[0_6px_18px_rgba(15,23,42,0.05)] overflow-hidden">
          <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base md:text-lg">Student Directory</CardTitle>
          </CardHeader>

          {courseFilteredStudents.length === 0 ? (
            <CardContent className="py-8 text-center text-sm">
              <span className="text-4xl mb-3 block">👨‍🎓</span>
              <p className="font-medium text-slate-700 mb-1">No Students Found</p>
              <p className="text-slate-500">
                {searchTerm || selectedCourseFilter
                  ? "Try adjusting the search or course filter."
                  : "No students enrolled in your courses yet."}
              </p>
            </CardContent>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {[
                      "Student",
                      "Program",
                      "Department",
                      "Courses",
                      "Attendance",
                      "Face Data",
                    ].map((head) => (
                      <th
                        key={head}
                        className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courseFilteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {student.user.name}
                          </p>
                          <p className="text-xs text-slate-500">{student.user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-slate-700">
                        {student.program.name}
                      </td>
                      <td className="px-6 py-3 text-slate-700">
                        {student.program.department.name}
                      </td>
                      <td className="px-6 py-3 text-slate-700">
                        {student._count.courses}
                      </td>
                      <td className="px-6 py-3 text-slate-700">
                        {student._count.attendance}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            student.faceEmbedding
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {student.faceEmbedding ? "✓ Registered" : "✗ Missing"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
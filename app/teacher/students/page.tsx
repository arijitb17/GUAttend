"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { Search, Upload } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
        alert("Please select a course before importing.");
        setImporting(false);
        return;
      }

      if (!programId) {
        alert("Please select a program before importing.");
        setImporting(false);
        return;
      }

      if (!file) {
        alert("Please select a file to import.");
        setImporting(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token not found. Please log in again.");
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

        let formattedDob = "";

        if (typeof dob === "number") {
          if (dob > 31000) {
            const date = XLSX.SSF.parse_date_code(dob);
            formattedDob = `${date.y}-${String(date.m).padStart(
              2,
              "0"
            )}-${String(date.d).padStart(2, "0")}`;
          } else {
            const dobStr = String(dob).padStart(6, "0");
            const day = dobStr.substring(0, 2);
            const month = dobStr.substring(2, 4);
            const year = "20" + dobStr.substring(4, 6);
            formattedDob = `${year}-${month}-${day}`;
          }
        } else if (typeof dob === "string") {
          if (dob.includes("/")) {
            const parts = dob.split("/");
            if (parts.length === 3) {
              let year = parts[2];
              if (year.length === 2) {
                year = "20" + year;
              }
              formattedDob = `${year}-${parts[1].padStart(
                2,
                "0"
              )}-${parts[0].padStart(2, "0")}`;
            }
          } else if (dob.length === 6) {
            const day = dob.substring(0, 2);
            const month = dob.substring(2, 4);
            const year = "20" + dob.substring(4, 6);
            formattedDob = `${year}-${month}-${day}`;
          }
        }

        studentsToImport.push({
          name: String(name).trim(),
          email: String(studentEmail).trim(),
          dob: formattedDob,
          programId,
        });
      }

      if (studentsToImport.length === 0) {
        alert("No valid student data found in the file.");
        setImporting(false);
        return;
      }

      const res = await fetch(`/api/teacher/courses/${courseId}/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ students: studentsToImport }),
      });

      const data = await res.json();

      if (res.ok) {
        const { results } = data;

        const studentsToEmail = studentsToImport.map((s) => ({
          name: s.name,
          email: s.email,
          dob: s.dob,
        }));

        await fetch("/api/teacher/send-credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ students: studentsToEmail }),
        });

        let message = `✅ Import completed and emails sent!\n\n`;
        message += `Successful: ${results.successful.length}\n`;
        message += `Already enrolled: ${results.existing.length}\n`;
        message += `Failed: ${results.failed.length}`;

        if (results.failed.length > 0) {
          message += `\n\nFailed imports:\n`;
          results.failed.slice(0, 5).forEach((f: any) => {
            message += `- ${f.email}: ${f.reason}\n`;
          });
          if (results.failed.length > 5) {
            message += `... and ${results.failed.length - 5} more`;
          }
        }

        alert(message);

        if (formRef.current) {
          formRef.current.reset();
        }

        await fetchData();
      } else {
        alert(`❌ Error: ${data.error || "Failed to import students"}`);
      }
    } catch (error: any) {
      console.error("Import error:", error);
      alert("❌ Error: " + error.message);
    } finally {
      setImporting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[260px] text-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto" />
          <p className="mt-3 text-sm text-slate-500">Loading students & courses…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[260px]">
        <Card className="max-w-md border border-rose-200 bg-rose-50 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-rose-800 text-base">
              Error Loading Students & Courses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-rose-700">{error}</p>
            <Button
              variant="outline"
              onClick={fetchData}
              className="border-rose-300 text-rose-700 hover:bg-rose-100"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto py-6 space-y-8 text-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight flex items-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)]">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white text-xl shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
              👩‍🏫
            </span>
            <span>Students & Courses</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            View your students, assign them to courses, and bulk-import new students from
            Excel.
          </p>
        </div>
      </div>

      {/* Import Students (single card now) */}
      <Card className="border border-slate-300 bg-white rounded-2xl shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
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
                <span className="font-mono">DOB (dd/mm/yyyy)</span>,{" "}
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
  );
}

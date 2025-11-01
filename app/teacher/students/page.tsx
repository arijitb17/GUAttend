"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from 'xlsx';
import { Search, Upload, ChevronRight } from "lucide-react";

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

  const handleCourseClick = (courseId: string) => {
    router.push(`/teacher/courses/${courseId}`);
  };

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
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

      const students = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;

        const [name, dob, email] = row;
        
        if (!name || !dob) continue;

        const studentEmail = email || 
          `${name.toLowerCase().replace(/\s+/g, '.')}@student.com`;
        
        let formattedDob = '';
        if (typeof dob === 'number') {
          if (dob > 31000) {
            const date = XLSX.SSF.parse_date_code(dob);
            formattedDob = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
          } else {
            const dobStr = String(dob).padStart(6, '0');
            const day = dobStr.substring(0, 2);
            const month = dobStr.substring(2, 4);
            const year = '20' + dobStr.substring(4, 6);
            formattedDob = `${year}-${month}-${day}`;
          }
        } else if (typeof dob === 'string') {
          if (dob.includes('/')) {
            const parts = dob.split('/');
            if (parts.length === 3) {
              let year = parts[2];
              if (year.length === 2) {
                year = '20' + year;
              }
              formattedDob = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          } else if (dob.length === 6) {
            const day = dob.substring(0, 2);
            const month = dob.substring(2, 4);
            const year = '20' + dob.substring(4, 6);
            formattedDob = `${year}-${month}-${day}`;
          }
        }

        students.push({
          name: String(name).trim(),
          email: studentEmail.trim(),
          dob: formattedDob,
          programId: programId
        });
      }

      if (students.length === 0) {
        alert("No valid student data found in the file.");
        setImporting(false);
        return;
      }

      const res = await fetch(`/api/teacher/courses/${courseId}/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ students })
      });

      const data = await res.json();

      if (res.ok) {
        const { results } = data;

        const studentsToEmail = students.map((s) => ({
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md shadow-sm">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

return (
  <div className="space-y-8 text-white">
    <div>
      <h1 className="text-4xl font-semibold tracking-tight">Students & Courses</h1>
      <p className="text-gray-400 mt-2">
        View and manage students, or click a course to import students
      </p>
    </div>

    {/* Import Students */}
    <div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_0_25px_rgba(255,255,255,0.05)]">
      <h3 className="text-xl font-semibold mb-4 text-white">Import Students</h3>
      <form ref={formRef} onSubmit={handleImport}>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Upload Excel File (.xlsx) – Columns: Name, DOB (dd/mm/yyyy), Email (optional)
        </label>
        <input
          type="file"
          name="file"
          accept=".xlsx,.xls"
          required
          disabled={importing}
          className="mb-3 block w-full border border-white/10 rounded-lg p-2 bg-[#1a1a1a]/80 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
        />

        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Program
        </label>
        <select
          name="programId"
          required
          disabled={importing}
          className="block w-full border border-white/10 rounded-lg p-2 mb-3 bg-[#1a1a1a]/80 text-gray-200 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">-- Select Program --</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name} ({program.department.name})
            </option>
          ))}
        </select>

        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Course
        </label>
        <select
          name="courseId"
          required
          disabled={importing}
          className="block w-full border border-white/10 rounded-lg p-2 mb-3 bg-[#1a1a1a]/80 text-gray-200 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">-- Select Course --</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={importing}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {importing ? "Importing..." : "Import Students"}
        </button>
      </form>
    </div>

    {/* Courses List */}
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-white">Your Courses</h2>
      {courses.length === 0 ? (
        <div className="bg-[#141414]/80 border border-white/10 rounded-2xl p-12 text-center backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)]">
          <span className="text-6xl mb-4 block">📚</span>
          <h3 className="text-xl font-semibold mb-2 text-white">No Courses Yet</h3>
          <p className="text-gray-400">You don't have any courses assigned yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => handleCourseClick(course.id)}
              className="bg-[#141414]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {course.name}
                </h3>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Code: {course.entryCode}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  👥 {course._count.students} students
                </span>
                <span className="text-blue-400 font-medium group-hover:text-blue-300">
                  View →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Search Filter */}
    <div className="bg-[#141414]/80 border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)]">
      <div className="relative">
        <Search className="absolute left-4 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by name, email, or program..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#1a1a1a]/80 pl-10 pr-4 py-2 text-sm text-gray-200 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500"
        />
      </div>
    </div>

    {/* Students Table */}
    {filteredStudents.length === 0 ? (
      <div className="bg-[#141414]/80 border border-white/10 rounded-2xl p-12 text-center backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <span className="text-6xl mb-4 block">👨‍🎓</span>
        <h3 className="text-xl font-semibold mb-2 text-white">No Students Found</h3>
        <p className="text-gray-400">
          {searchTerm
            ? "Try adjusting your search terms"
            : "No students enrolled in your courses yet"}
        </p>
      </div>
    ) : (
      <div className="bg-[#141414]/80 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1a1a1a] border-b border-white/10">
              <tr>
                {["Student", "Program", "Department", "Courses", "Attendance", "Face Data"].map((head) => (
                  <th
                    key={head}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-[#1f1f1f] transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {student.user.name}
                      </div>
                      <div className="text-sm text-gray-400">{student.user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {student.program.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {student.program.department.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {student._count.courses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {student._count.attendance}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        student.faceEmbedding
                          ? "bg-green-900/30 text-green-400 border border-green-700/50"
                          : "bg-red-900/30 text-red-400 border border-red-700/50"
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
      </div>
    )}
  </div>
);
}
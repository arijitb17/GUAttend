"use client";

import { useEffect, useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";

interface Course {
  id: string;
  name: string;
  entryCode: string;
}

interface AttendanceReport {
  studentName: string;
  studentEmail: string;
  totalSessions: number;
  attended: number;
  percentage: number;
}

export default function TeacherReports() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [report, setReport] = useState<AttendanceReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Please log in to view reports");
        return;
      }

      const res = await fetch("/api/teacher/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to fetch courses");
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setError("Failed to load courses");
    }
  }

  async function generateReport() {
    if (!selectedCourse) {
      setError("Please select a course");
      return;
    }
    
    setLoading(true);
    setError(null);
    setReport([]); // Clear previous report
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Please log in to generate reports");
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        courseId: selectedCourse,
      });

      if (dateRange.startDate) {
        params.append("startDate", dateRange.startDate);
      }
      if (dateRange.endDate) {
        params.append("endDate", dateRange.endDate);
      }
      
      console.log("Fetching report with params:", params.toString());
      
      const res = await fetch(`/api/teacher/reports?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Response status:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Failed to generate report");
      }

      const data = await res.json();
      console.log("Report data received:", data);
      setReport(data);
      
      if (data.length === 0) {
        setError("No attendance data found for this course. Make sure attendance has been marked.");
      }
    } catch (error: any) {
      console.error("Failed to generate report:", error);
      setError(error.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  }

  function downloadCSV() {
    if (report.length === 0) return;

    const selectedCourseName = courses.find(c => c.id === selectedCourse)?.name || "Unknown";
    const headers = ["Student Name", "Email", "Total Sessions", "Attended", "Attendance %"];
    const rows = report.map(r => [
      r.studentName,
      r.studentEmail,
      r.totalSessions.toString(),
      r.attended.toString(),
      r.percentage.toFixed(1) + "%"
    ]);

    const csv = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(",")
    ).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance_report_${selectedCourseName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return "text-green-600 bg-green-50";
    if (percentage >= 50) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const averageAttendance = report.length > 0 
    ? (report.reduce((sum, r) => sum + r.percentage, 0) / report.length).toFixed(1)
    : "0";

return (
  <div className="p-6 max-w-7xl mx-auto space-y-6 text-gray-100">
    {/* Header */}
    <div>
      <h1 className="text-3xl font-bold text-white">Attendance Reports</h1>
      <p className="text-gray-400 mt-2">
        Generate and export attendance statistics
      </p>
    </div>

    {/* Error Message */}
    {error && (
      <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 text-red-300">
        <p>{error}</p>
      </div>
    )}

    {/* Report Configuration */}
    <div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_0_25px_rgba(255,255,255,0.05)] space-y-4">
      <h2 className="text-lg font-semibold text-white mb-4">
        Report Configuration
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Course *
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-[#1a1a1a] border border-white/10 focus:ring-2 focus:ring-blue-500 text-gray-100"
          >
            <option value="">Choose a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.entryCode})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Start Date (Optional)
          </label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
            }
            className="w-full px-4 py-2 rounded-lg bg-[#1a1a1a] border border-white/10 focus:ring-2 focus:ring-blue-500 text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            End Date (Optional)
          </label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
            }
            className="w-full px-4 py-2 rounded-lg bg-[#1a1a1a] border border-white/10 focus:ring-2 focus:ring-blue-500 text-gray-100"
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={generateReport}
          disabled={!selectedCourse || loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 flex items-center"
        >
          <FileSpreadsheet className="mr-2" size={18} />
          {loading ? "Generating..." : "Generate Report"}
        </button>

        {report.length > 0 && (
          <button
            onClick={downloadCSV}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center"
          >
            <Download className="mr-2" size={18} />
            Export to CSV
          </button>
        )}
      </div>
    </div>

    {/* Summary Stats */}
    {report.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1a1a]/80 border border-white/10 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-400 mb-1">Total Students</p>
          <p className="text-2xl font-bold text-white">{report.length}</p>
        </div>
        <div className="bg-blue-900/30 border border-blue-500/30 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-blue-300 mb-1">Average Attendance</p>
          <p className="text-2xl font-bold text-blue-400">{averageAttendance}%</p>
        </div>
        <div className="bg-purple-900/30 border border-purple-500/30 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-purple-300 mb-1">Students Below 75%</p>
          <p className="text-2xl font-bold text-purple-400">
            {report.filter((r) => r.percentage < 75).length}
          </p>
        </div>
      </div>
    )}

    {/* Report Results */}
    {loading ? (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Generating report...</p>
        </div>
      </div>
    ) : report.length > 0 ? (
      <div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.05)] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 bg-[#1c1c1c]/80">
          <h3 className="text-lg font-semibold text-white">
            Attendance Summary -{" "}
            {courses.find((c) => c.id === selectedCourse)?.name}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Showing {report.length} students
            {dateRange.startDate && dateRange.endDate && (
              <span>
                {" "}
                • {new Date(dateRange.startDate).toLocaleDateString()} to{" "}
                {new Date(dateRange.endDate).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1f1f1f]/80 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Total Sessions
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Attended
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Attendance %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {report.map((student, index) => (
                <tr
                  key={index}
                  className="hover:bg-[#1a1a1a] transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                    {student.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                    {student.studentEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-gray-200">
                    {student.totalSessions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-gray-200">
                    {student.attended}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getAttendanceColor(
                        student.percentage
                      )}`}
                    >
                      {student.percentage.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ) : selectedCourse && !loading ? (
      <div className="bg-[#141414]/80 border border-white/10 rounded-2xl p-12 text-center">
        <FileSpreadsheet className="mx-auto mb-4 text-gray-500" size={64} />
        <h3 className="text-xl font-semibold text-white mb-2">
          No Data Available
        </h3>
        <p className="text-gray-400">
          No attendance records found for the selected criteria
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Try selecting a different date range or ensure attendance has been
          marked for this course
        </p>
      </div>
    ) : null}
  </div>
);
}
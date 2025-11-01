"use client";

import { useEffect, useState } from "react";
import { Calendar, Download } from "lucide-react";

export default function AttendanceHistoryPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view attendance history");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/student/history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch attendance history");
      }

      const data = await res.json();
      setRecords(data);
    } catch (error: any) {
      console.error("Failed to fetch history:", error);
      setError(error.message || "Failed to load attendance history");
    } finally {
      setLoading(false);
    }
  }

  const filteredRecords = records.filter((record) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "present" && record.status) ||
      (filter === "absent" && !record.status);
    const matchesSearch = record.course?.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: records.length,
    present: records.filter((r) => r.status).length,
    absent: records.filter((r) => !r.status).length,
    percentage:
      records.length > 0
        ? ((records.filter((r) => r.status).length / records.length) * 100).toFixed(1)
        : "0",
  };

  const downloadCSV = () => {
    const headers = ["Course", "Entry Code", "Status", "Date", "Time"];
    const rows = filteredRecords.map((r) => [
      r.course?.name || "N/A",
      r.course?.entryCode || "N/A",
      r.status ? "Present" : "Absent",
      new Date(r.timestamp).toLocaleDateString(),
      new Date(r.timestamp).toLocaleTimeString(),
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance_history_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ---------- Loading ----------
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141414] text-gray-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading attendance history...</p>
        </div>
      </div>
    );

  // ---------- Error ----------
  if (error)
    return (
      <div className="p-6 max-w-7xl mx-auto text-white">
        <div className="bg-red-600/10 border border-red-500/40 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchHistory}
            className="mt-3 text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold mb-2">Attendance History</h1>
        <p className="text-gray-400">
          Track your attendance records across all enrolled courses
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Total Classes</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <p className="text-green-400 text-sm mb-1">Present</p>
          <p className="text-2xl font-bold text-green-300">{stats.present}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm mb-1">Absent</p>
          <p className="text-2xl font-bold text-red-300">{stats.absent}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-blue-400 text-sm mb-1">Attendance Rate</p>
          <p className="text-2xl font-bold text-blue-300">{stats.percentage}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1a1a1a]/80 border border-white/10 p-4 rounded-xl mb-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <input
            type="text"
            placeholder="Search by course name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-[#141414] border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <div className="flex gap-2">
            {["all", "present", "absent"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f
                    ? f === "present"
                      ? "bg-green-600 text-white"
                      : f === "absent"
                      ? "bg-red-600 text-white"
                      : "bg-blue-600 text-white"
                    : "bg-[#141414] text-gray-300 hover:bg-[#232323]"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            {filteredRecords.length > 0 && (
              <button
                onClick={downloadCSV}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-white hover:bg-white/20 flex items-center gap-2 transition"
              >
                <Download size={18} />
                Export
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredRecords.length === 0 ? (
        <div className="bg-[#1a1a1a]/70 border border-white/10 rounded-xl p-12 text-center">
          <Calendar className="mx-auto mb-4 text-gray-500" size={48} />
          <p className="text-gray-300 text-lg">
            {searchTerm || filter !== "all"
              ? "No records match your filters"
              : "No attendance records found"}
          </p>
          {records.length === 0 && (
            <p className="text-gray-500 text-sm mt-2">
              Your attendance will appear here once classes are attended
            </p>
          )}
        </div>
      ) : (
        <div className="bg-[#1a1a1a]/80 border border-white/10 rounded-xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#232323] text-gray-400">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Course</th>
                  <th className="px-6 py-3 text-left font-semibold">Entry Code</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-t border-white/10 hover:bg-white/5 transition"
                  >
                    <td className="px-6 py-4 text-white">
                      {record.course?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono">
                      {record.course?.entryCode || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          record.status
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {record.status ? "✓ Present" : "✗ Absent"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(record.timestamp).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      at{" "}
                      {new Date(record.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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

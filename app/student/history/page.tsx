"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Download, Search, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AttendanceRecord {
  id: string;
  status: boolean;
  timestamp: string;
  course?: {
    name?: string;
    entryCode?: string;
  };
}

export default function AttendanceHistoryPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "present" | "absent">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "records">("overview");

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    setError(null);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setError("Please log in to view attendance history.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/student/history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || "Failed to fetch attendance history."
        );
      }

      const data = await res.json();
      setRecords(data);
    } catch (err: any) {
      console.error("Failed to fetch history:", err);
      setError(err.message || "Failed to load attendance history.");
    } finally {
      setLoading(false);
    }
  }

  const filteredRecords = records.filter((record) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "present" && record.status) ||
      (filter === "absent" && !record.status);

    const courseName = record.course?.name || "";
    const matchesSearch = courseName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const presentCount = records.filter((r) => r.status).length;
  const absentCount = records.filter((r) => !r.status).length;

  const stats = {
    total: records.length,
    present: presentCount,
    absent: absentCount,
    percentage:
      records.length > 0
        ? ((presentCount / records.length) * 100).toFixed(1)
        : "0.0",
  };

  // Per-course summary for "charts"
  const courseSummary = useMemo(() => {
    const map = new Map<
      string,
      { name: string; entryCode: string; total: number; present: number }
    >();

    for (const r of records) {
      const name = r.course?.name || "Unknown Course";
      const code = r.course?.entryCode || "N/A";
      const key = `${name}__${code}`;
      if (!map.has(key)) {
        map.set(key, { name, entryCode: code, total: 0, present: 0 });
      }
      const item = map.get(key)!;
      item.total += 1;
      if (r.status) item.present += 1;
    }

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        percentage:
          item.total > 0
            ? Math.round((item.present / item.total) * 100)
            : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [records]);

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
    link.download = `attendance_history_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ---------- Loading ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-900">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 mx-auto" />
          <p className="text-sm text-slate-500">
            Loading attendance history…
          </p>
        </div>
      </div>
    );
  }

  // ---------- Error ----------
  if (error) {
    return (
      <div className="space-y-6 text-slate-900">
        <Card className="max-w-xl border border-red-200 bg-red-50/80 shadow-[0_8px_30px_rgba(220,38,38,0.15)] mx-auto">
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle size={18} />
            </div>
            <CardTitle className="text-base md:text-lg text-red-800">
              Unable to load history
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <p className="text-sm text-red-700">{error}</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
              <Button
                size="sm"
                onClick={fetchHistory}
                className="bg-red-600 hover:bg-red-700"
              >
                Try again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white text-xl shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
              <Calendar size={18} />
            </span>
            <span>Attendance History</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            Review and analyze your attendance across all courses.
          </p>
        </div>
        {records.length > 0 && (
          <Button
            variant="outline"
            onClick={downloadCSV}
            className="flex items-center gap-2 border-slate-300 hover:border-slate-400"
          >
            <Download size={18} />
            <span className="text-sm">Export CSV</span>
          </Button>
        )}
      </div>

      {/* Tabs (Overview / Records) */}
      <Card className="border border-slate-200 bg-slate-50/70 rounded-2xl shadow-[0_4px_16px_rgba(15,23,42,0.06)]">
        <CardContent className="p-1.5 md:p-2 flex gap-1.5 md:gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 px-3 md:px-6 py-2 md:py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all
            ${
              activeTab === "overview"
                ? "bg-white text-slate-900 shadow-[0_4px_14px_rgba(15,23,42,0.12)] border border-slate-200"
                : "text-slate-500 hover:text-slate-900 hover:bg-white/70"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("records")}
            className={`flex-1 px-3 md:px-6 py-2 md:py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all
            ${
              activeTab === "records"
                ? "bg-white text-slate-900 shadow-[0_4px_14px_rgba(15,23,42,0.12)] border border-slate-200"
                : "text-slate-500 hover:text-slate-900 hover:bg-white/70"
            }`}
          >
            All Records
          </button>
        </CardContent>
      </Card>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(15,23,42,0.08)]">
              <CardContent className="p-4 md:p-5">
                <p className="text-xs md:text-sm text-slate-500">
                  Total Classes
                </p>
                <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
                  {stats.total}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-emerald-200 bg-emerald-50 rounded-2xl shadow-[0_6px_18px_rgba(16,185,129,0.18)]">
              <CardContent className="p-4 md:p-5">
                <p className="text-xs md:text-sm text-emerald-700">Present</p>
                <p className="text-2xl md:text-3xl font-bold text-emerald-800 mt-1">
                  {stats.present}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-rose-200 bg-rose-50 rounded-2xl shadow-[0_6px_18px_rgba(244,63,94,0.18)]">
              <CardContent className="p-4 md:p-5">
                <p className="text-xs md:text-sm text-rose-700">Absent</p>
                <p className="text-2xl md:text-3xl font-bold text-rose-800 mt-1">
                  {stats.absent}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-sky-200 bg-sky-50 rounded-2xl shadow-[0_6px_18px_rgba(59,130,246,0.18)]">
              <CardContent className="p-4 md:p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs md:text-sm text-sky-700">
                    Attendance Rate
                  </p>
                  <p className="text-lg md:text-xl font-semibold text-sky-800">
                    {stats.percentage}%
                  </p>
                </div>
                {/* Overall progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters (works for both tabs, but keep here for UX) */}
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,23,42,0.06)]">
            <CardContent className="p-4 md:p-5 space-y-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-2.5 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Filter courses in the chart by name…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm md:text-base rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {(["all", "present", "absent"] as const).map((f) => {
                  const isActive = filter === f;
                  const label = f.charAt(0).toUpperCase() + f.slice(1);
                  let activeClasses = "";
                  if (f === "present") activeClasses = "bg-emerald-200 text-slate-900";
                  else if (f === "absent")
                    activeClasses = "bg-rose-200 text-slate-900";
                  else activeClasses = "bg-sky-200 text-slate-900";

                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition ${
                        isActive
                          ? activeClasses
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Per-course "chart" with progress bars */}
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(15,23,42,0.08)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">
                Attendance by Course
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {courseSummary.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  No attendance records yet to show course-wise summary.
                </div>
              ) : (
                <div className="space-y-4">
                  {courseSummary
                    .filter((c) =>
                      c.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((course) => (
                      <div key={`${course.name}__${course.entryCode}`}>
                        <div className="flex justify-between items-baseline mb-1">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900">
                              {course.name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {course.entryCode}
                            </span>
                          </div>
                          <div className="text-right text-xs text-slate-500">
                            <span className="font-semibold text-slate-900 mr-1">
                              {course.percentage}%
                            </span>
                            <span>
                              ({course.present}/{course.total} present)
                            </span>
                          </div>
                        </div>
                        {/* Horizontal bar for this course (chart-like) */}
                        <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 via-sky-500 to-sky-400 transition-all duration-500"
                            style={{ width: `${course.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* RECORDS TAB */}
      {activeTab === "records" && (
        <div className="space-y-6">
          {/* Filters for records tab */}
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,23,42,0.06)]">
            <CardContent className="p-4 md:p-5 space-y-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-2.5 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by course name…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm md:text-base rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {(["all", "present", "absent"] as const).map((f) => {
                  const isActive = filter === f;
                  const label = f.charAt(0).toUpperCase() + f.slice(1);
                  let activeClasses = "";
                  if (f === "present") activeClasses = "bg-emerald-200 text-slate-900";
                  else if (f === "absent")
                    activeClasses = "bg-rose-200 text-slate-900";
                  else activeClasses = "bg-sky-200 text-slate-900";

                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition ${
                        isActive
                          ? activeClasses
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {filteredRecords.length === 0 ? (
            <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(15,23,42,0.08)]">
              <CardContent className="py-10 text-center space-y-2">
                <Calendar className="mx-auto mb-2 text-slate-300" size={40} />
                <p className="text-base md:text-lg font-semibold text-slate-900">
                  {searchTerm || filter !== "all"
                    ? "No records match your filters"
                    : "No attendance records yet"}
                </p>
                {records.length === 0 && (
                  <p className="text-sm text-slate-500">
                    Your attendance will appear here after you start attending
                    classes.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Desktop Table */}
              <Card className="hidden md:block border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(15,23,42,0.08)] overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wide">
                            Course
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wide">
                            Entry Code
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wide">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wide">
                            Date &amp; Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredRecords.map((record) => (
                          <tr
                            key={record.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-6 py-4 text-slate-900">
                              {record.course?.name || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                              {record.course?.entryCode || "N/A"}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                  record.status
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-rose-50 text-rose-700 border border-rose-200"
                                }`}
                              >
                                {record.status ? "Present" : "Absent"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {new Date(record.timestamp).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}{" "}
                              at{" "}
                              {new Date(record.timestamp).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredRecords.map((record) => (
                  <Card
                    key={record.id}
                    className="border border-slate-200 bg-white rounded-2xl shadow-[0_4px_14px_rgba(15,23,42,0.08)]"
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900 truncate">
                            {record.course?.name || "N/A"}
                          </h3>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {record.course?.entryCode || "N/A"}
                          </p>
                        </div>
                        <span
                          className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-medium ${
                            record.status
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {record.status ? "Present" : "Absent"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar size={12} />
                        <span>
                          {new Date(
                            record.timestamp
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at{" "}
                          {new Date(
                            record.timestamp
                          ).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

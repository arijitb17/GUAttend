"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Settings,
  Target,
  UserCheck,
  BarChart3,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AdminStats {
  teachers: number;
  students: number;
  departments: number;
  programs: number;
}

// Apple-style soft depth gradients for stat cards
const STAT_STYLES = [
  {
    bg: "from-sky-400/30 via-sky-400/10 to-transparent",
    iconBg:
      "bg-gradient-to-br from-sky-500 to-indigo-400 shadow-[0_8px_20px_-4px_rgba(56,189,248,0.45)]",
  },
  {
    bg: "from-emerald-400/30 via-emerald-400/10 to-transparent",
    iconBg:
      "bg-gradient-to-br from-emerald-500 to-lime-400 shadow-[0_8px_20px_-4px_rgba(16,185,129,0.45)]",
  },
  {
    bg: "from-violet-400/30 via-violet-400/10 to-transparent",
    iconBg:
      "bg-gradient-to-br from-violet-500 to-purple-500 shadow-[0_8px_20px_-4px_rgba(139,92,246,0.45)]",
  },
  {
    bg: "from-amber-400/30 via-amber-400/10 to-transparent",
    iconBg:
      "bg-gradient-to-br from-amber-500 to-orange-400 shadow-[0_8px_20px_-4px_rgba(245,158,11,0.45)]",
  },
];

export default function AdminOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    teachers: 0,
    students: 0,
    departments: 0,
    programs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReports, setShowReports] = useState(false); // ⬅️ NEW

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("token");
        if (!token) {
          if (isMounted) {
            setError("Authentication missing. Please sign in again.");
          }
          return;
        }

        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (isMounted) {
            setError("Unable to load admin overview. Please try again later.");
          }
          return;
        }

        const data = (await res.json()) as Partial<AdminStats>;
        if (isMounted && data) {
          setStats({
            teachers: data.teachers ?? 0,
            students: data.students ?? 0,
            departments: data.departments ?? 0,
            programs: data.programs ?? 0,
          });
        }
      } catch (err) {
        if (isMounted) {
          setError("Something went wrong while loading your admin dashboard.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const statCards = [
    { title: "Teachers", value: stats.teachers, icon: Users },
    { title: "Students", value: stats.students, icon: GraduationCap },
    { title: "Departments", value: stats.departments, icon: Building2 },
    { title: "Programs", value: stats.programs, icon: BookOpen },
  ];

  const quickActions = [
    {
      icon: UserCheck,
      title: "Approve Teachers",
      desc: "Review and manage teacher accounts",
      accent: "border-l-indigo-500/90",
      onClick: () => router.push("/admin/teachers"),
    },
    {
      icon: Building2,
      title: "Manage Departments",
      desc: "Create and organize departments",
      accent: "border-l-sky-500/90",
      onClick: () => router.push("/admin/departments"),
    },
    {
      icon: BookOpen,
      title: "Configure Courses",
      desc: "Create and assign courses",
      accent: "border-l-purple-500/90",
      onClick: () => router.push("/admin/courses"),
    },
    {
      icon: GraduationCap,
      title: "Programs & Structure",
      desc: "Set up academic programs",
      accent: "border-l-emerald-500/90",
      onClick: () => router.push("/admin/programs"),
    },
  ];

  // Simple normalized data for inline bar “charts”
  const maxValue = Math.max(
    stats.teachers,
    stats.students,
    stats.departments,
    stats.programs,
    1
  );

  const chartData = [
    {
      label: "Teachers",
      value: stats.teachers,
      gradient: "from-sky-500 to-indigo-400",
    },
    {
      label: "Students",
      value: stats.students,
      gradient: "from-emerald-500 to-lime-400",
    },
    {
      label: "Departments",
      value: stats.departments,
      gradient: "from-violet-500 to-purple-500",
    },
    {
      label: "Programs",
      value: stats.programs,
      gradient: "from-amber-500 to-orange-400",
    },
  ];

  return (
    <div className="space-y-10 text-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight flex items-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white text-xl shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
              A
            </span>
            <span>Admin Dashboard</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
            Institution-wide overview of teachers, students, departments, and programs.
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-700 border border-red-300 bg-red-50 rounded-md px-3 py-2 inline-flex items-center gap-2 shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="hidden md:inline-flex border-slate-200 bg-white hover:bg-slate-50 shadow-[0_4px_10px_rgba(0,0,0,0.06)]"
            onClick={() => setShowReports((prev) => !prev)} // ⬅️ TOGGLE INLINE REPORTS
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            {showReports ? "Hide Reports" : "View Reports"}
          </Button>
        </div>
      </div>

      {/* Top layout: Stats + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr]">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                <CardContent className="relative p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                      {loading ? (
                        <span className="inline-block h-7 w-16 rounded-md bg-slate-200 animate-pulse" />
                      ) : (
                        card.value
                      )}
                    </p>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${style.iconBg} text-white`}
                  >
                    <Icon size={22} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg drop-shadow-sm">
              <span>Quick Actions</span>
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Shortcuts
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  onClick={action.onClick}
                  className={`w-full justify-start h-auto py-4 px-4 border-slate-200 ${action.accent} border-l-4 bg-white hover:bg-slate-50 shadow-[0_4px_10px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] rounded-xl transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold leading-tight">{action.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                        {action.desc}
                      </p>
                    </div>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* INLINE REPORTS / CHARTS SECTION */}
      {showReports && (
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_10px_28px_rgba(15,23,42,0.18)]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-slate-700" />
                Overview Reports
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Auto-generated from current stats
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bar-style chart */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">
                Entity distribution
              </p>
              <div className="space-y-3">
                {chartData.map((item) => {
                  const widthPercent =
                    maxValue === 0 ? 0 : Math.round((item.value / maxValue) * 100);
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1 text-slate-500">
                        <span>{item.label}</span>
                        <span>
                          {item.value}{" "}
                          {maxValue > 0 && (
                            <span className="text-[11px] text-slate-400">
                              ({widthPercent}% of max)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${item.gradient}`}
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary metrics row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Total Users
                </p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {stats.teachers + stats.students}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {stats.students} Students · {stats.teachers} Teachers
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Avg users per program
                </p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {stats.programs > 0
                    ? Math.round(
                        (stats.students + stats.teachers) / stats.programs
                      )
                    : 0}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Based on current programs count
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Dept / Program ratio
                </p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {stats.departments > 0
                    ? (stats.programs / stats.departments).toFixed(1)
                    : "0.0"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Programs per department
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom layout: System Setup + Data Management */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Setup Guide */}
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.6)]">
              <Settings size={18} />
            </div>
            <CardTitle className="text-base md:text-lg">System Setup Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2 text-sm md:text-[15px] text-slate-700">
              <li>
                Create <strong>Departments</strong> (e.g., Computer Science, Mathematics).
              </li>
              <li>
                Add <strong>Programs</strong> under each department (e.g., B.Tech CS, M.Tech CS).
              </li>
              <li>
                Configure <strong>Academic Years</strong> (e.g., 2024–2025) and their{" "}
                <strong>Semesters</strong>.
              </li>
              <li>
                Register <strong>Teachers</strong> and assign them to departments.
              </li>
              <li>
                Ensure teachers create <strong>Courses</strong> in the correct semester.
              </li>
              <li>
                Import or add <strong>Students</strong> to programs and map them to courses.
              </li>
              <li>
                Verify access: admins, teachers, and students have appropriate permissions.
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Data Management Best Practices */}
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.6)]">
              <Target size={18} />
            </div>
            <CardTitle className="text-base md:text-lg">
              Data Management Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2 text-sm md:text-[15px] text-slate-700">
              <li>Schedule regular backups of student, course, and attendance data.</li>
              <li>Update student status (active/graduated) at the end of each academic year.</li>
              <li>Archive older academic year data before starting new sessions.</li>
              <li>Review teacher–department assignments periodically.</li>
              <li>Monitor storage usage for face embeddings and attendance images.</li>
              <li>Generate periodic <strong>reports</strong> for institutional analytics.</li>
              <li>Maintain consistent naming conventions for programs and courses.</li>
              <li>Audit user access and permissions every semester or quarter.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

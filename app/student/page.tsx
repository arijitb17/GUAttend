"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ClipboardList,
  User,
  GraduationCap,
  BarChart3,
  Target,
  CheckCircle2,
} from "lucide-react";

interface StudentStats {
  totalCourses: number;
  attendancePercentage: number;
  totalPresent: number;
}

// Soft gradient styles similar to TeacherOverview
const STAT_STYLES = [
  {
    bg: "from-sky-400/30 via-sky-400/10 to-transparent",
    iconBg:
      "bg-gradient-to-br from-sky-500 to-indigo-400 shadow-[0_8px_20px_-4px_rgba(56,189,248,0.5)]",
  },
  {
    bg: "from-emerald-400/30 via-emerald-400/10 to-transparent",
    iconBg:
      "bg-gradient-to-br from-emerald-500 to-lime-400 shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)]",
  },
  {
    bg: "from-purple-400/30 via-purple-400/10 to-transparent",
    iconBg:
      "bg-gradient-to-br from-purple-500 to-pink-400 shadow-[0_8px_20px_-4px_rgba(168,85,247,0.4)]",
  },
];

export default function StudentDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<StudentStats>({
    totalCourses: 0,
    attendancePercentage: 0,
    totalPresent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("token");
        if (!token) {
          if (isMounted) setError("Authentication missing. Please sign in again.");
          return;
        }

        const res = await fetch("/api/student/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (isMounted) {
            setError("Unable to load your dashboard. Please try again later.");
          }
          return;
        }

        const data = (await res.json()) as StudentStats;
        if (isMounted && data) {
          setStats({
            totalCourses: data.totalCourses ?? 0,
            attendancePercentage: data.attendancePercentage ?? 0,
            totalPresent: data.totalPresent ?? 0,
          });
        }
      } catch (err) {
        if (isMounted) {
          setError("Something went wrong while fetching your data.");
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

  const statCards: {
    title: string;
    key: keyof StudentStats;
    icon: React.ComponentType<{ size?: number }>;
    format?: (value: number) => string | number;
  }[] = [
    { title: "My Courses", key: "totalCourses", icon: GraduationCap },
    {
      title: "Attendance %",
      key: "attendancePercentage",
      icon: BarChart3,
      format: (v) => `${v.toFixed(1)}%`,
    },
    { title: "Classes Attended", key: "totalPresent", icon: CheckCircle2 },
  ];

  const quickActions = [
    {
      icon: BookOpen,
      title: "My Courses",
      desc: "View all your enrolled courses.",
      onClick: () => router.push("/student/courses"),
      accent: "border-l-sky-500/90",
    },
    {
      icon: ClipboardList,
      title: "Attendance History",
      desc: "Check detailed attendance for each class.",
      onClick: () => router.push("/student/history"),
      accent: "border-l-purple-500/90",
    },
    {
      icon: User,
      title: "My Profile",
      desc: "Review and update your personal details.",
      onClick: () => router.push("/student/profile"),
      accent: "border-l-amber-500/90",
    },
  ];

  return (
    <div className="space-y-10 text-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight flex items-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white text-xl shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
              S
            </span>
            <span>Student Dashboard</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
            Track your courses and attendance at a glance.
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-700 border border-red-300 bg-red-50 rounded-md px-3 py-2 inline-flex items-center gap-2 shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Top layout: Stats + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr]">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            const style = STAT_STYLES[index];
            const rawValue = stats[card.key] ?? 0;
            const displayValue =
              typeof card.format === "function" ? card.format(rawValue) : rawValue;

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
                        displayValue
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

      {/* Bottom layout: Attendance Guide + Tips */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attendance Guide */}
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.6)]">
              <Target size={18} />
            </div>
            <CardTitle className="text-base md:text-lg">How to Submit Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2 text-sm md:text-[15px] text-slate-700">
              <li>Get the <strong>Entry Code</strong> from your teacher.</li>
              <li>Go to <strong>My Courses</strong> and open the relevant course.</li>
              <li>Click on the active <strong>attendance batch</strong>.</li>
              <li>Enter the <strong>Entry Code</strong> when prompted.</li>
              <li>Upload a clear face photo or selfie and confirm.</li>
              <li>Wait for your teacher to approve your submission.</li>
              <li>Track your status in <strong>Attendance History</strong>.</li>
            </ol>
          </CardContent>
        </Card>

        {/* Attendance Tips / Progress Info */}
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.6)]">
              <BarChart3 size={18} />
            </div>
            <CardTitle className="text-base md:text-lg">Attendance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm md:text-[15px] text-slate-700">
              <li>
                Aim to maintain at least{" "}
                <strong>
                  {loading ? "the required" : `${Math.max(stats.attendancePercentage, 75)}%`}
                </strong>{" "}
                attendance (or higher if your program requires it).
              </li>
              <li>
                Regularly check <strong>Attendance History</strong> to ensure there are no missing
                entries.
              </li>
              <li>
                If you notice any discrepancy, contact your teacher with the{" "}
                <strong>date and course</strong> details.
              </li>
              <li>
                Make it a habit to submit attendance <strong>as soon as a batch opens</strong> to
                avoid missing it.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

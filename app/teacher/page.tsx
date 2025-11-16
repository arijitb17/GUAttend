  "use client";

  import { useEffect, useState } from "react";
  import { useRouter } from "next/navigation";
  import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import {
    BookOpen,
    Users,
    ClipboardList,
    CheckCircle2,
    PlusCircle,
    BarChart3,
    UserCog,
    Target,
    Download,
  } from "lucide-react";

  interface TeacherStats {
    courses: number;
    totalStudents: number;
    totalSemesters: number;
    totalAttendance: number;
  }

  // ⭐ Apple-style soft depth, smooth gradients, subtle glow
  const STAT_STYLES = [
    {
      bg: "from-indigo-400/30 via-indigo-400/10 to-transparent",
      iconBg:
        "bg-gradient-to-br from-indigo-500 to-sky-400 shadow-[0_8px_20px_-4px_rgba(79,70,229,0.4)]",
    },
    {
      bg: "from-emerald-400/30 via-emerald-400/10 to-transparent",
      iconBg:
        "bg-gradient-to-br from-emerald-500 to-lime-400 shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)]",
    },
    {
      bg: "from-amber-400/30 via-amber-400/10 to-transparent",
      iconBg:
        "bg-gradient-to-br from-amber-500 to-orange-400 shadow-[0_8px_20px_-4px_rgba(245,158,11,0.4)]",
    },
    {
      bg: "from-purple-400/30 via-purple-400/10 to-transparent",
      iconBg:
        "bg-gradient-to-br from-purple-500 to-pink-400 shadow-[0_8px_20px_-4px_rgba(168,85,247,0.4)]",
    },
  ];

  export default function TeacherOverview() {
    const router = useRouter();
    const [stats, setStats] = useState<TeacherStats>({
      courses: 0,
      totalStudents: 0,
      totalSemesters: 0,
      totalAttendance: 0,
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

          const res = await fetch("/api/teacher/stats", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) {
            if (isMounted) setError("Unable to load dashboard data. Please try again later.");
            return;
          }

          const data = (await res.json()) as TeacherStats;
          if (isMounted && data) {
            setStats({
              courses: data.courses ?? 0,
              totalStudents: data.totalStudents ?? 0,
              totalSemesters: data.totalSemesters ?? 0,
              totalAttendance: data.totalAttendance ?? 0,
            });
          }
        } catch (err) {
          if (isMounted) setError("Something went wrong while loading your dashboard.");
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
      { title: "My Courses", value: stats.courses, icon: BookOpen },
      { title: "Total Students", value: stats.totalStudents, icon: Users },
      { title: "Active Semesters", value: stats.totalSemesters, icon: ClipboardList },
      { title: "Total Attendance", value: stats.totalAttendance, icon: CheckCircle2 },
    ];

    const quickActions = [
      {
        icon: PlusCircle,
        title: "Create Attendance Batch",
        desc: "Start a new attendance session",
        accent: "border-l-indigo-500/90",
        onClick: () => router.push("/teacher/attendance"),
      },
      {
        icon: BookOpen,
        title: "View My Courses",
        desc: "Manage courses and enrolled students",
        accent: "border-l-emerald-500/90",
        onClick: () => router.push("/teacher/courses"),
      },
      {
        icon: BarChart3,
        title: "Attendance Reports",
        desc: "Analyze and export attendance",
        accent: "border-l-purple-500/90",
        onClick: () => router.push("/teacher/reports"),
      },
      {
        icon: UserCog,
        title: "Manage Students",
        desc: "Import and update student records",
        accent: "border-l-amber-500/90",
        onClick: () => router.push("/teacher/students"),
      },
    ];

    return (
      <div className="space-y-10 text-slate-900">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight flex items-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white text-xl shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
                T
              </span>
              <span>Teacher Dashboard</span>
            </h1>
            <p className="text-sm md:text-base text-slate-600 mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
              A focused overview of your courses, students, and attendance in one place.
            </p>
            {error && (
              <p className="mt-2 text-sm text-red-700 border border-red-300 bg-red-50 rounded-md px-3 py-2 inline-flex items-center gap-2 shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Top layout: Stats + Quick actions */}
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

        {/* Bottom layout: Workflow + Import */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Attendance Workflow */}
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.6)]">
                <Target size={18} />
              </div>
              <CardTitle className="text-base md:text-lg">Attendance Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-2 text-sm md:text-[15px] text-slate-700">
                <li>
                  Open <strong>Attendance</strong> and click <strong>Create Attendance Batch</strong>.
                </li>
                <li>
                  Select <strong>Department → Program → Academic Year → Semester → Course</strong>.
                </li>
                <li>
                  Share the generated <strong>Entry Code</strong> with students.
                </li>
                <li>Students submit photos using the entry code.</li>
                <li>Optionally upload classroom photos for face recognition.</li>
                <li>Review detected faces and approve submissions.</li>
                <li>Close the batch and generate attendance reports.</li>
              </ol>
            </CardContent>
          </Card>

          {/* Student Import Process */}
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.6)]">
                <Download size={18} />
              </div>
              <CardTitle className="text-base md:text-lg">Student Import Process</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-2 text-sm md:text-[15px] text-slate-700">
                <li>
                  Go to <strong>My Courses</strong> or <strong>Students</strong> in the navigation.
                </li>
                <li>
                  Download the <strong>sample CSV</strong> template provided.
                </li>
                <li>
                  Fill in the required student details (name, email, roll, etc.).
                </li>
                <li>
                  Upload the completed CSV and confirm the import preview.
                </li>
                <li>Verify that students appear in the course roster.</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

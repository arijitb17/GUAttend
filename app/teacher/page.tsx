"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function TeacherOverview() {
  const router = useRouter();
  const [stats, setStats] = useState({
    courses: 0,
    totalStudents: 0,
    totalSemesters: 0,
    totalAttendance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/teacher/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
  { title: "My Courses", value: stats.courses, icon: <BookOpen className="text-blue-400" size={28} /> },
  { title: "Total Students", value: stats.totalStudents, icon: <Users className="text-emerald-400" size={28} /> },
  { title: "Active Semesters", value: stats.totalSemesters, icon: <ClipboardList className="text-orange-400" size={28} /> },
  { title: "Total Attendance", value: stats.totalAttendance, icon: <CheckCircle2 className="text-purple-400" size={28} /> },
];


  const quickActions = [
    { icon: <PlusCircle size={20} className="text-blue-500" />, title: "Create Attendance Batch", desc: "Start a new attendance session", onClick: () => router.push("/teacher/attendance") },
    { icon: <BookOpen size={20} className="text-green-500" />, title: "View My Courses", desc: "Manage courses and students", onClick: () => router.push("/teacher/courses") },
    { icon: <BarChart3 size={20} className="text-purple-500" />, title: "Attendance Reports", desc: "View and export attendance stats", onClick: () => router.push("/teacher/reports") },
    { icon: <UserCog size={20} className="text-orange-500" />, title: "Manage Students", desc: "View and import students", onClick: () => router.push("/teacher/students") },
  ];

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Teacher Dashboard</h1>
        <p className="text-gray-400 mt-2">Welcome back! Manage your courses and track attendance efficiently.</p>
      </div>
{/* Stats Grid */}
<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
  {statCards.map((card) => (
    <div
      key={card.title}
      className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-2xl 
      p-4 sm:p-5 lg:p-6 hover:bg-[#1f1f1f]/90 hover:shadow-[0_0_25px_rgba(255,255,255,0.05)] 
      transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">
            {card.title}
          </p>

          <p className="text-lg sm:text-2xl lg:text-3xl font-semibold mt-1 text-white">
            {loading ? (
              <span className="animate-pulse bg-gray-700 h-5 sm:h-6 w-10 sm:w-14 rounded inline-block" />
            ) : (
              card.value
            )}
          </p>
        </div>

        <div className="bg-white/5 p-2 sm:p-3 rounded-xl border border-white/10 flex items-center justify-center">
          <div className="scale-90 sm:scale-100 text-transparent bg-clip-text 
            bg-gradient-to-br from-white to-current">
            {card.icon}
          </div>
        </div>
      </div>
    </div>
  ))}
</div>



     {/* ✅ Quick Actions - Updated UI */}
<div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_0_25px_rgba(255,255,255,0.05)]">
  <h2 className="text-xl font-semibold mb-5 text-white">Quick Actions</h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {quickActions.map((action) => (
      <button
        key={action.title}
        onClick={action.onClick}
        className="
          flex items-start gap-3 
          p-3 bg-white border border-white/10 rounded-xl
          hover:bg-gray-100 hover:shadow-md 
          transition-all duration-300 text-left
        "
      >
        {/* Icon Wrapper */}
        <div className="bg-gray-100 p-2.5 rounded-lg border border-white/10 flex items-center justify-center">
          {action.icon}
        </div>

        {/* Text */}
        <div>
          <p className="text-sm font-medium text-black leading-tight">{action.title}</p>
          <p className="text-xs text-gray-600 mt-0.5 leading-snug">{action.desc}</p>
        </div>
      </button>
    ))}
  </div>
</div>


      {/* Workflow Info */}
      <div className="bg-[#141414]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2 text-white">
          <Target className="text-blue-400" size={20} />
          Attendance Workflow
        </h2>
        <ol className="list-decimal pl-6 space-y-2 text-gray-300">
          <li>Navigate to <strong>Attendance</strong> and click <strong>Create Attendance Batch</strong>.</li>
          <li>Select <strong>Department → Program → Academic Year → Semester → Course</strong>.</li>
          <li>Share the generated <strong>Entry Code</strong> with students.</li>
          <li>Students submit photos using the entry code.</li>
          <li>Upload class photos for recognition (optional).</li>
          <li>Review & approve submissions.</li>
          <li>Close batch & generate reports.</li>
        </ol>
      </div>

      {/* Import Students */}
      <div className="bg-[#141414]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2 text-white">
          <Download className="text-green-400" size={20} />
          Student Import Process
        </h2>
        <ol className="list-decimal pl-6 space-y-2 text-gray-300">
          <li>Go to <strong>My Courses</strong> or <strong>Students</strong>.</li>
          <li>Download the sample CSV, fill student data.</li>
          <li>Upload CSV and confirm import.</li>
        </ol>
      </div>
    </div>
  );
}

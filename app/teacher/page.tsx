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
    { title: "My Courses", value: stats.courses, icon: <BookOpen size={28} />, color: "from-blue-500 to-blue-600" },
    { title: "Total Students", value: stats.totalStudents, icon: <Users size={28} />, color: "from-emerald-500 to-emerald-600" },
    { title: "Active Semesters", value: stats.totalSemesters, icon: <ClipboardList size={28} />, color: "from-orange-500 to-orange-600" },
    { title: "Total Attendance", value: stats.totalAttendance, icon: <CheckCircle2 size={28} />, color: "from-purple-500 to-purple-600" },
  ];

  const quickActions = [
    { icon: <PlusCircle size={24} className="text-blue-400" />, title: "Create Attendance Batch", desc: "Start a new attendance session", onClick: () => router.push("/teacher/attendance") },
    { icon: <BookOpen size={24} className="text-green-400" />, title: "View My Courses", desc: "Manage courses and students", onClick: () => router.push("/teacher/courses") },
    { icon: <BarChart3 size={24} className="text-purple-400" />, title: "Attendance Reports", desc: "View and export attendance stats", onClick: () => router.push("/teacher/reports") },
    { icon: <UserCog size={24} className="text-orange-400" />, title: "Manage Students", desc: "View and import students", onClick: () => router.push("/teacher/students") },
  ];

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Teacher Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Welcome back! Manage your courses and track attendance efficiently.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="relative p-6 rounded-2xl border border-white/10 bg-[#141414]/80 backdrop-blur-md 
                       shadow-[0_0_25px_rgba(255,255,255,0.05)] hover:shadow-[0_0_35px_rgba(255,255,255,0.08)] transition-all"
          >
            <div className={`absolute -top-5 right-4 bg-gradient-to-br ${card.color} p-3 rounded-xl text-white shadow-md`}>
              {card.icon}
            </div>
            <p className="text-sm font-medium text-gray-400 uppercase mt-2">{card.title}</p>
            {loading ? (
              <div className="mt-3">
                <div className="animate-pulse bg-gray-600 h-8 w-16 rounded"></div>
              </div>
            ) : (
              <p className="text-4xl font-bold mt-3 text-white">{card.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 
                      shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <h2 className="text-xl font-semibold mb-5 text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={action.onClick}
              className="flex items-start gap-3 p-4 bg-[#1a1a1a]/70 border border-white/10 rounded-xl 
                         hover:bg-[#232323] hover:shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all duration-300 text-left"
            >
              <div className="bg-white/5 p-3 rounded-lg border border-white/10">{action.icon}</div>
              <div>
                <p className="font-medium text-black">{action.title}</p>
                <p className="text-sm text-gray-600">{action.desc}</p>
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
          <li>Upload class photos for face recognition (optional).</li>
          <li>Review submissions and <strong>Approve/Reject</strong> attendance.</li>
          <li><strong>Close the batch</strong> to finalize records.</li>
          <li>Generate and export <strong>Reports</strong> to Excel.</li>
        </ol>
      </div>

      {/* Import Students Info */}
      <div className="bg-[#141414]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2 text-white">
          <Download className="text-green-400" size={20} />
          Student Import Process
        </h2>
        <ol className="list-decimal pl-6 space-y-2 text-gray-300">
          <li>Go to <strong>My Courses</strong> or <strong>Students</strong> page.</li>
          <li>Click on a course to open details.</li>
          <li>Click <strong>Import Students</strong>.</li>
          <li>Download the <strong>Sample CSV</strong> format.</li>
          <li>Prepare CSV with: <strong>name, email, dob</strong> (DOB = password).</li>
          <li>Select the appropriate <strong>Program</strong>.</li>
          <li>Upload CSV and click <strong>Import Students</strong>.</li>
          <li>Review success, existing, and failed imports.</li>
        </ol>
      </div>
    </div>
  );
}
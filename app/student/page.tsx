"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  ClipboardList, 
  User, 
  GraduationCap, 
  BarChart3, 
  Target, 
  CheckCircle2 
} from "lucide-react";

export default function StudentDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCourses: 0,
    attendancePercentage: 0,
    totalPresent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/student/stats", {
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
    { title: "My Courses", value: stats.totalCourses, icon: <GraduationCap className="text-blue-400" size={24} /> },
    { title: "Attendance %", value: `${stats.attendancePercentage}%`, icon: <BarChart3 className="text-purple-400" size={24} /> },
    { title: "Classes Attended", value: stats.totalPresent, icon: <CheckCircle2 className="text-green-400" size={24} /> },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 text-white">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Student Dashboard</h1>
        <p className="text-gray-400 mt-1 sm:mt-2">Welcome back! Manage your courses and attendance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-6 
            hover:bg-[#1f1f1f]/90 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">{card.title}</p>
                <p className="text-xl sm:text-3xl font-semibold mt-1 text-white">
                  {loading ? (
                    <span className="animate-pulse bg-gray-700 h-6 w-12 rounded inline-block" />
                  ) : (
                    card.value
                  )}
                </p>
              </div>
              <div className="bg-white/5 p-2 sm:p-3 rounded-lg border border-white/10">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-xl p-5 sm:p-6 shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">Quick Actions</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[
            {
              icon: <BookOpen size={20} className="text-green-400" />,
              title: "My Courses",
              desc: "View enrolled courses",
              onClick: () => router.push("/student/courses"),
            },
            {
              icon: <ClipboardList size={20} className="text-purple-400" />,
              title: "Attendance History",
              desc: "Check your past attendance",
              onClick: () => router.push("/student/history"),
            },
            {
              icon: <User size={20} className="text-orange-400" />,
              title: "My Profile",
              desc: "View and update your details",
              onClick: () => router.push("/student/profile"),
            },
          ].map((action) => (
            <button
              key={action.title}
              onClick={action.onClick}
              className="flex items-start gap-3 p-3 sm:p-4 bg-white border border-white/10 rounded-xl 
              hover:bg-gray-100 hover:shadow-md transition-all duration-300 text-left"
            >
              <div className="bg-gray-100 p-2.5 rounded-lg flex items-center justify-center">
                {action.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-black">{action.title}</p>
                <p className="text-xs sm:text-sm text-gray-600">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Attendance Instructions */}
      <div className="bg-[#141414]/80 border border-white/10 rounded-xl p-5 sm:p-6 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 flex items-center gap-2 text-white">
          <Target className="text-blue-400" size={18} />
          How to Submit Attendance
        </h2>
        <ol className="list-decimal pl-5 space-y-2 text-gray-300 text-sm sm:text-base">
          <li>Get the <strong>Entry Code</strong> from your teacher.</li>
          <li>Go to <strong>My Courses</strong> and select the course.</li>
          <li>Click on the active attendance batch.</li>
          <li>Enter the <strong>Entry Code</strong>.</li>
          <li>Upload a clear face photo or selfie.</li>
          <li>Submit and wait for approval.</li>
          <li>Track updates in <strong>Attendance History</strong>.</li>
        </ol>
      </div>
    </div>
  );
}

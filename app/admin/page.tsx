"use client";

import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  UserCheck,
  Target,
  Settings,
} from "lucide-react";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    teachers: 0,
    students: 0,
    departments: 0,
    programs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { title: "Teachers", value: stats.teachers, icon: <Users className="text-blue-400" size={28} /> },
    { title: "Students", value: stats.students, icon: <GraduationCap className="text-emerald-400" size={28} /> },
    { title: "Departments", value: stats.departments, icon: <Building2 className="text-purple-400" size={28} /> },
    { title: "Programs", value: stats.programs, icon: <BookOpen className="text-orange-400" size={28} /> },
  ];

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-400 mt-2">Here's a quick look at your institution's insights.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 
                       hover:bg-[#1f1f1f]/90 hover:shadow-[0_0_25px_rgba(255,255,255,0.05)] transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide">{card.title}</p>
                <p className="text-3xl font-semibold mt-2 text-white">
                  {loading ? (
                    <span className="animate-pulse bg-gray-700 h-7 w-16 rounded inline-block" />
                  ) : (
                    card.value
                  )}
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
<div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 
                shadow-[0_0_25px_rgba(255,255,255,0.05)]">
  <h2 className="text-xl font-semibold mb-5 text-white">Quick Actions</h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {[
      {
        title: "Approve Teachers",
        desc: "Review and approve teacher accounts",
        icon: <Users size={20} className="text-green-400" />,
        onClick: () => (window.location.href = "/admin/teachers"),
      },
      {
        title: "Departments",
        desc: "Add or manage departments",
        icon: <Building2 size={20} className="text-blue-400" />,
        onClick: () => (window.location.href = "/admin/departments"),
      },
      {
        title: "Courses",
        desc: "Create or update course info",
        icon: <BookOpen size={20} className="text-purple-400" />,
        onClick: () => (window.location.href = "/admin/courses"),
      },
      {
        title: "Programs",
        desc: "Manage academic programs",
        icon: <GraduationCap size={20} className="text-pink-400" />,
        onClick: () => (window.location.href = "/admin/programs"),
      },
    ].map((action) => (
      <button
        key={action.title}
        onClick={action.onClick}
        className="flex items-start gap-3 p-3 bg-[#1a1a1a]/70 border border-white/10 rounded-xl 
                   hover:bg-[#232323] hover:shadow-[0_0_20px_rgba(255,255,255,0.08)] 
                   transition-all duration-300 text-left"
      >
        <div className="bg-white/5 p-2.5 rounded-lg border border-white/10 flex items-center justify-center">
          {action.icon}
        </div>
        <div>
          <p className="text-sm font-medium text-black leading-tight">{action.title}</p>
          <p className="text-xs text-gray-600 mt-0.5 leading-snug">{action.desc}</p>
        </div>
      </button>
    ))}
  </div>
</div>



      {/* System Setup Guide */}
      <div className="bg-[#141414]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2 text-white">
          <Settings className="text-blue-400" size={20} />
          System Setup Guide
        </h2>
        <ol className="list-decimal pl-6 space-y-2 text-gray-300">
          <li>Create <strong>Departments</strong> (e.g., Computer Science, Mathematics).</li>
          <li>Add <strong>Programs</strong> under each department (e.g., B.Tech CS, M.Tech CS).</li>
          <li>Create <strong>Academic Years</strong> for each program (e.g., 2024-2025).</li>
          <li>Add <strong>Semesters</strong> under academic years (e.g., Semester 1, Semester 2).</li>
          <li>Register <strong>Teachers</strong> and assign them to departments.</li>
          <li>Teachers can create <strong>Courses</strong> under semesters.</li>
          <li>Import or add <strong>Students</strong> to programs and courses.</li>
          <li>Monitor attendance and generate system-wide <strong>Reports</strong>.</li>
        </ol>
      </div>

      {/* Data Management Info */}
      <div className="bg-[#141414]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2 text-white">
          <Target className="text-green-400" size={20} />
          Data Management Best Practices
        </h2>
        <ol className="list-decimal pl-6 space-y-2 text-gray-300">
          <li>Regularly backup student and attendance data.</li>
          <li>Update student status (active/graduated) at the end of academic years.</li>
          <li>Archive old academic year data before starting new sessions.</li>
          <li>Review and verify teacher assignments to departments.</li>
          <li>Monitor storage usage for face embeddings and attendance photos.</li>
          <li>Generate periodic reports for institutional analytics.</li>
          <li>Maintain consistent naming conventions for programs and courses.</li>
          <li>Audit user access and permissions quarterly.</li>
        </ol>
      </div>
    </div>
  );
}
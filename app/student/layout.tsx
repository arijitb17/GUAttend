"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  User,
  LogOut,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string>("Student");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    fetch("/api/student/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) router.push("/login");
        else {
          setStudentName(data.name || "Student");
          setRole("STUDENT");
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (role !== "STUDENT") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const navItems = [
    { href: "/student", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/student/courses", label: "My Courses", icon: <BookOpen size={18} /> },
    { href: "/student/history", label: "Attendance History", icon: <ClipboardList size={18} /> },
    { href: "/student/profile", label: "Profile", icon: <User size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#0e0e0e] text-white font-[Poppins]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#141414]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap size={20} />
            <span>Student</span>
          </h2>
          <p className="text-xs text-gray-400">{studentName}</p>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40
          w-64 h-screen
          bg-[#141414]/90 backdrop-blur-md border-r border-white/10 
          shadow-[0_0_25px_rgba(255,255,255,0.05)] 
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 text-center mt-14 lg:mt-0">
          <h2 className="text-lg font-semibold tracking-wide flex items-center justify-center gap-2">
            <GraduationCap className="text-white/80" size={20} />
            <span>Student Portal</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">Welcome, {studentName}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                  isActive
                    ? "bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className={`transition-transform duration-200 ${
                    isActive ? "scale-110 text-black" : "group-hover:scale-110 text-white/70"
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* FIXED Logout Button */}
<div className="p-4 border-t border-white/10 sticky bottom-0 bg-[#141414]/90 backdrop-blur-md">
  <button
    onClick={() => {
      localStorage.removeItem("token");
      router.push("/login");
    }}
    className="w-full px-4 py-2 text-sm text-red-400 border border-red-500/30 rounded-lg 
             hover:bg-red-500/20 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
  >
    <LogOut size={16} className="text-red-400" /> Logout
  </button>
</div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#0e0e0e] mt-14 lg:mt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="bg-[#1a1a1a]/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.05)] p-4 sm:p-6 lg:p-8 transition-all duration-300">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
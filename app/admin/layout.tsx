"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  BookMarked,
  LogOut,
} from "lucide-react"; // modern icons

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      if (decoded.role !== "ADMIN") {
        router.push("/login");
      } else {
        setRole("ADMIN");
      }
    } catch {
      router.push("/login");
    }
  }, [router]);

  if (role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "Overview", icon: <LayoutDashboard size={18} /> },
    { href: "/admin/teachers", label: "Teachers", icon: <Users size={18} /> },
    { href: "/admin/departments", label: "Departments", icon: <Building2 size={18} /> },
    { href: "/admin/programs", label: "Programs", icon: <BookMarked size={18} /> },
    { href: "/admin/courses", label: "Courses", icon: <BookOpen size={18} /> },
    { href: "/admin/students", label: "Students", icon: <GraduationCap size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#0e0e0e] text-white font-[Poppins]">
  {/* Sidebar */}
  <aside className="w-64 h-screen sticky top-0 bg-[#141414]/90 backdrop-blur-md border-r border-white/10 shadow-[0_0_25px_rgba(255,255,255,0.05)] flex flex-col">
    <div className="p-6 border-b border-white/10 text-center">
      <h2 className="text-lg font-semibold tracking-wide flex items-center justify-center gap-2">
        <LayoutDashboard className="text-white/80" size={20} />
        <span>Admin Dashboard</span>
      </h2>
    </div>

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

    <div className="p-4 border-t border-white/10 mt-auto">
      <button
        onClick={() => {
          localStorage.removeItem("token");
          router.push("/login");
        }}
        className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
      >
        <LogOut size={16} /> Logout
      </button>
    </div>
  </aside>

  {/* Main Content */}
  <main className="flex-1 overflow-y-auto bg-[#0e0e0e]">
    <div className="p-8">
      <div className="bg-[#1a1a1a]/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.05)] p-8 transition-all duration-300">
        {children}
      </div>
    </div>
  </main>
</div>

  );
}

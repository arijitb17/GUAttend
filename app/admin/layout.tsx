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
  Menu,
  X,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string>("Admin");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      if (decoded.role !== "ADMIN") {
        router.push("/login");
      } else {
        setRole("ADMIN");
        if (decoded.name) setAdminName(decoded.name);
      }
    } catch {
      router.push("/login");
    }
  }, [router]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
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
    <div className="flex min-h-screen bg-gray-50 text-slate-900 font-[Poppins]">
      {/* Mobile / Tablet Header */}
      <div
        className="
          lg:hidden fixed top-0 left-0 right-0 z-50
          bg-[var(--text-black)] text-[var(--text-white)]
          border-b border-[var(--card-border)]
          px-4 py-3 flex items-center justify-between
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              h-8 w-8 rounded-xl
              bg-[var(--text-white)] text-[var(--text-black)]
              flex items-center justify-center
              shadow-[0_6px_18px_rgba(0,0,0,0.55)]
            "
          >
            <LayoutDashboard size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wide">
              Admin Portal
            </span>
            <span className="text-[11px] text-[var(--secondary)] truncate">
              {adminName}
            </span>
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-[rgba(255,255,255,0.08)] rounded-lg transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40
          h-screen w-64
          bg-[var(--text-black)] text-[var(--text-white)]
          border-r border-[var(--card-border)]
          shadow-[0_12px_40px_rgba(0,0,0,0.6)]
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Spacer for mobile header */}
        <div className="h-14 lg:h-0" />

        {/* Header / Brand – ONLY on lg+ */}
        <div className="px-5 pt-4 pb-5 border-b border-[var(--card-border)] hidden lg:block">
          <div className="flex items-center gap-3">
            <div
              className="
                h-9 w-9 rounded-xl
                bg-[var(--text-white)] text-[var(--text-black)]
                flex items-center justify-center text-lg font-semibold
                shadow-[0_6px_20px_rgba(0,0,0,0.6)]
              "
            >
              <LayoutDashboard size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide text-[var(--text-white)]">
                Admin Portal
              </span>
              <span className="text-[11px] text-[var(--secondary)] truncate">
                {adminName}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="
            flex-1 px-3 pb-3 space-y-1 overflow-y-auto
            pt-4 lg:pt-4
            mt-6 lg:mt-0
          "
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-sm transition-all duration-200
                  ${
                    isActive
                      ? "bg-[var(--text-white)] text-[var(--text-black)] shadow-[0_8px_18px_rgba(0,0,0,0.55)]"
                      : "text-[var(--text-white)] hover:bg-[rgba(255,255,255,0.08)]"
                  }
                `}
              >
                {/* Left active indicator bar */}
                <span
                  className={`
                    absolute left-0 top-1/2 -translate-y-1/2 h-7 w-0.5 rounded-full
                    ${
                      isActive
                        ? "bg-[var(--text-black)]"
                        : "bg-transparent group-hover:bg-[rgba(255,255,255,0.4)]"
                    }
                  `}
                />

                {/* Icon */}
                <span
                  className={`
                    flex h-8 w-8 items-center justify-center rounded-lg
                    text-[var(--secondary)]
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-[var(--text-black)] text-[var(--text-white)] scale-105"
                        : "bg-[rgba(255,255,255,0.06)] group-hover:scale-105"
                    }
                  `}
                >
                  {item.icon}
                </span>

                {/* Label */}
                <span
                  className={`
                    font-medium tracking-tight
                    ${
                      isActive
                        ? "text-[var(--text-black)]"
                        : "text-[var(--text-white)]"
                    }
                  `}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 pb-4 pt-3 border-t border-[var(--card-border)]">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/login");
            }}
            className="
              w-full flex items-center justify-center gap-2
              px-4 py-2.5 text-sm font-medium
              bg-red-600 text-[var(--text-white)]
              rounded-lg transition-all duration-300
              hover:bg-red-700 hover:shadow-[0_8px_20px_rgba(239,68,68,0.55)]
            "
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 mt-14 lg:mt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 lg:p-8 shadow-[0_8px_30px_rgba(2,6,23,0.06)] transition-all duration-300 space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

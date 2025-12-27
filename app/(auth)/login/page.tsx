"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Login failed");
      localStorage.setItem("token", data.token ?? "");

      if (data.role === "ADMIN") router.push("/admin");
      else if (data.role === "TEACHER") router.push("/teacher");
      else if (data.role === "STUDENT") router.push("/student");
      else router.push("/");
    } catch (err: any) {
      alert(err.message || "Login error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left image section – narrower on tablet/desktop */}
      <div className="relative w-full h-56 sm:h-64 md:h-auto md:w-5/12 lg:w-1/2 overflow-hidden">
        <Image
          src="/bg.jpg"
          alt="Campus"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-black/40 to-black/10" />
      </div>

      {/* Right login panel – wider on tablet/desktop */}
      <div className="flex-1 flex items-center justify-center md:w-7/12 lg:w-1/2 px-3 sm:px-5 md:px-8 py-8 md:py-10">
        <div className="w-full flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="University Logo"
            width={90}
            height={90}
            className="mb-4"
          />

          {/* Department name – ALWAYS one line */}
          <h3
            className="
              font-semibold text-black leading-tight tracking-tight
              whitespace-nowrap
              text-[3.4vw]      /* very small screens */
              sm:text-xl       /* phones ≥640px */
              lg:text-3xl       /* large screens */
            "
          >
            Department of Information Technology
          </h3>

          {/* Subtitle – ALWAYS one line */}
          <p
            className="
              mt-1 text-black opacity-80 leading-snug tracking-tight
              whitespace-nowrap
              text-[2.9vw]      /* very small screens */
              sm:text-sm
              lg:text-lg
            "
          >
            GUAttend — Gauhati University&apos;s Smart Attendance System
          </p>

          {/* Login form – width limited, text area not */}
          <form
            onSubmit={handleLogin}
            className="mt-6 w-full max-w-md bg-white rounded-xl p-6 shadow-md border border-gray-200"
          >
            <div className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black/70 focus:border-black outline-none text-sm"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 pr-11 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black/70 focus:border-black outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="custom-btn w-full mt-2 py-3 rounded-lg font-semibold bg-black text-white hover:bg-blue-500 transition disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </div>
          </form>

          <p className="text-sm text-gray-600 mt-5">
            New to the Department?{" "}
            <span
              className="text-blue-600 underline cursor-pointer"
              onClick={() => router.push("/register-teacher")}
            >
              Register here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

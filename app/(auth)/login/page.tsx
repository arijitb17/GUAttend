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
    <div className="min-h-screen flex">
      {/* Left side image */}
      <div className="hidden lg:flex lg:w-7/12 xl:w-3/5 relative">
        <Image
          src="/bg-left.png"
          alt="Campus"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right panel */}
      <div className="flex-1 lg:w-5/12 xl:w-2/5 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8 py-12 flex flex-col items-center">

          {/* Logo + Titles */}
          <Image
            src="/logo.png"
            alt="University Logo"
            width={92}
            height={92}
            className="mb-4"
          />

          {/* One-line department name */}
          <h3 className="text-2xl font-semibold text-black whitespace-nowrap">
            Department of Information Technology
          </h3>

          {/* One-line GUAttend text */}
          <h1 className="mt-1 text-base font-medium text-black opacity-80 whitespace-nowrap">
            GUAttend — Gauhati University's first Smart Attendance System
          </h1>

          {/* Login Card */}
          <form
            onSubmit={handleLogin}
            className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200 w-full"
          >
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-600 whitespace-nowrap">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-0 focus:border-black placeholder-gray-400"
              />

              <label className="block text-sm font-medium text-gray-600 whitespace-nowrap">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-0 focus:border-black placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="custom-btn w-full mt-2 py-3 rounded-lg font-semibold bg-black text-white hover:bg-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </div>
          </form>

          {/* One-line welcome message */}
          <p className="text-sm text-gray-600 mt-5 whitespace-nowrap text-center">
            Welcome to the Department! Please{" "}
            <span
              onClick={() => router.push("/register-teacher")}
              className="text-blue-600 underline cursor-pointer"
            >
              Register
            </span>{" "}
            to Get Started.
          </p>
        </div>
      </div>

      {/* Mobile image */}
      <div className="lg:hidden w-full h-56 relative">
        <Image src="/bg-left.png" alt="Campus" fill className="object-cover" />
      </div>
    </div>
  );
}

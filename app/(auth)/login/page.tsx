"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      if (data.role === "ADMIN") router.push("/admin");
      else if (data.role === "TEACHER") router.push("/teacher");
      else if (data.role === "STUDENT") router.push("/student");
    } else {
      alert(data.error);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0e0e0e] text-white font-[Poppins]">
      {/* --- University Logo --- */}
      <div className="flex flex-col items-center mb-8 text-center">
        <Image
          src="/logo.png"
          alt="Gauhati University Logo"
          width={100}
          height={100}
          className="mb-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
        />
        <h1 className="text-2xl font-bold tracking-wide">Gauhati University</h1>
        <p className="text-gray-400 text-sm">
          GUAttend — Gauhati University’s Smart Attendance System
        </p>
      </div>

      {/* --- Login Card --- */}
      <div className="relative w-96 p-8 rounded-2xl bg-[#1a1a1a]/70 backdrop-blur-lg border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
        <h2 className="text-2xl font-semibold text-center mb-6 tracking-wide">
          Sign in to Continue
        </h2>

        <div className="space-y-4">
          {/* Email Input */}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 bg-transparent border border-white/20 rounded-lg focus:outline-none focus:border-white/50 placeholder-gray-400 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password Input with Eye Icon */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 pr-10 bg-transparent border border-white/20 rounded-lg focus:outline-none focus:border-white/50 placeholder-gray-400 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer select-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-white text-black font-semibold p-3 rounded-lg hover:bg-gray-200 transition-all duration-200 cursor-pointer"
          >
            Login
          </button>
        </div>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Don’t have an account?{" "}
          <span
            onClick={() => router.push("/register-teacher")}
            className="text-white hover:underline cursor-pointer"
          >
            Register
          </span>
        </p>

        <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />
      </div>

      {/* --- Footer --- */}
      <p className="text-gray-500 text-xs mt-8">
        © {new Date().getFullYear()} Gauhati University • All Rights Reserved
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function TeacherRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleRegister() {
    const res = await fetch("/api/auth/register-teacher", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(data.message);
      setName("");
      setEmail("");
      setPassword("");
    } else {
      setMessage(data.error);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0e0e0e] text-white font-[Poppins]">
      {/* --- University Logo & Header --- */}
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
          GUAttend — Smart Attendance System for Faculty
        </p>
      </div>

      {/* --- Registration Card --- */}
      <div className="relative w-96 p-8 rounded-2xl bg-[#1a1a1a]/70 backdrop-blur-lg border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
        <h2 className="text-2xl font-semibold text-center mb-6 tracking-wide">
          Teacher Registration
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 bg-transparent border border-white/20 rounded-lg focus:outline-none focus:border-white/50 placeholder-gray-400 transition"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 bg-transparent border border-white/20 rounded-lg focus:outline-none focus:border-white/50 placeholder-gray-400 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-transparent border border-white/20 rounded-lg focus:outline-none focus:border-white/50 placeholder-gray-400 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleRegister}
            className="w-full bg-white text-black font-semibold p-3 rounded-lg hover:bg-gray-200 transition-all duration-200 cursor-pointer"
          >
            Register
          </button>

          {message && (
            <p className="text-center text-gray-300 mt-4 text-sm">{message}</p>
          )}
        </div>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-white hover:underline cursor-pointer"
          >
            Login
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

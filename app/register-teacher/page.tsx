"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function TeacherRegister() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/register-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Registration failed");
      setMessage(data.message || "Registered successfully. Please login.");
      // clear fields on success
      setName("");
      setEmail("");
      setPassword("");
      // optionally redirect to login after short delay
      setTimeout(() => router.push("/login"), 900);
    } catch (err: any) {
      setMessage(err.message || "Registration error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left image (large) */}
      <div className="hidden lg:flex lg:w-7/12 xl:w-3/5 relative">
        <Image src="/bg-left.png" alt="Campus" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/0" />
      </div>

      {/* Right panel */}
      <div className="flex-1 lg:w-5/12 xl:w-2/5 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8 py-12">
          {/* Logo & header */}
          <div className="flex flex-col items-center mb-6 text-center">
            <Image src="/logo.png" alt="University Logo" width={92} height={92} className="mb-4" />

            {/* Department (bigger, one line) */}
            <h3 className="text-2xl font-semibold text-black leading-tight whitespace-nowrap">
              Department of Information Technology
            </h3>

            {/* GUAttend subtitle (smaller, one line) */}
            <h1 className="mt-1 text-base font-medium text-black opacity-80 whitespace-nowrap">
              GUAttend — Gauhati University's Smart Attendance System
            </h1>
          </div>

          {/* Card */}
          <form
            onSubmit={handleRegister}
            className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-600">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-0 focus:border-black placeholder-gray-400"
              />

              <label className="block text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-0 focus:border-black placeholder-gray-400"
              />

              <label className="block text-sm font-medium text-gray-600">Password</label>
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
  type="submit"
  disabled={loading}
  className="custom-btn w-full mt-2 py-3 rounded-lg font-semibold bg-black text-white hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loading ? "Registering..." : "Register"}
</button>


              {message && (
                <p
                  className={`text-center mt-2 text-sm ${
                    message.toLowerCase().includes("error") || message.toLowerCase().includes("failed")
                      ? "text-red-500"
                      : "text-gray-700"
                  }`}
                >
                  {message}
                </p>
              )}
            </div>
          </form>

          <p className="text-center text-sm text-gray-600 mt-5">
            Already a Faculty Member?{" "}
            <span onClick={() => router.push("/login")} className="text-blue-600 underline cursor-pointer">
              Login
            </span>
           {" "}Here
          </p>
        </div>
      </div>

      {/* Mobile: show image above the card */}
      <div className="lg:hidden w-full h-56 relative">
        <Image src="/bg-left.png" alt="Campus" fill className="object-cover" />
      </div>
    </div>
  );
}

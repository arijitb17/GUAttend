"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { useToast } from "@/lib/useToast";
import { ToastContainer } from "@/components/Toast";

export default function TeacherRegister() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { toasts, toast, removeToast } = useToast();

  async function handleRegister(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/auth/register-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error("Registration Failed", data?.error || "Unable to register. Please try again.");
        throw new Error(data?.error || "Registration failed");
      }
      
      toast.success(
        "Registration Successful!", 
        data.message || "Account created successfully. Redirecting to login..."
      );
      
      setName("");
      setEmail("");
      setPassword("");
      
      setTimeout(() => router.push("/login"), 1500);
      
    } catch (err: any) {
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .ai-badge {
          background: linear-gradient(
            90deg,
            rgba(59, 130, 246, 0.1) 0%,
            rgba(147, 51, 234, 0.15) 50%,
            rgba(59, 130, 246, 0.1) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }

        .ai-icon {
          filter: drop-shadow(0 0 8px rgba(147, 51, 234, 0.3));
        }
      `}</style>

      <div className="h-screen flex flex-col md:flex-row bg-white/90">
        <ToastContainer toasts={toasts} onClose={removeToast} />
        
        {/* Image section */}
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

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center md:w-7/12 lg:w-1/2 px-3 sm:px-6 md:px-8 py-8 md:py-10">
          <div className="w-full flex flex-col items-center text-center">
            {/* Facidence Logo with AI badge */}
            <div className="relative mb-4">
              <Image
                src="/facidence.png"
                alt="Facidence Logo"
                width={110}
                height={110}
                className="mb-2"
              />
              
              {/* AI-Powered Badge */}
              <div className="ai-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <Sparkles size={14} className="text-purple-600 ai-icon" />
                <span className="text-xs font-semibold text-purple-700">AI-Powered</span>
              </div>
            </div>

            {/* Department */}
            <h3 className="font-semibold text-black leading-tight tracking-tight whitespace-nowrap text-[3.4vw] sm:text-xl lg:text-3xl">
              Department of Information Technology
            </h3>

            {/* GUAttend subtitle with AI mention */}
            <h1 className="mt-1 font-medium text-black opacity-80 leading-snug tracking-tight whitespace-nowrap text-[2.9vw] sm:text-sm lg:text-lg">
              GUAttend – AI-Powered Smart Attendance System
            </h1>

            {/* Registration form */}
            <form
              onSubmit={handleRegister}
              className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200 w-full max-w-md text-left"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black/70 focus:border-black placeholder-gray-400 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black/70 focus:border-black placeholder-gray-400 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black/70 focus:border-black placeholder-gray-400 outline-none text-sm"
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
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="custom-btn w-full mt-2 py-3 rounded-lg font-semibold bg-black text-white hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Registering..." : "Register"}
                </button>
              </div>
            </form>

            <p className="text-center text-sm text-gray-600 mt-5">
              Already a Faculty Member?{" "}
              <span
                onClick={() => router.push("/login")}
                className="text-blue-600 underline cursor-pointer"
              >
                Login Here
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
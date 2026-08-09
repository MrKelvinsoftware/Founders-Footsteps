"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setIsLoading(true);
    try { await login(formData.email, formData.password); router.push("/"); } catch (err) { setError(err instanceof Error ? err.message : "Invalid email or password."); } finally { setIsLoading(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-white">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8"><ArrowLeft className="w-5 h-5" /> Back to Home</Link>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign In</h2>
        <p className="text-slate-600 mb-8">Welcome back! Please enter your details.</p>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div><label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your email" required /></div></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-2">Password</label><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your password" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div></div>
          <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 text-lg disabled:opacity-50">{isLoading ? "Signing in..." : "Sign In"}</button>
        </form>
        <p className="mt-8 text-center text-slate-600">Don&apos;t have an account? <Link href="/auth/signup" className="text-blue-600 font-semibold hover:text-blue-700">Sign up</Link></p>
      </div>
    </div>
  );
}

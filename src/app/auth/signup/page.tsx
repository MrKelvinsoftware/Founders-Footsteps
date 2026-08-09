"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft } from "lucide-react";
export default function SignUpPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "", agreeTerms: false });
  const [error, setError] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match"); return; }
    if (!formData.agreeTerms) { setError("You must agree to the terms"); return; }
    setIsLoading(true);
    try { await register({ firstName: formData.firstName, lastName: formData.lastName, email: formData.email, password: formData.password, phone: formData.phone }); router.push("/"); router.refresh(); } catch (err) { setError(err instanceof Error ? err.message : "Failed to create account."); } finally { setIsLoading(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-white overflow-y-auto">
      <div className="w-full max-w-md py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8"><ArrowLeft className="w-5 h-5" /> Back to Home</Link>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
        <p className="text-slate-600 mb-8">Start your journey with us today.</p>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200" placeholder="First Name" required /></div></div>
            <div><div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200" placeholder="Last Name" required /></div></div>
          </div>
          <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200" placeholder="Email" required /></div>
          <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200" placeholder="Phone" required /></div>
          <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200" placeholder="Password" required minLength={8} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>
          <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200" placeholder="Confirm Password" required /></div>
          <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" checked={formData.agreeTerms} onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-purple-600 mt-1" /><span className="text-sm text-slate-600">I agree to the <Link href="/terms" className="text-purple-600 font-medium">Terms</Link> and <Link href="/privacy" className="text-purple-600 font-medium">Privacy Policy</Link></span></label>
          <button type="submit" disabled={isLoading} className="btn-accent w-full py-4 text-lg disabled:opacity-50">{isLoading ? "Creating account..." : "Create Account"}</button>
        </form>
        <p className="mt-8 text-center text-slate-600">Already have an account? <Link href="/auth/signin" className="text-purple-600 font-semibold">Sign in</Link></p>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
export default async function CatchAll({ params }: { params: Promise<{ catchAll: string[] }> }) {
  const { catchAll } = await params;
  const path = "/" + catchAll.join("/");
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-10">
      <h1 className="font-display text-6xl mb-4">404</h1>
      <p className="text-slate-400 mb-2">The page at <code className="bg-white/5 px-2 py-0.5 rounded">{path}</code> doesn&apos;t exist yet.</p>
      <Link href="/" className="mt-6 px-5 py-3 rounded-lg bg-white text-slate-900 font-semibold inline-flex items-center gap-2 hover:bg-blue-50"><Home className="w-4 h-4" /> Back to home <ArrowRight className="w-4 h-4" /></Link>
    </div>
  );
}

import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 mb-6 shadow-inner">
          <FileQuestion className="w-10 h-10 text-white" />
        </div>

        <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-500 mb-2">
          404 Error
        </span>

        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">
          Page Not Found
        </h1>

        <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mb-8 leading-relaxed">
          The career document or link you are looking for doesn’t exist or has been relocated.
        </p>

        <Link
          href="/"
          className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Studio</span>
        </Link>
      </div>
    </div>
  );
}

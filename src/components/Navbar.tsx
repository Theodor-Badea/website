'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Terminal, BookOpen, ExternalLink, Flame, Code2 } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-cyber-bg/80 border-b border-cyber-border/60 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-cyber-card border border-cyber-border flex items-center justify-center text-brand-400 group-hover:border-brand-500 group-hover:shadow-glow-sm transition-all duration-300">
            <Terminal className="w-5 h-5 group-hover:text-brand-300 transition-colors" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-wider text-gray-100 flex items-center gap-1.5 font-mono">
              THEO <span className="text-brand-400 text-xs px-1.5 py-0.5 rounded bg-brand-900/50 border border-brand-700/50">SEC</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Cybersecurity Writeups</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 font-mono text-sm">
          <Link
            href="/"
            className={`px-3.5 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${
              isActive('/') && !pathname.startsWith('/writeups')
                ? 'bg-brand-900/40 text-brand-300 border border-brand-700/40 font-semibold shadow-glow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-cyber-card'
            }`}
          >
            <Shield className="w-4 h-4" />
            Home
          </Link>

          <Link
            href="/#writeups"
            className={`px-3.5 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${
              pathname.startsWith('/writeups')
                ? 'bg-brand-900/40 text-brand-300 border border-brand-700/40 font-semibold shadow-glow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-cyber-card'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Writeups
          </Link>
        </nav>

        {/* Right CTA Links */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Theodor-Badea/Final_Project-AWAS"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-cyber-card border border-transparent hover:border-cyber-border transition-all flex items-center gap-1 text-xs font-mono"
            title="AWAS project"
          >
            <Code2 className="w-4 h-4 text-brand-400" />
            <span className="hidden sm:inline">AWAS project</span>
          </a>

          <a
            href="https://github.com/digininja/DVWA"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-cyber-card border border-transparent hover:border-cyber-border transition-all flex items-center gap-1 text-xs font-mono"
            title="External Security Resources"
          >
            <Code2 className="w-4 h-4 text-brand-400" />
            <span className="hidden sm:inline">DVWA Repo</span>
          </a>

          <Link
            href="/#writeups"
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono rounded-md bg-gradient-to-r from-brand-700 to-brand-600 text-white font-medium hover:from-brand-600 hover:to-brand-500 shadow-glow-sm transition-all duration-300 active:scale-95"
          >
            <Flame className="w-3.5 h-3.5" />
            Browse Labs
          </Link>
        </div>

      </div>
    </header>
  );
}

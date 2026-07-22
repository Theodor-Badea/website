'use client';

import { useState } from 'react';
import { Writeup } from '@/lib/markdown';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import Link from 'next/link';
import { 
  ArrowLeft, Clock, ExternalLink, ShieldAlert, Cpu, Award, 
  Menu, X, BookOpen, List, ChevronRight, Layers 
} from 'lucide-react';

interface WriteupClientPageProps {
  writeup: Writeup;
  categoryWriteups: Writeup[];
}

export default function WriteupClientPage({ writeup, categoryWriteups }: WriteupClientPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getDifficultyBadge = (difficulty?: string | null) => {
    if (!difficulty) return null;
    const lower = difficulty.toLowerCase();
    
    if (lower === 'easy') {
      return (
        <span className="px-3 py-1 text-xs font-mono rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-semibold">
          Easy
        </span>
      );
    }
    if (lower === 'medium') {
      return (
        <span className="px-3 py-1 text-xs font-mono rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/60 font-semibold">
          Medium
        </span>
      );
    }
    if (lower === 'hard') {
      return (
        <span className="px-3 py-1 text-xs font-mono rounded-full bg-rose-950/80 text-rose-400 border border-rose-800/60 font-semibold">
          Hard
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-mono rounded-full bg-brand-950/80 text-brand-300 border border-brand-800/60 font-semibold">
        {difficulty}
      </span>
    );
  };

  const getCategoryIcon = (categorySlug: string) => {
    switch (categorySlug) {
      case 'try_hack_me':
        return <Cpu className="w-4 h-4 text-brand-400" />;
      case 'dvwa':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'security_summer_school':
        return <Award className="w-4 h-4 text-cyan-400" />;
      default:
        return <Layers className="w-4 h-4 text-brand-400" />;
    }
  };

  return (
    <div className="min-h-screen relative">
      
      {/* Floating Utilities Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-cyber-card border border-brand-500/50 text-brand-300 hover:text-white rounded-full shadow-glow-md hover:border-brand-500 transition-all font-mono text-xs font-bold active:scale-95 bg-opacity-95"
        >
          <Menu className="w-4 h-4" />
          Quick Navigation
        </button>
      </div>

      {/* Floating Slide-over Navigation Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          
          {/* Drawer content */}
          <div className="relative w-full max-w-sm bg-cyber-card border-l border-cyber-border h-full flex flex-col p-6 overflow-y-auto space-y-6 shadow-2xl z-10 text-gray-200">
            <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3">
              <span className="font-mono font-bold text-brand-300 tracking-wider">NAVIGATION DOCK</span>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded bg-cyber-bg hover:bg-cyber-border text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Table of Contents */}
            {writeup.toc && writeup.toc.length > 0 && (
              <div className="space-y-3 font-mono">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-400 flex items-center gap-2 border-b border-cyber-border/40 pb-1">
                  <List className="w-3.5 h-3.5" />
                  Outline
                </h4>
                <nav className="space-y-1.5 text-xs max-h-[45vh] overflow-y-auto pr-1">
                  {writeup.toc.map((item, idx) => (
                    <a
                      key={`${item.id}-${idx}`}
                      href={`#${item.id}`}
                      onClick={() => setIsSidebarOpen(false)}
                      style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}
                      className="group flex items-center gap-1.5 text-gray-400 hover:text-brand-300 py-1 transition-colors leading-normal"
                    >
                      <ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-brand-400 shrink-0" />
                      <span className="truncate">{item.text}</span>
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Sibling Writeups in the same category */}
            {categoryWriteups.length > 0 && (
              <div className="space-y-3 font-mono pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-400 flex items-center gap-2 border-b border-cyber-border/40 pb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  More in {writeup.category}
                </h4>
                <div className="space-y-2 text-xs max-h-[35vh] overflow-y-auto pr-1">
                  {categoryWriteups.map((cw) => (
                    <Link
                      key={cw.slug}
                      href={`/writeups/${cw.slug}`}
                      onClick={() => setIsSidebarOpen(false)}
                      className="block p-2 rounded bg-cyber-bg hover:bg-brand-950/20 border border-cyber-border/50 hover:border-brand-500/50 transition-all"
                    >
                      <span className="text-gray-200 line-clamp-1 font-sans font-medium hover:text-brand-300">
                        {cw.title}
                      </span>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                        <span>{cw.readTime}</span>
                        {cw.difficulty && <span className="capitalize">{cw.difficulty}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Centered Reading View */}
      <div className="max-w-3xl mx-auto space-y-8 px-4 sm:px-6">
        
        {/* Navigation Breadcrumb */}
        <nav className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-gray-400 border-b border-cyber-border/40 pb-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-brand-300 flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-brand-300 font-semibold">{writeup.category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-gray-300 truncate max-w-[150px] sm:max-w-[200px]">{writeup.title}</span>
          </div>
        </nav>

        {/* Banner Header */}
        <header className="relative overflow-hidden rounded-2xl bg-cyber-card border border-cyber-border p-6 sm:p-8 shadow-xl">
          <div className="space-y-4 relative z-10">
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-lg bg-cyber-bg border border-cyber-border text-gray-300">
                  {getCategoryIcon(writeup.categorySlug)}
                  {writeup.category}
                </span>
                {getDifficultyBadge(writeup.difficulty)}
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-400" />
                  {writeup.readTime}
                </span>

                {writeup.url && (
                  <a
                    href={writeup.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-900/40 border border-brand-700/50 text-brand-300 hover:bg-brand-800/50 transition-colors"
                  >
                    Target Link
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {writeup.title}
            </h1>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              {writeup.excerpt}
            </p>

          </div>
        </header>

        {/* Markdown Centered Article */}
        <main className="bg-cyber-card border border-cyber-border rounded-2xl p-6 sm:p-8 shadow-lg">
          <MarkdownRenderer content={writeup.content} />
        </main>

      </div>
    </div>
  );
}

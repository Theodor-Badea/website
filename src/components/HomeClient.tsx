'use client';

import { useState, useMemo } from 'react';
import { Writeup } from '@/lib/markdown';
import WriteupCard from '@/components/WriteupCard';
import WriteupFilter from '@/components/WriteupFilter';
import { Terminal, ShieldCheck, Award, Zap, BookOpen, Layers, SearchX } from 'lucide-react';

interface CategoryInfo {
  name: string;
  slug: string;
  count: number;
}

interface HomeClientProps {
  initialWriteups: Writeup[];
  categories: CategoryInfo[];
}

export default function HomeClient({ initialWriteups, categories }: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const filteredWriteups = useMemo(() => {
    return initialWriteups.filter((w) => {
      // Category filter
      if (selectedCategory !== 'all' && w.categorySlug !== selectedCategory) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== 'all') {
        if (!w.difficulty || w.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = w.title.toLowerCase().includes(q);
        const excerptMatch = w.excerpt.toLowerCase().includes(q);
        const categoryMatch = w.category.toLowerCase().includes(q);
        const contentMatch = w.content.toLowerCase().includes(q);
        const diffMatch = w.difficulty?.toLowerCase().includes(q);

        return titleMatch || excerptMatch || categoryMatch || contentMatch || diffMatch;
      }

      return true;
    });
  }, [initialWriteups, selectedCategory, selectedDifficulty, searchQuery]);

  return (
    <div className="space-y-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyber-card via-cyber-card/80 to-brand-950/40 border border-cyber-border p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          
          {/* Avatar frame */}
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 via-purple-500 to-cyber-neon rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse" />
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-brand-400 bg-cyber-bg overflow-hidden flex items-center justify-center">
              <img
                src="/profile.jpg"
                alt="Theo Profile"
                className="object-cover w-full h-full"
                onError={(e) => {
                  // Fallback if profile.jpg isn't present
                  (e.target as HTMLElement).style.display = 'none';
                  const parent = (e.target as HTMLElement).parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'flex flex-col items-center justify-center text-brand-400 font-mono';
                    fallback.innerHTML = '<svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 14l9-5-9-5-9 5 9 5z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg><span class="text-xs mt-1">THEO</span>';
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
          </div>

          {/* Bio text */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/40 border border-brand-700/50 text-brand-300 font-mono text-xs">
              <Zap className="w-3.5 h-3.5 text-brand-400" />
              <span>Ethical Hacking & Web Security</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Hi, I'm <span className="bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-purple-400">Theo</span>
            </h1>

            <p className="text-lg text-gray-300 max-w-2xl leading-relaxed font-sans">
              Cybersecurity enthusiast & security researcher. I build applications, analyze web vulnerabilities, break security controls, and document writeups for CTFs and security labs.
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg font-mono">
              <div className="p-3 rounded-xl bg-cyber-bg/80 border border-cyber-border text-center">
                <span className="block text-2xl font-bold text-brand-300">{initialWriteups.length}</span>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider">Writeups</span>
              </div>
              <div className="p-3 rounded-xl bg-cyber-bg/80 border border-cyber-border text-center">
                <span className="block text-2xl font-bold text-purple-400">{categories.length}</span>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider">Categories</span>
              </div>
              <div className="p-3 rounded-xl bg-cyber-bg/80 border border-cyber-border text-center">
                <span className="block text-2xl font-bold text-emerald-400">100%</span>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider">Hands-On</span>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* Certifications Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-400" />
          Certifications & Focus Areas
        </h2>
        <div className="flex flex-wrap gap-3">
          <div className="px-4 py-2.5 bg-cyber-card border border-brand-500/30 rounded-xl text-gray-200 font-mono text-xs flex items-center gap-2 shadow-glow-sm hover:border-brand-500 transition-colors">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-brand-300">Azure 900</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">Microsoft Certified</span>
          </div>

          <div className="px-4 py-2.5 bg-cyber-card border border-brand-500/30 rounded-xl text-gray-200 font-mono text-xs flex items-center gap-2 shadow-glow-sm hover:border-brand-500 transition-colors">
            <Layers className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-brand-300">Web Security</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">Security Summer School</span>
          </div>

          <div className="px-4 py-2.5 bg-cyber-card border border-brand-500/30 rounded-xl text-gray-200 font-mono text-xs flex items-center gap-2 shadow-glow-sm hover:border-brand-500 transition-colors">
            <Terminal className="w-4 h-4 text-brand-400" />
            <span className="font-semibold text-brand-300">Penetration Testing</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">TryHackMe Labs</span>
          </div>
        </div>
      </section>

      {/* Main Writeup Hub Section */}
      <section className="space-y-8">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cyber-border/60 pb-4">
          <div>
            <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-brand-400" />
              Writeup Library
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Search and filter through all documented cybersecurity labs, CTFs, and vulnerability walk-throughs.
            </p>
          </div>

          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-cyber-card border border-cyber-border text-brand-300">
            Showing {filteredWriteups.length} of {initialWriteups.length}
          </span>
        </div>

        {/* Filter component */}
        <WriteupFilter
          categories={categories}
          totalCount={initialWriteups.length}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
        />

        {/* Writeups Grid */}
        {filteredWriteups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWriteups.map((w) => (
              <WriteupCard key={w.slug} writeup={w} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-cyber-card/40 border border-cyber-border rounded-2xl space-y-4">
            <SearchX className="w-12 h-12 text-gray-500 mx-auto" />
            <h3 className="text-xl font-bold text-gray-200">No writeups found</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              No writeup matched your search query or filters. Try searching for a different keyword or resetting your filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-mono rounded-lg transition-all shadow-glow-sm"
            >
              Reset All Filters
            </button>
          </div>
        )}

      </section>

    </div>
  );
}

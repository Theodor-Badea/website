'use client';

import { Search, X, Filter, Terminal, Shield, Award, Cpu } from 'lucide-react';

interface CategoryInfo {
  name: string;
  slug: string;
  count: number;
}

interface WriteupFilterProps {
  categories: CategoryInfo[];
  totalCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (diff: string) => void;
}

export default function WriteupFilter({
  categories,
  totalCount,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
}: WriteupFilterProps) {
  return (
    <div id="writeups" className="space-y-6">
      
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search writeups by title, vulnerability, tool, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-cyber-card border border-cyber-border rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-mono text-sm shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
          <div className="flex bg-cyber-card border border-cyber-border rounded-xl p-1 font-mono text-xs">
            {['all', 'easy', 'medium', 'hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-brand-600 text-white font-semibold shadow-glow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-cyber-bg'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-cyber-border/40 pb-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg font-mono text-xs flex items-center gap-2 border transition-all ${
            selectedCategory === 'all'
              ? 'bg-brand-900/50 text-brand-200 border-brand-500/80 shadow-glow-sm font-medium'
              : 'bg-cyber-card text-gray-400 border-cyber-border hover:border-gray-600 hover:text-gray-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          All Writeups
          <span className="ml-1 px-1.5 py-0.5 rounded bg-cyber-bg text-gray-400 text-[10px]">
            {totalCount}
          </span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-4 py-2 rounded-lg font-mono text-xs flex items-center gap-2 border transition-all ${
              selectedCategory === cat.slug
                ? 'bg-brand-900/50 text-brand-200 border-brand-500/80 shadow-glow-sm font-medium'
                : 'bg-cyber-card text-gray-400 border-cyber-border hover:border-gray-600 hover:text-gray-200'
            }`}
          >
            {cat.slug === 'try_hack_me' && <Cpu className="w-3.5 h-3.5 text-brand-400" />}
            {cat.slug === 'dvwa' && <Shield className="w-3.5 h-3.5 text-rose-400" />}
            {cat.slug === 'security_summer_school' && <Award className="w-3.5 h-3.5 text-cyan-400" />}
            {cat.name}
            <span className="ml-1 px-1.5 py-0.5 rounded bg-cyber-bg text-gray-400 text-[10px]">
              {cat.count}
            </span>
          </button>
        ))}
      </div>

    </div>
  );
}

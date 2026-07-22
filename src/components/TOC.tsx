'use client';

import { TOCItem } from '@/lib/markdown';
import { List, ChevronRight } from 'lucide-react';

interface TOCProps {
  items: TOCItem[];
}

export default function TOC({ items }: TOCProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-cyber-card/60 border border-cyber-border rounded-xl p-5 backdrop-blur-md sticky top-24">
      <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-brand-400 mb-4 flex items-center gap-2 border-b border-cyber-border/60 pb-2">
        <List className="w-4 h-4" />
        Table of Contents
      </h4>

      <nav className="space-y-1.5 text-xs font-mono max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
        {items.map((item, idx) => (
          <a
            key={`${item.id}-${idx}`}
            href={`#${item.id}`}
            style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}
            className="group flex items-center gap-1.5 text-gray-400 hover:text-brand-300 py-1 transition-colors leading-normal"
          >
            <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-brand-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            <span className="truncate">{item.text}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

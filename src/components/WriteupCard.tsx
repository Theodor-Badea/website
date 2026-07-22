import Link from 'next/link';
import { Writeup } from '@/lib/markdown';
import { Clock, ArrowRight, ShieldAlert, Cpu, Award } from 'lucide-react';

interface WriteupCardProps {
  writeup: Writeup;
}

export default function WriteupCard({ writeup }: WriteupCardProps) {
  const getDifficultyBadge = (difficulty?: string | null) => {
    if (!difficulty) return null;
    const lower = difficulty.toLowerCase();
    
    if (lower === 'easy') {
      return (
        <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-medium">
          Easy
        </span>
      );
    }
    if (lower === 'medium') {
      return (
        <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/60 font-medium">
          Medium
        </span>
      );
    }
    if (lower === 'hard') {
      return (
        <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-rose-950/80 text-rose-400 border border-rose-800/60 font-medium">
          Hard
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-brand-950/80 text-brand-300 border border-brand-800/60 font-medium">
        {difficulty}
      </span>
    );
  };

  const getCategoryIcon = (categorySlug: string) => {
    switch (categorySlug) {
      case 'try_hack_me':
        return <Cpu className="w-3.5 h-3.5 text-brand-400" />;
      case 'dvwa':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case 'security_summer_school':
        return <Award className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-brand-400" />;
    }
  };

  return (
    <Link href={`/writeups/${writeup.slug}`} className="block group">
      <div className="h-full p-6 bg-cyber-card/70 border border-cyber-border rounded-xl hover:border-brand-500/80 hover:bg-cyber-card hover:shadow-glow-md transition-all duration-300 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden">
        
        {/* Subtle top accent gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-500/0 to-transparent group-hover:via-brand-500 transition-all duration-500" />

        <div>
          {/* Top Badges */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-md bg-cyber-bg border border-cyber-border text-gray-300">
              {getCategoryIcon(writeup.categorySlug)}
              {writeup.category}
            </span>
            {getDifficultyBadge(writeup.difficulty)}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-100 group-hover:text-brand-300 transition-colors duration-200 line-clamp-2 mb-3">
            {writeup.title}
          </h3>

          {/* Excerpt */}
          <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed mb-6">
            {writeup.excerpt}
          </p>
        </div>

        {/* Card Footer */}
        <div className="pt-4 border-t border-cyber-border/40 flex items-center justify-between text-xs text-gray-400 font-mono">
          <span className="flex items-center gap-1.5 text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            {writeup.readTime}
          </span>
          <span className="flex items-center gap-1 text-brand-400 font-medium group-hover:translate-x-1 transition-transform duration-200">
            Read Writeup
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

      </div>
    </Link>
  );
}

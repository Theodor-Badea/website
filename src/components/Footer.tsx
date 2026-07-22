import Link from 'next/link';
import { Terminal, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-cyber-border/60 bg-cyber-bg/90 text-gray-400 py-12 px-4 sm:px-6 lg:px-8 font-mono text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-cyber-card border border-cyber-border flex items-center justify-center text-brand-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <p className="text-gray-200 font-semibold font-sans">Theo's Cybersecurity Hub</p>
            <p className="text-xs text-gray-400">Penetration Testing, CTF Solutions & Security Research</p>
          </div>
        </div>

        {/* Center status */}
        <div className="flex items-center gap-2 text-xs text-brand-300 bg-cyber-card/80 px-3 py-1.5 rounded-full border border-cyber-border">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>System Status: Fully Operational</span>
        </div>

        {/* Right copyright */}
        <div className="text-xs text-gray-400 text-center md:text-right">
          <p>© {new Date().getFullYear()} Theo.</p>
        </div>

      </div>
    </footer>
  );
}

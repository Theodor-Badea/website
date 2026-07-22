'use client';

import { useState } from 'react';
import { Check, Copy, Code2 } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  children: React.ReactNode;
  rawCode?: string;
}

export default function CodeBlock({ language, children, rawCode }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    let textToCopy = '';
    if (typeof rawCode === 'string') {
      textToCopy = rawCode;
    } else if (typeof children === 'string') {
      textToCopy = children;
    } else {
      // Extract text content from children
      textToCopy = String(children).replace(/\n$/, '');
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6 rounded-xl border border-cyber-border bg-[#0d0a1a] overflow-hidden shadow-2xl">
      {/* Code Bar Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-cyber-card/90 border-b border-cyber-border/80 font-mono text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-brand-400" />
          <span className="uppercase text-brand-300 font-semibold">{language || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyber-bg hover:bg-cyber-border text-gray-300 hover:text-white transition-colors border border-cyber-border/50 text-[11px]"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-gray-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
        {children}
      </div>
    </div>
  );
}

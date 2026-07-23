'use client';

import React, { useState } from 'react';
import { Check, Copy, Code2 } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  children: React.ReactNode;
  rawCode?: string;
}

function getRawText(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getRawText).join('');
  if (node.props) {
    if (node.props.children) return getRawText(node.props.children);
    if (node.props.rawCode) return node.props.rawCode;
  }
  return '';
}

function splitIntoLines(node: React.ReactNode): React.ReactNode[][] {
  const lines: React.ReactNode[][] = [[]];

  function recurse(child: React.ReactNode) {
    if (child === null || child === undefined) return;

    if (typeof child === 'string') {
      const parts = child.split('\n');
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) {
          lines.push([]);
        }
        if (parts[i] !== '') {
          lines[lines.length - 1].push(parts[i]);
        }
      }
    } else if (typeof child === 'number') {
      lines[lines.length - 1].push(String(child));
    } else if (Array.isArray(child)) {
      child.forEach(recurse);
    } else if (React.isValidElement(child)) {
      const childrenProp = (child.props as any).children;
      const childText = getRawText(childrenProp);

      if (childText.includes('\n')) {
        const splitChildren = splitIntoLines(childrenProp);
        splitChildren.forEach((lineNodes, idx) => {
          if (idx > 0) {
            lines.push([]);
          }
          if (lineNodes.length > 0) {
            const cloned = React.cloneElement(
              child,
              { key: `${child.key || ''}-l-${lines.length}-${idx}` },
              ...lineNodes
            );
            lines[lines.length - 1].push(cloned);
          }
        });
      } else {
        lines[lines.length - 1].push(child);
      }
    }
  }

  recurse(node);
  return lines;
}

function stripPrompt(nodes: React.ReactNode[]): React.ReactNode[] {
  if (nodes.length === 0) return nodes;
  const first = nodes[0];
  if (typeof first === 'string') {
    if (first.startsWith('$ ')) return [first.substring(2), ...nodes.slice(1)];
    if (first.startsWith('# ')) return [first.substring(2), ...nodes.slice(1)];
  } else if (React.isValidElement(first)) {
    const childrenProp = (first.props as any).children;
    const text = getRawText(childrenProp);
    if (text.startsWith('$ ') || text.startsWith('# ')) {
      const strippedText = text.substring(2);
      return [
        React.cloneElement(first, {}, strippedText),
        ...nodes.slice(1)
      ];
    }
  }
  return nodes;
}

export default function CodeBlock({ language, children, rawCode }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const rawText = (typeof rawCode === 'string' ? rawCode : getRawText(children)).replace(/\n$/, '');

  const lines = rawText.split('\n');
  const hasPrompt = lines.some(line => line.startsWith('$ ') || line.startsWith('# '));
  const isTerminal = language === 'console' || language === 'terminal' || language === 'session' || hasPrompt;

  const handleCopy = () => {
    // If copying from a terminal block, let's copy either the whole thing or clean commands.
    // Let's copy the entire session text so the user gets everything they saw.
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Pre-split the children so we can render lines individually
  let renderedLines: React.ReactNode = null;
  if (isTerminal) {
    try {
      // Find the code element inside the pre -> code structure
      let codeElement: React.ReactNode = children;
      if (React.isValidElement(children) && children.type === 'pre') {
        const preChildren = (children.props as any).children;
        if (React.isValidElement(preChildren) && preChildren.type === 'code') {
          codeElement = (preChildren.props as any).children;
        }
      }

      const splitLines = splitIntoLines(codeElement);
      
      renderedLines = (
        <div className="flex flex-col gap-1">
          {splitLines.map((lineNodes, idx) => {
            const lineText = getRawText(lineNodes);
            const isCommand = lineText.startsWith('$ ') || lineText.startsWith('# ');
            const prompt = lineText.startsWith('$ ') ? '$' : '#';
            
            if (isCommand) {
              const cleanedNodes = stripPrompt(lineNodes);
              return (
                <div key={idx} className="min-h-[1.5rem] whitespace-pre">
                  <span className="text-brand-500/80 font-bold select-none mr-2">{prompt}</span>
                  <span className="font-semibold text-brand-100">{cleanedNodes}</span>
                </div>
              );
            } else {
              return (
                <div key={idx} className="min-h-[1.5rem] whitespace-pre text-gray-300/90">
                  {lineNodes}
                </div>
              );
            }
          })}
        </div>
      );
    } catch (e) {
      console.error('Failed to parse and split highlighted elements, falling back:', e);
      isTerminal && (renderedLines = null);
    }
  }

  return (
    <div className="relative group my-6 rounded-xl border border-cyber-border bg-[#0d0a1a] overflow-hidden shadow-2xl">
      {/* Code Bar Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-cyber-card/90 border-b border-cyber-border/80 font-mono text-xs text-gray-400">
        <div className="flex items-center gap-2">
          {isTerminal ? (
            <div className="flex items-center gap-1.5 mr-1 select-none">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </div>
          ) : (
            <Code2 className="w-3.5 h-3.5 text-brand-400" />
          )}
          <span className="uppercase text-brand-300 font-semibold tracking-wider">
            {isTerminal ? 'Terminal' : (language || 'code')}
          </span>
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
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed bg-[#07050f]">
        {isTerminal && renderedLines ? renderedLines : children}
      </div>
    </div>
  );
}

'use client';

import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/tokyo-night-dark.css';
import CodeBlock from './CodeBlock';
import { ExternalLink } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

function normalizeImageSrc(src?: string): string {
  if (!src) return '';
  let cleanSrc = src;

  const publicIdx = cleanSrc.indexOf('public/');
  if (publicIdx !== -1) {
    cleanSrc = '/' + cleanSrc.substring(publicIdx + 'public/'.length);
  }

  if (!cleanSrc.startsWith('/') && !cleanSrc.startsWith('http')) {
    cleanSrc = '/' + cleanSrc;
  }

  return cleanSrc;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert prose-purple max-w-none">
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ node, children, ...props }) => {
            const text = String(children);
            const id = slugifyHeading(text);
            return (
              <h1 id={id} className="text-3xl sm:text-4xl font-extrabold border-b border-cyber-border/80 pb-3 mt-8 mb-6 text-gray-100 flex items-center gap-2" {...props}>
                {children}
              </h1>
            );
          },
          h2: ({ node, children, ...props }) => {
            const text = String(children);
            const id = slugifyHeading(text);
            return (
              <h2 id={id} className="text-2xl font-bold border-b border-cyber-border/40 pb-2 mt-8 mb-4 text-brand-200" {...props}>
                {children}
              </h2>
            );
          },
          h3: ({ node, children, ...props }) => {
            const text = String(children);
            const id = slugifyHeading(text);
            return (
              <h3 id={id} className="text-xl font-bold mt-6 mb-3 text-brand-300" {...props}>
                {children}
              </h3>
            );
          },
          h4: ({ node, children, ...props }) => {
            const text = String(children);
            const id = slugifyHeading(text);
            return (
              <h4 id={id} className="text-lg font-semibold mt-4 mb-2 text-gray-200" {...props}>
                {children}
              </h4>
            );
          },
          img: ({ node, src, alt, ...props }) => {
            const normalizedSrc = normalizeImageSrc(src);
            return (
              <figure className="my-8">
                <div className="rounded-xl overflow-hidden border border-cyber-border bg-cyber-card/80 p-2 shadow-glow-sm">
                  <img
                    src={normalizedSrc}
                    alt={alt || 'Writeup Screenshot'}
                    className="w-full h-auto rounded-lg object-contain max-h-[650px]"
                    loading="lazy"
                    {...props}
                  />
                </div>
                {alt && (
                  <figcaption className="text-center text-xs font-mono text-gray-400 mt-2">
                    {alt}
                  </figcaption>
                )}
              </figure>
            );
          },
          pre: ({ node, children, ...props }) => {
            // Find language from child code element if available
            let lang = '';
            if (node && node.children && node.children[0]) {
              const codeNode: any = node.children[0];
              if (codeNode.properties && codeNode.properties.className) {
                const classes = codeNode.properties.className;
                const langClass = classes.find((c: string) => c.startsWith('language-'));
                if (langClass) {
                  lang = langClass.replace('language-', '');
                }
              }
            }

            return (
              <CodeBlock language={lang}>
                <pre {...props}>{children}</pre>
              </CodeBlock>
            );
          },
          a: ({ node, href, children, ...props }) => {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 underline underline-offset-4 font-mono text-sm transition-colors"
                {...props}
              >
                {children}
                {isExternal && <ExternalLink className="w-3 h-3 inline" />}
              </a>
            );
          },
          blockquote: ({ node, children, ...props }) => {
            return (
              <blockquote className="border-l-4 border-brand-500 bg-brand-950/20 px-4 py-3 rounded-r-lg text-gray-300 italic my-4 border border-y-transparent border-r-transparent font-mono text-sm" {...props}>
                {children}
              </blockquote>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

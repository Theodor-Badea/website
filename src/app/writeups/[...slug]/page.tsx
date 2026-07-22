import { getAllWriteups, getWriteupBySlug } from '@/lib/markdown';
import WriteupClientPage from '@/components/WriteupClientPage';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export async function generateStaticParams() {
  const writeups = getAllWriteups();
  return writeups.map((w) => ({
    slug: w.slugArray,
  }));
}

export default async function WriteupPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params;
  const writeup = getWriteupBySlug(resolvedParams.slug);

  if (!writeup) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-cyber-card border border-rose-500/40 flex items-center justify-center text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Writeup Not Found</h1>
        <p className="text-gray-400 text-sm max-w-md">
          The writeup at <code className="font-mono text-brand-300">/writeups/{resolvedParams.slug.join('/')}</code> could not be found.
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-mono text-xs rounded-xl shadow-glow-sm transition-all"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  // Get sibling writeups in the same category
  const allWriteups = getAllWriteups();
  const categoryWriteups = allWriteups.filter(
    (w) => w.categorySlug === writeup.categorySlug && w.slug !== writeup.slug
  );

  return <WriteupClientPage writeup={writeup} categoryWriteups={categoryWriteups} />;
}

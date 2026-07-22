import { getAllWriteups, getCategories } from '@/lib/markdown';
import HomeClient from '@/components/HomeClient';

export default function Home() {
  const writeups = getAllWriteups();
  const categories = getCategories();

  return <HomeClient initialWriteups={writeups} categories={categories} />;
}

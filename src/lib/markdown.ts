import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface TOCItem {
  level: number;
  text: string;
  id: string;
}

export interface Writeup {
  slug: string;
  slugArray: string[];
  title: string;
  category: string;
  categorySlug: string;
  difficulty?: string | null;
  url?: string | null;
  description?: string | null;
  excerpt: string;
  readTime: string;
  filePath: string;
  content: string;
  data: Record<string, any>;
  toc: TOCItem[];
}

const writeupsDir = path.join(process.cwd(), 'writeups');

function formatCategoryName(folder: string): string {
  switch (folder.toLowerCase()) {
    case 'try_hack_me':
      return 'TryHackMe';
    case 'dvwa':
      return 'DVWA';
    case 'security_summer_school':
      return 'Security Summer School';
    default:
      return folder.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

function extractTOC(content: string): TOCItem[] {
  const lines = content.split('\n');
  const toc: TOCItem[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{1,4})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim().replace(/\*+/g, '').replace(/`+/g, '');
      const id = slugifyHeading(text);
      toc.push({ level, text, id });
    }
  }

  return toc;
}

function deriveTitle(
  slugArray: string[],
  frontmatterTitle?: string,
  contentHeading?: string
): string {
  if (frontmatterTitle && frontmatterTitle.trim() && frontmatterTitle !== 'README') {
    return frontmatterTitle;
  }

  const category = slugArray[0]?.toLowerCase();
  const rest = slugArray.slice(1);

  if (category === 'try_hack_me' && rest.length > 0) {
    const boxName = rest[0].replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return `THM: ${boxName}`;
  }

  if (category === 'dvwa') {
    if (rest.length === 0 || (rest.length === 1 && rest[0] === 'README')) {
      return 'DVWA: Overview & Setup';
    }
    const pathStr = rest.join(' / ').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return `DVWA: ${pathStr}`;
  }

  if (category === 'security_summer_school') {
    if (rest.length === 0 || (rest.length === 1 && rest[0] === 'README')) {
      return 'Security Summer School Overview';
    }
    const labName = rest.join(' / ').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return `Lab: ${labName}`;
  }

  if (contentHeading && !['solution', 'readme', 'todo'].includes(contentHeading.toLowerCase())) {
    return contentHeading;
  }

  const last = slugArray[slugArray.length - 1];
  return last.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function extractExcerpt(content: string): string {
  const clean = content
    .replace(/---[\s\S]*?---/, '') // remove frontmatter
    .replace(/<!--[\s\S]*?-->/g, '') // remove HTML comments
    .replace(/#+\s+.*?\n/g, '') // remove headings
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/`.*?`/g, '') // remove inline code
    .replace(/!\[.*?\]\(.*?\)/g, '') // remove images
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // remove links
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return 'Cybersecurity lab writeup and vulnerability documentation.';
  return clean.length > 160 ? clean.substring(0, 157) + '...' : clean;
}

function calculateReadTime(content: string): string {
  const words = content.replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min read`;
}

function stripUserComments(content: string): string {
  const parts = content.split('```');
  for (let i = 0; i < parts.length; i += 2) {
    parts[i] = parts[i].replace(/<!--[\s\S]*?-->/g, '');
  }
  return parts.join('```');
}

function parseWriteupFile(filePath: string, relativePath: string): Writeup | null {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content: rawContent } = matter(fileContents);
    const content = stripUserComments(rawContent);

    // Normalize slug array from relative path
    // e.g. "try_hack_me/skynet/skynet.md" -> ["try_hack_me", "skynet"]
    // e.g. "DVWA/command_injection/writeup.md" -> ["DVWA", "command_injection"]
    // e.g. "security_summer_school/README.md" -> ["security_summer_school"]
    const parts = relativePath.split(path.sep);
    const categoryFolder = parts[0];
    const categoryName = formatCategoryName(categoryFolder);

    // Remove redundant file names like "writeup.md", "README.md", or "<folder>.md"
    let cleanParts = [...parts];
    const lastPart = cleanParts[cleanParts.length - 1];
    cleanParts[cleanParts.length - 1] = lastPart.replace(/\.md$/, '');

    const secondToLast = cleanParts[cleanParts.length - 2];
    const currentLast = cleanParts[cleanParts.length - 1];

    if (
      currentLast === 'writeup' ||
      currentLast === 'README' ||
      currentLast === 'index' ||
      currentLast === secondToLast
    ) {
      if (cleanParts.length > 1) {
        cleanParts.pop();
      }
    }

    const slugArray = cleanParts;
    const slug = slugArray.join('/');

    // Extract first H1 heading
    const h1Match = content.match(/^#\s+(.+)$/m);
    const contentHeading = h1Match ? h1Match[1].trim() : undefined;

    const rawTitle = data.Name || data.name || data.title;
    const title = deriveTitle(slugArray, rawTitle, contentHeading);

    const difficulty = data.Difficulty || data.difficulty || null;
    const url = data.URL || data.url || null;
    const description = data.Description || data.description || null;

    const excerpt = description || extractExcerpt(content);
    const readTime = calculateReadTime(content);
    const toc = extractTOC(content);

    return {
      slug,
      slugArray,
      title,
      category: categoryName,
      categorySlug: categoryFolder,
      difficulty,
      url,
      description,
      excerpt,
      readTime,
      filePath,
      content,
      data,
      toc,
    };
  } catch (err) {
    console.error(`Error parsing markdown file ${filePath}:`, err);
    return null;
  }
}

let cachedWriteups: Writeup[] | null = null;

function getGitignorePatterns(): string[] {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (!fs.existsSync(gitignorePath)) return [];
  
  try {
    const contents = fs.readFileSync(gitignorePath, 'utf8');
    return contents
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
  } catch (err) {
    console.error('Error reading gitignore:', err);
    return [];
  }
}

function shouldIgnore(filePath: string, gitignorePatterns: string[]): boolean {
  const relPathFromRoot = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
  
  for (const pattern of gitignorePatterns) {
    let cleanPattern = pattern;
    if (cleanPattern.startsWith('/')) {
      cleanPattern = cleanPattern.substring(1);
    }
    if (cleanPattern.endsWith('/')) {
      cleanPattern = cleanPattern.substring(0, cleanPattern.length - 1);
    }
    
    if (relPathFromRoot === cleanPattern || relPathFromRoot.startsWith(cleanPattern + '/')) {
      return true;
    }
  }
  return false;
}

export function getAllWriteups(): Writeup[] {
  if (cachedWriteups && process.env.NODE_ENV === 'production') {
    return cachedWriteups;
  }

  if (!fs.existsSync(writeupsDir)) {
    return [];
  }

  const writeups: Writeup[] = [];
  const gitignorePatterns = getGitignorePatterns();

  function walk(dir: string, baseDir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Also ignore whole directories if specified in gitignore
      if (shouldIgnore(fullPath, gitignorePatterns)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        walk(fullPath, baseDir);
      } else if (
        entry.isFile() &&
        entry.name.endsWith('.md') &&
        entry.name.toLowerCase() !== 'readme.md'
      ) {
        const relPath = path.relative(baseDir, fullPath);
        const parsed = parseWriteupFile(fullPath, relPath);
        if (parsed) {
          writeups.push(parsed);
        }
      }
    }
  }

  walk(writeupsDir, writeupsDir);

  // Sort writeups: category first, then title
  writeups.sort((a, b) => {
    if (a.categorySlug !== b.categorySlug) {
      return a.categorySlug.localeCompare(b.categorySlug);
    }
    return a.title.localeCompare(b.title);
  });

  cachedWriteups = writeups;
  return writeups;
}

export function getWriteupBySlug(slugArray: string[]): Writeup | null {
  const all = getAllWriteups();
  const targetSlug = slugArray.join('/');

  // Exact slug match
  let found = all.find(w => w.slug.toLowerCase() === targetSlug.toLowerCase());
  if (found) return found;

  // Fallback match by matching prefix or trailing path
  found = all.find(w => {
    const wSlug = w.slug.toLowerCase();
    const tSlug = targetSlug.toLowerCase();
    return wSlug === tSlug || wSlug.endsWith(`/${tSlug}`) || tSlug.endsWith(`/${wSlug}`);
  });

  return found || null;
}

export function getCategories(): { name: string; slug: string; count: number }[] {
  const all = getAllWriteups();
  const map = new Map<string, { name: string; slug: string; count: number }>();

  for (const w of all) {
    const existing = map.get(w.categorySlug);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(w.categorySlug, {
        name: w.category,
        slug: w.categorySlug,
        count: 1,
      });
    }
  }

  return Array.from(map.values());
}

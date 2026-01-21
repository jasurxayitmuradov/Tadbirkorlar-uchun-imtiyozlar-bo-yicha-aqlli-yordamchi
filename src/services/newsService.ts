import newsData from '../data/news.json';
import { NewsItem } from '../types';

type LexApiItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
  guid?: string;
  doc_id?: string;
};

type LexApiResponse = {
  items?: LexApiItem[];
};

const API_BASE =
  (import.meta.env.VITE_NEWS_API_BASE as string | undefined) ||
  'http://127.0.0.1:8000';

const LEX_SOURCE_ID = 'lexuz';
const LEX_SOURCE_NAME = 'Lex.uz';

const toNewsItem = (item: LexApiItem, idx: number): NewsItem => {
  const guid = item.guid || item.link || `lex-${idx}`;
  const publishedAt = item.pubDate ? Date.parse(item.pubDate) : Date.now();
  const safePublishedAt = Number.isFinite(publishedAt) ? publishedAt : Date.now();

  return {
    id: guid,
    title: item.title || 'Untitled',
    summary: item.description || '',
    url: item.link || '',
    sourceId: LEX_SOURCE_ID,
    sourceName: LEX_SOURCE_NAME,
    publishedAt: safePublishedAt,
    tags: [],
    docRefs: guid ? [guid] : [],
  };
};

export const getNews = async (): Promise<NewsItem[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/news/lex?limit=100`);
    if (!response.ok) throw new Error(`News fetch failed: ${response.status}`);
    const data = (await response.json()) as LexApiResponse;
    const items = data.items || [];
    return items.map(toNewsItem);
  } catch (error) {
    console.warn('Falling back to static news data:', error);
    return newsData as NewsItem[];
  }
};

export const filterNews = (
  items: NewsItem[],
  query: string,
  tag: string | null
): NewsItem[] => {
  let filtered = items;

  if (tag) {
    filtered = filtered.filter(item => item.tags.includes(tag));
  }

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.summary.toLowerCase().includes(q)
    );
  }

  return filtered.sort((a, b) => b.publishedAt - a.publishedAt);
};

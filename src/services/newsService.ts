import newsData from '../data/news.json';
import { NewsItem, ContextPayload, ContextItem } from '../types';

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

type NewsCard = {
  title?: string;
  date?: string;
  summary?: string;
  target_audience?: string;
  changes?: string;
  source_url?: string;
  doc_reference?: string;
};

const toNewsItem = (item: LexApiItem, idx: number): NewsItem => {
  const guid = item.guid || item.link || `lex-${idx}`;
  const publishedAt = item.pubDate ? Date.parse(item.pubDate) : Date.now();
  const safePublishedAt = Number.isFinite(publishedAt) ? publishedAt : Date.now();

  return {
    id: guid,
    title: item.title || 'Untitled',
    summary: item.description || '',
    impact: '',
    changes: '',
    url: item.link || '',
    sourceId: LEX_SOURCE_ID,
    sourceName: LEX_SOURCE_NAME,
    publishedAt: safePublishedAt,
    tags: [],
    docRefs: guid ? [guid] : [],
  };
};

const toContextItem = (item: LexApiItem, idx: number): ContextItem => {
  const guid = item.guid || item.link || `lex-${idx}`;
  return {
    id: guid,
    doc_title: item.title || 'Untitled',
    doc_type: 'Boshqa',
    source: 'lex.uz',
    url: item.link || '',
    status_hint: 'unknown',
    published_date: item.pubDate || '',
    effective_date: '',
    last_updated: '',
    article_or_clause: "Band/Bo'lim topilmadi",
    snippet_text: item.description || '',
    snippet_language: 'uz',
    confidence: 0.4,
  };
};

const summarizeNewsWithAI = async (items: LexApiItem[]): Promise<NewsItem[] | null> => {
  const contextItems = items.slice(0, 20).map(toContextItem);
  const context: ContextPayload = { items: contextItems };

  try {
    const response = await fetch('/api/ai/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context }),
    });

    if (!response.ok) {
      console.warn('AI news summary error:', response.status, await response.text());
      return null;
    }

    const data = (await response.json()) as { text?: string; error?: string };
    const text = data.text?.trim();
    if (!text) return null;

    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '');
    const parsed = JSON.parse(cleaned) as NewsCard[];
    if (!Array.isArray(parsed)) return null;

    return parsed.map((card, idx) => {
      const publishedAt = card.date ? Date.parse(card.date) : Date.now();
      const safePublishedAt = Number.isFinite(publishedAt) ? publishedAt : Date.now();
      const url = card.source_url || '';
      const docRef = card.doc_reference || '';
      return {
        id: url || docRef || `ai-news-${idx}`,
        title: card.title || 'Untitled',
        summary: card.summary || '',
        impact: card.target_audience || '',
        changes: card.changes || '',
        url,
        sourceId: LEX_SOURCE_ID,
        sourceName: LEX_SOURCE_NAME,
        publishedAt: safePublishedAt,
        tags: [],
        docRefs: docRef ? [docRef] : [],
      };
    });
  } catch (error) {
    console.warn('AI news summary parse error:', error);
    return null;
  }
};

export const getNews = async (): Promise<NewsItem[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/news/lex?limit=100`);
    if (!response.ok) throw new Error(`News fetch failed: ${response.status}`);
    const data = (await response.json()) as LexApiResponse;
    const items = data.items || [];
    const aiNews = await summarizeNewsWithAI(items);
    if (aiNews && aiNews.length > 0) return aiNews;
    return items.map(toNewsItem);
  } catch (error) {
    console.warn('Falling back to static news data:', error);
    return (newsData as NewsItem[]).map(item => ({
      ...item,
      impact: item.impact || '',
      changes: item.changes || '',
    }));
  }
};

export const getContextForNews = async (
  item: NewsItem
): Promise<ContextPayload | null> => {
  try {
    const params = new URLSearchParams();
    if (item.url) params.set('url', item.url);
    if (item.title) params.set('title', item.title);
    if (item.publishedAt) params.set('published_date', new Date(item.publishedAt).toISOString());

    const response = await fetch(`${API_BASE}/api/context/lex?${params.toString()}`);
    if (!response.ok) {
      console.warn('Context fetch failed:', response.status, await response.text());
      return null;
    }
    const data = (await response.json()) as ContextPayload;
    if (!data.items || data.items.length === 0) return null;
    return data;
  } catch (error) {
    console.warn('Context fetch error:', error);
    return null;
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

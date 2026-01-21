import newsData from '../data/news.json';
import { NewsItem } from '../types';

export const getNews = (): NewsItem[] => {
  return newsData as NewsItem[];
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

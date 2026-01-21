import benefitsData from '../data/benefits.json';
import { BenefitItem } from '../types';

export const getBenefits = (): BenefitItem[] => {
  return benefitsData as BenefitItem[];
};

export const filterBenefits = (
  items: BenefitItem[],
  region: string,
  query: string
): BenefitItem[] => {
  let filtered = items;

  // Region logic: Show items for "Barcha hududlar" OR specific user region
  filtered = filtered.filter(item => 
    item.hudud === "Barcha hududlar" || item.hudud === region
  );

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.benefit.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  return filtered;
};

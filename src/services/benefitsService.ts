import benefitsData from '../data/benefits.json';
import { BenefitRoadmap } from '../types';

export const getBenefits = (): BenefitRoadmap => {
  return benefitsData as BenefitRoadmap;
};

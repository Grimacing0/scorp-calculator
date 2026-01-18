// index.ts - Hub file that combines all tax years

import { rules2024 } from './2024';
import { rules2025 } from './2025';
import type { TaxYearRules } from './types';

// Object that contains all available tax years
export const taxYears: Record<number, TaxYearRules> = {
  2024: rules2024,
  2025: rules2025,
};

// Helper to get available years for dropdown (sorted descending, newest first)
export const availableYears = Object.keys(taxYears).map(Number).sort((a, b) => b - a);

// Export types for use in other files
export type {
  TaxYearRules,
  TaxBracket,
  FilingStatus,
  FilingStatusType,
  SelfEmploymentRules,
  AdditionalMedicareTaxThresholds,
  RetirementLimits,
  QBILimits,
} from './types';

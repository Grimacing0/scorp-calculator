// 2024.ts - Tax rules for 2024

import type { TaxYearRules } from './types';

export const rules2024: TaxYearRules = {
  year: 2024,
  filingStatuses: {
    single: {
      brackets: [
        { min: 0, max: 11600, rate: 0.10 },
        { min: 11600, max: 47150, rate: 0.12 },
        { min: 47150, max: 100525, rate: 0.22 },
        { min: 100525, max: 191950, rate: 0.24 },
        { min: 191950, max: 243725, rate: 0.32 },
        { min: 243725, max: 609350, rate: 0.35 },
        { min: 609350, max: Infinity, rate: 0.37 },
      ],
    },
  },
  selfEmployment: {
    socialSecurityRate: 0.124,        // 12.4%
    medicareRate: 0.029,              // 2.9%
    additionalMedicareRate: 0.009,    // 0.9%
    seIncomeMultiplier: 0.9235,       // 92.35%
    socialSecurityWageBase: 168600,   // 2024 SS wage base
  },
  additionalMedicareTaxThresholds: {
    single: 200000,
    marriedFilingJointly: 250000,
    marriedFilingSeparately: 125000,
    headOfHousehold: 200000,
  },
  retirement: {
    employeeDeferralLimit: 23500,
    catchUpLimit: 7500,
    overall415cLimit: 70000,
    compensationLimit: 345000,
    profitSharingRate: 0.25,
  },
};
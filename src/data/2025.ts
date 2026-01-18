// 2025.ts - Tax rules for 2025

import type { TaxYearRules } from './types';

export const rules2025: TaxYearRules = {
  year: 2025,
  filingStatuses: {
    single: {
      brackets: [
        { min: 0, max: 11925, rate: 0.10 },
        { min: 11925, max: 48475, rate: 0.12 },
        { min: 48475, max: 103350, rate: 0.22 },
        { min: 103350, max: 197300, rate: 0.24 },
        { min: 197300, max: 250525, rate: 0.32 },
        { min: 250525, max: 626350, rate: 0.35 },
        { min: 626350, max: Infinity, rate: 0.37 },
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
}
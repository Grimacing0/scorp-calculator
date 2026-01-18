// 2024.ts - Tax rules for 2024

import type { TaxYearRules } from './types';

export const rules2024: TaxYearRules = {
  year: 2024,

  filingStatuses: {
    single: {
      standardDeduction: 14600,
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
    marriedFilingJointly: {
      standardDeduction: 29200,
      brackets: [
        { min: 0, max: 23200, rate: 0.10 },
        { min: 23200, max: 94300, rate: 0.12 },
        { min: 94300, max: 201050, rate: 0.22 },
        { min: 201050, max: 383900, rate: 0.24 },
        { min: 383900, max: 487450, rate: 0.32 },
        { min: 487450, max: 731200, rate: 0.35 },
        { min: 731200, max: Infinity, rate: 0.37 },
      ],
    },
    marriedFilingSeparately: {
      standardDeduction: 14600,
      brackets: [
        { min: 0, max: 11600, rate: 0.10 },
        { min: 11600, max: 47150, rate: 0.12 },
        { min: 47150, max: 100525, rate: 0.22 },
        { min: 100525, max: 191950, rate: 0.24 },
        { min: 191950, max: 243725, rate: 0.32 },
        { min: 243725, max: 365600, rate: 0.35 },
        { min: 365600, max: Infinity, rate: 0.37 },
      ],
    },
    headOfHousehold: {
      standardDeduction: 21900,
      brackets: [
        { min: 0, max: 16550, rate: 0.10 },
        { min: 16550, max: 63100, rate: 0.12 },
        { min: 63100, max: 100500, rate: 0.22 },
        { min: 100500, max: 191950, rate: 0.24 },
        { min: 191950, max: 243700, rate: 0.32 },
        { min: 243700, max: 609350, rate: 0.35 },
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
    employeeDeferralLimit: 23000,     // 2024 limit
    catchUpLimit: 7500,               // Standard catch-up for age 50+
    superCatchUpLimit: 7500,          // SECURE 2.0 super catch-up not yet in effect for 2024
    overall415cLimit: 69000,          // 2024 total additions limit
    compensationLimit: 345000,        // 2024 max compensation
    profitSharingRate: 0.25,
  },

  qbi: {
    thresholds: {
      single: 191950,
      marriedFilingJointly: 383900,
      marriedFilingSeparately: 191950,
      headOfHousehold: 191950,
    },
    phaseOutRange: {
      single: 100000,
      marriedFilingJointly: 200000,
      marriedFilingSeparately: 100000,
      headOfHousehold: 100000,
    },
  },

  // Long-term capital gains tax brackets (0%, 15%, 20%)
  capitalGainsBrackets: {
    single: [
      { min: 0, max: 47025, rate: 0.00 },
      { min: 47025, max: 518900, rate: 0.15 },
      { min: 518900, max: Infinity, rate: 0.20 },
    ],
    marriedFilingJointly: [
      { min: 0, max: 94050, rate: 0.00 },
      { min: 94050, max: 583750, rate: 0.15 },
      { min: 583750, max: Infinity, rate: 0.20 },
    ],
    marriedFilingSeparately: [
      { min: 0, max: 47025, rate: 0.00 },
      { min: 47025, max: 291850, rate: 0.15 },
      { min: 291850, max: Infinity, rate: 0.20 },
    ],
    headOfHousehold: [
      { min: 0, max: 63000, rate: 0.00 },
      { min: 63000, max: 551350, rate: 0.15 },
      { min: 551350, max: Infinity, rate: 0.20 },
    ],
  },

  // Net Investment Income Tax (3.8%) thresholds
  niitThresholds: {
    single: 200000,
    marriedFilingJointly: 250000,
    marriedFilingSeparately: 125000,
    headOfHousehold: 200000,
  },
};

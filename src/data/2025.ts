// 2025.ts - Tax rules for 2025

import type { TaxYearRules } from './types';

export const rules2025: TaxYearRules = {
  year: 2025,

  filingStatuses: {
    single: {
      standardDeduction: 15000,
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
    marriedFilingJointly: {
      standardDeduction: 30000,
      brackets: [
        { min: 0, max: 23850, rate: 0.10 },
        { min: 23850, max: 96950, rate: 0.12 },
        { min: 96950, max: 206700, rate: 0.22 },
        { min: 206700, max: 394600, rate: 0.24 },
        { min: 394600, max: 501050, rate: 0.32 },
        { min: 501050, max: 751600, rate: 0.35 },
        { min: 751600, max: Infinity, rate: 0.37 },
      ],
    },
    marriedFilingSeparately: {
      standardDeduction: 15000,
      brackets: [
        { min: 0, max: 11925, rate: 0.10 },
        { min: 11925, max: 48475, rate: 0.12 },
        { min: 48475, max: 103350, rate: 0.22 },
        { min: 103350, max: 197300, rate: 0.24 },
        { min: 197300, max: 250525, rate: 0.32 },
        { min: 250525, max: 375800, rate: 0.35 },
        { min: 375800, max: Infinity, rate: 0.37 },
      ],
    },
    headOfHousehold: {
      standardDeduction: 22500,
      brackets: [
        { min: 0, max: 17000, rate: 0.10 },
        { min: 17000, max: 64850, rate: 0.12 },
        { min: 64850, max: 103350, rate: 0.22 },
        { min: 103350, max: 197300, rate: 0.24 },
        { min: 197300, max: 250500, rate: 0.32 },
        { min: 250500, max: 626350, rate: 0.35 },
        { min: 626350, max: Infinity, rate: 0.37 },
      ],
    },
  },

  selfEmployment: {
    socialSecurityRate: 0.124,        // 12.4% (6.2% employee + 6.2% employer)
    medicareRate: 0.029,              // 2.9% (1.45% employee + 1.45% employer)
    additionalMedicareRate: 0.009,    // 0.9% on wages over threshold
    seIncomeMultiplier: 0.9235,       // 92.35% - adjusts for employer portion
    socialSecurityWageBase: 176100,   // 2025 SS wage base
  },

  additionalMedicareTaxThresholds: {
    single: 200000,
    marriedFilingJointly: 250000,
    marriedFilingSeparately: 125000,
    headOfHousehold: 200000,
  },

  retirement: {
    employeeDeferralLimit: 23500,     // 2025 401(k) employee deferral limit
    catchUpLimit: 7500,               // Standard catch-up for age 50+
    superCatchUpLimit: 11250,         // SECURE 2.0: ages 60-63 catch-up
    overall415cLimit: 70000,          // 2025 total additions limit (employer + employee)
    compensationLimit: 350000,        // 2025 max compensation for calc
    profitSharingRate: 0.25,          // 25% employer contribution rate
  },

  qbi: {
    thresholds: {
      single: 197300,
      marriedFilingJointly: 394600,
      marriedFilingSeparately: 197300,
      headOfHousehold: 197300,
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
      { min: 0, max: 48350, rate: 0.00 },
      { min: 48350, max: 533400, rate: 0.15 },
      { min: 533400, max: Infinity, rate: 0.20 },
    ],
    marriedFilingJointly: [
      { min: 0, max: 96700, rate: 0.00 },
      { min: 96700, max: 600050, rate: 0.15 },
      { min: 600050, max: Infinity, rate: 0.20 },
    ],
    marriedFilingSeparately: [
      { min: 0, max: 48350, rate: 0.00 },
      { min: 48350, max: 300025, rate: 0.15 },
      { min: 300025, max: Infinity, rate: 0.20 },
    ],
    headOfHousehold: [
      { min: 0, max: 64750, rate: 0.00 },
      { min: 64750, max: 566700, rate: 0.15 },
      { min: 566700, max: Infinity, rate: 0.20 },
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

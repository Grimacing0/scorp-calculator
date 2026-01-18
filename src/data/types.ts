// types.ts - Defines the structure of our tax data
// Each year file (2024.ts, 2025.ts, etc.) provides the actual values

export type FilingStatusType = 'single' | 'marriedFilingJointly' | 'marriedFilingSeparately' | 'headOfHousehold';

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export interface FilingStatus {
  brackets: TaxBracket[];
  standardDeduction: number;
}

export interface SelfEmploymentRules {
  socialSecurityRate: number;      // 12.4% for SE, split for W-2
  medicareRate: number;            // 2.9% for SE, split for W-2
  additionalMedicareRate: number;  // 0.9% employee-only
  seIncomeMultiplier: number;      // 92.35%
  socialSecurityWageBase: number;  // Wage base cap for SS
}

export interface AdditionalMedicareTaxThresholds {
  single: number;
  marriedFilingJointly: number;
  marriedFilingSeparately: number;
  headOfHousehold: number;
}

export interface RetirementLimits {
  employeeDeferralLimit: number;   // Base 401k employee contribution
  catchUpLimit: number;            // Standard catch-up for 50+
  superCatchUpLimit: number;       // SECURE 2.0: ages 60-63 get higher catch-up
  overall415cLimit: number;        // Total annual additions limit
  compensationLimit: number;       // Max compensation for contribution calc
  profitSharingRate: number;       // 25% for employer contributions
}

export interface QBILimits {
  // QBI deduction thresholds - below this, full 20% deduction regardless of SSTB
  thresholds: {
    single: number;
    marriedFilingJointly: number;
    marriedFilingSeparately: number;
    headOfHousehold: number;
  };
  // Phase-out range above threshold
  phaseOutRange: {
    single: number;
    marriedFilingJointly: number;
    marriedFilingSeparately: number;
    headOfHousehold: number;
  };
}

export interface TaxYearRules {
  year: number;
  filingStatuses: Record<FilingStatusType, FilingStatus>;
  selfEmployment: SelfEmploymentRules;
  additionalMedicareTaxThresholds: AdditionalMedicareTaxThresholds;
  retirement: RetirementLimits;
  qbi: QBILimits;
  // Long-term capital gains brackets
  capitalGainsBrackets: Record<FilingStatusType, TaxBracket[]>;
  // Net Investment Income Tax threshold
  niitThresholds: {
    single: number;
    marriedFilingJointly: number;
    marriedFilingSeparately: number;
    headOfHousehold: number;
  };
}

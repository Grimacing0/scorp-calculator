// qbiCalculator.ts - QBI Deduction Calculator
// Implements Form 8995 (simplified) and Form 8995-A (detailed) logic

import type { TaxYearRules, FilingStatusType } from '../data';

export interface QBIInput {
  qbi: number;                    // Qualified Business Income
  businessW2Wages: number;        // W-2 wages paid by the business (for S-Corp includes owner salary)
  taxableIncomeBeforeQBI: number; // Taxable income before QBI deduction
  netCapitalGains: number;        // Net capital gains (for income limitation)
  filingStatus: FilingStatusType;
  isSSTB: boolean;                // Specified Service Trade or Business
}

export interface QBIResult {
  deduction: number;
  useForm8995A: boolean;          // True if complex form needed
  qbiComponent: number;           // 20% of (possibly reduced) QBI
  wageLimit: number;              // 50% of (possibly reduced) W-2 wages
  incomeLimit: number;            // 20% of (taxable income - cap gains)
  applicablePercentage: number;   // For SSTB phase-out (1 = full, 0 = none)
  limitingFactor: string;         // What limited the deduction
}

/**
 * Calculate QBI Deduction following IRS Form 8995 / 8995-A logic
 *
 * Form 8995 (Simplified): Used when taxable income ≤ threshold
 *   - Deduction = 20% of QBI, limited to 20% of (taxable income - net cap gains)
 *
 * Form 8995-A (Detailed): Used when taxable income > threshold
 *   - W-2 wage limitation applies
 *   - SSTB businesses phase out entirely over phase-out range
 */
export function calculateQBIDeduction(
  input: QBIInput,
  rules: TaxYearRules
): QBIResult {
  const { qbi, businessW2Wages, taxableIncomeBeforeQBI, netCapitalGains, filingStatus, isSSTB } = input;
  const threshold = rules.qbi.thresholds[filingStatus];
  const phaseOutRange = rules.qbi.phaseOutRange[filingStatus];
  const phaseOutCeiling = threshold + phaseOutRange;

  // Income limitation: 20% of (taxable income - net capital gains)
  const taxableOrdinaryIncome = Math.max(0, taxableIncomeBeforeQBI - netCapitalGains);
  const incomeLimit = taxableOrdinaryIncome * 0.20;

  // If no QBI or negative, no deduction
  if (qbi <= 0) {
    return {
      deduction: 0,
      useForm8995A: false,
      qbiComponent: 0,
      wageLimit: 0,
      incomeLimit,
      applicablePercentage: 1,
      limitingFactor: 'No QBI',
    };
  }

  // FORM 8995 (SIMPLIFIED) - Below threshold
  if (taxableIncomeBeforeQBI <= threshold) {
    const qbiComponent = qbi * 0.20;
    const deduction = Math.min(qbiComponent, incomeLimit);

    return {
      deduction: Math.max(0, deduction),
      useForm8995A: false,
      qbiComponent,
      wageLimit: Infinity, // Not applicable
      incomeLimit,
      applicablePercentage: 1,
      limitingFactor: deduction < qbiComponent ? 'Income limit' : 'None',
    };
  }

  // FORM 8995-A (DETAILED) - Above threshold

  // Calculate phase-out percentage for SSTB
  // This is the "applicable percentage" - how much of QBI/wages to include
  let applicablePercentage = 1;

  if (isSSTB) {
    if (taxableIncomeBeforeQBI >= phaseOutCeiling) {
      // Completely phased out - no deduction for SSTB above ceiling
      return {
        deduction: 0,
        useForm8995A: true,
        qbiComponent: 0,
        wageLimit: 0,
        incomeLimit,
        applicablePercentage: 0,
        limitingFactor: 'SSTB phase-out complete',
      };
    }

    // In phase-out range: calculate applicable percentage
    // Applicable % = (Ceiling - Taxable Income) / Phase-out Range
    applicablePercentage = (phaseOutCeiling - taxableIncomeBeforeQBI) / phaseOutRange;
  }

  // Apply applicable percentage to QBI and W-2 wages (for SSTB)
  // For non-SSTB, applicablePercentage stays at 1
  const adjustedQBI = qbi * applicablePercentage;
  const adjustedW2Wages = businessW2Wages * applicablePercentage;

  // QBI component: 20% of adjusted QBI
  const qbiComponent = adjustedQBI * 0.20;

  // W-2 wage limitation: 50% of adjusted W-2 wages
  // (We're skipping the "25% wages + 2.5% UBIA" alternative since user doesn't want UBIA)
  const wageLimit = adjustedW2Wages * 0.50;

  // For taxpayers above threshold, deduction is limited to wage limit
  // But we also need to phase in this limitation for those in the phase-out range

  let deductionBeforeIncomeLimit: number;
  let limitingFactor: string;

  if (taxableIncomeBeforeQBI >= phaseOutCeiling) {
    // Fully above phase-out: full wage limitation applies
    deductionBeforeIncomeLimit = Math.min(qbiComponent, wageLimit);
    limitingFactor = qbiComponent <= wageLimit ? 'None' : 'W-2 wage limit';
  } else {
    // In phase-out range: wage limitation phases IN
    // The "reduction" phases in from 0% to 100%
    const phaseInPercent = (taxableIncomeBeforeQBI - threshold) / phaseOutRange;

    // Calculate how much the wage limit reduces the deduction
    const reductionDueToWageLimit = Math.max(0, qbiComponent - wageLimit);

    // Phase in that reduction
    const phasedReduction = reductionDueToWageLimit * phaseInPercent;

    deductionBeforeIncomeLimit = qbiComponent - phasedReduction;
    limitingFactor = phasedReduction > 0 ? 'W-2 wage limit (partial)' : 'None';
  }

  // Final limitation: income limit
  const deduction = Math.min(deductionBeforeIncomeLimit, incomeLimit);

  if (deduction < deductionBeforeIncomeLimit) {
    limitingFactor = 'Income limit';
  }

  return {
    deduction: Math.max(0, deduction),
    useForm8995A: true,
    qbiComponent,
    wageLimit,
    incomeLimit,
    applicablePercentage,
    limitingFactor,
  };
}

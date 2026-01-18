// selfEmploymentTax.ts - Self-Employment Tax Calculation

import type { TaxYearRules } from '../data';

export interface SETaxResult {
  seIncome: number;              // Line 4c: Net earnings from self-employment
  socialSecurityTax: number;     // Line 10: Social Security portion
  medicareTax: number;           // Line 11: Medicare portion
  totalSETax: number;            // Line 12: Total SE tax (SS + Medicare)
  seDeduction: number;           // Line 13: Half of SE tax (deductible)
  additionalMedicareTax: number; // Form 8959: Additional Medicare Tax
  totalWithAdditional: number;   // Total SE/FICA + Additional Medicare
}

/**
 * Calculate Self-Employment Tax (Schedule SE) or S-Corp FICA
 * 
 * For Schedule C:
 *   - netProfit = Schedule C net profit
 *   - w2Wages = any outside W-2 wages (reduces SS wage base available)
 * 
 * For S-Corp:
 *   - netProfit = owner's W-2 salary from S-Corp
 *   - w2Wages = any other W-2 wages (usually 0 for S-Corp owners)
 * 
 * The calculation is the same for both - handles SS wage base cap correctly
 */
export function calculateSelfEmploymentTax(
  netProfit: number,
  w2Wages: number,
  rules: TaxYearRules,
  filingStatus: 'single' | 'marriedFilingJointly' | 'marriedFilingSeparately' | 'headOfHousehold'
): SETaxResult {
  const se = rules.selfEmployment;
  
  // Line 4a & 4c: Calculate SE income base (92.35% of net profit)
  const seIncome = netProfit * se.seIncomeMultiplier;
  
  // Line 8d: Total W-2 wages already subject to Social Security
  const existingSSWages = w2Wages;
  
  // Line 9: Calculate remaining Social Security wage base
  // If you already earned $100k in W-2 wages, only $68,600 of SE income is subject to SS tax
  const remainingSSwageBase = Math.max(0, se.socialSecurityWageBase - existingSSWages);
  
  // Line 10: Social Security tax (12.4% up to remaining wage base)
  const taxableForSS = Math.min(seIncome, remainingSSwageBase);
  const socialSecurityTax = taxableForSS * se.socialSecurityRate;
  
  // Line 11: Medicare tax (2.9% on all SE income - no cap)
  const medicareTax = seIncome * se.medicareRate;
  
  // Line 12: Total SE tax
  const totalSETax = socialSecurityTax + medicareTax;
  
  // Line 13: Deduction for one-half of SE tax
  const seDeduction = totalSETax * 0.5;
  
  // Form 8959: Additional Medicare Tax (0.9% on income over threshold)
  const threshold = rules.additionalMedicareTaxThresholds[filingStatus];
  
  // Line 4 & 10: Combined W-2 wages and SE income
  const totalMedicareWages = w2Wages + seIncome;
  
  // Line 11: Amount subject to additional Medicare tax
  const amountOverThreshold = Math.max(0, totalMedicareWages - threshold);
  
  // Line 13: Additional Medicare Tax
  const additionalMedicareTax = amountOverThreshold * se.additionalMedicareRate;
  
  return {
    seIncome,
    socialSecurityTax,
    medicareTax,
    totalSETax,
    seDeduction,
    additionalMedicareTax,
    totalWithAdditional: totalSETax + additionalMedicareTax,
  };
}
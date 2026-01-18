// retirementCalculator.ts - Solo 401(k) Maximum Contribution Calculator

import type { TaxYearRules } from '../data';

export interface RetirementContributionResult {
  // Maximum amounts
  maxEmployeeDeferral: number;      // Max employee contribution
  maxEmployerContribution: number;  // Max employer contribution
  maxTotalContribution: number;     // Combined max
  
  // Components for reference
  compensationUsed: number;         // Compensation amount used in calc
  limitedByOverall: boolean;        // Was it capped by $70k limit?
  limitedByCompensation: boolean;   // Was it capped by $345k compensation limit?
}

/**
 * Calculate maximum Solo 401(k) contribution for Schedule C
 * 
 * This follows the IRS worksheet logic:
 * - Employee deferral: Up to $23,500 (or $31,000 with catch-up)
 * - Employer contribution: 20% of (net profit - SE deduction)
 * - Total capped at $70,000 (or $77,500 with catch-up)
 */
export function calculateScheduleCRetirementMax(
  netProfit: number,
  seDeduction: number,
  isCatchUpEligible: boolean,
  rules: TaxYearRules
): RetirementContributionResult {
  console.log('=== Schedule C Retirement Calculation ===');
  console.log('Net Profit:', netProfit);
  console.log('SE Deduction:', seDeduction);
  console.log('Catch-up eligible:', isCatchUpEligible);
  
  const ret = rules.retirement;
  
  // Line 3: Net self-employment earnings (net profit - SE deduction)
  const netSEEarnings = netProfit - seDeduction;
  console.log('Net SE Earnings:', netSEEarnings);
  
  // Line 4: Self-employed rate (25% ÷ 125% = 20%)
  const selfEmployedRate = ret.profitSharingRate / (1 + ret.profitSharingRate);
  console.log('Self-employed rate:', selfEmployedRate);
  
  // Line 5: Employer contribution based on earnings
  const employerByEarnings = netSEEarnings * selfEmployedRate;
  console.log('Employer contribution by earnings:', employerByEarnings);
  
  // Line 6: Employer contribution based on compensation limit
  const employerByCompLimit = ret.compensationLimit * ret.profitSharingRate;
  console.log('Employer contribution by comp limit:', employerByCompLimit);
  
  // Line 7: Smaller of line 5 or 6
  const employerContribution = Math.min(employerByEarnings, employerByCompLimit);
  console.log('Employer contribution (smaller):', employerContribution);
  
  // Line 9: Employee deferral limit
  const baseDeferralLimit = ret.employeeDeferralLimit;
  const catchUpAmount = isCatchUpEligible ? ret.catchUpLimit : 0;
  const maxEmployeeDeferral = baseDeferralLimit + catchUpAmount;
  console.log('Max employee deferral:', maxEmployeeDeferral);
  
  // Line 8: Overall limit
  const overallLimit = ret.overall415cLimit + catchUpAmount;
  console.log('Overall 415(c) limit:', overallLimit);
  
  // Line 10: Overall limit minus employee deferral
  const remainingForEmployer = overallLimit - maxEmployeeDeferral;
  console.log('Remaining for employer after deferrals:', remainingForEmployer);
  
  // Line 13: Actual employer contribution (smallest of several limits)
  const maxEmployerContribution = Math.min(
    employerContribution,
    remainingForEmployer
  );
  console.log('Max employer contribution:', maxEmployerContribution);
  
  // Total maximum contribution
  const maxTotalContribution = maxEmployeeDeferral + maxEmployerContribution;
  console.log('Max total contribution:', maxTotalContribution);
  
  const limitedByOverall = (maxEmployeeDeferral + employerContribution) > overallLimit;
  const limitedByCompensation = employerByEarnings > employerByCompLimit;
  
  console.log('Limited by overall cap:', limitedByOverall);
  console.log('Limited by compensation:', limitedByCompensation);
  console.log('=== End Retirement Calculation ===');
  
  return {
    maxEmployeeDeferral,
    maxEmployerContribution,
    maxTotalContribution,
    compensationUsed: netSEEarnings,
    limitedByOverall,
    limitedByCompensation,
  };
}

/**
 * Calculate maximum Solo 401(k) contribution for S-Corp
 * 
 * For S-Corp, it's simpler:
 * - Employee deferral: Up to $23,500 from W-2 wages
 * - Employer contribution: 25% of W-2 wages
 * - Total capped at $70,000
 */
export function calculateSCorpRetirementMax(
  w2Wages: number,
  isCatchUpEligible: boolean,
  rules: TaxYearRules
): RetirementContributionResult {
  console.log('=== S-Corp Retirement Calculation ===');
  console.log('W-2 Wages:', w2Wages);
  console.log('Catch-up eligible:', isCatchUpEligible);
  
  const ret = rules.retirement;
  
  // Employee deferral limit
  const baseDeferralLimit = ret.employeeDeferralLimit;
  const catchUpAmount = isCatchUpEligible ? ret.catchUpLimit : 0;
  const maxEmployeeDeferral = Math.min(w2Wages, baseDeferralLimit + catchUpAmount);
  console.log('Max employee deferral:', maxEmployeeDeferral);
  
  // Employer contribution: 25% of wages
  const employerByWages = w2Wages * ret.profitSharingRate;
  console.log('Employer contribution (25% of wages):', employerByWages);
  
  // Overall limit
  const overallLimit = ret.overall415cLimit + catchUpAmount;
  console.log('Overall 415(c) limit:', overallLimit);
  
  // Employer contribution limited by overall cap
  const remainingForEmployer = overallLimit - maxEmployeeDeferral;
  const maxEmployerContribution = Math.min(employerByWages, remainingForEmployer);
  console.log('Max employer contribution:', maxEmployerContribution);
  
  // Total
  const maxTotalContribution = maxEmployeeDeferral + maxEmployerContribution;
  console.log('Max total contribution:', maxTotalContribution);
  
  const limitedByOverall = (maxEmployeeDeferral + employerByWages) > overallLimit;
  const limitedByCompensation = w2Wages > ret.compensationLimit;
  
  console.log('=== End Retirement Calculation ===');
  
  return {
    maxEmployeeDeferral,
    maxEmployerContribution,
    maxTotalContribution,
    compensationUsed: w2Wages,
    limitedByOverall,
    limitedByCompensation,
  };
}
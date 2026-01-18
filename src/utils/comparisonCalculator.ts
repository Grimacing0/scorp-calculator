// comparisonCalculator.ts - Main engine for S-Corp vs Schedule C comparison

import type { TaxYearRules, TaxBracket, FilingStatusType } from '../data';
import { calculateQBIDeduction as calculateQBI, type QBIResult } from './qbiCalculator';

// Input data for the comparison
export interface ComparisonInput {
  // Business income
  businessRevenue: number;
  businessExpenses: number;  // Non-wage expenses
  nonOwnerW2Wages: number;   // W-2 wages paid to employees (not owner)

  // S-Corp specific
  ownerSalary: number;       // Reasonable salary for S-Corp scenario

  // Other income
  otherW2Wages: number;      // Non-business W-2 wages (spouse, other jobs)
  dividendIncome: number;    // Qualified dividends
  interestIncome: number;    // Interest income (taxed as ordinary)
  capitalGains: number;      // Long-term capital gains
  retirementIncome: number;  // Pension, IRA distributions, etc.
  socialSecurityIncome: number;  // Taxable SS benefits
  otherIncome: number;       // Misc other income

  // Tax settings
  filingStatus: FilingStatusType;
  useStandardDeduction: boolean;
  itemizedDeductions: number;

  // Personal info
  age: number;               // For retirement catch-up eligibility

  // Business characteristics
  isSSTB: boolean;           // Specified Service Trade or Business (affects QBI)

  // Retirement contributions (optional - calculator will compute max if 0)
  traditionalContribution: number;  // Amount to defer (0 = use max)

  // Health insurance
  selfEmployedHealthInsurance: number;
}

// Detailed results for one scenario
export interface ScenarioResult {
  // Income breakdown
  grossBusinessIncome: number;   // Revenue minus expenses (minus wages for S-Corp)
  w2Wages: number;               // Owner W-2 (S-Corp only) + other W-2
  distributionOrProfit: number;  // S-Corp distributions or Schedule C net profit
  otherIncome: number;           // All other income combined
  totalGrossIncome: number;

  // Adjustments (above-the-line deductions)
  seDeduction: number;           // Half of SE tax (Schedule C only)
  retirementDeduction: number;   // Solo 401k/SEP contribution
  healthInsuranceDeduction: number;
  totalAdjustments: number;

  // AGI and deductions
  agi: number;
  standardOrItemized: number;
  qbiDeduction: number;
  qbiDetails: QBIResult;         // Detailed QBI calculation info
  totalDeductions: number;
  taxableOrdinaryIncome: number;

  // Tax calculations
  ordinaryIncomeTax: number;
  capitalGainsTax: number;
  niit: number;                  // Net Investment Income Tax
  totalIncomeTax: number;

  // Payroll/SE taxes
  socialSecurityTax: number;
  medicareTax: number;
  additionalMedicareTax: number;
  employerFICA: number;          // S-Corp employer portion (also a deduction)
  totalPayrollTax: number;

  // Final totals
  totalFederalTax: number;
  effectiveRate: number;

  // Retirement info
  maxRetirementContribution: number;
  employeeDeferral: number;
  employerContribution: number;
}

export interface ComparisonResult {
  scheduleC: ScenarioResult;
  sCorp: ScenarioResult;
  savings: number;              // Positive = S-Corp saves money
  savingsPercent: number;
}

// Calculate tax using progressive brackets
export function calculateProgressiveTax(income: number, brackets: TaxBracket[]): number {
  if (income <= 0) return 0;

  let totalTax = 0;

  for (const bracket of brackets) {
    if (income <= bracket.min) break;

    const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
    totalTax += taxableInBracket * bracket.rate;

    if (income <= bracket.max) break;
  }

  return totalTax;
}

// Calculate capital gains tax (stacked on top of ordinary income)
function calculateCapitalGainsTax(
  ordinaryIncome: number,
  capitalGains: number,
  brackets: TaxBracket[]
): number {
  if (capitalGains <= 0) return 0;

  // Capital gains "fill in" above ordinary income
  let tax = 0;
  let remainingGains = capitalGains;

  for (const bracket of brackets) {
    if (remainingGains <= 0) break;

    // How much room is there in this bracket?
    const bracketStart = Math.max(ordinaryIncome, bracket.min);
    const bracketEnd = bracket.max;

    if (bracketStart >= bracketEnd) continue;

    const roomInBracket = bracketEnd - bracketStart;
    const gainsInBracket = Math.min(remainingGains, roomInBracket);

    tax += gainsInBracket * bracket.rate;
    remainingGains -= gainsInBracket;
  }

  return tax;
}

// Calculate Net Investment Income Tax (3.8%)
function calculateNIIT(
  agi: number,
  investmentIncome: number,
  threshold: number
): number {
  const excessAGI = Math.max(0, agi - threshold);
  const taxableAmount = Math.min(investmentIncome, excessAGI);
  return taxableAmount * 0.038;
}

// Get catch-up amount based on age
function getCatchUpAmount(age: number, rules: TaxYearRules): number {
  if (age >= 60 && age <= 63) {
    return rules.retirement.superCatchUpLimit;
  } else if (age >= 50) {
    return rules.retirement.catchUpLimit;
  }
  return 0;
}

// Calculate Schedule C scenario
function calculateScheduleC(
  input: ComparisonInput,
  rules: TaxYearRules
): ScenarioResult {
  const se = rules.selfEmployment;
  const ret = rules.retirement;
  const fs = rules.filingStatuses[input.filingStatus];

  // Net profit from Schedule C (after non-owner wages)
  const netProfit = input.businessRevenue - input.businessExpenses - input.nonOwnerW2Wages;

  // SE income base (92.35% of net profit)
  const seIncome = netProfit * se.seIncomeMultiplier;

  // Social Security tax (capped at wage base)
  const w2WagesForSS = input.otherW2Wages;
  const remainingSSBase = Math.max(0, se.socialSecurityWageBase - w2WagesForSS);
  const taxableForSS = Math.min(seIncome, remainingSSBase);
  const socialSecurityTax = taxableForSS * se.socialSecurityRate;

  // Medicare tax (no cap)
  const medicareTax = seIncome * se.medicareRate;

  // Total SE tax and deduction
  const totalSETax = socialSecurityTax + medicareTax;
  const seDeduction = totalSETax * 0.5;

  // Calculate retirement max
  // For Schedule C: employer contribution rate is 20% of (net profit - SE deduction)
  const netSEEarnings = netProfit - seDeduction;
  const selfEmployedRate = ret.profitSharingRate / (1 + ret.profitSharingRate); // 25/125 = 20%
  const maxEmployerContribution = Math.min(
    netSEEarnings * selfEmployedRate,
    ret.compensationLimit * ret.profitSharingRate
  );

  const catchUp = getCatchUpAmount(input.age, rules);
  const maxEmployeeDeferral = ret.employeeDeferralLimit + catchUp;
  const overallLimit = ret.overall415cLimit + catchUp;

  // Employer contribution is limited by overall cap
  const employerContribution = Math.min(
    maxEmployerContribution,
    overallLimit - maxEmployeeDeferral
  );

  const maxTotal = maxEmployeeDeferral + employerContribution;

  // Actual contribution (use max if not specified)
  const retirementDeduction = input.traditionalContribution > 0
    ? Math.min(input.traditionalContribution, maxTotal)
    : maxTotal;

  // Health insurance deduction
  const healthInsuranceDeduction = Math.min(
    input.selfEmployedHealthInsurance,
    netProfit // Can't exceed net self-employment earnings
  );

  // Other income
  const otherIncome = input.dividendIncome + input.interestIncome +
    input.retirementIncome + input.socialSecurityIncome + input.otherIncome;

  // Gross income for AGI calculation
  const totalGrossIncome = netProfit + input.otherW2Wages +
    input.capitalGains + otherIncome;

  // Adjustments
  const totalAdjustments = seDeduction + retirementDeduction + healthInsuranceDeduction;

  // AGI
  const agi = totalGrossIncome - totalAdjustments;

  // Deductions
  const standardOrItemized = input.useStandardDeduction
    ? fs.standardDeduction
    : input.itemizedDeductions;

  // QBI deduction using the proper Form 8995/8995-A logic
  // For Schedule C: QBI = net profit minus adjustments allocated to the business
  // Business W-2 wages = non-owner wages paid (owner has no W-2 in Schedule C)
  const qbiAmount = netProfit - seDeduction - retirementDeduction;
  const taxableBeforeQBI = agi - standardOrItemized;

  const qbiDetails = calculateQBI({
    qbi: qbiAmount,
    businessW2Wages: input.nonOwnerW2Wages,  // Only non-owner wages count for QBI W-2 limit
    taxableIncomeBeforeQBI: taxableBeforeQBI,
    netCapitalGains: input.capitalGains,
    filingStatus: input.filingStatus,
    isSSTB: input.isSSTB,
  }, rules);

  const qbiDeduction = qbiDetails.deduction;
  const totalDeductions = standardOrItemized + qbiDeduction;

  // Taxable income
  const taxableOrdinaryIncome = Math.max(0, agi - totalDeductions - input.capitalGains);

  // Income tax
  const ordinaryIncomeTax = calculateProgressiveTax(taxableOrdinaryIncome, fs.brackets);

  // Capital gains tax
  const capitalGainsTax = calculateCapitalGainsTax(
    taxableOrdinaryIncome,
    input.capitalGains,
    rules.capitalGainsBrackets[input.filingStatus]
  );

  // NIIT
  const investmentIncome = input.capitalGains + input.dividendIncome + input.interestIncome;
  const niit = calculateNIIT(agi, investmentIncome, rules.niitThresholds[input.filingStatus]);

  const totalIncomeTax = ordinaryIncomeTax + capitalGainsTax + niit;

  // Additional Medicare Tax
  const totalMedicareWages = input.otherW2Wages + seIncome;
  const amtThreshold = rules.additionalMedicareTaxThresholds[input.filingStatus];
  const additionalMedicareTax = Math.max(0, totalMedicareWages - amtThreshold) * se.additionalMedicareRate;

  // Total payroll tax (all SE tax goes to employee in Schedule C)
  const totalPayrollTax = totalSETax + additionalMedicareTax;

  // Total federal tax
  const totalFederalTax = totalIncomeTax + totalPayrollTax;

  // Effective rate
  const effectiveRate = totalGrossIncome > 0 ? totalFederalTax / totalGrossIncome : 0;

  return {
    grossBusinessIncome: netProfit,
    w2Wages: input.otherW2Wages,
    distributionOrProfit: netProfit,
    otherIncome,
    totalGrossIncome,

    seDeduction,
    retirementDeduction,
    healthInsuranceDeduction,
    totalAdjustments,

    agi,
    standardOrItemized,
    qbiDeduction,
    qbiDetails,
    totalDeductions,
    taxableOrdinaryIncome,

    ordinaryIncomeTax,
    capitalGainsTax,
    niit,
    totalIncomeTax,

    socialSecurityTax,
    medicareTax,
    additionalMedicareTax,
    employerFICA: 0, // No employer FICA in Schedule C
    totalPayrollTax,

    totalFederalTax,
    effectiveRate,

    maxRetirementContribution: maxTotal,
    employeeDeferral: maxEmployeeDeferral,
    employerContribution,
  };
}

// Calculate S-Corp scenario
function calculateSCorp(
  input: ComparisonInput,
  rules: TaxYearRules
): ScenarioResult {
  const se = rules.selfEmployment;
  const ret = rules.retirement;
  const fs = rules.filingStatuses[input.filingStatus];

  // S-Corp: Owner takes salary as W-2 wages
  const ownerSalary = input.ownerSalary;

  // Total business W-2 wages (owner + non-owner employees)
  const totalBusinessW2 = ownerSalary + input.nonOwnerW2Wages;

  // Employer FICA on owner's salary (6.2% SS + 1.45% Medicare)
  const employerSSRate = se.socialSecurityRate / 2;  // 6.2%
  const employerMedRate = se.medicareRate / 2;       // 1.45%

  const taxableForSS = Math.min(ownerSalary, se.socialSecurityWageBase);
  const employerSS = taxableForSS * employerSSRate;
  const employerMed = ownerSalary * employerMedRate;
  const employerFICA = employerSS + employerMed;

  // Business profit after all wages and employer FICA
  const netBusinessIncome = input.businessRevenue - input.businessExpenses -
    totalBusinessW2 - employerFICA;

  // S-Corp distributions (passed through to owner)
  const distributions = Math.max(0, netBusinessIncome);

  // Total W-2 wages for the taxpayer (owner salary + other personal W-2)
  const totalW2 = ownerSalary + input.otherW2Wages;

  // Employee FICA on owner's salary
  const employeeSSRate = se.socialSecurityRate / 2;
  const employeeMedRate = se.medicareRate / 2;

  // Account for other W-2 wages when computing SS cap
  const priorSSWages = input.otherW2Wages;
  const remainingSSBase = Math.max(0, se.socialSecurityWageBase - priorSSWages);
  const ownerTaxableForSS = Math.min(ownerSalary, remainingSSBase);

  const socialSecurityTax = ownerTaxableForSS * employeeSSRate;
  const medicareTax = ownerSalary * employeeMedRate;

  // Calculate retirement max for S-Corp
  // Employee deferral: up to limit from W-2 wages
  const catchUp = getCatchUpAmount(input.age, rules);
  const maxEmployeeDeferral = Math.min(ownerSalary, ret.employeeDeferralLimit + catchUp);

  // Employer contribution: 25% of wages
  const maxEmployerByWages = ownerSalary * ret.profitSharingRate;
  const overallLimit = ret.overall415cLimit + catchUp;
  const employerContribution = Math.min(
    maxEmployerByWages,
    overallLimit - maxEmployeeDeferral
  );

  const maxTotal = maxEmployeeDeferral + employerContribution;

  // Actual contribution
  const retirementDeduction = input.traditionalContribution > 0
    ? Math.min(input.traditionalContribution, maxTotal)
    : maxTotal;

  // Health insurance deduction
  const healthInsuranceDeduction = input.selfEmployedHealthInsurance;

  // Other income
  const otherIncome = input.dividendIncome + input.interestIncome +
    input.retirementIncome + input.socialSecurityIncome + input.otherIncome;

  // Gross income
  const totalGrossIncome = totalW2 + distributions + input.capitalGains + otherIncome;

  // Adjustments (no SE deduction for S-Corp)
  const totalAdjustments = retirementDeduction + healthInsuranceDeduction;

  // AGI
  const agi = totalGrossIncome - totalAdjustments;

  // Deductions
  const standardOrItemized = input.useStandardDeduction
    ? fs.standardDeduction
    : input.itemizedDeductions;

  // QBI deduction using proper Form 8995/8995-A logic
  // For S-Corp: QBI = distributions (pass-through income)
  // Business W-2 wages = total wages paid by the S-Corp (owner + employees)
  const qbiAmount = distributions;
  const taxableBeforeQBI = agi - standardOrItemized;

  const qbiDetails = calculateQBI({
    qbi: qbiAmount,
    businessW2Wages: totalBusinessW2,  // All W-2 wages paid by S-Corp count
    taxableIncomeBeforeQBI: taxableBeforeQBI,
    netCapitalGains: input.capitalGains,
    filingStatus: input.filingStatus,
    isSSTB: input.isSSTB,
  }, rules);

  const qbiDeduction = qbiDetails.deduction;
  const totalDeductions = standardOrItemized + qbiDeduction;

  // Taxable income
  const taxableOrdinaryIncome = Math.max(0, agi - totalDeductions - input.capitalGains);

  // Income tax
  const ordinaryIncomeTax = calculateProgressiveTax(taxableOrdinaryIncome, fs.brackets);

  // Capital gains tax
  const capitalGainsTax = calculateCapitalGainsTax(
    taxableOrdinaryIncome,
    input.capitalGains,
    rules.capitalGainsBrackets[input.filingStatus]
  );

  // NIIT - distributions are NOT investment income
  const investmentIncome = input.capitalGains + input.dividendIncome + input.interestIncome;
  const niit = calculateNIIT(agi, investmentIncome, rules.niitThresholds[input.filingStatus]);

  const totalIncomeTax = ordinaryIncomeTax + capitalGainsTax + niit;

  // Additional Medicare Tax on W-2 wages over threshold
  const amtThreshold = rules.additionalMedicareTaxThresholds[input.filingStatus];
  const additionalMedicareTax = Math.max(0, totalW2 - amtThreshold) * se.additionalMedicareRate;

  // Total payroll tax (employee portion only)
  const totalPayrollTax = socialSecurityTax + medicareTax + additionalMedicareTax;

  // Total federal tax (employee side)
  const totalFederalTax = totalIncomeTax + totalPayrollTax;

  // Effective rate
  const effectiveRate = totalGrossIncome > 0 ? totalFederalTax / totalGrossIncome : 0;

  return {
    grossBusinessIncome: netBusinessIncome,
    w2Wages: totalW2,
    distributionOrProfit: distributions,
    otherIncome,
    totalGrossIncome,

    seDeduction: 0,
    retirementDeduction,
    healthInsuranceDeduction,
    totalAdjustments,

    agi,
    standardOrItemized,
    qbiDeduction,
    qbiDetails,
    totalDeductions,
    taxableOrdinaryIncome,

    ordinaryIncomeTax,
    capitalGainsTax,
    niit,
    totalIncomeTax,

    socialSecurityTax,
    medicareTax,
    additionalMedicareTax,
    employerFICA,
    totalPayrollTax,

    totalFederalTax,
    effectiveRate,

    maxRetirementContribution: maxTotal,
    employeeDeferral: maxEmployeeDeferral,
    employerContribution,
  };
}

// Main comparison function
export function calculateComparison(
  input: ComparisonInput,
  rules: TaxYearRules
): ComparisonResult {
  const scheduleC = calculateScheduleC(input, rules);
  const sCorp = calculateSCorp(input, rules);

  // For true comparison, include employer FICA as a "cost" of S-Corp
  const sCorpTotalCost = sCorp.totalFederalTax + sCorp.employerFICA;
  const scheduleCTotalCost = scheduleC.totalFederalTax;

  const savings = scheduleCTotalCost - sCorpTotalCost;
  const savingsPercent = scheduleCTotalCost > 0 ? savings / scheduleCTotalCost : 0;

  return {
    scheduleC,
    sCorp,
    savings,
    savingsPercent,
  };
}

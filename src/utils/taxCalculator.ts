// src/utils/taxCalculator.ts
import type { TaxBracket } from '../data';

export function calculateTax(income: number, brackets: TaxBracket[]): number {
  let totalTax = 0;

  for (const bracket of brackets) {
    // If income is less than this bracket's minimum, we're done
    if (income <= bracket.min) {
      break;
    }

    // Calculate how much income falls in this bracket
    const taxableInBracket = Math.min(income, bracket.max) - bracket.min;

    // Add the tax for this bracket
    totalTax += taxableInBracket * bracket.rate;

    // If we've used all the income, stop
    if (income <= bracket.max) {
      break;
    }
  }

  return totalTax;
}
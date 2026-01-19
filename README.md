# S-Corp vs Schedule C Tax Calculator

A React-based calculator that compares federal tax liability for self-employed individuals operating as a sole proprietorship (Schedule C) versus an S-Corporation.

## Features

- **Side-by-side comparison** of Schedule C vs S-Corp tax scenarios
- **Comprehensive tax calculations** including:
  - Federal income tax (progressive brackets)
  - Self-employment tax / FICA
  - Additional Medicare Tax (0.9%)
  - Net Investment Income Tax (NIIT)
  - Long-term capital gains tax
- **QBI deduction** with proper Form 8995/8995-A logic, W-2 wage limits, and SSTB handling
- **Retirement contributions** (Solo 401k) with catch-up and super catch-up provisions
- **Multiple filing statuses** (Single, MFJ, MFS, HOH)
- **2024 and 2025 tax year** support
- **QBI optimization tip** showing the 2/7 rule for setting optimal S-Corp wages

## Usage

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Build

```bash
npm run build
```

Output is in the `dist` folder.

## Disclaimer

This calculator provides estimates for educational purposes only. Consult a qualified tax professional for advice specific to your situation.

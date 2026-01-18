import { useState, useMemo } from 'react';
import './App.css';
import { taxYears, availableYears } from './data';
import type { FilingStatusType } from './data';
import {
  calculateComparison,
  type ComparisonInput,
  type ComparisonResult,
} from './utils/comparisonCalculator';

const formatCurrency = (value: number): string => {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const formatPercent = (value: number): string => {
  return (value * 100).toFixed(2) + '%';
};

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  help?: string;
}

function InputField({ label, value, onChange, help }: InputFieldProps) {
  return (
    <div className="input-field">
      <label>
        <span className="label-text">{label}</span>
        {help && <span className="help-text">{help}</span>}
      </label>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        placeholder="0"
      />
    </div>
  );
}

interface ResultRowProps {
  label: string;
  scheduleC: number | string;
  sCorp: number | string;
  isTotal?: boolean;
  isCurrency?: boolean;
}

function ResultRow({ label, scheduleC, sCorp, isTotal, isCurrency = true }: ResultRowProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    return isCurrency ? formatCurrency(val) : formatPercent(val);
  };

  return (
    <tr className={isTotal ? 'total-row' : ''}>
      <td>{label}</td>
      <td className="number">{formatValue(scheduleC)}</td>
      <td className="number">{formatValue(sCorp)}</td>
    </tr>
  );
}

interface ResultsSectionProps {
  title: string;
  rows: { label: string; scheduleC: number; sCorp: number; isTotal?: boolean }[];
}

function ResultsSection({ title, rows }: ResultsSectionProps) {
  return (
    <div className="results-section">
      <h3>{title}</h3>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Schedule C</th>
            <th>S-Corp</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <ResultRow key={i} {...row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function App() {
  // Tax year
  const [taxYear, setTaxYear] = useState(2025);

  // Business inputs
  const [businessRevenue, setBusinessRevenue] = useState(400000);
  const [businessExpenses, setBusinessExpenses] = useState(50000);
  const [nonOwnerW2Wages, setNonOwnerW2Wages] = useState(0);
  const [ownerSalary, setOwnerSalary] = useState(100000);

  // Other income
  const [otherW2Wages, setOtherW2Wages] = useState(0);
  const [dividendIncome, setDividendIncome] = useState(0);
  const [interestIncome, setInterestIncome] = useState(0);
  const [capitalGains, setCapitalGains] = useState(0);
  const [retirementIncome, setRetirementIncome] = useState(0);
  const [socialSecurityIncome, setSocialSecurityIncome] = useState(0);
  const [otherIncome, setOtherIncome] = useState(0);

  // Tax settings
  const [filingStatus, setFilingStatus] = useState<FilingStatusType>('marriedFilingJointly');
  const [useStandardDeduction, setUseStandardDeduction] = useState(true);
  const [itemizedDeductions, setItemizedDeductions] = useState(0);

  // Personal
  const [age, setAge] = useState(45);

  // Business characteristics
  const [isSSTB, setIsSSTB] = useState(false);

  // Optional overrides
  const [selfEmployedHealthInsurance, setSelfEmployedHealthInsurance] = useState(0);
  const [traditionalContribution, setTraditionalContribution] = useState(0);

  const rules = taxYears[taxYear];

  const input: ComparisonInput = useMemo(() => ({
    businessRevenue,
    businessExpenses,
    nonOwnerW2Wages,
    ownerSalary,
    otherW2Wages,
    dividendIncome,
    interestIncome,
    capitalGains,
    retirementIncome,
    socialSecurityIncome,
    otherIncome,
    filingStatus,
    useStandardDeduction,
    itemizedDeductions,
    age,
    isSSTB,
    traditionalContribution,
    selfEmployedHealthInsurance,
  }), [
    businessRevenue, businessExpenses, nonOwnerW2Wages, ownerSalary, otherW2Wages,
    dividendIncome, interestIncome, capitalGains, retirementIncome,
    socialSecurityIncome, otherIncome, filingStatus, useStandardDeduction,
    itemizedDeductions, age, isSSTB, traditionalContribution, selfEmployedHealthInsurance
  ]);

  const result: ComparisonResult = useMemo(
    () => calculateComparison(input, rules),
    [input, rules]
  );

  const { scheduleC, sCorp, savings } = result;

  return (
    <div className="app">
      <header>
        <h1>S-Corp vs Schedule C Tax Comparison</h1>
        <p className="subtitle">Compare your tax liability under different business structures</p>
      </header>

      <div className="main-content">
        <div className="inputs-panel">
          <div className="input-section">
            <h2>Tax Year & Filing Status</h2>
            <div className="input-row">
              <div className="input-field">
                <label>Tax Year</label>
                <select
                  value={taxYear}
                  onChange={(e) => setTaxYear(Number(e.target.value))}
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="input-field">
                <label>Filing Status</label>
                <select
                  value={filingStatus}
                  onChange={(e) => setFilingStatus(e.target.value as FilingStatusType)}
                >
                  <option value="single">Single</option>
                  <option value="marriedFilingJointly">Married Filing Jointly</option>
                  <option value="marriedFilingSeparately">Married Filing Separately</option>
                  <option value="headOfHousehold">Head of Household</option>
                </select>
              </div>
            </div>
            <div className="input-row">
              <InputField
                label="Your Age"
                value={age}
                onChange={setAge}
                help={age >= 60 && age <= 63 ? "Super catch-up eligible!" : age >= 50 ? "Catch-up eligible" : ""}
              />
              <div className="input-field checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={isSSTB}
                    onChange={(e) => setIsSSTB(e.target.checked)}
                  />
                  <span>Specified Service Trade or Business (SSTB)</span>
                </label>
                <span className="help-text">Law, health, accounting, consulting, etc.</span>
              </div>
            </div>
          </div>

          <div className="input-section">
            <h2>Business Income</h2>
            <InputField
              label="Business Revenue"
              value={businessRevenue}
              onChange={setBusinessRevenue}
              help="Gross receipts before expenses"
            />
            <InputField
              label="Business Expenses"
              value={businessExpenses}
              onChange={setBusinessExpenses}
              help="Non-wage operating expenses"
            />
            <InputField
              label="Employee Wages (Non-Owner)"
              value={nonOwnerW2Wages}
              onChange={setNonOwnerW2Wages}
              help="W-2 wages paid to employees (affects QBI limit)"
            />
            <InputField
              label="S-Corp Owner Salary"
              value={ownerSalary}
              onChange={setOwnerSalary}
              help="Reasonable compensation for S-Corp scenario"
            />
            <div className="calculated-value">
              Net Business Income: {formatCurrency(businessRevenue - businessExpenses - nonOwnerW2Wages)}
            </div>
          </div>

          <div className="input-section">
            <h2>Other Income</h2>
            <InputField
              label="Other W-2 Wages"
              value={otherW2Wages}
              onChange={setOtherW2Wages}
              help="Spouse income, other jobs, etc."
            />
            <InputField
              label="Dividend Income"
              value={dividendIncome}
              onChange={setDividendIncome}
              help="Qualified dividends"
            />
            <InputField
              label="Interest Income"
              value={interestIncome}
              onChange={setInterestIncome}
            />
            <InputField
              label="Long-term Capital Gains"
              value={capitalGains}
              onChange={setCapitalGains}
            />
            <InputField
              label="Retirement Income"
              value={retirementIncome}
              onChange={setRetirementIncome}
              help="Pensions, IRA distributions"
            />
            <InputField
              label="Social Security (Taxable)"
              value={socialSecurityIncome}
              onChange={setSocialSecurityIncome}
            />
            <InputField
              label="Other Income"
              value={otherIncome}
              onChange={setOtherIncome}
            />
          </div>

          <div className="input-section">
            <h2>Deductions & Adjustments</h2>
            <div className="input-field checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={useStandardDeduction}
                  onChange={(e) => setUseStandardDeduction(e.target.checked)}
                />
                <span>Use Standard Deduction ({formatCurrency(rules.filingStatuses[filingStatus].standardDeduction)})</span>
              </label>
            </div>
            {!useStandardDeduction && (
              <InputField
                label="Itemized Deductions"
                value={itemizedDeductions}
                onChange={setItemizedDeductions}
              />
            )}
            <InputField
              label="SE Health Insurance Premium"
              value={selfEmployedHealthInsurance}
              onChange={setSelfEmployedHealthInsurance}
              help="Self-employed health insurance deduction"
            />
            <InputField
              label="401(k) Contribution Override"
              value={traditionalContribution}
              onChange={setTraditionalContribution}
              help="Leave 0 to use max contribution"
            />
          </div>
        </div>

        <div className="results-panel">
          <div className="summary-box">
            <h2>Summary</h2>
            <div className={`savings-display ${savings > 0 ? 'positive' : savings < 0 ? 'negative' : ''}`}>
              {savings > 0 ? (
                <>
                  <span className="savings-label">S-Corp Saves</span>
                  <span className="savings-amount">{formatCurrency(savings)}</span>
                </>
              ) : savings < 0 ? (
                <>
                  <span className="savings-label">Schedule C Saves</span>
                  <span className="savings-amount">{formatCurrency(Math.abs(savings))}</span>
                </>
              ) : (
                <span className="savings-label">No Difference</span>
              )}
            </div>
            <table className="summary-table">
              <tbody>
                <ResultRow
                  label="Total Federal Tax"
                  scheduleC={scheduleC.totalFederalTax}
                  sCorp={sCorp.totalFederalTax}
                  isTotal
                />
                <ResultRow
                  label="+ Employer FICA"
                  scheduleC={0}
                  sCorp={sCorp.employerFICA}
                />
                <ResultRow
                  label="Total Tax Cost"
                  scheduleC={scheduleC.totalFederalTax}
                  sCorp={sCorp.totalFederalTax + sCorp.employerFICA}
                  isTotal
                />
                <ResultRow
                  label="Effective Rate"
                  scheduleC={scheduleC.effectiveRate}
                  sCorp={sCorp.effectiveRate}
                  isCurrency={false}
                />
              </tbody>
            </table>
          </div>

          <ResultsSection
            title="Income"
            rows={[
              { label: "Business Income", scheduleC: scheduleC.grossBusinessIncome, sCorp: sCorp.grossBusinessIncome },
              { label: "W-2 Wages", scheduleC: scheduleC.w2Wages, sCorp: sCorp.w2Wages },
              { label: "Distributions/Profit", scheduleC: scheduleC.distributionOrProfit, sCorp: sCorp.distributionOrProfit },
              { label: "Other Income", scheduleC: scheduleC.otherIncome, sCorp: sCorp.otherIncome },
              { label: "Capital Gains", scheduleC: capitalGains, sCorp: capitalGains },
              { label: "Total Gross Income", scheduleC: scheduleC.totalGrossIncome, sCorp: sCorp.totalGrossIncome, isTotal: true },
            ]}
          />

          <ResultsSection
            title="Adjustments to Income"
            rows={[
              { label: "SE Tax Deduction (50%)", scheduleC: scheduleC.seDeduction, sCorp: sCorp.seDeduction },
              { label: "Retirement Contribution", scheduleC: scheduleC.retirementDeduction, sCorp: sCorp.retirementDeduction },
              { label: "Health Insurance", scheduleC: scheduleC.healthInsuranceDeduction, sCorp: sCorp.healthInsuranceDeduction },
              { label: "Total Adjustments", scheduleC: scheduleC.totalAdjustments, sCorp: sCorp.totalAdjustments, isTotal: true },
              { label: "AGI", scheduleC: scheduleC.agi, sCorp: sCorp.agi, isTotal: true },
            ]}
          />

          <div className="results-section">
            <h3>QBI Deduction</h3>
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Schedule C</th>
                  <th>S-Corp</th>
                </tr>
              </thead>
              <tbody>
                <ResultRow
                  label="Standard/Itemized"
                  scheduleC={scheduleC.standardOrItemized}
                  sCorp={sCorp.standardOrItemized}
                />
                <ResultRow
                  label="QBI Deduction"
                  scheduleC={scheduleC.qbiDeduction}
                  sCorp={sCorp.qbiDeduction}
                />
                <tr>
                  <td>Form Used</td>
                  <td className="number">{scheduleC.qbiDetails.useForm8995A ? '8995-A' : '8995'}</td>
                  <td className="number">{sCorp.qbiDetails.useForm8995A ? '8995-A' : '8995'}</td>
                </tr>
                <tr>
                  <td>Limiting Factor</td>
                  <td className="number" style={{ fontSize: '0.8rem' }}>{scheduleC.qbiDetails.limitingFactor}</td>
                  <td className="number" style={{ fontSize: '0.8rem' }}>{sCorp.qbiDetails.limitingFactor}</td>
                </tr>
                {(scheduleC.qbiDetails.useForm8995A || sCorp.qbiDetails.useForm8995A) && (
                  <>
                    <ResultRow
                      label="20% of QBI"
                      scheduleC={scheduleC.qbiDetails.qbiComponent}
                      sCorp={sCorp.qbiDetails.qbiComponent}
                    />
                    <ResultRow
                      label="50% W-2 Wage Limit"
                      scheduleC={scheduleC.qbiDetails.wageLimit}
                      sCorp={sCorp.qbiDetails.wageLimit}
                    />
                  </>
                )}
                <ResultRow
                  label="Total Deductions"
                  scheduleC={scheduleC.totalDeductions}
                  sCorp={sCorp.totalDeductions}
                  isTotal
                />
                <ResultRow
                  label="Taxable Income"
                  scheduleC={scheduleC.taxableOrdinaryIncome}
                  sCorp={sCorp.taxableOrdinaryIncome}
                  isTotal
                />
              </tbody>
            </table>
          </div>

          <ResultsSection
            title="Income Taxes"
            rows={[
              { label: "Ordinary Income Tax", scheduleC: scheduleC.ordinaryIncomeTax, sCorp: sCorp.ordinaryIncomeTax },
              { label: "Capital Gains Tax", scheduleC: scheduleC.capitalGainsTax, sCorp: sCorp.capitalGainsTax },
              { label: "Net Investment Income Tax", scheduleC: scheduleC.niit, sCorp: sCorp.niit },
              { label: "Total Income Tax", scheduleC: scheduleC.totalIncomeTax, sCorp: sCorp.totalIncomeTax, isTotal: true },
            ]}
          />

          <ResultsSection
            title="Payroll / Self-Employment Taxes"
            rows={[
              { label: "Social Security Tax", scheduleC: scheduleC.socialSecurityTax, sCorp: sCorp.socialSecurityTax },
              { label: "Medicare Tax", scheduleC: scheduleC.medicareTax, sCorp: sCorp.medicareTax },
              { label: "Additional Medicare Tax", scheduleC: scheduleC.additionalMedicareTax, sCorp: sCorp.additionalMedicareTax },
              { label: "Total Payroll/SE Tax", scheduleC: scheduleC.totalPayrollTax, sCorp: sCorp.totalPayrollTax, isTotal: true },
            ]}
          />

          <ResultsSection
            title="Retirement Contribution Limits"
            rows={[
              { label: "Employee Deferral", scheduleC: scheduleC.employeeDeferral, sCorp: sCorp.employeeDeferral },
              { label: "Employer Contribution", scheduleC: scheduleC.employerContribution, sCorp: sCorp.employerContribution },
              { label: "Max Total Contribution", scheduleC: scheduleC.maxRetirementContribution, sCorp: sCorp.maxRetirementContribution, isTotal: true },
            ]}
          />
        </div>
      </div>

      <footer>
        <p>
          This calculator provides estimates for educational purposes only.
          Consult a qualified tax professional for advice specific to your situation.
        </p>
      </footer>
    </div>
  );
}

export default App;

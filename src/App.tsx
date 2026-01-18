import { useState } from 'react'
import './App.css'
import { taxYears, availableYears } from './data';
import { calculateSelfEmploymentTax } from './utils/selfEmploymentTax';

function App() {
  const [taxYear, setTaxYear] = useState(2025);
  const [scheduleCIncome, setScheduleCIncome] = useState(331582);
  const [sCorpSalary, setSCorpSalary] = useState(95000);
  
  // Calculate SE tax based on user inputs
  const scheduleCResult = calculateSelfEmploymentTax(
    scheduleCIncome,
    0,
    taxYears[taxYear],
    'single'
  );

  const sCorpResult = calculateSelfEmploymentTax(
    sCorpSalary,
    0,
    taxYears[taxYear],
    'marriedFilingJointly'
  );

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>SE Tax Calculator</h1>
      
      {/* Tax Year Selection */}
      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          <strong>Tax Year:</strong>
        </label>
        <select 
          value={taxYear} 
          onChange={(e) => setTaxYear(Number(e.target.value))}
          style={{ 
            padding: '8px', 
            fontSize: '16px', 
            width: '200px',
            backgroundColor: '#1a1a1a',
            color: 'white',
            border: '1px solid #444'
          }}
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Schedule C Column */}
        <div>
          <h2>Schedule C</h2>
          
          {/* Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              <strong>Net Profit:</strong>
            </label>
            <input
              type="number"
              value={scheduleCIncome}
              onChange={(e) => setScheduleCIncome(Number(e.target.value))}
              style={{ 
                padding: '8px', 
                fontSize: '16px', 
                width: '100%',
                backgroundColor: '#1a1a1a',
                color: 'white',
                border: '1px solid #444'
              }}
            />
          </div>

          {/* Results */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#1a1a1a',
            border: '1px solid #444',
            borderRadius: '8px'
          }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p><strong>SE Income (92.35%):</strong> ${scheduleCResult.seIncome.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <p><strong>Social Security Tax:</strong> ${scheduleCResult.socialSecurityTax.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <p><strong>Medicare Tax:</strong> ${scheduleCResult.medicareTax.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <p><strong>Total SE Tax:</strong> ${scheduleCResult.totalSETax.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <p><strong>SE Deduction (Half):</strong> ${scheduleCResult.seDeduction.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
            <p><strong>Additional Medicare Tax:</strong> ${scheduleCResult.additionalMedicareTax.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <p style={{ 
              borderTop: '1px solid #444', 
              paddingTop: '10px',
              fontSize: '18px'
            }}>
              <strong>Total with Additional:</strong> ${scheduleCResult.totalWithAdditional.toLocaleString(undefined, {maximumFractionDigits: 0})}
            </p>
          </div>
        </div>

        {/* S-Corp Column */}
        <div>
          <h2>S-Corp (MFJ)</h2>
          
          {/* Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              <strong>Owner's Salary:</strong>
            </label>
            <input
              type="number"
              value={sCorpSalary}
              onChange={(e) => setSCorpSalary(Number(e.target.value))}
              style={{ 
                padding: '8px', 
                fontSize: '16px', 
                width: '100%',
                backgroundColor: '#1a1a1a',
                color: 'white',
                border: '1px solid #444'
              }}
            />
          </div>

          {/* Results */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#1a1a1a',
            border: '1px solid #444',
            borderRadius: '8px'
          }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p><strong>SE Income (92.35%):</strong> ${sCorpResult.seIncome.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <p><strong>Social Security Tax:</strong> ${sCorpResult.socialSecurityTax.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <p><strong>Medicare Tax:</strong> ${sCorpResult.medicareTax.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <p><strong>Total FICA:</strong> ${sCorpResult.totalSETax.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <p><strong>Employer Portion (Half):</strong> ${sCorpResult.seDeduction.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
            <p><strong>Additional Medicare Tax:</strong> ${sCorpResult.additionalMedicareTax.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <p style={{ 
              borderTop: '1px solid #444', 
              paddingTop: '10px',
              fontSize: '18px'
            }}>
              <strong>Total with Additional:</strong> ${sCorpResult.totalWithAdditional.toLocaleString(undefined, {maximumFractionDigits: 0})}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
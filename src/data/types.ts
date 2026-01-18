// types.ts - Defines the structure of our tax data

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export interface FilingStatus {
  brackets: TaxBracket[];
}

export interface SelfEmploymentRules {
  socialSecurityRate: number;
  medicareRate: number;
  additionalMedicareRate: number;
  seIncomeMultiplier: number;
  socialSecurityWageBase: number;
}

export interface AdditionalMedicareTaxThresholds {
  single: number;
  marriedFilingJointly: number;
  marriedFilingSeparately: number;
  headOfHousehold: number;
}

export interface RetirementLimits {
  employeeDeferralLimit: number;  
  catchUpLimit: number;           
  overall415cLimit: number;       
  compensationLimit: number;      
  profitSharingRate: number;      
}

export interface TaxYearRules {
  year: number;
  filingStatuses: {
    single: FilingStatus;
    marriedFilingJointly?: FilingStatus;
    headOfHousehold?: FilingStatus;
  };
  selfEmployment: SelfEmploymentRules;
  additionalMedicareTaxThresholds: AdditionalMedicareTaxThresholds;
  retirement: RetirementLimits;  
}
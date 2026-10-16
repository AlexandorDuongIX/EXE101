export type HealthMetricKind = 'blood-pressure' | 'heart-rate' | 'blood-glucose' | 'weight';
export type GlucoseUnit = 'mmol/L' | 'mg/dL';
export type GlucoseMealContext = 'fasting' | 'after-meal' | 'unspecified';
export type HealthHistoryWindow = 7 | 30 | 90;
export type SymptomSeverity = 'none' | 'mild' | 'moderate' | 'severe';

type HealthInputBase = {
  seniorId: string;
  recordedAt: string;
  note?: string;
};

export type HealthReadingInput = HealthInputBase & (
  | { kind: 'blood-pressure'; systolic: number; diastolic: number }
  | { kind: 'heart-rate' | 'weight'; value: number }
  | { kind: 'blood-glucose'; value: number; unit: GlucoseUnit; mealContext: GlucoseMealContext }
);

export type HealthReading = HealthReadingInput & {
  id: string;
  ownerId: string;
  createdAt: string;
};

export type SymptomEntryInput = {
  seniorId: string;
  recordedAt: string;
  symptoms: string[];
  severity: SymptomSeverity;
  notes?: string;
};

export type SymptomEntry = SymptomEntryInput & {
  id: string;
  ownerId: string;
  createdAt: string;
};

export type HealthSenior = Readonly<{ id: string; ownerId: string; fullName: string }>;

export type HealthChartPoint = {
  id: string;
  recordedAt: string;
  timestamp: number;
  value: number;
  // Blood pressure's diastolic value, paired with systolic at the same timestamp.
  secondaryValue?: number;
};

export interface HealthRepository {
  listReadings(): readonly HealthReading[];
  listSymptoms(): readonly SymptomEntry[];
  createReading(input: HealthReadingInput): HealthReading;
  createSymptoms(input: SymptomEntryInput): SymptomEntry;
}

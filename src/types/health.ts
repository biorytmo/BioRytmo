export type Gender = 'male' | 'female' | 'other';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'intense' | 'athlete';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  primaryGoal: 'longevity' | 'cholesterol_control' | 'gut_healing' | 'fat_loss' | 'energy';
  wakeTime: string; // e.g. "06:30"
  bedTime: string; // e.g. "22:30"
  baselineRestingHR?: number; // e.g. 65
}

export type ConditionCategory = 'metabolic' | 'gastrointestinal' | 'cardiovascular' | 'inflammatory' | 'intolerance';

export interface HealthCondition {
  id: string;
  code: string;
  name: string;
  category: ConditionCategory;
  severity: 'mild' | 'moderate' | 'severe';
  diagnosedAt?: string;
  notes?: string;
  labMarkersTriggered?: {
    marker: string;
    value: number;
    unit: string;
    referenceRange: string;
  }[];
}

export type SubstitutionMode = 'strict_cut' | 'enzymatic_supplement' | 'alternative_certified';

export interface UserSubstitutionPreference {
  intoleranceCode: string; // e.g. 'lactose', 'gluten', 'histamine'
  preferredMode: SubstitutionMode;
  notes?: string;
}

export interface WearableBiometrics {
  deviceId: string;
  deviceModel: 'Samsung Galaxy Fit 3' | 'Samsung Galaxy Watch' | 'Health Connect';
  timestamp: string;
  sleepScore: number; // 0 - 100
  totalSleepMinutes: number;
  deepSleepMinutes: number;
  remSleepMinutes: number;
  lightSleepMinutes: number;
  restingHeartRateBpm: number;
  baselineRestingHeartRateBpm: number;
  hrvRmssdMs?: number; // Heart Rate Variability
  stressLevel: 'low' | 'moderate' | 'high';
  stepsCount: number;
  activeCalories: number;
  recoveryStatus: 'optimal' | 'moderate' | 'depleted';
}

export interface NaturalSupplementProtocol {
  compound: string;
  dosage: string;
  evidenceGrade: 'A' | 'B' | 'C';
  timing: string;
  biologicalMechanism: string;
  safetyWarnings: string[];
}

export interface PathologyKnowledge {
  id: string;
  name: string;
  category: ConditionCategory;
  description: string;
  rootCauses: string[];
  whatHarms: {
    foods: string[];
    habits: string[];
    mechanisms: string[];
  };
  whatHelps: {
    foods: string[];
    habits: string[];
    functionalCompounds: string[];
  };
  naturalSupplements: NaturalSupplementProtocol[];
  circadianNutritionRules: {
    mealFrequency: string;
    maxVolumePerMealMl: number;
    recommendedWindow: string;
    gastricEmptyingNotes: string;
  };
  exerciseGuidance: {
    optimalTypes: string[];
    contraindicatedTypes: string[];
    maxIntensityPercentage: number;
    adaptationsForLowRecovery: string;
  };
  recommendedLabTests: {
    testName: string;
    loincCode?: string;
    repeatIntervalMonths: number;
    clinicalRationale: string;
    targetOptimalRange: string;
  }[];
}

// ==========================================
// MÓDULO DE MEDICAMENTOS & ESTOQUE INTELIGENTE
// ==========================================
export type MedicationType = 'continuous' | 'temporary';
export type ContinuousFrequency = 'daily' | 'alternate_days' | 'specific_weekdays';

export interface UserMedication {
  id: string;
  name: string;
  dosage: string; // ex: "50mg", "1 cápsula", "10 gotas"
  type: MedicationType;
  continuousFrequency?: ContinuousFrequency;
  specificDays?: number[]; // 0=Domingo, 1=Segunda, etc.
  intervalHours?: number; // ex: 8 (a cada 8 horas para uso temporário)
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (para uso temporário)
  times: string[]; // ex: ["08:00", "20:00"]
  currentStock: number; // unidades restantes no estoque
  minStockAlertDays?: number; // dias de antecedência para alertar compra (default: 5 dias)
  unit: string; // 'comprimidos' | 'cápsulas' | 'gotas' | 'sachês' | 'doses'
  instructions?: string; // "Tomar em jejum", "Com alimentos"
  category?: 'medication' | 'supplement';
  takenTodayCount?: number;
  lastTakenAt?: string;
}

export interface StockCalculationResult {
  medicationId: string;
  medicationName: string;
  type: MedicationType;
  dailyConsumptionRate: number; // unidades por dia
  daysRemaining: number;
  projectedStockOutDate: string;
  isLowStock: boolean;
  isTemporaryFinished: boolean;
  temporaryProgressPercentage: number;
  alertSeverity: 'none' | 'warning' | 'urgent';
  alertMessage: string;
  suggestedPurchaseQuantity: number;
}

export interface ShoppingListItem {
  id: string;
  medicationId: string;
  name: string;
  dosage: string;
  currentStock: number;
  daysRemaining: number;
  suggestedQuantity: number;
  urgency: 'urgent' | 'warning' | 'info';
  checked: boolean;
}

// ==========================================
// MÓDULO DE ONBOARDING WIZARD COMPLETO
// ==========================================
export interface OnboardingState {
  currentStep: number;
  personal: {
    name: string;
    birthDate: string;
    gender: Gender;
    heightCm: number;
    weightKg: number;
  };
  gutHealth: string[];
  mentalHealth: string[];
  chronicConditions: string[];
  medications: UserMedication[];
  wearables: {
    deviceModel: string;
    trackedMetrics: string[];
    manualOverride: boolean;
  };
  labFiles: {
    id: string;
    name: string;
    size: string;
    date: string;
    type: string;
  }[];
  goals: string[];
}

export interface RecommendationEngineOutput {
  date: string;
  autonomicReadinessScore: number;
  recoveryStatus: 'optimal' | 'moderate' | 'depleted';
  dailyWorkoutPrescription: {
    sessionName: string;
    adjustedType: string;
    originalType: string;
    intensity: 'restorative' | 'moderate' | 'high';
    durationMinutes: number;
    wearableTriggerRationale: string;
  };
  circadianNutritionPlan: {
    breakfast: { time: string; items: string[]; notes: string };
    lunch: { time: string; items: string[]; notes: string };
    afternoonSnack?: { time: string; items: string[]; notes: string };
    dinner: { time: string; items: string[]; notes: string };
    fastingWindow: string;
    hydrationTargetMl: number;
  };
  activeSupplementsSchedule: {
    supplement: string;
    dosage: string;
    timeSlot: 'jejum' | 'com_refeicao_manha' | 'com_almoco' | 'com_jantar' | 'antes_dormir';
    reason: string;
  }[];
  activeSubstitutionsApplied: {
    trigger: string;
    chosenMode: SubstitutionMode;
    practicalAction: string;
  }[];
  criticalLabAlerts: {
    testName: string;
    status: 'urgent' | 'due_soon' | 'up_to_date';
    dueDate: string;
    rationale: string;
  }[];
}


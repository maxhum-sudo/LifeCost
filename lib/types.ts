export interface QuizOption {
  id: string;
  label: string;
  baseCost?: number;
  multiplier?: number;
  sqft?: number;
}

export interface ConditionalRule {
  if: {
    question: string;
    answer: string;
  };
  multiply?: number;
  add?: number;
  onlyFor?: string[]; // Apply only to specific option IDs
}

export interface SliderConfig {
  min: number;
  max: number;
  step?: number;
  leftLabel: string;
  rightLabel: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  order: number;
  type?: 'multiple-choice' | 'slider';
  options?: QuizOption[];
  slider?: SliderConfig;
  conditionals?: ConditionalRule[];
  showIf?: {
    question: string;
    answer: string;
  };
}

export interface LocationPricing {
  suburb: number;
  cityCenter: number;
}

export interface QuizConfig {
  questions: QuizQuestion[];
  locationPricing?: {
    [key: string]: LocationPricing;
  };
  housingSqft?: number;
}

export interface QuizAnswer {
  questionId: string;
  optionId: string;
}

export interface CostBreakdown {
  questionId: string;
  questionText: string;
  optionId: string;
  optionLabel: string;
  baseCost: number;
  adjustedCost: number;
  adjustments: string[];
}

export interface QuizResult {
  totalCost: number;
  breakdown: CostBreakdown[];
}


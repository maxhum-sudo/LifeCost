import { QuizConfig, QuizQuestion, QuizAnswer, QuizResult, CostBreakdown, ConditionalRule } from './types';
import quizConfig from '../config/quiz-config.json';

interface LocationPricing {
  [key: string]: {
    suburb: number;
    cityCenter: number;
  };
}

export function getQuizConfig(): QuizConfig {
  return quizConfig as QuizConfig;
}

export function getQuestions(): QuizQuestion[] {
  const config = getQuizConfig();
  return config.questions.sort((a, b) => a.order - b.order);
}

export function getQuestionById(questionId: string): QuizQuestion | undefined {
  return getQuestions().find(q => q.id === questionId);
}

export function getQuestionByOrder(order: number): QuizQuestion | undefined {
  return getQuestions().find(q => q.order === order);
}

function checkCondition(rule: ConditionalRule, answers: Map<string, string>): boolean {
  const answerValue = answers.get(rule.if.question);
  return answerValue === rule.if.answer;
}

function applyConditional(
  cost: number,
  rule: ConditionalRule,
  optionId: string,
  answers: Map<string, string>
): number {
  if (!checkCondition(rule, answers)) {
    return cost;
  }

  // If onlyFor is specified, only apply to those options
  if (rule.onlyFor && !rule.onlyFor.includes(optionId)) {
    return cost;
  }

  let adjustedCost = cost;

  if (rule.multiply !== undefined) {
    adjustedCost = cost * rule.multiply;
  }

  if (rule.add !== undefined) {
    adjustedCost = cost + rule.add;
  }

  return adjustedCost;
}

function calculateHousingCost(answers: Map<string, string>): number {
  const config = getQuizConfig();
  const locationPricing = (config as any).locationPricing as LocationPricing;
  const defaultHousingSqft = (config as any).housingSqft || 1500;

  const location = answers.get('location');
  const commuteValue = answers.get('commute'); // 0-100 slider value
  const housingType = answers.get('housing_type');
  const homeAge = answers.get('home_age');

  if (!location || !commuteValue || !housingType || !homeAge) {
    return 0;
  }

  // Skip if location is "other"
  if (location === 'other' || !locationPricing[location]) {
    return 0;
  }

  // Convert slider value (0-100) to suburb/city center ratio
  // 0 = 100% suburb, 100 = 100% city center
  const sliderValue = parseFloat(commuteValue);
  const suburbRatio = (100 - sliderValue) / 100;
  const cityCenterRatio = sliderValue / 100;

  // Get base price per sqft based on location and commute preference
  const suburbPrice = locationPricing[location].suburb;
  const cityCenterPrice = locationPricing[location].cityCenter;
  const basePricePerSqft = (suburbPrice * suburbRatio) + (cityCenterPrice * cityCenterRatio);

  // Get housing type option to get sqft and multiplier
  const housingTypeQuestion = getQuestionById('housing_type');
  const housingTypeOption = housingTypeQuestion?.options?.find(opt => opt.id === housingType);
  const housingTypeMultiplier = housingTypeOption?.multiplier || 1.0;
  const housingSqft = housingTypeOption?.sqft || defaultHousingSqft;

  // Apply home age multiplier
  const homeAgeQuestion = getQuestionById('home_age');
  const homeAgeOption = homeAgeQuestion?.options?.find(opt => opt.id === homeAge);
  const homeAgeMultiplier = homeAgeOption?.multiplier || 1.0;

  // Calculate total home price (price per sqft * sqft * multipliers)
  const totalHomePrice = basePricePerSqft * housingSqft * housingTypeMultiplier * homeAgeMultiplier;

  // Mortgage calculation: 25 years at 4% interest
  const principal = totalHomePrice;
  const annualInterestRate = 0.04; // 4%
  const monthlyInterestRate = annualInterestRate / 12;
  const numberOfPayments = 25 * 12; // 25 years * 12 months = 300 payments

  // Conventional mortgage formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const monthlyPayment = principal * 
    (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

  // Convert to annual cost
  const annualCost = monthlyPayment * 12;

  return Math.round(annualCost);
}

function calculateTransportationCost(answers: Map<string, string>): number {
  const numCars = answers.get('num_cars');
  const carUsage = answers.get('car_usage');
  const noCarTransport = answers.get('no_car_transport');

  if (!numCars) {
    return 0;
  }

  // If 0 cars, use the no_car_transport answer
  if (numCars === '0') {
    if (!noCarTransport) {
      return 0;
    }
    const question = getQuestionById('no_car_transport');
    const option = question?.options?.find(opt => opt.id === noCarTransport);
    return option?.baseCost || 0;
  }

  // Calculate cost based on number of cars
  const numCarsInt = parseInt(numCars);
  if (isNaN(numCarsInt) || numCarsInt <= 0) {
    return 0;
  }

  // Base cost for 1 car
  const baseCarCost = 12000;

  // If 1 car, apply usage multiplier
  if (numCarsInt === 1 && carUsage) {
    const question = getQuestionById('car_usage');
    const option = question?.options?.find(opt => opt.id === carUsage);
    const usageMultiplier = option?.multiplier || 1.0;
    return Math.round(baseCarCost * usageMultiplier);
  }

  // For 2+ cars, multiply base cost by number of cars
  return baseCarCost * numCarsInt;
}

export function calculateCost(answers: QuizAnswer[]): QuizResult {
  const answerMap = new Map<string, string>();
  answers.forEach(answer => {
    answerMap.set(answer.questionId, answer.optionId);
  });

  const questions = getQuestions();
  const breakdown: CostBreakdown[] = [];
  let totalCost = 0;

  questions.forEach(question => {
    // Skip conditional questions that don't apply
    if (question.showIf) {
      const conditionAnswer = answerMap.get(question.showIf.question);
      if (conditionAnswer !== question.showIf.answer) {
        return; // Skip this question
      }
    }

    const answer = answers.find(a => a.questionId === question.id);
    if (!answer) {
      return; // Skip unanswered questions
    }

    // Special handling for housing calculation
    if (question.id === 'housing_type' || question.id === 'commute' || question.id === 'home_age') {
      // These are part of housing calculation, handled separately
      if (question.id === 'housing_type') {
        // Calculate housing cost when we have all components
        const location = answerMap.get('location');
        const commute = answerMap.get('commute');
        const housingType = answerMap.get('housing_type');
        const homeAge = answerMap.get('home_age');

        if (location && commute && housingType && homeAge) {
          const housingCost = calculateHousingCost(answerMap);
          breakdown.push({
            questionId: 'housing',
            questionText: 'Housing Cost',
            optionId: `${housingType}_${homeAge}`,
            optionLabel: `${getQuestionById('housing_type')?.options?.find(o => o.id === housingType)?.label || ''} - ${getQuestionById('home_age')?.options?.find(o => o.id === homeAge)?.label || ''}`,
            baseCost: 0,
            adjustedCost: housingCost,
            adjustments: [
              `Based on location: ${getQuestionById('location')?.options?.find(o => o.id === location)?.label || ''}`,
              `Commute preference: ${parseFloat(commute)}% city center`,
            ],
          });
          totalCost += housingCost;
        }
      }
      return; // Don't add these questions individually to breakdown
    }

    // Special handling for transportation
    if (question.id === 'num_cars') {
      const transportCost = calculateTransportationCost(answerMap);
      const numCars = answerMap.get('num_cars');
      let label = `${numCars} car${numCars !== '1' ? 's' : ''}`;
      
      if (numCars === '0') {
        const noCarTransport = answerMap.get('no_car_transport');
        const transportOption = getQuestionById('no_car_transport')?.options?.find(o => o.id === noCarTransport);
        label = transportOption?.label || 'No car';
      } else if (numCars === '1') {
        const carUsage = answerMap.get('car_usage');
        const usageOption = getQuestionById('car_usage')?.options?.find(o => o.id === carUsage);
        if (usageOption) {
          label = `1 car (${usageOption.label})`;
        }
      }

      breakdown.push({
        questionId: 'transportation',
        questionText: 'Transportation',
        optionId: numCars || '',
        optionLabel: label,
        baseCost: 0,
        adjustedCost: transportCost,
        adjustments: [],
      });
      totalCost += transportCost;
      return;
    }

    // Skip conditional questions that are part of other calculations
    if (question.id === 'no_car_transport' || question.id === 'car_usage') {
      return; // Already handled in transportation calculation
    }

    // Special handling for location question - show multiplier instead of $0
    if (question.id === 'location') {
      const option = question.options?.find(opt => opt.id === answer.optionId);
      if (!option) {
        return;
      }

      // Find the multiplier for this location from other questions (like food)
      let locationMultiplier = 1.0;
      const foodQuestion = getQuestionById('food');
      if (foodQuestion?.conditionals) {
        const locationRule = foodQuestion.conditionals.find(
          rule => rule.if.question === 'location' && rule.if.answer === answer.optionId
        );
        if (locationRule?.multiply) {
          locationMultiplier = locationRule.multiply;
        }
      }

      breakdown.push({
        questionId: question.id,
        questionText: question.text,
        optionId: option.id,
        optionLabel: option.label,
        baseCost: 0,
        adjustedCost: locationMultiplier, // Show multiplier instead of $0
        adjustments: locationMultiplier !== 1.0 ? [`${locationMultiplier.toFixed(2)}x cost multiplier`] : [],
      });

      // Don't add to total cost since location doesn't have a direct cost
      return;
    }

    // Regular question handling
    const option = question.options?.find(opt => opt.id === answer.optionId);
    if (!option) {
      return;
    }

    let cost = option.baseCost || 0;
    const adjustments: string[] = [];

    // Apply multipliers if present
    if (option.multiplier !== undefined) {
      cost = cost * option.multiplier;
    }

    // Apply all conditional rules
    if (question.conditionals) {
      question.conditionals.forEach(rule => {
        const originalCost = cost;
        cost = applyConditional(cost, rule, option.id, answerMap);

        if (cost !== originalCost) {
          const dependentQuestion = getQuestionById(rule.if.question);
          const dependentAnswer = answerMap.get(rule.if.question);
          const dependentOption = dependentQuestion?.options?.find(opt => opt.id === dependentAnswer);
          
          if (rule.multiply !== undefined) {
            adjustments.push(
              `×${rule.multiply.toFixed(2)} (based on ${dependentQuestion?.text}: ${dependentOption?.label})`
            );
          }
          if (rule.add !== undefined) {
            adjustments.push(
              `+$${rule.add.toLocaleString()} (based on ${dependentQuestion?.text}: ${dependentOption?.label})`
            );
          }
        }
      });
    }

    breakdown.push({
      questionId: question.id,
      questionText: question.text,
      optionId: option.id,
      optionLabel: option.label,
      baseCost: option.baseCost || 0,
      adjustedCost: cost,
      adjustments,
    });

    totalCost += cost;
  });

  return {
    totalCost,
    breakdown,
  };
}

export function getNextQuestionId(currentQuestionId?: string, answers?: Map<string, string>): string | null {
  const questions = getQuestions();
  
  if (!currentQuestionId) {
    return questions[0]?.id || null;
  }

  const currentIndex = questions.findIndex(q => q.id === currentQuestionId);
  if (currentIndex === -1) {
    return null;
  }

  // Find next visible question
  for (let i = currentIndex + 1; i < questions.length; i++) {
    const question = questions[i];
    
    // Check if question should be shown
    if (question.showIf && answers) {
      const conditionAnswer = answers.get(question.showIf.question);
      if (conditionAnswer !== question.showIf.answer) {
        continue; // Skip this question
      }
    }
    
    return question.id;
  }

  return null; // No more questions
}

export function getPreviousQuestionId(currentQuestionId: string, answers?: Map<string, string>): string | null {
  const questions = getQuestions();
  const currentIndex = questions.findIndex(q => q.id === currentQuestionId);
  
  if (currentIndex <= 0) {
    return null;
  }

  // Find previous visible question
  for (let i = currentIndex - 1; i >= 0; i--) {
    const question = questions[i];
    
    // Check if question should be shown
    if (question.showIf && answers) {
      const conditionAnswer = answers.get(question.showIf.question);
      if (conditionAnswer !== question.showIf.answer) {
        continue; // Skip this question
      }
    }
    
    return question.id;
  }

  return null;
}

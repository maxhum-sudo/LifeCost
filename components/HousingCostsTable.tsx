'use client';

import { getQuestionById, getQuizConfig } from '@/lib/quiz-engine';
import { QuizAnswer } from '@/lib/types';

interface HousingCostsTableProps {
  answers: QuizAnswer[];
}

// Helper function to calculate housing cost (copied from quiz-engine logic)
function calculateHousingCostForType(
  location: string,
  commuteValue: string,
  housingTypeId: string,
  homeAge: string
): number {
  try {
    const quizConfig = getQuizConfig() as any;
    const locationPricing = quizConfig?.locationPricing;
    const defaultHousingSqft = quizConfig?.housingSqft || 1500;

    if (!locationPricing || !locationPricing[location]) {
      return 0;
    }

    // Convert slider value (0-100) to suburb/city center ratio
    const sliderValue = parseFloat(commuteValue);
    if (isNaN(sliderValue)) return 0;
    
    const suburbRatio = (100 - sliderValue) / 100;
    const cityCenterRatio = sliderValue / 100;

    // Get base price per sqft
    const suburbPrice = locationPricing[location].suburb;
    const cityCenterPrice = locationPricing[location].cityCenter;
    const basePricePerSqft = (suburbPrice * suburbRatio) + (cityCenterPrice * cityCenterRatio);

    // Get housing type details
    const housingTypeQuestion = getQuestionById('housing_type');
    const housingTypeOption = housingTypeQuestion?.options?.find(opt => opt.id === housingTypeId);
    const housingTypeMultiplier = housingTypeOption?.multiplier || 1.0;
    const housingSqft = housingTypeOption?.sqft || defaultHousingSqft;

    // Get home age multiplier
    const homeAgeQuestion = getQuestionById('home_age');
    const homeAgeOption = homeAgeQuestion?.options?.find(opt => opt.id === homeAge);
    const homeAgeMultiplier = homeAgeOption?.multiplier || 1.0;

    // Calculate total home price
    const totalHomePrice = basePricePerSqft * housingSqft * housingTypeMultiplier * homeAgeMultiplier;

    // Mortgage calculation: 25 years at 4% interest
    const principal = totalHomePrice;
    const annualInterestRate = 0.04;
    const monthlyInterestRate = annualInterestRate / 12;
    const numberOfPayments = 25 * 12;

    // Conventional mortgage formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const monthlyPayment = principal * 
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

    // Convert to annual cost
    const annualCost = monthlyPayment * 12;

    return Math.round(annualCost);
  } catch (error) {
    console.error('Error calculating housing cost:', error);
    return 0;
  }
}

export default function HousingCostsTable({ answers }: HousingCostsTableProps) {
  // Safety check
  if (!answers || answers.length === 0) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  try {
    // Get user's answers
    const answerMap = new Map<string, string>();
    answers.forEach(answer => {
      if (answer && answer.questionId && answer.optionId) {
        answerMap.set(answer.questionId, answer.optionId);
      }
    });

    const location = answerMap.get('location');
    const commuteValue = answerMap.get('commute');
    const homeAge = answerMap.get('home_age');

    // If we don't have the required answers, don't show the table
    if (!location || !commuteValue || !homeAge || location === 'other') {
      return null;
    }

  // Get all housing types
  let housingTypeQuestion;
  try {
    housingTypeQuestion = getQuestionById('housing_type');
  } catch (error) {
    console.error('Error getting housing type question:', error);
    return null;
  }
  
  if (!housingTypeQuestion?.options) {
    return null;
  }

  // Calculate cost for each housing type
  const housingCosts = housingTypeQuestion.options.map(option => {
    try {
      const cost = calculateHousingCostForType(location, commuteValue, option.id, homeAge);
      
      return {
        type: option.label,
        sqft: option.sqft || 0,
        annualCost: cost,
        monthlyCost: Math.round(cost / 12),
        id: option.id,
      };
    } catch (error) {
      console.error('Error calculating cost for housing type:', option.id, error);
      return {
        type: option.label,
        sqft: option.sqft || 0,
        annualCost: 0,
        monthlyCost: 0,
        id: option.id,
      };
    }
  });

  // Find the selected housing type
  const selectedHousingType = answerMap.get('housing_type');
  const selectedIndex = housingCosts.findIndex(cost => cost.id === selectedHousingType);

  return (
    <div className="w-full overflow-x-auto">
      <h3 className="text-xl font-bold mb-4 text-gray-900">Housing Costs by Type</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b-2 border-gray-300">
            <th className="text-left p-3 font-semibold text-gray-900">Housing Type</th>
            <th className="text-right p-3 font-semibold text-gray-900">Square Feet</th>
            <th className="text-right p-3 font-semibold text-gray-900">Monthly Cost</th>
            <th className="text-right p-3 font-semibold text-gray-900">Annual Cost</th>
          </tr>
        </thead>
        <tbody>
          {housingCosts.map((housing, index) => (
            <tr
              key={index}
              className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                index === selectedIndex ? 'bg-blue-50 font-semibold' : ''
              }`}
            >
              <td className="p-3 text-gray-900">
                {housing.type}
                {index === selectedIndex && (
                  <span className="ml-2 text-xs text-blue-600 font-normal">(Your Selection)</span>
                )}
              </td>
              <td className="p-3 text-right text-gray-700">{housing.sqft.toLocaleString()} sqft</td>
              <td className="p-3 text-right text-gray-900 font-medium">
                {formatCurrency(housing.monthlyCost)}
              </td>
              <td className="p-3 text-right text-gray-900 font-bold">
                {formatCurrency(housing.annualCost)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  } catch (error) {
    console.error('Error rendering HousingCostsTable:', error);
    return null;
  }
}


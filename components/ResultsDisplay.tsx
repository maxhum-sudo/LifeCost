'use client';

import { QuizResult, QuizAnswer } from '@/lib/types';
import CostBreakdown from './CostBreakdown';
import ExpensePieChart from './ExpensePieChart';
import HousingCostsTable from './HousingCostsTable';

interface ResultsDisplayProps {
  result: QuizResult;
  answers?: QuizAnswer[];
  onRetake?: () => void;
}

export default function ResultsDisplay({ result, answers, onRetake }: ResultsDisplayProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const monthlyCost = Math.round(result.totalCost / 12);
  const weeklyCost = Math.round(result.totalCost / 52);
  const dailyCost = Math.round(result.totalCost / 365);

  // Calculate pre-tax income required (30% flat tax)
  // If after-tax cost is X, and tax is 30%, then: preTaxIncome * 0.70 = X
  // Therefore: preTaxIncome = X / 0.70
  const preTaxIncomeRequired = Math.round(result.totalCost / 0.70);
  const taxAmount = preTaxIncomeRequired - result.totalCost;

  // Calculate largest expense category
  const largestExpense = result.breakdown.reduce((max, item) => 
    item.adjustedCost > max.adjustedCost ? item : max
  , result.breakdown[0]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            Your Annual Cost Estimate
          </h1>
          <p className="text-lg text-gray-600">
            Based on your lifestyle choices
          </p>
        </div>

        {/* Main Total Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-8 mb-8 shadow-lg">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              Total Annual Cost (After Tax)
            </p>
            <p className="text-6xl font-bold text-blue-600 mb-4">
              {formatCurrency(result.totalCost)}
            </p>
            <div className="flex justify-center gap-6 text-sm text-gray-600 mb-6">
              <div>
                <span className="font-semibold">Monthly:</span> {formatCurrency(monthlyCost)}
              </div>
              <div>
                <span className="font-semibold">Weekly:</span> {formatCurrency(weeklyCost)}
              </div>
              <div>
                <span className="font-semibold">Daily:</span> {formatCurrency(dailyCost)}
              </div>
            </div>
            
            {/* Pre-tax Income Required */}
            <div className="bg-white/60 rounded-xl p-6 border border-blue-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Pre-Tax Income Required (30% Tax)
              </p>
              <p className="text-4xl font-bold text-indigo-600 mb-2">
                {formatCurrency(preTaxIncomeRequired)}
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">After-tax income:</span> {formatCurrency(result.totalCost)}
                </p>
                <p>
                  <span className="font-medium">Estimated tax (30%):</span> {formatCurrency(taxAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Categories</p>
            <p className="text-2xl font-bold text-gray-900">{result.breakdown.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Largest Expense</p>
            <p className="text-lg font-bold text-gray-900 truncate" title={largestExpense.questionText}>
              {formatCurrency(largestExpense.adjustedCost)}
            </p>
            <p className="text-xs text-gray-500 mt-1 truncate">{largestExpense.questionText}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Average per Category</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(Math.round(result.totalCost / result.breakdown.length))}
            </p>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <ExpensePieChart breakdown={result.breakdown} />
        </div>

        {/* Housing Costs Table */}
        {answers && answers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <HousingCostsTable answers={answers} />
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <CostBreakdown breakdown={result.breakdown} />
        </div>

        {/* Actions */}
        <div className="text-center space-y-4">
          {onRetake && (
            <button
              onClick={onRetake}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-md hover:shadow-lg"
            >
              Retake Quiz
            </button>
          )}
          <p className="text-sm text-gray-500">
            Your results have been saved. You can retake the quiz anytime to explore different scenarios.
          </p>
        </div>
      </div>
    </div>
  );
}


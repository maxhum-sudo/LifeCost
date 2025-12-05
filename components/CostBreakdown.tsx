'use client';

import { CostBreakdown as CostBreakdownType } from '@/lib/types';

interface CostBreakdownProps {
  breakdown: CostBreakdownType[];
}

export default function CostBreakdown({ breakdown }: CostBreakdownProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4 text-gray-900">Cost Breakdown</h3>
      {breakdown.map((item, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{item.questionText}</h4>
              <p className="text-sm text-gray-600 mt-1">{item.optionLabel}</p>
            </div>
            <div className="text-right ml-4">
              {item.questionId === 'location' ? (
                <p className="text-lg font-bold text-gray-900">
                  {item.adjustedCost.toFixed(2)}x
                </p>
              ) : (
                <>
                  <p className="text-lg font-bold text-gray-900">
                    ${item.adjustedCost.toLocaleString()}
                  </p>
                  {item.baseCost !== item.adjustedCost && item.baseCost > 0 && (
                    <p className="text-xs text-gray-500 line-through">
                      ${item.baseCost.toLocaleString()}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          {item.adjustments.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-600 font-medium">Adjustments:</p>
              <ul className="mt-1 space-y-1">
                {item.adjustments.map((adjustment, idx) => (
                  <li key={idx} className="text-xs text-gray-600">
                    • {adjustment}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


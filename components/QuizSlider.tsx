'use client';

import { useState, useEffect } from 'react';

interface QuizSliderProps {
  min: number;
  max: number;
  step?: number;
  leftLabel: string;
  rightLabel: string;
  value?: number;
  onChange: (value: number) => void;
  displayAsMinutes?: boolean;
  minMinutes?: number;
  maxMinutes?: number;
}

export default function QuizSlider({
  min,
  max,
  step = 1,
  leftLabel,
  rightLabel,
  value: externalValue,
  onChange,
  displayAsMinutes = false,
  minMinutes = 90,
  maxMinutes = 5,
}: QuizSliderProps) {
  const [value, setValue] = useState(externalValue ?? (min + max) / 2);

  useEffect(() => {
    if (externalValue !== undefined) {
      setValue(externalValue);
    }
  }, [externalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setValue(newValue);
    onChange(newValue);
  };

  const percentage = ((value - min) / (max - min)) * 100;
  
  // Convert slider value to minutes (inverse: 0 = minMinutes (90), 100 = maxMinutes (5))
  // Formula: minutes = minMinutes - (slider_position * (minMinutes - maxMinutes))
  const minutes = displayAsMinutes 
    ? Math.round(minMinutes - ((value - min) / (max - min)) * (minMinutes - maxMinutes))
    : null;

  return (
    <div className="w-full">
      <div className="flex justify-between mb-4">
        <span className="text-sm font-medium text-gray-700">
          {displayAsMinutes ? `${leftLabel} (${minMinutes} min)` : leftLabel}
        </span>
        <span className="text-sm font-medium text-gray-700">
          {displayAsMinutes ? `${rightLabel} (${maxMinutes} min)` : rightLabel}
        </span>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`,
          }}
        />
        <div
          className="absolute top-0 h-3 bg-blue-600 rounded-l-lg pointer-events-none"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-4 text-center">
        <div className="inline-block bg-blue-50 border-2 border-blue-200 rounded-lg px-6 py-3">
          <p className="text-sm text-gray-600 mb-1">Selected Value</p>
          {displayAsMinutes && minutes !== null ? (
            <>
              <p className="text-2xl font-bold text-blue-600">{minutes} min</p>
              <p className="text-xs text-gray-500 mt-1">
                {minutes > 45 ? 'Suburb (Longer commute)' : minutes > 20 ? 'Mixed area' : 'City center (Shorter commute)'}
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-blue-600">{Math.round(value)}%</p>
              <p className="text-xs text-gray-500 mt-1">
                {percentage < 50 ? 'Suburb preference' : 'City center preference'}
              </p>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}


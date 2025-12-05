'use client';

import { QuizQuestion as QuizQuestionType } from '@/lib/types';
import QuizSlider from './QuizSlider';

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedOptionId?: string;
  selectedSliderValue?: number;
  onSelect: (optionId: string) => void;
  onSliderChange?: (value: number) => void;
  onNext: () => void;
  onPrevious?: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLastQuestion?: boolean;
  locationAnswer?: string; // For commute question to adjust range
}

// Get min minutes based on city
function getMinMinutesForCity(cityId?: string): number {
  const cityMinutes: { [key: string]: number } = {
    'yyc': 60,  // Calgary
    'yyz': 90,  // Toronto
    'yvr': 75,  // Vancouver
    'yul': 75,  // Montreal
  };
  return cityMinutes[cityId || ''] || 90; // Default to 90 if city not found
}

export default function QuizQuestion({
  question,
  selectedOptionId,
  selectedSliderValue,
  onSelect,
  onSliderChange,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isLastQuestion = false,
  locationAnswer,
}: QuizQuestionProps) {
  const questionType = question.type || 'multiple-choice';
  const hasSelection = questionType === 'slider' 
    ? selectedSliderValue !== undefined 
    : selectedOptionId !== undefined;

  // Get city-specific min minutes for commute question
  const minMinutes = question.id === 'commute' 
    ? getMinMinutesForCity(locationAnswer)
    : 90;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">{question.text}</h2>
      
      {questionType === 'slider' && question.slider ? (
        <div className="mb-8">
          <QuizSlider
            min={question.slider.min}
            max={question.slider.max}
            step={question.slider.step}
            leftLabel={question.slider.leftLabel}
            rightLabel={question.slider.rightLabel}
            value={selectedSliderValue}
            onChange={(value) => {
              if (onSliderChange) {
                onSliderChange(value);
              }
            }}
            displayAsMinutes={question.id === 'commute'}
            minMinutes={minMinutes}
            maxMinutes={5}
          />
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {question.options?.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedOptionId === option.id
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{option.label}</span>
                {selectedOptionId === option.id && (
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        {canGoPrevious && onPrevious && (
          <button
            onClick={onPrevious}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>
        )}
        <div className="flex-1" />
        {canGoNext && (
          <button
            onClick={onNext}
            disabled={!hasSelection}
            className={`px-6 py-2 rounded-lg transition-colors font-medium ${
              hasSelection
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLastQuestion ? 'See Results' : 'Next'}
          </button>
        )}
      </div>
    </div>
  );
}


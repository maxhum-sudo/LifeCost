'use client';

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
}

export default function QuizProgress({
  currentQuestion,
  totalQuestions,
}: QuizProgressProps) {
  const percentage = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-6 pt-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Question {currentQuestion} of {totalQuestions}
        </span>
        <span className="text-sm font-medium text-gray-700">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}


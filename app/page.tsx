'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getQuestions, getNextQuestionId } from '@/lib/quiz-engine';

export default function Home() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    const questionsList = getQuestions();
    setQuestions(questionsList);
  }, []);

  const handleStart = () => {
    const firstQuestionId = getNextQuestionId();
    if (firstQuestionId) {
      router.push(`/quiz/${firstQuestionId}`);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">
          LifeCost Quiz
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover your annual cost of living based on your lifestyle choices
        </p>
        <p className="text-gray-500 mb-12">
          Answer a few questions about your housing, transportation, food, and more.
          We&apos;ll calculate your estimated annual costs.
        </p>
        <button
          onClick={handleStart}
          className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          Start Quiz
        </button>
        {questions.length > 0 && (
          <p className="mt-6 text-sm text-gray-500">
            {questions.length} questions • Takes about 2 minutes
          </p>
        )}
      </div>
    </main>
  );
}


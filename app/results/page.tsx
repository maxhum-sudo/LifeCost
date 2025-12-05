'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { QuizResult, QuizAnswer } from '@/lib/types';
import ResultsDisplay from '@/components/ResultsDisplay';

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load result from localStorage first
    const savedResult = localStorage.getItem('quizResult');
    if (savedResult) {
      try {
        const parsed = JSON.parse(savedResult);
        setResult(parsed);
        
        // Try to load answers from localStorage (check both keys)
        const savedAnswers = localStorage.getItem('quizAnswersForResults') || localStorage.getItem('quizAnswers');
        if (savedAnswers) {
          try {
            const answerParsed = JSON.parse(savedAnswers);
            // Check if it's already an array or needs conversion
            let answerArray: QuizAnswer[];
            if (Array.isArray(answerParsed)) {
              answerArray = answerParsed;
            } else {
              answerArray = Object.entries(answerParsed).map(([questionId, optionId]) => ({
                questionId,
                optionId: optionId as string,
              }));
            }
            setAnswers(answerArray);
          } catch (e) {
            console.error('Error parsing saved answers:', e);
          }
        }
        
        setLoading(false);
        return;
      } catch (e) {
        console.error('Error parsing saved result:', e);
      }
    }

    // Try to load from sessionId if available
    const sessionId = localStorage.getItem('quizSessionId');
    if (sessionId) {
      fetch(`/api/results?sessionId=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.result) {
            setResult(data.result);
            if (data.answers) {
              // Convert database answers to QuizAnswer format
              const answerArray: QuizAnswer[] = data.answers.map((a: any) => ({
                questionId: a.questionId,
                optionId: a.optionId,
              }));
              setAnswers(answerArray);
            }
          } else {
            router.push('/');
          }
        })
        .catch(() => {
          router.push('/');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Try to load answers from localStorage
      const savedAnswers = localStorage.getItem('quizAnswers');
      if (savedAnswers) {
        try {
          const parsed = JSON.parse(savedAnswers);
          const answerArray: QuizAnswer[] = Object.entries(parsed).map(([questionId, optionId]) => ({
            questionId,
            optionId: optionId as string,
          }));
          setAnswers(answerArray);
        } catch (e) {
          console.error('Error parsing saved answers:', e);
        }
      }
      router.push('/');
    }
  }, [router]);

  const handleRetake = () => {
    localStorage.removeItem('quizResult');
    localStorage.removeItem('quizSessionId');
    localStorage.removeItem('quizAnswers');
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading results...</p>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No results found.</p>
          <button
            onClick={handleRetake}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start New Quiz
          </button>
        </div>
      </main>
    );
  }

  return (
    <ResultsDisplay result={result} answers={answers} onRetake={handleRetake} />
  );
}


'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getQuestionById, getNextQuestionId, getPreviousQuestionId, getQuestions } from '@/lib/quiz-engine';
import { QuizQuestion as QuizQuestionType, QuizAnswer } from '@/lib/types';
import QuizQuestion from '@/components/QuizQuestion';
import QuizProgress from '@/components/QuizProgress';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params.id as string;

  const [question, setQuestion] = useState<QuizQuestionType | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>();
  const [selectedSliderValue, setSelectedSliderValue] = useState<number | undefined>();
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Get visible questions based on answers
  const getVisibleQuestions = (answerMap: Map<string, string>) => {
    const allQuestions = getQuestions();
    return allQuestions.filter(q => {
      if (q.showIf) {
        const conditionAnswer = answerMap.get(q.showIf.question);
        return conditionAnswer === q.showIf.answer;
      }
      return true;
    });
  };

  useEffect(() => {
    // Load answers from localStorage
    let answerMap = new Map<string, string>();
    const savedAnswers = localStorage.getItem('quizAnswers');
    if (savedAnswers) {
      try {
        const parsed = JSON.parse(savedAnswers);
        answerMap = new Map(Object.entries(parsed));
        setAnswers(answerMap);
        
        const currentAnswer = answerMap.get(questionId);
        if (currentAnswer) {
          // Check if it's a slider value (numeric)
          const numValue = parseFloat(currentAnswer);
          if (!isNaN(numValue)) {
            setSelectedSliderValue(numValue);
            setSelectedOptionId(undefined);
          } else {
            setSelectedOptionId(currentAnswer);
            setSelectedSliderValue(undefined);
          }
        } else {
          // Reset selections if no answer for this question
          setSelectedOptionId(undefined);
          setSelectedSliderValue(undefined);
        }
      } catch (e) {
        console.error('Error loading answers:', e);
      }
    }

    // Load question
    const currentQuestion = getQuestionById(questionId);
    if (!currentQuestion) {
      router.push('/');
      return;
    }

    // Check if question should be shown
    if (currentQuestion.showIf) {
      const conditionAnswer = answerMap.get(currentQuestion.showIf.question);
      if (conditionAnswer !== currentQuestion.showIf.answer) {
        // Question shouldn't be shown, redirect to next
        const nextId = getNextQuestionId(questionId, answerMap);
        if (nextId) {
          router.push(`/quiz/${nextId}`);
        } else {
          router.push('/');
        }
        return;
      }
    }

    setQuestion(currentQuestion);

    // Set progress based on visible questions
    const visibleQuestions = getVisibleQuestions(answerMap);
    setTotalQuestions(visibleQuestions.length);
    const visibleIndex = visibleQuestions.findIndex(q => q.id === questionId);
    setCurrentQuestionIndex(visibleIndex >= 0 ? visibleIndex + 1 : 1);
  }, [questionId, router]);

  const handleSelect = (optionId: string) => {
    setSelectedOptionId(optionId);
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, optionId);
    setAnswers(newAnswers);
    
    // Save to localStorage
    localStorage.setItem('quizAnswers', JSON.stringify(Object.fromEntries(newAnswers)));
  };

  const handleSliderChange = (value: number) => {
    setSelectedSliderValue(value);
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, value.toString());
    setAnswers(newAnswers);
    
    // Save to localStorage
    localStorage.setItem('quizAnswers', JSON.stringify(Object.fromEntries(newAnswers)));
  };

  const handleNext = () => {
    const questionType = question?.type || 'multiple-choice';
    const hasSelection = questionType === 'slider' 
      ? selectedSliderValue !== undefined 
      : selectedOptionId !== undefined;

    if (!hasSelection) return;

    // Save current answer if not already saved
    const newAnswers = new Map(answers);
    if (questionType === 'slider' && selectedSliderValue !== undefined) {
      newAnswers.set(questionId, selectedSliderValue.toString());
    } else if (selectedOptionId) {
      newAnswers.set(questionId, selectedOptionId);
    }
    setAnswers(newAnswers);
    localStorage.setItem('quizAnswers', JSON.stringify(Object.fromEntries(newAnswers)));

    const nextQuestionId = getNextQuestionId(questionId, newAnswers);
    if (nextQuestionId) {
      router.push(`/quiz/${nextQuestionId}`);
    } else {
      // Last question - calculate and go to results
      calculateAndNavigate(newAnswers);
    }
  };

  const handlePrevious = () => {
    const previousQuestionId = getPreviousQuestionId(questionId, answers);
    if (previousQuestionId) {
      router.push(`/quiz/${previousQuestionId}`);
    }
  };

  const calculateAndNavigate = async (finalAnswersMap?: Map<string, string>) => {
    try {
      // Ensure current answer is saved
      const finalAnswers = finalAnswersMap || new Map(answers);
      const questionType = question?.type || 'multiple-choice';
      
      if (questionType === 'slider' && selectedSliderValue !== undefined) {
        finalAnswers.set(questionId, selectedSliderValue.toString());
      } else if (selectedOptionId) {
        finalAnswers.set(questionId, selectedOptionId);
      }
      
      localStorage.setItem('quizAnswers', JSON.stringify(Object.fromEntries(finalAnswers)));

      // Convert answers to QuizAnswer format
      const answerArray: QuizAnswer[] = Array.from(finalAnswers.entries()).map(([qId, optionId]) => ({
        questionId: qId,
        optionId,
      }));

      // Calculate cost
      const response = await fetch('/api/quiz/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerArray }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate cost');
      }

      const result = await response.json();

      // Save results
      const saveResponse = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerArray, result }),
      });

      if (saveResponse.ok) {
        const { sessionId } = await saveResponse.json();
        localStorage.setItem('quizSessionId', sessionId);
      }

      // Store result and answers in localStorage for results page
      localStorage.setItem('quizResult', JSON.stringify(result));
      localStorage.setItem('quizAnswersForResults', JSON.stringify(answerArray));

      // Clear answers (but keep quizAnswersForResults for the results page)
      localStorage.removeItem('quizAnswers');

      // Navigate to results
      router.push('/results');
    } catch (error) {
      console.error('Error calculating cost:', error);
      alert('Failed to calculate cost. Please try again.');
    }
  };

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading question...</p>
      </div>
    );
  }

  // Check if this is the last visible question
  const visibleQuestions = getVisibleQuestions(answers);
  const currentVisibleIndex = visibleQuestions.findIndex(q => q.id === questionId);
  const isLastQuestion = currentVisibleIndex >= 0 && currentVisibleIndex === visibleQuestions.length - 1;
  const canGoNext = true; // Always show button, even on last question
  const canGoPrevious = currentQuestionIndex > 1;

  return (
    <main className="min-h-screen py-8">
      <QuizProgress
        currentQuestion={currentQuestionIndex}
        totalQuestions={totalQuestions}
      />
      <QuizQuestion
        question={question}
        selectedOptionId={selectedOptionId}
        selectedSliderValue={selectedSliderValue}
        onSelect={handleSelect}
        onSliderChange={handleSliderChange}
        onNext={handleNext}
        onPrevious={canGoPrevious ? handlePrevious : undefined}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        isLastQuestion={isLastQuestion}
        locationAnswer={answers.get('location')}
      />
    </main>
  );
}


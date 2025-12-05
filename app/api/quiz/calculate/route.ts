import { NextRequest, NextResponse } from 'next/server';
import { calculateCost } from '@/lib/quiz-engine';
import { QuizAnswer } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Invalid request: answers array required' },
        { status: 400 }
      );
    }

    const result = calculateCost(answers as QuizAnswer[]);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calculating cost:', error);
    return NextResponse.json(
      { error: 'Failed to calculate cost' },
      { status: 500 }
    );
  }
}


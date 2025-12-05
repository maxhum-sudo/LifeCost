import { NextResponse } from 'next/server';
import { getQuizConfig } from '@/lib/quiz-engine';

export async function GET() {
  try {
    const config = getQuizConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching quiz config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz configuration' },
      { status: 500 }
    );
  }
}


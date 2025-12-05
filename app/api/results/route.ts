import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { QuizAnswer } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers, result } = body;

    if (!answers || !Array.isArray(answers) || !result) {
      return NextResponse.json(
        { error: 'Invalid request: answers and result required' },
        { status: 400 }
      );
    }

    // Create session
    const session = await prisma.quizSession.create({
      data: {},
    });

    // Create answers
    const answerData = (answers as QuizAnswer[]).map(answer => ({
      sessionId: session.id,
      questionId: answer.questionId,
      optionId: answer.optionId,
    }));

    await prisma.quizAnswer.createMany({
      data: answerData,
    });

    // Create result
    const quizResult = await prisma.quizResult.create({
      data: {
        sessionId: session.id,
        totalCost: result.totalCost,
        breakdown: result.breakdown,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      resultId: quizResult.id,
      result: {
        totalCost: quizResult.totalCost,
        breakdown: quizResult.breakdown,
      },
    });
  } catch (error) {
    console.error('Error saving results:', error);
    return NextResponse.json(
      { error: 'Failed to save results' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId parameter required' },
        { status: 400 }
      );
    }

    const result = await prisma.quizResult.findUnique({
      where: { sessionId },
      include: {
        session: {
          include: {
            answers: true,
          },
        },
      },
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      );
    }

    // Convert answers to QuizAnswer format
    const answers = result.session.answers.map(a => ({
      questionId: a.questionId,
      optionId: a.optionId,
    }));

    return NextResponse.json({
      sessionId: result.sessionId,
      resultId: result.id,
      result: {
        totalCost: result.totalCost,
        breakdown: result.breakdown,
      },
      answers: answers,
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}


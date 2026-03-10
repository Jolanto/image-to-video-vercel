import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId, type, source } = await request.json();

    if (!userId || !type) {
      return NextResponse.json({ error: 'Missing userId or type' }, { status: 400 });
    }

    // Ensure user exists
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          source: source || 'direct',
        },
      });
    }

    // Record action
    const action = await prisma.action.create({
      data: {
        userId: user.id,
        type,
      },
    });

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error('Tracking Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

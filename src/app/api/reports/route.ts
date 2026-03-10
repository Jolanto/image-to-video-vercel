import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const totalVisitors = await prisma.user.count();
    
    const actionsDesc = await prisma.action.groupBy({
      by: ['type'],
      _count: {
        type: true,
      },
    });

    const sources = await prisma.user.groupBy({
      by: ['source'],
      _count: {
        source: true,
      },
    });

    const actions = actionsDesc.reduce((acc, curr) => {
      acc[curr.type] = curr._count.type;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      totalVisitors,
      actions: {
        visit: actions['visit'] || 0,
        upload: actions['upload'] || 0,
        download: actions['download'] || 0,
        share: actions['share'] || 0,
      },
      sources: sources.map(s => ({
        source: s.source || 'direct',
        count: s._count.source
      })),
    });
  } catch (error) {
    console.error('Reports Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

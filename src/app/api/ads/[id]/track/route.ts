import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/ads/[id]/track
 * Track ad impressions or clicks
 * Body: { type: 'impression' | 'click' }
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { type } = await request.json();
    const { id } = params;

    if (!type || !['impression', 'click'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid tracking type. Must be "impression" or "click"' },
        { status: 400 }
      );
    }

    // Update the ad analytics
    const updateData = type === 'impression' 
      ? { impressions: { increment: 1 } }
      : { clicks: { increment: 1 } };

    await prisma.ad.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, type });
  } catch (error) {
    console.error('Error tracking ad:', error);
    return NextResponse.json(
      { error: 'Failed to track ad event' },
      { status: 500 }
    );
  }
}

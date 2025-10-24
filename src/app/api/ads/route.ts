import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/ads
 * Fetch all active ad spaces with their current ads
 * Query params:
 *   - location: Filter by specific location (optional)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      isActive: true,
    };

    if (location) {
      where.location = location.toUpperCase().replace(/-/g, '_');
    }

    const adSpaces = await prisma.adSpace.findMany({
      where,
      include: {
        currentAd: {
          where: {
            isActive: true,
            OR: [
              { startDate: null },
              { startDate: { lte: new Date() } }
            ],
            AND: [
              {
                OR: [
                  { endDate: null },
                  { endDate: { gte: new Date() } }
                ]
              }
            ]
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    return NextResponse.json(adSpaces);
  } catch (error) {
    console.error('Error fetching ad spaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ad spaces' },
      { status: 500 }
    );
  }
}

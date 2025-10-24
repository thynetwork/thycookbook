import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's recipes count
    const totalRecipes = await prisma.recipe.count({
      where: { userId: user.id },
    });

    // Get total likes on user's recipes
    const recipesWithLikes = await prisma.recipe.findMany({
      where: { userId: user.id },
      select: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });
    const totalLikes = recipesWithLikes.reduce(
      (sum, recipe) => sum + recipe._count.likes,
      0
    );

    // Get total views on user's recipes
    const recipesWithViews = await prisma.recipe.findMany({
      where: { userId: user.id },
      select: {
        viewCount: true,
      },
    });
    const totalViews = recipesWithViews.reduce(
      (sum, recipe) => sum + recipe.viewCount,
      0
    );

    // Get saved recipes count
    const savedRecipes = await prisma.savedRecipe.count({
      where: { userId: user.id },
    });

    // Get followers count
    const followers = await prisma.follow.count({
      where: { followingId: user.id },
    });

    // Get following count
    const following = await prisma.follow.count({
      where: { followerId: user.id },
    });

    return NextResponse.json({
      totalRecipes,
      totalLikes,
      totalViews,
      savedRecipes,
      followers,
      following,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

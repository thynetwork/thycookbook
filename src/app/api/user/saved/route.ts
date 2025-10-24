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

    // Get user's saved recipes
    const savedRecipes = await prisma.savedRecipe.findMany({
      where: {
        userId: user.id,
      },
      include: {
        recipe: {
          include: {
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedRecipes = savedRecipes.map((saved: any) => ({
      id: saved.recipe.id,
      title: saved.recipe.title,
      slug: saved.recipe.slug,
      thumbnail: saved.recipe.thumbnail,
      videoEmbedId: saved.recipe.videoEmbedId,
      likeCount: saved.recipe._count.likes,
      commentCount: saved.recipe._count.comments,
      viewCount: saved.recipe.viewCount,
      cuisine: saved.recipe.cuisine,
      difficulty: saved.recipe.difficulty,
      prepTime: saved.recipe.prepTime,
      cookTime: saved.recipe.cookTime,
      createdAt: saved.recipe.createdAt,
      savedAt: saved.createdAt,
      category: saved.recipe.category,
    }));

    return NextResponse.json({
      recipes: formattedRecipes,
    });
  } catch (error) {
    console.error('Error fetching saved recipes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

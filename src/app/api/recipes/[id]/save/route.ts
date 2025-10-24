import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST /api/recipes/[id]/save - Save/Unsave a recipe
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      return NextResponse.json(
        { message: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Check if already saved
    const existingSave = await prisma.savedRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: session.user.id,
          recipeId: id,
        },
      },
    });

    if (existingSave) {
      // Unsave
      await prisma.savedRecipe.delete({
        where: { id: existingSave.id },
      });

      return NextResponse.json({ saved: false });
    } else {
      // Save
      await prisma.savedRecipe.create({
        data: {
          userId: session.user.id,
          recipeId: id,
        },
      });

      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error('POST /api/recipes/[id]/save error:', error);
    return NextResponse.json(
      { message: 'Failed to process save' },
      { status: 500 }
    );
  }
}

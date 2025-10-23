import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/recipes/[id] - Get a single recipe
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
          },
        },
        category: true,
        comments: {
          where: {
            parentId: null, // Only top-level comments
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            savedBy: true,
          },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json(
        { message: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.recipe.update({
      where: { id: params.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    // Parse JSON fields
    const parsedRecipe = {
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients),
      instructions: JSON.parse(recipe.instructions),
      images: recipe.images ? JSON.parse(recipe.images) : null,
      dietaryTags: recipe.dietaryTags ? JSON.parse(recipe.dietaryTags) : null,
    };

    return NextResponse.json(parsedRecipe);
  } catch (error) {
    console.error('GET /api/recipes/[id] error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}

// PATCH /api/recipes/[id] - Update a recipe (protected)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if recipe exists and belongs to user
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: params.id },
    });

    if (!existingRecipe) {
      return NextResponse.json(
        { message: 'Recipe not found' },
        { status: 404 }
      );
    }

    if (existingRecipe.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const data = await req.json();

    // Update recipe
    const recipe = await prisma.recipe.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        ingredients: data.ingredients ? JSON.stringify(data.ingredients) : undefined,
        instructions: data.instructions ? JSON.stringify(data.instructions) : undefined,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        servings: data.servings,
        difficulty: data.difficulty,
        thumbnail: data.thumbnail,
        images: data.images ? JSON.stringify(data.images) : undefined,
        videoUrl: data.videoUrl,
        videoEmbedId: data.videoEmbedId,
        cuisine: data.cuisine,
        mealType: data.mealType,
        dietaryTags: data.dietaryTags ? JSON.stringify(data.dietaryTags) : undefined,
        published: data.published,
        categoryId: data.categoryId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        category: true,
      },
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('PATCH /api/recipes/[id] error:', error);
    return NextResponse.json(
      { message: 'Failed to update recipe' },
      { status: 500 }
    );
  }
}

// DELETE /api/recipes/[id] - Delete a recipe (protected)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if recipe exists and belongs to user
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: params.id },
    });

    if (!existingRecipe) {
      return NextResponse.json(
        { message: 'Recipe not found' },
        { status: 404 }
      );
    }

    if (existingRecipe.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete recipe
    await prisma.recipe.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/recipes/[id] error:', error);
    return NextResponse.json(
      { message: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}

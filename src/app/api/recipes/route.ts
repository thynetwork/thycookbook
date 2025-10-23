import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/recipes - Get all recipes with filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const mealType = searchParams.get('mealType');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured') === 'true';
    const userId = searchParams.get('userId');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      published: true,
    };

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (mealType) {
      where.mealType = {
        has: mealType.toUpperCase(),
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { cuisine: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (featured) {
      where.featured = true;
    }

    if (userId) {
      where.userId = userId;
    }

    // Fetch recipes
    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
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
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ]);

    return NextResponse.json({
      recipes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/recipes error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

// POST /api/recipes - Create a new recipe (protected)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await req.json();

    // Generate slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { slug },
    });

    if (existingRecipe) {
      return NextResponse.json(
        { message: 'A recipe with this title already exists' },
        { status: 409 }
      );
    }

    // Create recipe
    const recipe = await prisma.recipe.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        ingredients: JSON.stringify(data.ingredients || []),
        instructions: JSON.stringify(data.instructions || []),
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        servings: data.servings,
        difficulty: data.difficulty || 'MEDIUM',
        thumbnail: data.thumbnail,
        images: data.images ? JSON.stringify(data.images) : null,
        videoUrl: data.videoUrl,
        videoEmbedId: data.videoEmbedId,
        cuisine: data.cuisine,
        mealType: data.mealType || [],
        dietaryTags: data.dietaryTags ? JSON.stringify(data.dietaryTags) : null,
        published: data.published || false,
        categoryId: data.categoryId,
        userId: session.user.id,
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

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error('POST /api/recipes error:', error);
    return NextResponse.json(
      { message: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}

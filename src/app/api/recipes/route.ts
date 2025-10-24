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
    const slug = searchParams.get('slug');
    const featured = searchParams.get('featured') === 'true';
    const userId = searchParams.get('userId');

    const skip = (page - 1) * limit;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    // If fetching by slug, don't filter by published (allow owner to see their own unpublished recipes)
    if (!slug) {
      where.published = true;
    }

    if (slug) {
      where.slug = slug;
    }

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (mealType) {
      // mealType is stored as a JSON string, so we use contains to search within it
      where.mealType = {
        contains: mealType.toUpperCase(),
        mode: 'insensitive',
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

    // Validation
    if (!data.title || !data.title.trim()) {
      return NextResponse.json(
        { message: 'Recipe title is required' },
        { status: 400 }
      );
    }

    if (!data.ingredients || !Array.isArray(data.ingredients) || data.ingredients.length === 0) {
      return NextResponse.json(
        { message: 'At least one ingredient is required' },
        { status: 400 }
      );
    }

    if (!data.instructions || !Array.isArray(data.instructions) || data.instructions.length === 0) {
      return NextResponse.json(
        { message: 'At least one instruction step is required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const baseSlug = data.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existingRecipe = await prisma.recipe.findUnique({
        where: { slug },
      });

      if (!existingRecipe) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Determine category based on mealType
    let categoryId = data.categoryId || null;
    if (!categoryId && data.mealType && Array.isArray(data.mealType) && data.mealType.length > 0) {
      // Map mealType to category slug
      const mealTypeToCategoryMap: Record<string, string> = {
        'BREAKFAST': 'breakfast',
        'BRUNCH': 'brunch',
        'LUNCH': 'lunch',
        'DINNER': 'dinner',
        'QUICK_MEAL': 'quick-meals',
        'APPETIZER': 'appetizers',
        'DESSERT': 'desserts',
        'SNACK': 'snacks',
      };

      const primaryMealType = data.mealType[0]; // Use first mealType
      const categorySlug = mealTypeToCategoryMap[primaryMealType];
      
      if (categorySlug) {
        // Find or create category
        const category = await prisma.category.findUnique({
          where: { slug: categorySlug },
        });
        
        if (category) {
          categoryId = category.id;
        }
      }
    }

    // Create recipe
    const recipe = await prisma.recipe.create({
      data: {
        title: data.title.trim(),
        slug,
        description: data.description?.trim() || null,
        ingredients: JSON.stringify(data.ingredients || []),
        instructions: JSON.stringify(data.instructions || []),
        prepTime: data.prepTime ? parseInt(data.prepTime) : null,
        cookTime: data.cookTime ? parseInt(data.cookTime) : null,
        servings: data.servings ? parseInt(data.servings) : null,
        difficulty: data.difficulty || 'MEDIUM',
        thumbnail: data.thumbnail?.trim() || null,
        images: data.images ? JSON.stringify(data.images) : null,
        videoUrl: data.videoUrl?.trim() || null,
        videoEmbedId: data.videoEmbedId || null,
        cuisine: data.cuisine?.trim() || null,
        mealType: data.mealType ? JSON.stringify(data.mealType) : null,
        dietaryTags: data.dietaryTags ? JSON.stringify(data.dietaryTags) : null,
        published: data.published || false,
        publishedAt: data.published ? new Date() : null,
        categoryId: data.categoryId || null,
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

    return NextResponse.json({
      message: 'Recipe created successfully',
      recipe,
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/recipes error:', error);
    return NextResponse.json(
      { message: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}

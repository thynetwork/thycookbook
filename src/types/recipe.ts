// Recipe Types
export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  thumbnail: string | null;
  images: string[] | null;
  videoUrl: string | null;
  videoEmbedId: string | null;
  cuisine: string | null;
  mealType: MealType[];
  dietaryTags: string[] | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  user: RecipeUser;
  category: Category | null;
  _count?: {
    likes: number;
    comments: number;
    savedBy: number;
  };
}

export interface Ingredient {
  item: string;
  amount: string;
}

export interface RecipeUser {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  bio?: string | null;
}

export type MealType =
  | 'BREAKFAST'
  | 'BRUNCH'
  | 'LUNCH'
  | 'DINNER'
  | 'SNACK'
  | 'DESSERT'
  | 'APPETIZER'
  | 'QUICK_MEAL';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    recipes: number;
  };
}

// Comment Types
export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
  parentId: string | null;
  replies?: Comment[];
}

export interface CommentUser {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

// Pagination Types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedRecipes {
  recipes: Recipe[];
  pagination: PaginationMeta;
}

// API Response Types
export interface ApiError {
  message: string;
}

export interface LikeResponse {
  liked: boolean;
}

export interface SaveResponse {
  saved: boolean;
}

// Form Types for Creating/Updating
export interface RecipeFormData {
  title: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: Difficulty;
  thumbnail?: string;
  images?: string[];
  videoUrl?: string;
  videoEmbedId?: string;
  cuisine?: string;
  mealType?: MealType[];
  dietaryTags?: string[];
  published?: boolean;
  categoryId?: string;
}

// Filter Types
export interface RecipeFilters {
  page?: number;
  limit?: number;
  category?: string;
  mealType?: string;
  search?: string;
  featured?: boolean;
  userId?: string;
}

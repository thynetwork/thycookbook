export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export function getTotalTime(prepTime?: number, cookTime?: number): number {
  return (prepTime || 0) + (cookTime || 0);
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toUpperCase()) {
    case 'EASY':
      return '#0fb36a'; // brand green
    case 'MEDIUM':
      return '#ff8a00'; // mango orange
    case 'HARD':
      return '#e91e63'; // beet pink
    default:
      return '#5a5a5a'; // muted
  }
}

export function getMealTypeLabel(mealType: string): string {
  const labels: Record<string, string> = {
    BREAKFAST: 'Breakfast',
    BRUNCH: 'Brunch',
    LUNCH: 'Lunch',
    DINNER: 'Dinner',
    SNACK: 'Snack',
    DESSERT: 'Dessert',
    APPETIZER: 'Appetizer',
    QUICK_MEAL: 'Quick Meal',
  };
  return labels[mealType] || mealType;
}

export interface ParsedIngredient {
  item: string;
  amount: string;
}

export interface ParsedInstruction {
  step?: number;
  text?: string;
}

export function parseIngredients(ingredientsJson: string): ParsedIngredient[] {
  try {
    return JSON.parse(ingredientsJson);
  } catch {
    return [];
  }
}

export function parseInstructions(instructionsJson: string): string[] {
  try {
    const parsed = JSON.parse(instructionsJson);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => (typeof item === 'string' ? item : item.text || ''));
    }
    return [];
  } catch {
    return [];
  }
}

export function parseImages(imagesJson: string | null): string[] {
  if (!imagesJson) return [];
  try {
    return JSON.parse(imagesJson);
  } catch {
    return [];
  }
}

export function parseDietaryTags(tagsJson: string | null): string[] {
  if (!tagsJson) return [];
  try {
    return JSON.parse(tagsJson);
  } catch {
    return [];
  }
}

export function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

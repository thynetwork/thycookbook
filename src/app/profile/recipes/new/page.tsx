'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, FormEvent } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import FileUpload, { FileUploadRef } from '@/components/FileUpload';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CreateRecipePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Ingredients & Instructions
  const [ingredients, setIngredients] = useState<Array<{ amount: string; unit: string; item: string }>>([
    { amount: '', unit: '', item: '' }
  ]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  
  // Time & Servings
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  
  // Categorization
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [cuisine, setCuisine] = useState('');
  const [mealTypes, setMealTypes] = useState<string[]>([]);
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  
  // Media
  const [videoUrl, setVideoUrl] = useState('');
  const [videoMode, setVideoMode] = useState<'upload' | 'embed'>('embed');
  
  // File upload refs
  const thumbnailRef = useRef<FileUploadRef>(null);
  const videoRef = useRef<FileUploadRef>(null);
  
  // Privacy
  const [published, setPublished] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Please log in to create a recipe');
      router.push('/login');
    }
  }, [status, router]);

  const addIngredient = () => {
    setIngredients([...ingredients, { amount: '', unit: '', item: '' }]);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients.length > 0 ? newIngredients : [{ amount: '', unit: '', item: '' }]);
  };

  const updateIngredient = (index: number, field: 'amount' | 'unit' | 'item', value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const toggleMealType = (type: string) => {
    if (mealTypes.includes(type)) {
      setMealTypes(mealTypes.filter(t => t !== type));
    } else {
      setMealTypes([...mealTypes, type]);
    }
  };

  const toggleDietaryTag = (tag: string) => {
    if (dietaryTags.includes(tag)) {
      setDietaryTags(dietaryTags.filter(t => t !== tag));
    } else {
      setDietaryTags([...dietaryTags, tag]);
    }
  };

  const extractVideoId = (url: string): string | null => {
    if (!url) return null;
    
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) return youtubeMatch[1];
    
    // Vimeo
    const vimeoRegex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) return vimeoMatch[1];
    
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      toast.error('Recipe title is required');
      return;
    }

    const filteredIngredients = ingredients.filter(i => i.item.trim());
    if (filteredIngredients.length === 0) {
      toast.error('At least one ingredient is required');
      return;
    }

    const filteredInstructions = instructions.filter(i => i.trim());
    if (filteredInstructions.length === 0) {
      toast.error('At least one instruction step is required');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Creating recipe...');

    try {
      // STEP 1: Create recipe first to get recipeId (matches ThyMissing/ThyPolice2 pattern)
      toast.loading('Creating recipe...', { id: loadingToast });

      // Extract video embed ID only for embed mode
      const videoEmbedId = videoMode === 'embed' ? extractVideoId(videoUrl) : null;

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          ingredients: filteredIngredients,
          instructions: filteredInstructions,
          prepTime: prepTime ? parseInt(prepTime) : null,
          cookTime: cookTime ? parseInt(cookTime) : null,
          servings: servings ? parseInt(servings) : null,
          difficulty,
          cuisine: cuisine.trim() || null,
          mealType: mealTypes.length > 0 ? mealTypes : null,
          dietaryTags: dietaryTags.length > 0 ? dietaryTags : null,
          thumbnail: null, // Will update after upload
          videoUrl: videoMode === 'embed' ? videoUrl : null, // For embed mode, use URL directly
          videoEmbedId,
          published,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.dismiss(loadingToast);
        toast.error(data.message || 'Failed to create recipe');
        return;
      }

      const recipeId = data.recipe?.id;
      if (!recipeId) {
        toast.dismiss(loadingToast);
        toast.error('Recipe created but ID not returned');
        return;
      }

      console.log('✅ Recipe created with ID:', recipeId);

      // STEP 2: Upload files with recipeId (server-side upload)
      let uploadedThumbnail = '';
      let uploadedVideoUrl = videoMode === 'embed' ? videoUrl : '';

      // Upload thumbnail if user selected a file
      if (thumbnailRef.current?.hasFile()) {
        toast.loading('Uploading thumbnail...', { id: loadingToast });
        const thumbnailS3Key = await thumbnailRef.current.uploadFile(recipeId);
        if (thumbnailS3Key) {
          uploadedThumbnail = thumbnailS3Key;
          console.log('✅ Thumbnail uploaded:', thumbnailS3Key);
        } else {
          toast.dismiss(loadingToast);
          toast.error('Failed to upload thumbnail');
          return;
        }
      }

      // Upload video if user selected a file (upload mode)
      if (videoMode === 'upload' && videoRef.current?.hasFile()) {
        toast.loading('Uploading video...', { id: loadingToast });
        const videoS3Key = await videoRef.current.uploadFile(recipeId);
        if (videoS3Key) {
          uploadedVideoUrl = videoS3Key;
          console.log('✅ Video uploaded:', videoS3Key);
        } else {
          toast.dismiss(loadingToast);
          toast.error('Failed to upload video');
          return;
        }
      }

      // STEP 3: Update recipe with uploaded file URLs if any files were uploaded
      if (uploadedThumbnail || (videoMode === 'upload' && uploadedVideoUrl)) {
        toast.loading('Updating recipe with media...', { id: loadingToast });
        
        const updateResponse = await fetch(`/api/recipes/${recipeId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            thumbnail: uploadedThumbnail || undefined,
            videoUrl: uploadedVideoUrl || undefined,
          }),
        });

        if (!updateResponse.ok) {
          toast.dismiss(loadingToast);
          toast.error('Recipe created but failed to update media files');
          // Still redirect since recipe was created
          setTimeout(() => {
            router.push('/profile');
          }, 1500);
          return;
        }

        console.log('✅ Recipe updated with media files');
      }

      toast.dismiss(loadingToast);

      if (!response.ok) {
        toast.error(data.message || 'Failed to create recipe');
        return;
      }

      toast.success('Recipe created successfully! 🎉');
      
      // Redirect to the created recipe or profile
      setTimeout(() => {
        router.push('/profile');
      }, 1000);
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error creating recipe:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <main className="flex flex-col min-h-screen">
        <Header />
        <Loading />
        <Footer />
      </main>
    );
  }

  if (!session) return null;

  const mealTypeOptions = [
    { value: 'BREAKFAST', label: 'Breakfast', icon: '🌅' },
    { value: 'BRUNCH', label: 'Brunch', icon: '🥐' },
    { value: 'LUNCH', label: 'Lunch', icon: '🍱' },
    { value: 'DINNER', label: 'Dinner', icon: '🍽️' },
    { value: 'SNACK', label: 'Snack', icon: '🍿' },
    { value: 'DESSERT', label: 'Dessert', icon: '🍰' },
    { value: 'APPETIZER', label: 'Appetizer', icon: '🥗' },
    { value: 'QUICK_MEAL', label: 'Quick Meal', icon: '⚡' },
  ];

  const dietaryOptions = [
    { value: 'vegetarian', label: 'Vegetarian', icon: '🥕' },
    { value: 'vegan', label: 'Vegan', icon: '🌱' },
    { value: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
    { value: 'dairy-free', label: 'Dairy-Free', icon: '🥛' },
    { value: 'keto', label: 'Keto', icon: '🥑' },
    { value: 'paleo', label: 'Paleo', icon: '🍖' },
  ];

  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-1 bg-gradient-to-b from-[#0fb36a]/5 to-transparent py-12 max-sm:py-6">
        <div className="container-custom max-w-4xl">
          {/* Back Button */}
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 mb-6 text-ink font-semibold px-4 py-2.5 rounded-[10px] bg-card border border-black/[0.08] hover:bg-white hover:shadow-brand transition-all group no-underline max-sm:mb-4 max-sm:text-sm"
          >
            <svg 
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform max-sm:w-4 max-sm:h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </Link>

          {/* Page Header */}
          <div className="text-center mb-8 max-sm:mb-6">
            <h1 className="text-3xl font-bold text-ink mb-2 max-sm:text-2xl">Create New Recipe</h1>
            <p className="text-muted max-sm:text-sm">Share your culinary creation with the world</p>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-brand shadow-brand border border-black/[0.06] p-8 max-sm:p-5">
            <form onSubmit={handleSubmit} className="space-y-8 max-sm:space-y-6">
              {/* Basic Information */}
              <section>
                <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2 max-sm:text-lg">
                  <span>📝</span> Basic Information
                </h2>
                
                <div className="space-y-4 max-sm:space-y-3">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-ink mb-2">
                      Recipe Title <span className="text-[#e91e63]">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-black/[0.12] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0fb36a]/25 focus:border-[#0fb36a] transition-all"
                      placeholder="e.g., Grandma's Secret Chocolate Chip Cookies"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-ink mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 border border-black/[0.12] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0fb36a]/25 focus:border-[#0fb36a] transition-all resize-vertical"
                      placeholder="Tell us about this recipe..."
                      rows={3}
                      maxLength={500}
                    />
                    <p className="mt-1 text-xs text-muted text-right">{description.length}/500</p>
                  </div>
                </div>
              </section>

              {/* Ingredients */}
              <section>
                <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
                  <span>🥘</span> Ingredients <span className="text-[#e91e63]">*</span>
                </h2>
                
                <div className="space-y-3">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={ingredient.amount}
                        onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                        className="w-24 px-3 py-3 border border-black/[0.12] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0fb36a]/25 focus:border-[#0fb36a] transition-all"
                        placeholder="1"
                      />
                      <select
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                        className="w-32 px-3 py-3 border border-black/[0.12] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0fb36a]/25 focus:border-[#0fb36a] transition-all bg-white"
                      >
                        <option value="">Unit</option>
                        <optgroup label="Volume">
                          <option value="cup">Cup</option>
                          <option value="tbsp">Tbsp</option>
                          <option value="tsp">Tsp</option>
                          <option value="ml">ml</option>
                          <option value="l">L</option>
                          <option value="fl oz">fl oz</option>
                        </optgroup>
                        <optgroup label="Weight">
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                          <option value="oz">oz</option>
                          <option value="lb">lb</option>
                        </optgroup>
                        <optgroup label="Other">
                          <option value="piece">Piece</option>
                          <option value="pinch">Pinch</option>
                          <option value="dash">Dash</option>
                          <option value="to taste">To taste</option>
                        </optgroup>
                      </select>
                      <input
                        type="text"
                        value={ingredient.item}
                        onChange={(e) => updateIngredient(index, 'item', e.target.value)}
                        className="flex-1 px-4 py-3 border border-black/[0.12] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0fb36a]/25 focus:border-[#0fb36a] transition-all"
                        placeholder={`Ingredient ${index + 1}`}
                      />
                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="px-4 py-3 bg-[#e91e63]/10 text-[#e91e63] rounded-[10px] hover:bg-[#e91e63]/20 transition-colors font-semibold max-sm:px-3 max-sm:text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="w-full px-4 py-3 border-2 border-dashed border-black/[0.12] rounded-[10px] text-muted hover:border-[#0fb36a] hover:text-[#0fb36a] transition-colors font-semibold"
                  >
                    + Add Ingredient
                  </button>
                </div>
              </section>

              {/* Instructions */}
              <section>
                <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
                  <span>👨‍🍳</span> Instructions <span className="text-[#e91e63]">*</span>
                </h2>
                
                <div className="space-y-3">
                  {instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-shrink-0 w-8 h-11 flex items-center justify-center bg-[#0fb36a] text-white font-bold rounded-[8px]">
                        {index + 1}
                      </div>
                      <textarea
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        className="flex-1 px-4 py-3 border border-black/[0.12] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0fb36a]/25 focus:border-[#0fb36a] transition-all resize-vertical"
                        placeholder={`Step ${index + 1}`}
                        rows={2}
                      />
                      {instructions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInstruction(index)}
                          className="px-4 py-3 bg-[#e91e63]/10 text-[#e91e63] rounded-[10px] hover:bg-[#e91e63]/20 transition-colors font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addInstruction}
                    className="w-full px-4 py-3 border-2 border-dashed border-black/[0.12] rounded-[10px] text-muted hover:border-[#0fb36a] hover:text-[#0fb36a] transition-colors font-semibold"
                  >
                    + Add Step
                  </button>
                </div>
              </section>

              {/* Time & Servings */}
              <section>
                <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2 max-sm:text-lg">
                  <span>⏱️</span> Time & Servings
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-sm:gap-3">
                  <div>
                    <label htmlFor="prepTime" className="block text-sm font-semibold text-ink mb-2">
                      Prep Time (minutes)
                    </label>
                    <input
                      id="prepTime"
                      type="number"
                      value={prepTime}
                      onChange={(e) => setPrepTime(e.target.value)}
                      className="w-full px-4 py-3 border border-black/[0.12] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0fb36a]/25 focus:border-[#0fb36a] transition-all"
                      placeholder="15"
                      min="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="cookTime" className="block text-sm font-semibold text-ink mb-2">
                      Cook Time (minutes)
                    </label>
                    <input
                      id="cookTime"
                      type="number"
                      value={cookTime}
                      onChange={(e) => setCookTime(e.target.value)}
                      className="w-full px-4 py-3 border border-black/[0.12] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0fb36a]/25 focus:border-[#0fb36a] transition-all"
                      placeholder="30"
                      min="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="servings" className="block text-sm font-semibold text-ink mb-2">
                      Servings
                    </label>
                    <input
                      id="servings"
                      type="number"
                      value={servings}
                      onChange={(e) => setServings(e.target.value)}
                      className="w-full px-4 py-3 border border-black/[0.12] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0fb36a]/25 focus:border-[#0fb36a] transition-all"
                      placeholder="4"
                      min="1"
                    />
                  </div>
                </div>
              </section>

              {/* Categorization */}
              <section>
                <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
                  <span>🏷️</span> Categorization
                </h2>
                
                <div className="space-y-4">
                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">
                      Difficulty Level
                    </label>
                    <div className="flex gap-3 max-sm:flex-col">
                      {(['EASY', 'MEDIUM', 'HARD'] as const).map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setDifficulty(level)}
                          className={`flex-1 px-4 py-3 rounded-[10px] font-semibold transition-all max-sm:text-sm ${
                            difficulty === level
                              ? 'bg-[#0fb36a] text-white'
                              : 'bg-bg text-ink hover:bg-white'
                          }`}
                        >
                          {level.charAt(0) + level.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cuisine */}
                  <div>
                    <label htmlFor="cuisine" className="block text-sm font-semibold text-ink mb-2">
                      Cuisine Type
                    </label>
                    <input
                      id="cuisine"
                      type="text"
                      value={cuisine}
                      onChange={(e) => setCuisine(e.target.value)}
                      className="w-full px-4 py-3 border border-black/[0.12] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0fb36a]/25 focus:border-[#0fb36a] transition-all"
                      placeholder="e.g., Italian, Japanese, Mexican"
                    />
                  </div>

                  {/* Meal Types */}
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">
                      Meal Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {mealTypeOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleMealType(option.value)}
                          className={`px-3 py-2 rounded-[8px] font-semibold text-sm transition-all ${
                            mealTypes.includes(option.value)
                              ? 'bg-[#0fb36a] text-white'
                              : 'bg-bg text-ink hover:bg-white'
                          }`}
                        >
                          {option.icon} {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Tags */}
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">
                      Dietary Tags
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {dietaryOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleDietaryTag(option.value)}
                          className={`px-3 py-2 rounded-[8px] font-semibold text-sm transition-all ${
                            dietaryTags.includes(option.value)
                              ? 'bg-[#0fb36a] text-white'
                              : 'bg-bg text-ink hover:bg-white'
                          }`}
                        >
                          {option.icon} {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Media */}
              <section>
                <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2 max-sm:text-lg">
                  <span>📸</span> Media
                </h2>
                
                <div className="space-y-6">
                  {/* Thumbnail Image Upload */}
                  <div>
                    <FileUpload
                      ref={thumbnailRef}
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      maxSizeMB={10}
                      label="Recipe Thumbnail Image"
                    />
                  </div>

                  {/* Video Section */}
                  <div className="border-t border-black/[0.08] pt-6">
                    <label className="block text-sm font-semibold text-ink mb-3">
                      Recipe Video (Optional)
                    </label>
                    
                    {/* Video Mode Selector */}
                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => {
                          setVideoMode('embed');
                          setVideoUrl('');
                        }}
                        className={`flex-1 px-4 py-3 rounded-[10px] font-semibold transition-all text-sm ${
                          videoMode === 'embed'
                            ? 'bg-[#0fb36a] text-white'
                            : 'bg-bg text-ink hover:bg-white'
                        }`}
                      >
                        🔗 Embed Video
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setVideoMode('upload');
                          setVideoUrl('');
                        }}
                        className={`flex-1 px-4 py-3 rounded-[10px] font-semibold transition-all text-sm ${
                          videoMode === 'upload'
                            ? 'bg-[#0fb36a] text-white'
                            : 'bg-bg text-ink hover:bg-white'
                        }`}
                      >
                        ⬆️ Upload Video
                      </button>
                    </div>

                    {/* Embed Mode */}
                    {videoMode === 'embed' && (
                      <div>
                        <input
                          id="videoUrl"
                          type="url"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          className="w-full px-4 py-3 border border-black/[0.12] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0fb36a]/25 focus:border-[#0fb36a] transition-all"
                          placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                        />
                        <p className="mt-2 text-xs text-muted">
                          Paste a YouTube or Vimeo URL to embed the video
                        </p>
                      </div>
                    )}

                    {/* Upload Mode */}
                    {videoMode === 'upload' && (
                      <FileUpload
                        ref={videoRef}
                        accept="video/mp4,video/mpeg,video/quicktime,video/webm"
                        maxSizeMB={500}
                        label="Upload Video"
                      />
                    )}
                  </div>
                </div>
              </section>

              {/* Privacy Settings */}
              <section className="border-t border-black/[0.08] pt-6">
                <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2 max-sm:text-lg">
                  <span>🔒</span> Privacy Settings
                </h2>
                
                <div className="bg-gradient-to-br from-[#0fb36a]/5 to-transparent rounded-[10px] p-6 border border-[#0fb36a]/20">
                  <div className="space-y-4">
                    <p className="text-sm text-muted mb-4">
                      Choose who can see your recipe
                    </p>
                    
                    {/* Privacy Options */}
                    <div className="space-y-3">
                      {/* Public Option */}
                      <label className="flex items-start gap-3 p-4 rounded-[10px] border-2 border-black/[0.08] hover:border-[#0fb36a]/30 cursor-pointer transition-all bg-white">
                        <input
                          type="radio"
                          name="privacy"
                          checked={published}
                          onChange={() => setPublished(true)}
                          className="mt-1 w-5 h-5 text-[#0fb36a] focus:ring-[#0fb36a] focus:ring-offset-0 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">🌍</span>
                            <span className="font-bold text-ink">Public</span>
                            <span className="text-xs px-2 py-0.5 bg-[#0fb36a]/10 text-[#0fb36a] rounded-full font-semibold">
                              Recommended
                            </span>
                          </div>
                          <p className="text-sm text-muted">
                            Your recipe will appear on the homepage and in search results. Perfect for sharing with the community!
                          </p>
                        </div>
                      </label>

                      {/* Private Option */}
                      <label className="flex items-start gap-3 p-4 rounded-[10px] border-2 border-black/[0.08] hover:border-[#0fb36a]/30 cursor-pointer transition-all bg-white">
                        <input
                          type="radio"
                          name="privacy"
                          checked={!published}
                          onChange={() => setPublished(false)}
                          className="mt-1 w-5 h-5 text-[#0fb36a] focus:ring-[#0fb36a] focus:ring-offset-0 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">🔒</span>
                            <span className="font-bold text-ink">Private</span>
                          </div>
                          <p className="text-sm text-muted">
                            Only you can see this recipe in your profile. Great for personal recipes or drafts.
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Info Banner */}
                    <div className="flex gap-3 items-start bg-blue-50 border border-blue-200 rounded-[10px] p-3 mt-4">
                      <span className="text-blue-500 text-lg">ℹ️</span>
                      <p className="text-xs text-blue-700">
                        <strong>Note:</strong> You can change this setting anytime from your profile.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 max-sm:flex-col max-sm:gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-4 bg-[#0fb36a] text-white font-bold rounded-[10px] hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 max-sm:text-sm max-sm:py-3"
                >
                  {isLoading ? 'Creating Recipe...' : '✨ Create Recipe'}
                </button>
                <Link
                  href="/profile"
                  className="flex-1 px-6 py-4 bg-bg hover:bg-white border border-black/[0.08] text-ink font-semibold rounded-[10px] hover:shadow-brand transition-all text-center no-underline flex items-center justify-center max-sm:text-sm max-sm:py-3"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { processFileUpload } from '@/lib/aws-s3';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Server-side file upload to S3
 * Matches ThyMissing and ThyPolice2 implementation pattern
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const recipeId = formData.get('recipeId') as string;
    const uploadType = formData.get('uploadType') as 'image' | 'video';

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    if (!recipeId) {
      return NextResponse.json(
        { message: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    if (!uploadType || !['image', 'video'].includes(uploadType)) {
      return NextResponse.json(
        { message: 'Invalid upload type. Must be "image" or "video"' },
        { status: 400 }
      );
    }

    console.log('📤 Server-side upload started:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      recipeId,
      uploadType,
    });

    // Determine folder based on upload type
    const folder = uploadType === 'image' ? 'images' : 'videos';

    // Process file upload (matches ThyMissing pattern)
    const uploadResult = await processFileUpload(file, recipeId, folder);

    console.log('✅ File uploaded successfully:', {
      s3Key: uploadResult.s3Key,
      fileName: uploadResult.filename,
      fileHash: uploadResult.fileHash,
    });

    // Return upload details (ThyMissing format)
    return NextResponse.json({
      success: true,
      file: {
        filename: uploadResult.filename,
        originalName: uploadResult.originalName,
        mimeType: uploadResult.mimeType,
        size: uploadResult.size,
        url: uploadResult.url, // S3 URI format
        s3Key: uploadResult.s3Key,
        fileHash: uploadResult.fileHash,
      },
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Return appropriate error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to upload file', 
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}

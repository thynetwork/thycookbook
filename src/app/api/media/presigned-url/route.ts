import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedGetUrl, extractS3KeyFromUrl } from '@/lib/aws-s3';

/**
 * API route to generate presigned URLs for viewing S3 media files
 * POST /api/media/presigned-url
 * Body: { url: string } or { key: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, key } = body;

    console.log('📥 [API] Presigned URL request:', {
      hasUrl: !!url,
      hasKey: !!key,
      url: url,
      urlType: typeof url,
      urlLength: url?.length,
      key: key,
      keyType: typeof key,
      keyLength: key?.length,
    });

    let s3Key: string | null = null;

    // Get S3 key either directly or extract from URL
    if (key) {
      s3Key = key;
      console.log('✅ [API] Using provided key:', s3Key);
    } else if (url) {
      console.log('🔍 [API] Extracting key from URL...');
      s3Key = extractS3KeyFromUrl(url);
      console.log('✅ [API] Extracted key from URL:', s3Key);
    }

    if (!s3Key) {
      console.error('❌ [API] No valid S3 key found:', { url, key });
      return NextResponse.json(
        { error: 'Invalid S3 URL or key provided' },
        { status: 400 }
      );
    }

    // Generate presigned URL (valid for 1 hour)
    console.log('🔐 [API] Generating presigned URL for key:', s3Key);
    const presignedUrl = await generatePresignedGetUrl(s3Key, 3600);
    console.log('✅ [API] Presigned URL generated successfully');

    return NextResponse.json({
      success: true,
      presignedUrl,
      expiresIn: 3600, // seconds
    });

  } catch (error) {
    console.error('❌ [API] Error generating presigned URL for viewing:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { 
        error: 'Failed to generate presigned URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

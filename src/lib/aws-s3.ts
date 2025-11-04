import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { createHash } from 'crypto';

// S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';
const BASE_PATH = 'thycookbook'; // Main folder for this application

export interface S3UploadedFile {
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileHash: string;
  s3Key: string;
  s3Url: string;
}

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/webm',
];

export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

/**
 * Generate file hash for integrity checking
 */
function generateFileHash(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

/**
 * Sanitize filename to remove unsafe characters
 */
function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}

/**
 * Uploads a file to AWS S3 (server-side upload matching ThyMissing/ThyPolice2)
 * @param file - The file to upload
 * @param recipeId - The recipe ID for organizing files
 * @param folder - 'images' or 'videos'
 * @returns Promise with upload details
 */
export async function uploadFileToS3(
  file: File,
  recipeId: string,
  folder: 'images' | 'videos' = 'images'
): Promise<S3UploadedFile> {
  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`);
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
  }

  // Validate environment variables
  if (!BUCKET_NAME) {
    throw new Error('AWS S3 bucket name is not configured');
  }

  // Convert file to buffer
  const buffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(buffer);
  
  // Generate file hash for integrity
  const fileHash = generateFileHash(fileBuffer);
  
  // Generate unique filename
  const sanitizedName = sanitizeFilename(file.name);
  const timestamp = Date.now();
  const fileName = `${timestamp}_${sanitizedName}`;
  
  // Create S3 key with proper path structure
  // Format: thycookbook/recipes/{recipeId}/{folder}/{timestamp}_{filename}
  const s3Key = `${BASE_PATH}/recipes/${recipeId}/${folder}/${fileName}`;
  
  try {
    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: file.type,
      ContentLength: file.size,
      Metadata: {
        'original-name': file.name,
        'file-hash': fileHash,
        'recipe-id': recipeId,
        'upload-timestamp': timestamp.toString(),
      },
      // Set appropriate ACL - private by default for security
      ACL: 'private',
    });

    await s3Client.send(uploadCommand);

    // Return S3 URI and key for storage (matches ThyMissing/ThyPolice format)
    const s3Url = `s3://${BUCKET_NAME}/${s3Key}`;
    
    return {
      fileName,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      fileHash,
      s3Key,
      s3Url, // S3 URI format: s3://bucket/key
    };

  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Process file upload (matches ThyMissing pattern)
 * Direct server-side upload with file info return
 */
export async function processFileUpload(
  file: File,
  recipeId: string,
  folder: 'images' | 'videos' = 'images'
): Promise<{
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string; // S3 URI format
  s3Key: string;
  fileHash: string;
}> {
  // Upload file to S3
  const uploadResult = await uploadFileToS3(file, recipeId, folder);
  
  return {
    filename: uploadResult.fileName,
    originalName: uploadResult.originalName,
    mimeType: uploadResult.mimeType,
    size: uploadResult.fileSize,
    url: uploadResult.s3Url, // S3 URI: s3://bucket/key
    s3Key: uploadResult.s3Key,
    fileHash: uploadResult.fileHash,
  };
}

/**
 * Validate file type and size
export function validateFile(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSizeMB = 100, allowedTypes } = options;

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  // Check file type
  if (allowedTypes && allowedTypes.length > 0) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type.toLowerCase();
    
    const isValidType = allowedTypes.some(type => {
      // Check by MIME type
      if (mimeType.includes(type.toLowerCase())) return true;
      // Check by extension
      if (fileExtension === type.toLowerCase().replace('.', '')) return true;
      return false;
    });

    if (!isValidType) {
      return {
        valid: false,
        error: `File type must be one of: ${allowedTypes.join(', ')}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Generate a presigned URL for viewing/downloading files from S3
 * @param s3Key - The S3 key of the file (e.g., "thycookbook/images/1234-filename.jpg")
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Promise<string> - The presigned URL for accessing the file
 */
export async function generatePresignedGetUrl(
  s3Key: string,
  expiresIn: number = 3600
): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION || 'us-east-1';
  
  console.log('🔐 generatePresignedGetUrl called:', { 
    s3Key, 
    bucketName, 
    region, 
    expiresIn 
  });
  
  if (!bucketName) {
    console.error('❌ AWS_S3_BUCKET_NAME is not configured');
    throw new Error('AWS_S3_BUCKET_NAME is not configured');
  }

  try {
    // Create the GetObject command
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      ResponseCacheControl: 'max-age=3600',
      ResponseContentDisposition: 'inline', // Display in browser instead of download
    });

    // Generate presigned URL
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn,
    });

    console.log('✅ Presigned URL generated:', presignedUrl.substring(0, 100) + '...');
    return presignedUrl;
  } catch (error) {
    console.error('❌ Error in generatePresignedGetUrl:', error);
    throw error;
  }
}

/**
 * Extract S3 key from public URL
 * @param url - The S3 public URL
 * @returns The S3 key
 */
export function extractS3KeyFromUrl(url: string): string | null {
  try {
    console.log('🔍 Extracting S3 key from URL:', url);
    
    // Handle S3 URI format: s3://bucket/key (matches ThyMissing/ThyPolice)
    if (url.startsWith('s3://')) {
      const s3UriPattern = /^s3:\/\/[^/]+\/(.+)$/;
      const match = url.match(s3UriPattern);
      if (match && match[1]) {
        const key = decodeURIComponent(match[1]);
        console.log('✅ Extracted key from S3 URI:', key);
        return key;
      }
    }
    
    // Handle HTTPS format: https://bucket.s3.region.amazonaws.com/key
    const httpsPattern = /https:\/\/[^/]+\.s3\.[^/]+\.amazonaws\.com\/(.+)/;
    const httpsMatch = url.match(httpsPattern);
    
    if (httpsMatch && httpsMatch[1]) {
      const key = decodeURIComponent(httpsMatch[1]);
      console.log('✅ Extracted key from HTTPS URL:', key);
      return key;
    }
    
    console.error('❌ Could not extract key from URL');
    return null;
  } catch (error) {
    console.error('❌ Error extracting S3 key from URL:', error);
    return null;
  }
}

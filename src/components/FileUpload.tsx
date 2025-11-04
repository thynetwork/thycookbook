'use client';

import { useState, useRef, forwardRef, useImperativeHandle, DragEvent } from 'react';
import { formatFileSize } from '@/lib/aws-s3';

interface FileUploadProps {
  accept: string;
  maxSizeMB: number;
  label: string;
  onFileSelect?: (file: File | null) => void;
  className?: string;
}

export interface FileUploadRef {
  uploadFile: (recipeId: string) => Promise<string | null>;
  hasFile: () => boolean;
  getFile: () => File | null;
  getProgress: () => number;
  isUploading: () => boolean;
  reset: () => void;
}

const FileUpload = forwardRef<FileUploadRef, FileUploadProps>(
  ({ accept, maxSizeMB, label, onFileSelect, className = '' }, ref) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      uploadFile: async (recipeId: string): Promise<string | null> => {
        if (!file) {
          setError('No file selected');
          return null;
        }

        if (!recipeId) {
          setError('Recipe ID is required for upload');
          return null;
        }

        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
          // Create FormData for server-side upload (matches ThyMissing/ThyPolice2)
          const formData = new FormData();
          formData.append('file', file);
          formData.append('recipeId', recipeId);
          formData.append('uploadType', file.type.startsWith('video/') ? 'video' : 'image');

          console.log('📤 Uploading file via server-side API:', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            recipeId,
          });

          // Upload file to server (server handles S3 upload)
          const xhr = new XMLHttpRequest();

          await new Promise<void>((resolve, reject) => {
            // Track upload progress
            xhr.upload.addEventListener('progress', (e) => {
              if (e.lengthComputable) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                setUploadProgress(percentComplete);
                console.log(`📊 Upload progress: ${percentComplete}%`);
              }
            });

            xhr.addEventListener('load', () => {
              if (xhr.status === 200) {
                console.log('✅ Upload successful');
                resolve();
              } else {
                console.error('❌ Upload failed with status:', xhr.status);
                const errorData = xhr.response ? JSON.parse(xhr.response) : {};
                reject(new Error(errorData.error || `Upload failed with status ${xhr.status}`));
              }
            });

            xhr.addEventListener('error', () => {
              console.error('❌ Upload request failed');
              reject(new Error('Upload request failed'));
            });

            xhr.addEventListener('abort', () => {
              console.error('❌ Upload cancelled');
              reject(new Error('Upload cancelled'));
            });

            xhr.open('POST', '/api/upload');
            xhr.send(formData);
          });

          // Parse response (ThyMissing format)
          const responseData = JSON.parse(xhr.response);
          const fileUrl = responseData.file?.url; // S3 URI format

          if (!fileUrl) {
            throw new Error('Upload succeeded but file URL not returned');
          }

          console.log('✅ File uploaded successfully, S3 URL:', fileUrl);
          setIsUploading(false);
          return fileUrl; // Return S3 URI to store in database
        } catch (err) {
          console.error('❌ Upload error:', err);
          setIsUploading(false);
          setError(err instanceof Error ? err.message : 'Upload failed');
          return null;
        }
      },
      hasFile: () => file !== null,
      getFile: () => file,
      getProgress: () => uploadProgress,
      isUploading: () => isUploading,
      reset: () => {
        setFile(null);
        setPreview(null);
        setUploadProgress(0);
        setIsUploading(false);
        setError(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }));

    const validateFile = (selectedFile: File): boolean => {
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (selectedFile.size > maxSizeBytes) {
        setError(`File size must be less than ${maxSizeMB}MB`);
        return false;
      }

      const allowedTypes = accept.split(',').map(t => t.trim());
      const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
      const mimeType = selectedFile.type;

      const isValid = allowedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type.toLowerCase();
        }
        if (type.includes('*')) {
          const baseType = type.split('/')[0];
          return mimeType.startsWith(baseType + '/');
        }
        return mimeType === type;
      });

      if (!isValid) {
        setError(`File type not allowed. Accepted: ${accept}`);
        return false;
      }

      return true;
    };

    const handleFileSelect = (selectedFile: File) => {
      setError(null);
      
      if (!validateFile(selectedFile)) {
        return;
      }

      setFile(selectedFile);
      
      // Create preview
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type.startsWith('video/')) {
        const url = URL.createObjectURL(selectedFile);
        setPreview(url);
      }

      // Notify parent
      if (onFileSelect) {
        onFileSelect(selectedFile);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFileSelect(selectedFile);
      }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    };

    const handleRemove = () => {
      setFile(null);
      setPreview(null);
      setUploadProgress(0);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (onFileSelect) {
        onFileSelect(null);
      }
    };

    return (
      <div className={`space-y-2 ${className}`}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>

        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              transition-colors duration-200
              ${isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleChange}
              className="hidden"
            />
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  Click to upload
                </span>{' '}
                or drag and drop
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {accept} (Max {maxSizeMB}MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              {preview && file.type.startsWith('image/') && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
              )}
              {preview && file.type.startsWith('video/') && (
                <video
                  src={preview}
                  controls
                  className="w-full h-48"
                />
              )}
            </div>

            {/* File info */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.size)}
                </p>
              </div>
              {!isUploading && (
                <button
                  onClick={handleRemove}
                  className="ml-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Upload progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';

export default FileUpload;

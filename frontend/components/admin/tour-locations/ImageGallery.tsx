'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageGallery({
  images,
  onImagesChange,
  maxImages = 20,
}: ImageGalleryProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  // Handle file selection from input or drag-drop
  const processFiles = useCallback(
    async (files: File[]) => {
      setError(null);
      setIsUploading(true);

      try {
        // Validate file count
        if (images.length + files.length > maxImages) {
          setError(
            `Maximum ${maxImages} images allowed. You can add ${maxImages - images.length} more.`
          );
          return;
        }

        // Process each file
        const newImages: string[] = [];
        for (const file of files) {
          // Validate file type
          if (!file.type.startsWith('image/')) {
            console.warn(`Skipping non-image file: ${file.name}`);
            continue;
          }

          // Validate file size (max 5MB per image)
          if (file.size > 5 * 1024 * 1024) {
            setError(`Image "${file.name}" is too large. Max 5MB per image.`);
            continue;
          }

          // Create object URL (simulating upload)
          const url = URL.createObjectURL(file);
          newImages.push(url);
        }

        if (newImages.length > 0) {
          const updatedImages = [...images, ...newImages];
          onImagesChange(updatedImages);
          showToast(`Added ${newImages.length} image(s)`);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to upload images');
      } finally {
        setIsUploading(false);
      }
    },
    [images, maxImages, onImagesChange]
  );

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    [processFiles]
  );

  // Handle file input change
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        processFiles(files);
      }
    },
    [processFiles]
  );

  // Handle image removal
  const handleRemoveImage = useCallback(
    (index: number) => {
      const updatedImages = images.filter((_, i) => i !== index);
      onImagesChange(updatedImages);
      showToast('Image removed');
    },
    [images, onImagesChange]
  );

  // Handle image reorder (move up)
  const handleMoveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const updatedImages = [...images];
      [updatedImages[index - 1], updatedImages[index]] = [
        updatedImages[index],
        updatedImages[index - 1],
      ];
      onImagesChange(updatedImages);
    },
    [images, onImagesChange]
  );

  // Handle image reorder (move down)
  const handleMoveDown = useCallback(
    (index: number) => {
      if (index === images.length - 1) return;
      const updatedImages = [...images];
      [updatedImages[index], updatedImages[index + 1]] = [
        updatedImages[index + 1],
        updatedImages[index],
      ];
      onImagesChange(updatedImages);
    },
    [images, onImagesChange]
  );

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canAddMore && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50'
          } ${isUploading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
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
                d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-8-12l-4-4m0 0l-4 4m4-4v16"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isUploading
                  ? 'Uploading...'
                  : 'Drag and drop images here, or click to select'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 5MB each • Max {maxImages} images
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Images Count */}
      <div className="text-sm text-gray-600">
        {images.length} of {maxImages} images
        {canAddMore && (
          <span className="text-gray-500 ml-2">
            ({maxImages - images.length} remaining)
          </span>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              {/* Image */}
              <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>

              {/* Image Number Badge */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs font-medium px-2 py-1 rounded">
                {index + 1}
              </div>

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {/* Move Up Button */}
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Move up"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3.707 9.293a1 1 0 010 1.414l5 5a1 1 0 001.414 0l5-5a1 1 0 00-1.414-1.414L11 12.586V5a1 1 0 10-2 0v7.586L5.121 9.293a1 1 0 00-1.414 1.414z" />
                  </svg>
                </button>

                {/* Move Down Button */}
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === images.length - 1}
                  className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Move down"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M16.293 10.707a1 1 0 010-1.414l-5-5a1 1 0 00-1.414 0l-5 5a1 1 0 001.414 1.414L9 7.414V15a1 1 0 102 0V7.414l3.879 3.879a1 1 0 001.414-1.414z" />
                  </svg>
                </button>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !isUploading && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No images added yet</p>
        </div>
      )}

      {/* Max Images Reached */}
      {!canAddMore && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          Maximum number of images ({maxImages}) reached
        </div>
      )}
    </div>
  );
}

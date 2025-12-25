'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { imageOptimizationConfig } from '@/lib/image-optimization';

interface GallerySliderProps {
  images: string[];
  title: string;
  onImageSelect?: (index: number) => void;
}

export default function GallerySlider({ images, title, onImageSelect }: GallerySliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [imageError, setImageError] = useState<number | null>(null);

  // Filter out error images
  const validImages = images.filter((_, idx) => idx !== imageError);

  if (!validImages || validImages.length === 0) {
    return (
      <div className="w-full bg-gray-200 rounded-lg h-96 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p>No images available</p>
        </div>
      </div>
    );
  }

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlay || validImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlay, validImages.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    setIsAutoPlay(false);
  }, [validImages.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
    setIsAutoPlay(false);
  }, [validImages.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
    onImageSelect?.(index);
  }, [onImageSelect]);

  const currentImage = validImages[currentIndex];

  return (
    <div className="space-y-4">
      {/* Main Slider */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden group">
        {/* Main Image */}
        <div className="relative w-full h-96 bg-gray-800">
          <Image
            src={currentImage}
            alt={`${title} - Image ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority={currentIndex === 0}
            quality={85}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 100vw"
            onError={() => setImageError(currentIndex)}
          />

          {/* Image Counter */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-full text-sm font-medium">
            {currentIndex + 1} / {validImages.length}
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
            <h3 className="text-white text-xl font-bold">{title}</h3>
          </div>

          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Next Button */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next image"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Play/Pause Button */}
          {validImages.length > 1 && (
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="absolute bottom-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
              aria-label={isAutoPlay ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isAutoPlay ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.75 1.172A.75.75 0 004 1.972v16.056a.75.75 0 001.172.627l12.94-8.028a.75.75 0 000-1.254L5.172 1.172z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 100 2v5a1 1 0 102 0V8a1 1 0 00-2 0zm6 0a1 1 0 100 2v5a1 1 0 102 0V8a1 1 0 00-2 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">Gallery ({validImages.length})</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {validImages.map((image, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  currentIndex === idx
                    ? 'border-blue-500 ring-2 ring-blue-300'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                aria-label={`View image ${idx + 1}`}
              >
                <Image
                  src={image}
                  alt={`${title} thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  onError={() => setImageError(idx)}
                />

                {/* Active indicator */}
                {currentIndex === idx && (
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

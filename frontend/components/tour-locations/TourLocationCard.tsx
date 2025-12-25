'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TourLocation } from '@/types/tour-location';

interface TourLocationCardProps {
  location: TourLocation;
  showApprovalBadge?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export default function TourLocationCard({
  location,
  showApprovalBadge = false,
  onClick,
  compact = false,
}: TourLocationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get primary image URL
  const imageUrl =
    location.imageUrl ||
    (location.gallery && location.gallery.length > 0 ? location.gallery[0].url : null) ||
    '/images/placeholder-location.jpg';

  // Format duration
  const formatDuration = () => {
    if (!location.durationMinutes) return 'Duration not specified';
    const hours = Math.floor(location.durationMinutes / 60);
    const minutes = location.durationMinutes % 60;

    if (hours === 0) return `${minutes}min`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}min`;
  };

  // Format location type
  const formatType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Compact view (smaller card)
  if (compact) {
    return (
      <Link href={`/tour-locations/${location.slug}`}>
        <div
          className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image */}
          <div className="relative w-full h-32 bg-gray-200">
            {!imageError ? (
              <Image
                src={imageUrl}
                alt={location.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500 text-sm">
                No image
              </div>
            )}
            {isHovered && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <span className="text-white text-sm font-medium">View Details</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3">
            <h3 className="font-semibold text-sm text-gray-900 truncate">
              {location.name}
            </h3>
            <p className="text-xs text-gray-600 mt-1">{formatType(location.type)}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">{location.island}</span>
              {showApprovalBadge && (
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    location.contentApproved
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {location.contentApproved ? '✓' : 'Pending'}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Full view (larger card)
  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative w-full h-64 bg-gray-200">
        {!imageError ? (
          <Image
            src={imageUrl}
            alt={location.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
            <div className="text-center">
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
              <p className="text-sm">No image available</p>
            </div>
          </div>
        )}

        {/* Overlay on hover */}
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center">
            <p className="text-white text-lg font-semibold mb-2">View Details</p>
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        )}

        {/* Badge: Type */}
        <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
          {formatType(location.type)}
        </div>

        {/* Badge: Approval Status */}
        {showApprovalBadge && (
          <div
            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium text-white ${
              location.contentApproved ? 'bg-green-600' : 'bg-yellow-600'
            }`}
          >
            {location.contentApproved ? '✓ Approved' : '⚠ Pending'}
          </div>
        )}

        {/* Badge: Featured */}
        {location.isFeatured && (
          <div className="absolute bottom-3 right-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <span>⭐</span>
            <span>Featured</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {location.name}
        </h2>

        {/* Description */}
        {location.shortDescription && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {location.shortDescription}
          </p>
        )}

        {/* Meta Information */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          {/* Island */}
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{location.island}</span>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00-.447.894l1.447 1.447a1 1 0 001.054 0l1.447-1.447A1 1 0 0011 10.894V6z"
                clipRule="evenodd"
              />
            </svg>
            <span>{formatDuration()}</span>
          </div>

          {/* Activity Level */}
          {location.skillLevel && (
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v4h8v-4zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <span className="capitalize">{location.skillLevel}</span>
            </div>
          )}

          {/* Highlights Count */}
          {location.highlights && location.highlights.length > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{location.highlights.length} highlights</span>
            </div>
          )}
        </div>

        {/* Highlights Tags */}
        {location.highlights && location.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {location.highlights.slice(0, 3).map((highlight, idx) => (
              <span
                key={idx}
                className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
              >
                {highlight}
              </span>
            ))}
            {location.highlights.length > 3 && (
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                +{location.highlights.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Keywords/Tags */}
        {location.keywords && location.keywords.length > 0 && (
          <div className="mb-4 pb-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 font-semibold mb-2">KEYWORDS</p>
            <div className="flex flex-wrap gap-1">
              {location.keywords.slice(0, 4).map((keyword, idx) => (
                <span
                  key={idx}
                  className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Link */}
        <Link href={`/tour-locations/${location.slug}`}>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">
            View Full Details
          </button>
        </Link>
      </div>
    </div>
  );
}

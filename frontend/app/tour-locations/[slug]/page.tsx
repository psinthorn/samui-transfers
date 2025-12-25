'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TourLocation } from '@/types/tour-location';
import GallerySlider from '@/components/tour-locations/GallerySlider';
import ItineraryMap from '@/components/tour-locations/ItineraryMap';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function TourLocationDetailPage({ params }: PageProps) {
  const [slug, setSlug] = useState<string>('');
  const [location, setLocation] = useState<TourLocation | null>(null);
  const [relatedLocations, setRelatedLocations] = useState<TourLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const fetchLocation = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/tour-locations/by-slug/${slug}`);

        if (!response.ok) {
          throw new Error('Location not found');
        }

        const data = await response.json();
        setLocation(data);

        // Fetch nearby locations
        if (data.gpsLat && data.gpsLon) {
          const nearbyResponse = await fetch(
            `/api/tour-locations/${data.id}/nearby?maxDistance=10&limit=3`
          );
          if (nearbyResponse.ok) {
            const nearbyData = await nearbyResponse.json();
            setRelatedLocations(nearbyData.filter((loc: TourLocation) => loc.id !== data.id));
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load location');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocation();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading location details...</p>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Location Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The location you are looking for does not exist.'}</p>
            <Link
              href="/tour-locations"
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Locations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const galleryImages = location.gallery && location.gallery.length > 0
    ? location.gallery.map((img) => img.url)
    : location.imageUrl
    ? [location.imageUrl]
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Cover Image */}
      <div className="relative bg-gray-900 h-64 md:h-96 overflow-hidden">
        {(location.gallery?.[0]?.url || location.imageUrl) && (
          <Image
            src={location.gallery?.[0]?.url || location.imageUrl!}
            alt={location.name}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="flex items-center gap-2 text-white text-sm">
            <Link href="/tour-locations" className="hover:underline">
              Locations
            </Link>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>{location.name}</span>
          </div>
        </div>

        {/* Title and Badges */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{location.name}</h1>
              <div className="flex flex-wrap gap-2">
                {/* Type Badge */}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500 text-white">
                  {location.type}
                </span>

                {/* Approval Badge */}
                {location.contentApproved && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500 text-white">
                    ✓ Approved
                  </span>
                )}

                {/* Featured Badge */}
                {location.isFeatured && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-500 text-white">
                    ★ Featured
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            {galleryImages.length > 0 && (
              <section className="bg-white rounded-lg shadow p-6">
                <GallerySlider
                  images={galleryImages}
                  title={location.name}
                  onImageSelect={setSelectedImageIndex}
                />
              </section>
            )}

            {/* Description */}
            {location.description && (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Location</h2>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <p>{location.description}</p>
                </div>
              </section>
            )}

            {/* Highlights */}
            {location.highlights && location.highlights.length > 0 && (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Highlights</h2>
                <ul className="space-y-3">
                  {location.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Amenities */}
            {location.amenities && location.amenities.length > 0 && (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities & Facilities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {location.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-4">
                {location.island && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Island</p>
                    <p className="text-gray-900">{location.island}</p>
                  </div>
                )}

                {location.durationMinutes && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Duration</p>
                    <p className="text-gray-900">{location.durationMinutes} minutes</p>
                  </div>
                )}

                {location.activity && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Activity</p>
                    <p className="text-gray-900">{location.activity}</p>
                  </div>
                )}

                {location.skillLevel && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Skill Level</p>
                    <p className="text-gray-900 capitalize">{location.skillLevel}</p>
                  </div>
                )}

                {location.latitude && location.longitude && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">GPS Coordinates</p>
                    <p className="text-gray-900 text-sm font-mono">
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </p>
                  </div>
                )}

                {location.bestTimeToVisit && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Best Time to Visit</p>
                    <p className="text-gray-900">{location.bestTimeToVisit}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Keywords */}
            {location.keywords && location.keywords.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {location.keywords.slice(0, 8).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors"
                    >
                      #{keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Button */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
              <h3 className="font-bold mb-2">Ready to explore?</h3>
              <p className="text-sm text-blue-100 mb-4">
                Book this tour location through our travel packages.
              </p>
              <Link
                href="/packages"
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                View Packages
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Share Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Share</h3>
              <div className="flex gap-2">
                <button className="flex-1 p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                  Facebook
                </button>
                <button className="flex-1 p-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition-colors text-sm font-medium">
                  Twitter
                </button>
                <button className="flex-1 p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Locations */}
        {relatedLocations.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nearby Locations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedLocations.map((loc) => (
                <Link
                  key={loc.id}
                  href={`/tour-locations/${loc.slug}`}
                  className="group bg-white rounded-lg shadow hover:shadow-lg transition-all overflow-hidden"
                >
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {(loc.gallery && loc.gallery.length > 0) || loc.imageUrl ? (
                      <Image
                        src={loc.gallery?.[0]?.url || loc.imageUrl || '/placeholder-location.jpg'}
                        alt={loc.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : null}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                        {loc.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {loc.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{loc.island}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

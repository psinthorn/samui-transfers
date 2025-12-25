'use client';

import { useMemo } from 'react';

interface SEOPreviewProps {
  title?: string;
  slug?: string;
  description?: string;
  keywords?: string[];
}

export default function SEOPreview({
  title = 'Location Title',
  slug = 'location-slug',
  description = 'Location description will appear here',
  keywords = [],
}: SEOPreviewProps) {
  // Calculate SEO score (0-100)
  const seoScore = useMemo(() => {
    let score = 0;

    // Title scoring (max 25 points)
    if (title && title.length > 0) {
      score += 5;
      if (title.length >= 30 && title.length <= 60) score += 20; // Optimal length
      else if (title.length >= 20 && title.length <= 70) score += 15; // Good length
      else if (title.length > 0) score += 10; // Has content but not optimal
    }

    // Slug scoring (max 15 points)
    if (slug && slug.length > 0) {
      score += 5;
      if (slug.includes('-')) score += 5;
      if (!slug.includes('_') && slug === slug.toLowerCase()) score += 5;
    }

    // Description scoring (max 30 points)
    if (description && description.length > 0) {
      score += 5;
      if (description.length >= 120 && description.length <= 160) score += 20; // Optimal
      else if (description.length >= 100 && description.length <= 180) score += 15; // Good
      else if (description.length > 0) score += 10; // Has content
    }

    // Keywords scoring (max 30 points)
    if (keywords && keywords.length > 0) {
      score += 5;
      if (keywords.length >= 3 && keywords.length <= 6) score += 20; // Optimal
      else if (keywords.length > 0 && keywords.length <= 8) score += 15; // Good
      else score += 10; // Has keywords
    }

    return Math.min(score, 100);
  }, [title, slug, description, keywords]);

  // Get score color and label
  const getScoreColor = () => {
    if (seoScore >= 80) return { color: 'text-green-600', bg: 'bg-green-50', label: 'Excellent' };
    if (seoScore >= 60) return { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Good' };
    if (seoScore >= 40) return { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Fair' };
    return { color: 'text-red-600', bg: 'bg-red-50', label: 'Needs Improvement' };
  };

  const scoreColor = getScoreColor();

  // Get recommendations
  const recommendations = useMemo(() => {
    const tips: string[] = [];

    if (!title || title.length === 0) tips.push('Add a title for the location');
    else if (title.length < 30) tips.push('Title is too short. Aim for 30-60 characters.');
    else if (title.length > 60) tips.push('Title is too long. Keep it under 60 characters.');

    if (!slug || slug.length === 0) tips.push('Generate a URL-friendly slug');
    else if (!slug.includes('-')) tips.push('Use hyphens to separate words in the slug');
    else if (slug.includes('_')) tips.push('Replace underscores with hyphens in the slug');

    if (!description || description.length === 0) tips.push('Add a meta description');
    else if (description.length < 120) tips.push('Description is too short. Aim for 120-160 characters.');
    else if (description.length > 160) tips.push('Description is too long. Keep it under 160 characters.');

    if (!keywords || keywords.length === 0) tips.push('Add 3-6 relevant keywords');
    else if (keywords.length < 3) tips.push(`Add more keywords. You have ${keywords.length}, aim for 3-6.`);
    else if (keywords.length > 6) tips.push(`You have too many keywords (${keywords.length}). Aim for 3-6.`);

    return tips;
  }, [title, slug, description, keywords]);

  return (
    <div className="space-y-4">
      {/* SEO Score Card */}
      <div className={`p-4 rounded-lg border ${scoreColor.bg}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-lg font-bold ${scoreColor.color}`}>SEO Score</h3>
          <div className="text-right">
            <div className={`text-3xl font-bold ${scoreColor.color}`}>{seoScore}</div>
            <div className={`text-xs font-medium ${scoreColor.color}`}>{scoreColor.label}</div>
          </div>
        </div>

        {/* Score Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              seoScore >= 80
                ? 'bg-green-600'
                : seoScore >= 60
                  ? 'bg-amber-600'
                  : seoScore >= 40
                    ? 'bg-orange-600'
                    : 'bg-red-600'
            }`}
            style={{ width: `${seoScore}%` }}
          />
        </div>
      </div>

      {/* SEO Elements Checklist */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">SEO Elements</h3>

        {/* Title */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-700 uppercase">Page Title</p>
              <p className="text-sm text-gray-600 mt-1">{title || '(No title)'}</p>
              <p className="text-xs text-gray-500 mt-1">
                {title?.length || 0} / 60 characters
                {title && title.length >= 30 && title.length <= 60 && (
                  <span className="text-green-600 ml-1">✓ Optimal</span>
                )}
              </p>
            </div>
            <div className="ml-2">
              {title && title.length >= 30 && title.length <= 60 ? (
                <div className="text-2xl">✓</div>
              ) : (
                <div className="text-xl text-gray-300">○</div>
              )}
            </div>
          </div>
        </div>

        {/* Slug */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-700 uppercase">URL Slug</p>
              <p className="text-sm text-gray-600 mt-1 break-all">{slug || '(No slug)'}</p>
              <p className="text-xs text-gray-500 mt-1">
                {slug && slug.includes('-') && slug === slug.toLowerCase()
                  ? 'SEO-friendly'
                  : 'Needs optimization'}
              </p>
            </div>
            <div className="ml-2">
              {slug && slug.includes('-') && slug === slug.toLowerCase() ? (
                <div className="text-2xl">✓</div>
              ) : (
                <div className="text-xl text-gray-300">○</div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-700 uppercase">Meta Description</p>
              <p className="text-sm text-gray-600 mt-1">{description || '(No description)'}</p>
              <p className="text-xs text-gray-500 mt-1">
                {description?.length || 0} / 160 characters
                {description && description.length >= 120 && description.length <= 160 && (
                  <span className="text-green-600 ml-1">✓ Optimal</span>
                )}
              </p>
            </div>
            <div className="ml-2">
              {description && description.length >= 120 && description.length <= 160 ? (
                <div className="text-2xl">✓</div>
              ) : (
                <div className="text-xl text-gray-300">○</div>
              )}
            </div>
          </div>
        </div>

        {/* Keywords */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-700 uppercase">Focus Keywords</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {keywords && keywords.length > 0 ? (
                  keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded"
                    >
                      {keyword}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">(No keywords added)</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {keywords?.length || 0} / 6 keywords
                {keywords && keywords.length >= 3 && keywords.length <= 6 && (
                  <span className="text-green-600 ml-1">✓ Optimal</span>
                )}
              </p>
            </div>
            <div className="ml-2">
              {keywords && keywords.length >= 3 && keywords.length <= 6 ? (
                <div className="text-2xl">✓</div>
              ) : (
                <div className="text-xl text-gray-300">○</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Recommendations</h3>
          <ul className="space-y-2">
            {recommendations.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <svg
                  className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 7H7v6h6V7z" />
                  <path
                    fillRule="evenodd"
                    d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2V2a1 1 0 112 0v1a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2v1a1 1 0 11-2 0v-1h-2v1a1 1 0 11-2 0v-1a2 2 0 01-2-2v-2H3a1 1 0 110-2h1V9H3a1 1 0 010-2h1V5a2 2 0 012-2v-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-blue-700">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Google Preview</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
          <div className="text-sm text-blue-600 break-all">
            samui-transfers.local/tour-locations/{slug || 'location-slug'}
          </div>
          <div className="text-base font-medium text-blue-900 break-words">{title || 'Location Title'}</div>
          <div className="text-sm text-gray-600 break-words">{description || 'Location description...'}</div>
        </div>
      </div>
    </div>
  );
}

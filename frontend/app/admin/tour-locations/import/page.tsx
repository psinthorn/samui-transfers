'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { batchImportLocations } from '@/lib/tour-location';

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  console.log(`[${type.toUpperCase()}] ${message}`);
};

interface CSVRow {
  [key: string]: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

export default function ImportLocationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams() as any;
  const tourId = searchParams?.get('tourId') || '';

  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'results'>('upload');
  const [results, setResults] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    parseCSV(selectedFile);
  };

  // Parse CSV file
  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter((line) => line.trim());

        if (lines.length < 2) {
          setError('CSV file must contain headers and at least one data row');
          return;
        }

        // Parse headers
        const headers = lines[0].split(',').map((h) => h.trim());
        const required = [
          'name',
          'type',
          'latitude',
          'longitude',
          'sequenceNumber',
        ];
        const missingHeaders = required.filter(
          (h) => !headers.map((hh) => hh.toLowerCase()).includes(h.toLowerCase())
        );

        if (missingHeaders.length > 0) {
          setError(`Missing required columns: ${missingHeaders.join(', ')}`);
          return;
        }

        // Parse data rows
        const rows: CSVRow[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          const row: CSVRow = {};
          headers.forEach((header, index) => {
            row[header] = values[index]?.trim() || '';
          });
          if (row.name) rows.push(row);
        }

        if (rows.length === 0) {
          setError('No valid data rows found in CSV');
          return;
        }

        setCsvData(rows);
        setStep('preview');
        showToast(`Parsed ${rows.length} rows from CSV`);
      } catch (err: any) {
        setError('Failed to parse CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Handle import
  const handleImport = async () => {
    if (!tourId) {
      setError('Tour ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert CSV data to location objects
      const locations = csvData.map((row) => ({
        tourPackageId: tourId,
        name: row.name || '',
        type: (row.type || 'LAND_ACTIVITY') as any,
        latitude: parseFloat(row.latitude || '0'),
        longitude: parseFloat(row.longitude || '0'),
        sequenceNumber: parseInt(row.sequenceNumber || '0', 10),
        slug: row.slug || '',
        duration: row.duration || '',
        durationMinutes: row.durationMinutes ? parseInt(row.durationMinutes, 10) : null,
        title: row.title || '',
        description: row.description || '',
        imageUrls: row.imageUrls ? row.imageUrls.split(';').map((u) => u.trim()) : [],
        galleryUrls: row.galleryUrls ? row.galleryUrls.split(';').map((u) => u.trim()) : [],
        keywords: row.keywords ? row.keywords.split(';').map((k) => k.trim()) : [],
        highlights: row.highlights ? row.highlights.split(';').map((h) => h.trim()) : [],
        funFacts: row.funFacts ? row.funFacts.split(';').map((f) => f.trim()) : [],
        tips: row.tips ? row.tips.split(';').map((t) => t.trim()) : [],
        isActive: row.isActive !== 'false',
        contentApproved: row.contentApproved === 'true',
      }));

      const result = await batchImportLocations(tourId, locations);
      setResults({
        success: result.success,
        failed: result.failed,
        errors: result.errors || [],
      });
      setStep('results');
      showToast(`Import completed: ${result.success} successful, ${result.failed} failed`);
    } catch (err: any) {
      setError(err.message || 'Failed to import locations');
      showToast(err.message || 'Failed to import locations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Download template
  const downloadTemplate = () => {
    const headers = [
      'name',
      'type',
      'sequenceNumber',
      'latitude',
      'longitude',
      'slug',
      'duration',
      'durationMinutes',
      'title',
      'description',
      'imageUrls',
      'galleryUrls',
      'keywords',
      'highlights',
      'funFacts',
      'tips',
      'isActive',
      'contentApproved',
    ];
    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tour-locations-template.csv';
    link.click();
  };

  if (!tourId) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-medium">Tour ID is required</p>
          <p className="text-sm mt-1">Please navigate from the tour locations list page</p>
          <Link
            href="/admin/tour-locations"
            className="text-red-600 hover:text-red-800 underline mt-2 inline-block"
          >
            Back to Tour Locations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Back Button */}
      <Link
        href={`/admin/tour-locations?tourId=${tourId}`}
        className="text-blue-600 hover:text-blue-800 underline text-sm mb-6 inline-block"
      >
        ← Back to Tour Locations
      </Link>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Import Tour Locations</h1>
          <p className="text-gray-600 mt-2">
            Bulk import locations from a CSV file. Each row represents one location.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Step 1: Select CSV File</h2>

              {/* Instructions */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                <p className="text-sm font-medium text-blue-900">Instructions:</p>
                <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                  <li>Download the template to see required columns</li>
                  <li>Fill in your location data in the CSV</li>
                  <li>Use semicolons (;) to separate multiple values in array fields</li>
                  <li>Example: "Snorkeling;Swimming" for multiple highlights</li>
                </ul>
              </div>

              {/* Template Download */}
              <button
                onClick={downloadTemplate}
                className="mb-6 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                📥 Download CSV Template
              </button>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer block space-y-2"
                >
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
                      {file ? file.name : 'Click to select or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500">CSV files only</p>
                  </div>
                </label>
              </div>

              {/* Column Reference */}
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Available Columns:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 uppercase mb-2">
                      Required
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• name</li>
                      <li>• type</li>
                      <li>• latitude</li>
                      <li>• longitude</li>
                      <li>• sequenceNumber</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 uppercase mb-2">
                      Optional
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• slug, duration, durationMinutes</li>
                      <li>• title, description, imageUrls</li>
                      <li>• galleryUrls, keywords, highlights</li>
                      <li>• funFacts, tips, isActive, contentApproved</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 'preview' && csvData.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Step 2: Preview ({csvData.length} locations)
              </h2>

              {/* Data Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-900">#</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900">Lat/Lng</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900">Seq</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {csvData.slice(0, 10).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {row.name}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{row.type}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {row.latitude?.slice(0, 8)}, {row.longitude?.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{row.sequenceNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {csvData.length > 10 && (
                <p className="text-sm text-gray-600 mt-2">
                  Showing first 10 of {csvData.length} locations
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep('upload');
                  setFile(null);
                  setCsvData([]);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                ← Back to Upload
              </button>
              <button
                onClick={handleImport}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isLoading ? 'Importing...' : `Import ${csvData.length} Locations`}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 'results' && results && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Step 3: Import Results</h2>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600">{results.success}</div>
                  <p className="text-sm text-green-700">Successful</p>
                </div>
                <div
                  className={`p-4 rounded-lg text-center border ${
                    results.failed > 0
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div
                    className={`text-3xl font-bold ${
                      results.failed > 0 ? 'text-red-600' : 'text-gray-600'
                    }`}
                  >
                    {results.failed}
                  </div>
                  <p className={`text-sm ${results.failed > 0 ? 'text-red-700' : 'text-gray-600'}`}>
                    Failed
                  </p>
                </div>
              </div>

              {/* Error Details */}
              {results.errors.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Errors:</h3>
                  <div className="max-h-64 overflow-y-auto border border-red-200 rounded-lg bg-red-50">
                    {results.errors.map((err, i) => (
                      <div
                        key={i}
                        className="px-4 py-2 border-b border-red-200 last:border-b-0"
                      >
                        <p className="text-sm font-medium text-red-900">
                          Row {err.row}: {err.error}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link
                href={`/admin/tour-locations?tourId=${tourId}`}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium text-center"
              >
                ✓ View Imported Locations
              </Link>
              <button
                onClick={() => {
                  setStep('upload');
                  setFile(null);
                  setCsvData([]);
                  setResults(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                ↻ Import Another File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

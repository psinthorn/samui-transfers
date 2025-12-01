/**
 * Admin Rate Management Page
 * 
 * Manage service rates, pricing rules, and view history
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';

interface ServiceRate {
  id: string;
  vehicleType: string;
  basePrice: string;
  distanceRate: string;
  minDistance: number;
  maxDistance?: number;
  description?: string;
  isActive: boolean;
}

interface RateFormData {
  vehicleType: string;
  basePrice: string;
  distanceRate: string;
  minDistance: string;
  maxDistance: string;
  description: string;
}

export default function AdminRatesPage() {
  const [rates, setRates] = useState<ServiceRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<RateFormData>({
    vehicleType: '',
    basePrice: '',
    distanceRate: '',
    minDistance: '',
    maxDistance: '',
    description: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch rates on mount
  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/rates/service-rates');

      if (!response.ok) {
        throw new Error('Failed to fetch rates');
      }

      const data = await response.json();
      setRates(data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.vehicleType || !formData.basePrice || !formData.distanceRate || !formData.minDistance) {
        throw new Error('Please fill in all required fields');
      }

      const body: any = {
        vehicleType: formData.vehicleType.toUpperCase(),
        basePrice: parseFloat(formData.basePrice),
        distanceRate: parseFloat(formData.distanceRate),
        minDistance: parseInt(formData.minDistance),
      };

      if (formData.maxDistance) {
        body.maxDistance = parseInt(formData.maxDistance);
      }

      if (formData.description) {
        body.description = formData.description;
      }

      const url = editingId ? '/api/admin/rates/service-rates' : '/api/admin/rates/service-rates';
      const method = editingId ? 'PUT' : 'POST';

      if (editingId) {
        body.id = editingId;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${editingId ? 'update' : 'create'} rate`);
      }

      // Success - refresh rates
      await fetchRates();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        vehicleType: '',
        basePrice: '',
        distanceRate: '',
        minDistance: '',
        maxDistance: '',
        description: '',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (rate: ServiceRate) => {
    setEditingId(rate.id);
    setFormData({
      vehicleType: rate.vehicleType,
      basePrice: rate.basePrice,
      distanceRate: rate.distanceRate,
      minDistance: rate.minDistance.toString(),
      maxDistance: rate.maxDistance?.toString() || '',
      description: rate.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rate?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/rates/service-rates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete rate');
      }

      await fetchRates();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      vehicleType: '',
      basePrice: '',
      distanceRate: '',
      minDistance: '',
      maxDistance: '',
      description: '',
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Rate Management</h1>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Rate
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form Section */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {editingId ? 'Edit Rate' : 'Add New Rate'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Vehicle Type *
                </label>
                <input
                  type="text"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  placeholder="e.g., MINIBUS, SUV"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Base Price (THB) *
                </label>
                <input
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  placeholder="300"
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Distance Rate (THB/km) *
                </label>
                <input
                  type="number"
                  name="distanceRate"
                  value={formData.distanceRate}
                  onChange={handleInputChange}
                  placeholder="5.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Minimum Distance (km) *
                </label>
                <input
                  type="number"
                  name="minDistance"
                  value={formData.minDistance}
                  onChange={handleInputChange}
                  placeholder="5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Maximum Distance (km)
                </label>
                <input
                  type="number"
                  name="maxDistance"
                  value={formData.maxDistance}
                  onChange={handleInputChange}
                  placeholder="50"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g., 7-seat minibus with A/C"
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Rate'
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Rates List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : rates.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-slate-600">No rates found. Create your first rate to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Vehicle Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Base Price
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Distance Rate
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Min/Max Distance
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => (
                <tr key={rate.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">{rate.vehicleType}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    ฿{parseFloat(rate.basePrice).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    ฿{parseFloat(rate.distanceRate).toFixed(2)}/km
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {rate.minDistance} - {rate.maxDistance || '∞'} km
                  </td>
                  <td className="px-6 py-4 text-slate-700 text-sm">
                    {rate.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(rate)}
                      disabled={showForm}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(rate.id)}
                      disabled={showForm}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

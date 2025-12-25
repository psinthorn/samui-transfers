'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, TrendingUp, Users } from 'lucide-react';

interface ServiceMetrics {
  serviceType: string;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  averageRating: number;
  lastUpdated: string;
}

interface ServiceSettings {
  serviceType: string;
  isActive: boolean;
  maxCapacity: number;
  minBookingDays: number;
  maxBookingDays: number;
  commissionRate: number;
  description: string;
}

export function ServicesManagementClient() {
  const [metrics, setMetrics] = useState<ServiceMetrics[]>([]);
  const [settings, setSettings] = useState<ServiceSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const [editingService, setEditingService] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metricsRes, settingsRes] = await Promise.all([
        fetch('/api/admin/services/metrics'),
        fetch('/api/admin/services/settings'),
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }
    } catch (error) {
      console.error('Error fetching services data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (serviceType: string, updatedSettings: Partial<ServiceSettings>) => {
    try {
      const response = await fetch(`/api/admin/services/settings/${serviceType}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });

      if (response.ok) {
        setEditingService(null);
        await fetchData();
      }
    } catch (error) {
      console.error('Error updating service settings:', error);
    }
  };

  const serviceConfig = {
    TRANSFER: { label: 'Airport Transfers', icon: '🚗', color: 'blue' },
    BOAT: { label: 'Speedboat Tours', icon: '🌊', color: 'cyan' },
    TOUR: { label: 'Guided Tours', icon: '📍', color: 'emerald' },
    EVENT: { label: 'Event Services', icon: '📅', color: 'purple' },
    PACKAGE: { label: 'Package Deals', icon: '🎁', color: 'rose' },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Services Management</h1>
        <p className="text-slate-600 mt-2">Manage and monitor all available services</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {metrics.map((metric) => {
              const config = serviceConfig[metric.serviceType as keyof typeof serviceConfig];
              return (
                <Card key={metric.serviceType}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{config?.label}</CardTitle>
                      <span className="text-2xl">{config?.icon}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-600 uppercase tracking-wide">Total Bookings</p>
                        <p className="text-2xl font-bold text-slate-900">{metric.totalBookings}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-slate-600">Confirmed</p>
                          <p className="text-lg font-semibold text-green-600">{metric.confirmedBookings}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Pending</p>
                          <p className="text-lg font-semibold text-yellow-600">{metric.pendingBookings}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-slate-600">Revenue</p>
                        <p className="text-lg font-semibold text-primary">
                          ${metric.totalRevenue.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 flex items-center gap-2">
                          <TrendingUp className="w-3 h-3" />
                          Rating
                        </p>
                        <p className="text-lg font-semibold">⭐ {metric.averageRating.toFixed(1)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Detailed Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Service Performance</CardTitle>
              <CardDescription>Detailed metrics for each service type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Service</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-900">Bookings</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-900">Confirmed</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-900">Pending</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-900">Revenue</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-900">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((metric) => {
                      const config = serviceConfig[metric.serviceType as keyof typeof serviceConfig];
                      return (
                        <tr key={metric.serviceType} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{config?.icon}</span>
                              <span className="font-medium text-slate-900">{config?.label}</span>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4 text-slate-900 font-medium">
                            {metric.totalBookings}
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                              <CheckCircle className="w-4 h-4" />
                              {metric.confirmedBookings}
                            </span>
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-yellow-600 font-medium">
                              <AlertCircle className="w-4 h-4" />
                              {metric.pendingBookings}
                            </span>
                          </td>
                          <td className="text-right py-3 px-4 font-medium text-slate-900">
                            ${metric.totalRevenue.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-4">⭐ {metric.averageRating.toFixed(1)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {settings.map((service) => {
            const config = serviceConfig[service.serviceType as keyof typeof serviceConfig];
            const isEditing = editingService === service.serviceType;

            return (
              <Card key={service.serviceType}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{config?.icon}</span>
                      <div>
                        <CardTitle>{config?.label}</CardTitle>
                        <CardDescription>{service.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {service.isActive ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                          <AlertCircle className="w-4 h-4" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <EditServiceForm
                      service={service}
                      onSave={(updated) => handleUpdateSettings(service.serviceType, updated)}
                      onCancel={() => setEditingService(null)}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">Max Capacity</p>
                          <p className="text-2xl font-bold text-slate-900">{service.maxCapacity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Min Booking Days</p>
                          <p className="text-2xl font-bold text-slate-900">{service.minBookingDays}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Max Booking Days</p>
                          <p className="text-2xl font-bold text-slate-900">{service.maxBookingDays}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Commission Rate</p>
                          <p className="text-2xl font-bold text-slate-900">{service.commissionRate}%</p>
                        </div>
                      </div>
                      <div className="pt-4 flex gap-2">
                        <Button
                          onClick={() => setEditingService(service.serviceType)}
                          variant="outline"
                        >
                          Edit Settings
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EditServiceForm({
  service,
  onSave,
  onCancel,
}: {
  service: ServiceSettings;
  onSave: (updated: Partial<ServiceSettings>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(service);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Max Capacity
          </label>
          <input
            type="number"
            value={formData.maxCapacity}
            onChange={(e) =>
              setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Commission Rate (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.commissionRate}
            onChange={(e) =>
              setFormData({ ...formData, commissionRate: parseFloat(e.target.value) })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Min Booking Days
          </label>
          <input
            type="number"
            value={formData.minBookingDays}
            onChange={(e) =>
              setFormData({ ...formData, minBookingDays: parseInt(e.target.value) })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Max Booking Days
          </label>
          <input
            type="number"
            value={formData.maxBookingDays}
            onChange={(e) =>
              setFormData({ ...formData, maxBookingDays: parseInt(e.target.value) })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="mr-2"
          />
          Active Service
        </label>
      </div>
      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

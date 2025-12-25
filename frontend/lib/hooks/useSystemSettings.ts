import { useCallback, useEffect, useState } from 'react';

interface SettingValue {
  value: any;
  type: string;
  category: string;
}

interface SystemSettingsContextType {
  settings: Record<string, SettingValue>;
  loading: boolean;
  error: string | null;
  updateSetting: (key: string, value: any, type?: string) => Promise<void>;
  getSetting: (key: string, defaultValue?: any) => any;
}

let settingsCache: Record<string, SettingValue> = {};
let settingsPromise: Promise<Record<string, SettingValue>> | null = null;

export function useSystemSettings() {
  const [settings, setSettings] = useState<Record<string, SettingValue>>(settingsCache);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    if (Object.keys(settingsCache).length > 0) {
      setSettings(settingsCache);
      return settingsCache;
    }

    if (settingsPromise) {
      const result = await settingsPromise;
      setSettings(result);
      return result;
    }

    setLoading(true);
    try {
      settingsPromise = fetch('/api/admin/settings')
        .then(res => res.json())
        .then(data => {
          settingsCache = data;
          return data;
        });

      const result = await settingsPromise;
      setSettings(result);
      setError(null);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch settings';
      setError(errorMsg);
      console.error('[useSystemSettings] Fetch error:', err);
      return {};
    } finally {
      setLoading(false);
      settingsPromise = null;
    }
  }, []);

  // Update a single setting in real-time
  const updateSetting = useCallback(async (key: string, value: any, type: string = 'string') => {
    try {
      setError(null);

      // Optimistic update
      setSettings(prev => ({
        ...prev,
        [key]: {
          value,
          type,
          category: prev[key]?.category || 'general',
        },
      }));

      // Send to API
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, type }),
      });

      if (!response.ok) {
        throw new Error('Failed to update setting');
      }

      const result = await response.json();

      // Update cache with server response
      settingsCache[key] = {
        value: result.setting.value,
        type: result.setting.type,
        category: result.setting.category,
      };

      // Update state with confirmed value
      setSettings(prev => ({
        ...prev,
        [key]: {
          value: result.setting.value,
          type: result.setting.type,
          category: result.setting.category,
        },
      }));

      console.log(`[useSystemSettings] Updated ${key}:`, value);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update setting';
      setError(errorMsg);
      console.error('[useSystemSettings] Update error:', err);

      // Revert optimistic update
      await fetchSettings();
      throw err;
    }
  }, [fetchSettings]);

  // Get a setting value with optional default
  const getSetting = useCallback((key: string, defaultValue: any = null): any => {
    const setting = settings[key];
    return setting ? setting.value : defaultValue;
  }, [settings]);

  // Load settings on mount
  useEffect(() => {
    if (Object.keys(settings).length === 0) {
      fetchSettings();
    }
  }, []);

  return {
    settings,
    loading,
    error,
    updateSetting,
    getSetting,
  };
}

// Create a context for providing settings globally
import { createContext } from 'react';

export const SystemSettingsContext = createContext<SystemSettingsContextType | null>(null);

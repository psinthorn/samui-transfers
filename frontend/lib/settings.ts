import { db } from '@/lib/db';

let settingsCache: Record<string, any> = {};
let cacheTimestamp = 0;
const CACHE_DURATION = 60000; // 1 minute

export async function getSystemSetting(key: string, defaultValue: any = null) {
  try {
    // Check cache first
    const now = Date.now();
    if (settingsCache[key] && (now - cacheTimestamp) < CACHE_DURATION) {
      return settingsCache[key];
    }

    // Fetch from database
    const setting = await db.systemSettings.findUnique({
      where: { key },
    });

    const value = setting ? setting.value : defaultValue;
    
    // Parse boolean and number values
    let parsedValue: any = value;
    if (setting?.type === 'boolean') {
      parsedValue = value === 'true' || value === true;
    } else if (setting?.type === 'number') {
      parsedValue = parseInt(value, 10);
    } else if (setting?.type === 'json') {
      try {
        parsedValue = JSON.parse(value);
      } catch (e) {
        parsedValue = value;
      }
    }

    settingsCache[key] = parsedValue;
    cacheTimestamp = now;

    return parsedValue;
  } catch (error) {
    console.error(`[getSystemSetting] Error fetching ${key}:`, error);
    return defaultValue;
  }
}

export async function getAllSystemSettings() {
  try {
    const settings = await db.systemSettings.findMany();
    const result: Record<string, any> = {};

    settings.forEach(setting => {
      let value: any = setting.value;
      if (setting.type === 'boolean') {
        value = value === 'true' || value === true;
      } else if (setting.type === 'number') {
        value = parseInt(value, 10);
      } else if (setting.type === 'json') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string
        }
      }
      result[setting.key] = value;
    });

    return result;
  } catch (error) {
    console.error('[getAllSystemSettings] Error:', error);
    return {};
  }
}

export function clearSettingsCache() {
  settingsCache = {};
  cacheTimestamp = 0;
}

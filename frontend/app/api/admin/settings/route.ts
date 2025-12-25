import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET all settings
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as any;

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const settings = await db.systemSettings.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    // Convert settings to a keyed object and parse values
    const settingsMap: Record<string, any> = {};
    settings.forEach(setting => {
      try {
        settingsMap[setting.key] = {
          value: setting.type === 'json' ? JSON.parse(setting.value) : setting.value,
          type: setting.type,
          category: setting.category,
        };
      } catch (e) {
        settingsMap[setting.key] = {
          value: setting.value,
          type: setting.type,
          category: setting.category,
        };
      }
    });

    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error('[Settings API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// UPDATE a single setting (real-time)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as any;

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { key, value, type = 'string' } = body;

    if (!key) {
      return NextResponse.json(
        { error: 'Setting key is required' },
        { status: 400 }
      );
    }

    // Convert value to string based on type
    let stringValue = value;
    if (typeof value === 'object') {
      stringValue = JSON.stringify(value);
    } else if (typeof value === 'boolean') {
      stringValue = value ? 'true' : 'false';
    } else {
      stringValue = String(value);
    }

    const setting = await db.systemSettings.upsert({
      where: { key },
      update: {
        value: stringValue,
        type,
        updatedAt: new Date(),
      },
      create: {
        key,
        value: stringValue,
        type,
        label_en: key,
        label_th: key,
        category: 'general',
      },
    });

    return NextResponse.json({
      success: true,
      setting: {
        ...setting,
        value: type === 'json' ? JSON.parse(setting.value) : setting.value,
      },
    });
  } catch (error) {
    console.error('[Settings API] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    );
  }
}

// PATCH - Update multiple settings at once
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as any;

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const updates = body.settings; // Array of { key, value, type }

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Settings must be an array' },
        { status: 400 }
      );
    }

    const results = [];

    for (const update of updates) {
      const { key, value, type = 'string' } = update;

      let stringValue = value;
      if (typeof value === 'object') {
        stringValue = JSON.stringify(value);
      } else if (typeof value === 'boolean') {
        stringValue = value ? 'true' : 'false';
      } else {
        stringValue = String(value);
      }

      const setting = await db.systemSettings.upsert({
        where: { key },
        update: {
          value: stringValue,
          type,
          updatedAt: new Date(),
        },
        create: {
          key,
          value: stringValue,
          type,
          label_en: key,
          label_th: key,
          category: 'general',
        },
      });

      results.push({
        ...setting,
        value: type === 'json' ? JSON.parse(setting.value) : setting.value,
      });
    }

    return NextResponse.json({
      success: true,
      settings: results,
    });
  } catch (error) {
    console.error('[Settings API] PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// Middleware to check admin role
async function checkAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { isAuthorized: false, error: 'Unauthorized' };
  }

  const user = session.user as any;
  if (user?.role !== 'ADMIN') {
    return { isAuthorized: false, error: 'Admin access required' };
  }

  return { isAuthorized: true, userId: user.id };
}

// GET - Fetch all pages or single page
export async function GET(request: NextRequest) {
  const auth = await checkAdmin();
  if (!auth.isAuthorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      // Fetch single page
      const page = await db.pageContent.findUnique({
        where: { slug },
      });

      if (!page) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
      }

      return NextResponse.json(page);
    }

    // Fetch all pages with filters
    const contentType = searchParams.get('contentType');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const where: any = {};
    if (contentType) where.contentType = contentType;
    if (status) where.status = status;
    if (category) where.category = category;

    const pages = await db.pageContent.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error('[GET /api/admin/content]', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

// POST - Create new page
export async function POST(request: NextRequest) {
  const auth = await checkAdmin();
  if (!auth.isAuthorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      slug,
      title_en,
      title_th,
      content_en,
      content_th,
      description_en,
      description_th,
      contentType = 'page',
      status = 'draft',
      category = 'general',
      featuredImage,
      metaKeywords_en,
      metaKeywords_th,
    } = body;

    // Validate required fields
    if (!slug || !title_en || !title_th || !content_en || !content_th) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, title_en, title_th, content_en, content_th' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await db.pageContent.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }

    // Create page
    const page = await db.pageContent.create({
      data: {
        slug,
        title_en,
        title_th,
        content_en,
        content_th,
        description_en,
        description_th,
        contentType,
        status,
        category,
        featuredImage,
        metaKeywords_en,
        metaKeywords_th,
        createdBy: auth.userId,
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/content]', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}

// PATCH - Update page
export async function PATCH(request: NextRequest) {
  const auth = await checkAdmin();
  if (!auth.isAuthorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, slug, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing page ID' }, { status: 400 });
    }

    // Check if slug is being changed and if new slug exists
    if (slug) {
      const existing = await db.pageContent.findUnique({
        where: { slug },
      });

      if (existing && existing.id !== id) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
      }
    }

    const page = await db.pageContent.update({
      where: { id },
      data: {
        ...updateData,
        ...(slug && { slug }),
        updatedBy: auth.userId,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error('[PATCH /api/admin/content]', error);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

// DELETE - Delete page
export async function DELETE(request: NextRequest) {
  const auth = await checkAdmin();
  if (!auth.isAuthorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing page ID' }, { status: 400 });
    }

    await db.pageContent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/content]', error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}

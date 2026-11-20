import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Folder } from '@/lib/models/Folder';

const DEFAULT_FOLDERS = [
  {
    name: 'Education',
    slug: 'education',
    icon: 'book-open',
    color: '#3b82f6',
    description: 'Lectures, tutorials, and educational content',
  },
  {
    name: 'Meditation',
    slug: 'meditation',
    icon: 'sparkles',
    color: '#10b981',
    description: 'Mindfulness, calm sounds, and meditation guides',
  },
  {
    name: 'Coding & Tech',
    slug: 'coding',
    icon: 'code',
    color: '#8b5cf6',
    description: 'Programming guides, AI, and developer tools',
  },
  {
    name: 'Focus & Calm',
    slug: 'focus-calm',
    icon: 'headphones',
    color: '#f59e0b',
    description: 'Deep work background music and podcasts',
  },
];

export async function GET() {
  try {
    await connectToDatabase();

    let folders = await Folder.find({}).sort({ createdAt: 1 }).lean();

    // If no folders exist yet, seed the default folders
    if (!folders || folders.length === 0) {
      await Folder.insertMany(DEFAULT_FOLDERS);
      folders = await Folder.find({}).sort({ createdAt: 1 }).lean();
    }

    return NextResponse.json({ folders });
  } catch (error: unknown) {
    console.error('Folders GET error:', error);
    // Fallback in case of database connectivity issue
    return NextResponse.json({ folders: DEFAULT_FOLDERS, warning: 'Using fallback default folders' });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, icon, color, description } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = await Folder.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: 'A folder with this name already exists' },
        { status: 409 }
      );
    }

    const newFolder = await Folder.create({
      name: name.trim(),
      slug,
      icon: icon || 'folder',
      color: color || '#ef4444',
      description: description || '',
    });

    return NextResponse.json({ folder: newFolder }, { status: 201 });
  } catch (error: unknown) {
    console.error('Folders POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create folder';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Folder id is required' }, { status: 400 });
    }

    await Folder.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Folder deleted' });
  } catch (error: unknown) {
    console.error('Folders DELETE error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete folder';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Uploaded file must be an image' }, { status: 400 });
    }

    // Simulate processing delay (3 seconds) to demonstrate processing UI
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Return dummy video
    // This is a publicly available open source test video
    const dummyVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';

    return NextResponse.json({ 
        success: true, 
        videoUrl: dummyVideoUrl 
    });

  } catch (error) {
    console.error('Generation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Template video URLs mapping
const templateVideos = {
  cinematic: 'https://www.w3schools.com/html/mov_bbb.mp4',
  social: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  business: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
  artistic: 'https://sample-videos.com/video321/mp4/480/big_buck_bunny_480p_1mb.mp4',
  minimal: 'https://sample-videos.com/video123/mp4/480/big_buck_bunny_480p_1mb.mp4'
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const template = formData.get('template') as string || 'cinematic';

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

    // Return template-specific video
    const videoUrl = templateVideos[template as keyof typeof templateVideos] || templateVideos.cinematic;

    return NextResponse.json({ 
        success: true, 
        videoUrl: videoUrl,
        template: template
    });

  } catch (error) {
    console.error('Generation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

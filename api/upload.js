
import { put } from '@vercel/blob';

export const config = {
  runtime: 'edge', // or 'nodejs'
};

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const form = await request.formData();
    const file = form.get('file');

    if (!file) {
      return new Response('No file provided', { status: 400 });
    }

    // Upload 'file' to Vercel Blob
    // access: 'public' means the URL is publicly accessible
    const blob = await put(file.name, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN, // Injected by Vercel (or .env locally)
    });

    return new Response(JSON.stringify(blob), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

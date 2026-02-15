
import { put } from '@vercel/blob';

// Switch to Node.js runtime to avoid Edge limitations with stream/undici
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel Serverless Functions provide .query on the request object
    const filename = request.query.filename || `puzzle-${Date.now()}.jpg`;

    // Stream the request body directly to Vercel Blob
    const blob = await put(filename, request, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return response.status(200).json(blob);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: error.message });
  }
}

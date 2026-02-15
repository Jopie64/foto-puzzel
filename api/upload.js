
import { put } from '@vercel/blob';
import crypto from 'node:crypto';

// Switch to Node.js runtime
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Generate random filename: puzzle-<timestamp>-<random>.jpg
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const filename = `puzzle-${timestamp}-${randomString}.jpg`;

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

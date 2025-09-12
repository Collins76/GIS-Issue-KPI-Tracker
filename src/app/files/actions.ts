'use server';

import { ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { URL } from 'url';

export async function uploadFromUrl(url: string, userId: string) {
  try {
    // Validate URL
    const parsedUrl = new URL(url);
    const fileName = parsedUrl.pathname.split('/').pop() || 'upload-from-web';

    // Fetch the file
    const response = await fetch(url);
    if (!response.ok) {
      return { error: `Failed to fetch file from URL: ${response.statusText}` };
    }
    const fileBuffer = await response.arrayBuffer();

    // Upload to Firebase Storage
    const storageRef = ref(storage, `uploads/${userId}/${fileName}`);
    await uploadBytes(storageRef, fileBuffer);

    return { success: true, fileName };
  } catch (error: any) {
    console.error('Server-side upload error:', error);
    if (error instanceof TypeError && error.message.includes('Invalid URL')) {
       return { error: 'The URL you entered is not valid. Please check and try again.' };
    }
    return { error: 'An unexpected error occurred on the server.' };
  }
}

import { supabase } from '../supabase';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

const uploadFileToSupabase = async (fileUri, fileName, bucketName = 'oksyon_documents') => {
  try {
    console.log('Starting file upload...');
    console.log('File URI:', fileUri);

    // Check if the fileUri is a URL (already uploaded)
    if (fileUri.startsWith('https://')) {
      console.log('File is already uploaded:', fileUri);
      return fileUri; // Return the URL as-is
    }

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist at the given URI');
    }

    // Determine MIME type
    const mimeType = fileUri.endsWith('.jpg') || fileUri.endsWith('.jpeg')
      ? 'image/jpeg'
      : fileUri.endsWith('.png')
      ? 'image/png'
      : fileUri.endsWith('.pdf')
      ? 'application/pdf'
      : 'application/octet-stream';

    // Read the file as Base64
    const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('File read as Base64 successfully.');

    // Convert Base64 to a Uint8Array
    const fileBuffer = Buffer.from(fileBase64, 'base64');

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error('Error during Supabase upload:', error);
      throw error;
    }

    console.log('Upload successful:', data);

    // Construct the correct public URL
    const supabaseUrl = 'https://ikvsahtemgarvhkvaftl.supabase.co';
    const publicUrl = `${supabaseUrl}/${bucketName}/${fileName}`;
    console.log('Public URL:', publicUrl);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export default uploadFileToSupabase;

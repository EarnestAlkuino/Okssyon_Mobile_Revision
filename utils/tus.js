import { Upload } from 'tus-js-client';

function getFileExtension(uri) {
  const match = /\.([a-zA-Z]+)$/.exec(uri);
  return match ? match[1].toLowerCase() : '';
}

function getMimeType(extension) {
  const mimeTypes = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    pdf: 'application/pdf',
  };
  return mimeTypes[extension] || 'application/octet-stream';
}

export async function uploadFileUsingTUS(bucketName, fileUri, fileName) {
  try {
    console.log('Starting TUS upload for file:', fileUri);

    // Validate environment variables
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase environment variables are missing.');
      throw new Error('Supabase URL or Anon Key is not defined in environment variables.');
    }

    const endpoint = `${supabaseUrl}/storage/v1/upload/resumable`;

    // Fetch the file as a blob
    console.log('Fetching file from URI...');
    const response = await fetch(fileUri);
    if (!response.ok) {
      console.error('Failed to fetch file:', response.statusText);
      throw new Error(`Failed to fetch file from URI: ${response.statusText}`);
    }
    const blob = await response.blob();

    // Validate the blob
    if (!blob || blob.size === 0) {
      console.error('Blob validation failed. No valid file content.');
      throw new Error('Blob is empty. No valid file content to upload.');
    }

    const extension = getFileExtension(fileUri);
    const mimeType = getMimeType(extension);

    console.log('Starting upload with TUS...');
    const upload = new Upload(blob, {
      endpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${supabaseAnonKey}`,
        'x-upsert': 'true',
      },
      metadata: {
        bucketName,
        objectName: fileName,
        contentType: mimeType,
        cacheControl: '3600',
      },
      chunkSize: 6 * 1024 * 1024, // 6MB chunk size
      onError: (error) => {
        console.error('TUS upload failed:', error);
        throw error;
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log(`Uploading: ${bytesUploaded}/${bytesTotal} (${percentage}%)`);
      },
    });

    // Check for previous uploads and resume if possible
    const previousUploads = await upload.findPreviousUploads();
    if (previousUploads.length > 0) {
      console.log('Resuming previous upload...');
      upload.resumeFromPreviousUpload(previousUploads[0]);
    }

    // Start the upload
    upload.start();

    // Wait for upload completion
    return await new Promise((resolve, reject) => {
      upload.onSuccess = () => {
        console.log('TUS upload completed successfully. File URL:', upload.url);
        resolve(upload.url);
      };
      upload.onError = (error) => {
        console.error('Upload failed:', error);
        reject(error);
      };
    });
  } catch (error) {
    console.error('Error in TUS upload:', error.message);
    return null; // Return null on error
  }
}

import { Upload } from 'tus-js-client';

export const uploadFiles = async (bucketName, fileUri) => {
  try {
    // Convert the URI to a Blob
    const fileBlob = await convertUriToBlob(fileUri);

    // Set up the TUS upload
    const upload = new Upload(fileBlob, {
      endpoint: `https://your-server.com/uploads/${bucketName}`, // Replace with your server's endpoint
      metadata: {
        filename: fileUri.split('/').pop(),
        filetype: fileBlob.type,
      },
      onError: (error) => {
        console.error('Upload failed:', error);
        throw error;
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const progress = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log(`Uploaded ${progress}%`);
      },
      onSuccess: () => {
        console.log('Upload finished:', upload.url);
      },
    });

    // Start the upload
    upload.start();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

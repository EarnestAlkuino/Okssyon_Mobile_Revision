// src/UploadedPage.js
import React from 'react';

const UploadedPage = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>File Upload Mockup</h1>
      <input type="file" />
      <button style={{ margin: '20px' }}>Upload</button>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Uploaded File:</h2>
        <p>Name: example.txt</p>
        <p>Size: 123 KB</p>
      </div>
    </div>
  );
};

export default UploadedPage;

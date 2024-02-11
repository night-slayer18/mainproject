import React, { useState, useRef } from 'react';

const App = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [subtitleFile, setSubtitleFile] = useState(null);
  const videoRef = useRef(null);
  const subtitleRef = useRef(null);

  const handleVideoChange = (event) => {
    setVideoFile(event.target.files[0]);
  };

  const handleSubtitleChange = (event) => {
    setSubtitleFile(event.target.files[0]);
  };

  const handleUploadFiles = async () => {
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('subtitle', subtitleFile);

      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('Files uploaded successfully');
        setVideoFile(null);
        setSubtitleFile(null);
        videoRef.current.value = '';
        subtitleRef.current.value = '';
      } else {
        console.error('File upload failed');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  return (
    <div>
      <h1>Video Upload App</h1>
      <input ref={videoRef} type="file" accept="video/*" onChange={handleVideoChange} />
      <input ref={subtitleRef} type="file" accept=".srt" onChange={handleSubtitleChange} />
      <button onClick={handleUploadFiles}>Upload Files</button>
    </div>
  );
};

export default App;

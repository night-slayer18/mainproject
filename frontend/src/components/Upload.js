import React, { useState, useRef } from 'react';


const Upload = (props) => {
  const [videoFile, setVideoFile] = useState(null);
  const [subtitleFile, setSubtitleFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const {uploadSuccess,upError,errorOccurred, uploadClear} = props;

  const videoRef = useRef(null);
  const subtitleRef = useRef(null);

  const handleVideoChange = (event) => {
    setVideoFile(event.target.files[0]);
  };

  const handleSubtitleChange = (event) => {
    setSubtitleFile(event.target.files[0]);
  };

  const handleClearFiles = () => {
    setVideoFile(null);
    setSubtitleFile(null);
    videoRef.current.value = '';
    subtitleRef.current.value = '';
    uploadClear();
  };

  const handleUploadFiles = async () => {
    try {
      setUploading(true);
      setUploadError(null);

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
        const videoBlob = await response.blob();
        const videoObjectUrl = URL.createObjectURL(videoBlob);
        setVideoUrl(videoObjectUrl);
        uploadSuccess();
      } else {
        console.error('File upload failed');
        setUploadError('File upload failed. Please try again.');
        upError();
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadError('An error occurred. Please try again.');
        errorOccurred();
    } finally {
      setUploading(false);
    }
  };
  return (
    <div>
      <div className="container d-flex flex-column align-items-center justify-content-center mt-5">
      <h1 className="mb-4 mt-5 ">Video Upload App</h1>

      <div className="input-group mb-3">
        <div className="container my-4">
          <input
            ref={videoRef}
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="form-control my-5 w-50 mx-auto"
            id="inputGroupFile01"
          />
          <input
            ref={subtitleRef}
            type="file"
            accept=".srt"
            onChange={handleSubtitleChange}
            className="form-control my-5 w-50 mx-auto"
            id="inputGroupFile02"
          />
        </div>
      </div>

      <div className="container d-flex justify-content-center align-items-center gap-5">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleClearFiles}
          disabled={!videoFile && !subtitleFile}
        >
          Clear Files
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleUploadFiles}
          disabled={!videoFile || !subtitleFile || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Files'}
        </button>
      </div>

      {uploadError && <div className="text-danger mt-3">{uploadError}</div>}
      {videoUrl && (
        <video controls>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
    </div>
  )
}

export default Upload

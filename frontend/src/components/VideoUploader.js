import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const VideoUploader = ({ onVideoUpload }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const videoFile = acceptedFiles[0];
    onVideoUpload(videoFile);
  }, [onVideoUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'video/*',
  });

  return (
    <div>
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drag 'n' drop a video file here, or click to select one</p>
      </div>
    </div>
  );
};

export default VideoUploader;

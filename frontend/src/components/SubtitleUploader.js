// SubtitleUploader.js
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const SubtitleUploader = ({ onSubtitleUpload }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const subtitleFile = acceptedFiles[0];
    onSubtitleUpload(subtitleFile);
  }, [onSubtitleUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: '.srt',
  });

  return (
    <div>
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drag 'n' drop an SRT file here, or click to select one</p>
      </div>
    </div>
  );
};

export default SubtitleUploader;

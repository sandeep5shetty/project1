import React, { useState, useRef } from 'react';
    import './App.css';
    import toast from 'react-hot-toast';
    import {
      AiOutlineFile,
      AiOutlineFileImage,
      AiOutlineAudio,
      AiOutlineVideoCamera,
      AiOutlineFilePdf,
      AiOutlineDelete,
    } from 'react-icons/ai';
    import { FaCloudUploadAlt, FaCheckCircle } from 'react-icons/fa';
    import { motion } from 'framer-motion';

    function FileUpload() {
      const [isDragging, setIsDragging] = useState(false);
      const [uploadProgress, setUploadProgress] = useState(0);
      const [uploadedFile, setUploadedFile] = useState(null);
      const [isUploading, setIsUploading] = useState(false);
      const [uploadCompleted, setUploadCompleted] = useState(false);
      const fileInputRef = useRef(null);
      const [intervalId, setIntervalId] = useState(null);

      const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
      };

      const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
      };

      const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };

      const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) {
          handleFileChange(e.dataTransfer.files[0]);
        }
      };

      const handleFileChange = (file) => {
        if (!file) return;
         if (file.size > 500 * 1024) {
          toast.error('File size exceeds 500kb.');
          handleDelete();
          return;
        }
        if (isUploading) {
          toast.error('Another file is currently uploading.');
          return;
        }
        setUploadedFile(file);
        startUpload(file);
      };

      const startUpload = (file) => {
        setIsUploading(true);
        setUploadProgress(0);
        const fileSize = file.size;
        let uploadedBytes = 0;

        const id = setInterval(() => {
          uploadedBytes += 1024;
          const progress = Math.min(100, Math.round((uploadedBytes / fileSize) * 100));
          setUploadProgress(progress);

          if (progress === 100) {
            clearInterval(id);
            setIsUploading(false);
            setUploadCompleted(true);
            toast.success('Upload Completed');
            setIntervalId(null);
          }
        }, 100);
        setIntervalId(id);
      };

      const handleDelete = (e) => {
        if(e) {
          e.stopPropagation();
        }
        if (intervalId) {
          clearInterval(intervalId);
          setIntervalId(null);
        }
        setUploadedFile(null);
        setUploadProgress(0);
        setIsUploading(false);
        setUploadCompleted(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };

      const handleFileInputClick = () => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      };

      const getFileIcon = (file) => {
        if (!file) return <AiOutlineFile />;
        const fileType = file.type;
        if (fileType.startsWith('image/')) return <AiOutlineFileImage />;
        if (fileType.startsWith('audio/')) return <AiOutlineAudio />;
        if (fileType.startsWith('video/')) return <AiOutlineVideoCamera />;
        if (fileType === 'application/pdf') return <AiOutlineFilePdf />;
        return <AiOutlineFile />;
      };

      const truncateFileName = (name) => {
        if (name.length > 13) {
          const fileType = name.split('.').pop();
          return `${name.slice(0, 8)}...  .${fileType}`;
        }
        return name;
      };

      return (
        <div
          className={`file-upload-container ${isDragging ? 'dragging' : ''} ${uploadedFile ? 'file-selected' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={uploadCompleted ? undefined : handleFileInputClick}
        >
          <input
            type="file"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files.length > 0) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />
          {uploadCompleted ? (
            <div className="uploaded-state">
              {uploadedFile && (
                <div className="file-info">
                  <span className="file-icon">{getFileIcon(uploadedFile)}</span>
                  <span className="file-name">{truncateFileName(uploadedFile.name)}</span>
                  <span className="file-size">{(uploadedFile.size / 1024).toFixed(0)}kb</span>
                </div>
              )}
              <button className="delete-button" onClick={handleDelete}>
                <AiOutlineDelete />
              </button>
              <span className="success-icon"><FaCheckCircle size={20} color="green"/></span>
            </div>
          ) : uploadedFile ? (
            <div className="uploading-state">
              <div className="file-info">
                <span className="file-icon">{getFileIcon(uploadedFile)}</span>
                <span className="file-name">{truncateFileName(uploadedFile.name)}</span>
                <span className="file-size">{(uploadedFile.size / 1024).toFixed(0)}kb</span>
                <button className="delete-button" onClick={handleDelete}>
                  <AiOutlineDelete />
                </button>
              </div>
              <div className="progress-bar-container">
                <motion.div
                  className="progress-bar"
                  style={{ backgroundColor: '#00ff00' }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div className="progress-text">{uploadProgress}%</div>
            </div>
          ) : (
            <div className="default-state">
              <span className="upload-icon"><FaCloudUploadAlt size={40}/></span>
              <p>Click to upload or drag and drop</p>
              <p className="file-types">SVG, PNG, JPG or GIF (max of 500kb)</p>
            </div>
          )}
        </div>
      );
    }

    export default function App() {
      return (
        <FileUpload />
      );
    }

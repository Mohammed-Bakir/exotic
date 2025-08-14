import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiImage, FiLoader, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { useToast } from '../../context/ToastContext';

const ImageUpload = ({
    onUploadSuccess,
    onUploadError,
    multiple = false,
    maxFiles = 10,
    acceptedTypes = 'image/*',
    uploadType = 'single' // 'single', 'multiple', 'profile'
}) => {
    const [uploading, setUploading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);
    const { showToast } = useToast();

    const handleFileSelect = (files) => {
        const fileArray = Array.from(files);

        if (multiple && fileArray.length > maxFiles) {
            showToast(`Maximum ${maxFiles} files allowed`, 'error');
            return;
        }

        if (!multiple && fileArray.length > 1) {
            showToast('Only one file allowed', 'error');
            return;
        }

        uploadFiles(fileArray);
    };

    const uploadFiles = async (files) => {
        setUploading(true);

        try {
            const token = localStorage.getItem('exotic-token');
            const formData = new FormData();

            if (multiple) {
                files.forEach(file => {
                    formData.append('images', file);
                });
            } else {
                const fieldName = uploadType === 'profile' ? 'profileImage' : 'image';
                formData.append(fieldName, files[0]);
            }

            const endpoint = multiple ? 'multiple' : uploadType;
            const response = await axios.post(
                `${API_BASE_URL}/api/uploads/${endpoint}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                const images = multiple ? response.data.images : [response.data.image];
                setUploadedImages(prev => [...prev, ...images]);
                showToast(response.data.message, 'success');
                onUploadSuccess && onUploadSuccess(images);
            }
        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = error.response?.data?.message || 'Upload failed';
            showToast(errorMessage, 'error');
            onUploadError && onUploadError(error);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = e.dataTransfer.files;
        handleFileSelect(files);
    };

    const handleFileInputChange = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            handleFileSelect(files);
        }
    };

    return (
        <div style={{ width: '100%' }}>
            {/* Upload Area */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                    border: `2px dashed ${dragOver ? '#3b82f6' : '#d1d5db'}`,
                    borderRadius: '12px',
                    padding: '40px 20px',
                    textAlign: 'center',
                    backgroundColor: dragOver ? '#f0f9ff' : '#f9fafb',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    marginBottom: '20px'
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedTypes}
                    multiple={multiple}
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                    disabled={uploading}
                />

                {uploading ? (
                    <div>
                        <FiLoader style={{
                            fontSize: '48px',
                            color: '#3b82f6',
                            marginBottom: '16px',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <p style={{ margin: 0, color: '#3b82f6', fontWeight: '500' }}>
                            Uploading...
                        </p>
                    </div>
                ) : (
                    <div>
                        <FiUpload style={{
                            fontSize: '48px',
                            color: '#6b7280',
                            marginBottom: '16px'
                        }} />
                        <p style={{
                            margin: '0 0 8px 0',
                            fontSize: '16px',
                            fontWeight: '500',
                            color: '#374151'
                        }}>
                            {dragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
                        </p>
                        <p style={{
                            margin: 0,
                            fontSize: '14px',
                            color: '#6b7280'
                        }}>
                            {multiple ? `Up to ${maxFiles} images` : 'Single image'} (PNG, JPG, GIF up to 5MB)
                        </p>
                    </div>
                )}
            </div>

            {/* Uploaded Images Preview */}
            {uploadedImages.length > 0 && (
                <div>
                    <h4 style={{
                        margin: '0 0 16px 0',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#374151'
                    }}>
                        Uploaded Images ({uploadedImages.length})
                    </h4>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                        gap: '16px'
                    }}>
                        {uploadedImages.map((image, index) => (
                            <div key={index} style={{
                                position: 'relative',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: '1px solid #e5e7eb'
                            }}>
                                <img
                                    src={image.url}
                                    alt={`Uploaded ${index + 1}`}
                                    style={{
                                        width: '100%',
                                        height: '150px',
                                        objectFit: 'cover'
                                    }}
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(index);
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        backgroundColor: 'rgba(239, 68, 68, 0.9)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    <FiX />
                                </button>
                                <div style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    left: '0',
                                    right: '0',
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    color: 'white',
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <FiCheck style={{ marginRight: '4px' }} />
                                    Uploaded
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style>
                {`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

export default ImageUpload;
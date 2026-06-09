import React, { useState } from 'react';
import { Button, Modal, Alert } from 'react-bootstrap';

interface DocumentReplaceModalProps {
    show: boolean;
    formNumber: string;
    documentType: 'admissionLetter' | 'passport';
    currentFileName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const DocumentReplaceModal: React.FC<DocumentReplaceModalProps> = ({
    show,
    formNumber,
    documentType,
    currentFileName,
    onClose,
    onSuccess
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState<string | null>(null);

    const documentTitle = documentType === 'admissionLetter'
        ? 'Admission Letter'
        : 'Passport Photo';

    const acceptedTypes = documentType === 'admissionLetter'
        ? '.pdf,.jpg,.jpeg,.png'
        : '.jpg,.jpeg,.png';

    const validMimeTypes = documentType === 'admissionLetter'
        ? ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
        : ['image/jpeg', 'image/jpg', 'image/png'];

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!validMimeTypes.includes(file.type)) {
            setError(`Invalid file type. Please select a valid ${documentTitle}.`);
            setSelectedFile(null);
            setPreview(null);
            return;
        }

        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            setError('File too large. Maximum size is 2MB.');
            setSelectedFile(null);
            setPreview(null);
            return;
        }

        setSelectedFile(file);
        setError('');

        // Generate preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('formNumber', formNumber);
        formData.append('uploadType', documentType === 'admissionLetter' ? 'letter' : 'passport');

        try {
            const baseUrl = window.location.origin;
            const basePath = document.querySelector('base')?.getAttribute('href') ?? '/';
            const cleanBasePath = basePath.replace(/\/$/, '');

            const response = await fetch(`${baseUrl}${cleanBasePath}/server/api/files/upload`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                onSuccess();
                handleClose();
            } else {
                setError(result.error || result.message || 'Upload failed');
            }
        } catch (err: any) {
            setError('Network error: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setPreview(null);
        setError('');
        setUploading(false);
        onClose();
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Replace {documentTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <div className="mb-3">
                    <strong>Current file:</strong> <code>{currentFileName}</code>
                </div>

                <div className="mb-3">
                    <label className="form-label">Select new file</label>
                    <input
                        type="file"
                        className="form-control"
                        accept={acceptedTypes}
                        onChange={handleFileSelect}
                        disabled={uploading}
                    />
                    <small className="form-text text-muted">
                        Max size: 2MB.
                        {documentType === 'admissionLetter'
                            ? ' Accepted: PDF, JPG, PNG'
                            : ' Accepted: JPG, PNG'}
                    </small>
                </div>

                {selectedFile && (
                    <div className="alert alert-info">
                        <i className="bi bi-file-earmark"></i> {selectedFile.name}
                        {' '}({(selectedFile.size / 1024).toFixed(1)} KB)
                    </div>
                )}

                {preview && (
                    <div className="text-center mb-3">
                        <img
                            src={preview}
                            alt="Preview"
                            className="img-thumbnail"
                            style={{ maxWidth: '100%', maxHeight: '200px' }}
                        />
                        <div className="mt-2">
                            <small className="text-muted">Preview</small>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={handleClose}
                    disabled={uploading}
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                >
                    {uploading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Uploading...
                        </>
                    ) : (
                        'Upload & Replace'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

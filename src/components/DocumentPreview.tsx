import React from 'react';
import { logger } from '../utils/logger';

interface DocumentPreviewProps {
  fileName: string;
  type: 'letter' | 'passport';
  formNumber: string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  fileName,
  type,
  formNumber
}) => {
  const baseUrl = window.location.origin;
  const basePath = document.querySelector('base')?.getAttribute('href') ?? '/';
  const cleanBasePath = basePath.replace(/\/$/, '');

  const fileExt = fileName.split('.').pop()?.toLowerCase();
  const isPDF = fileExt === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExt || '');

  // Simple thumbnail URL - no token required
  const fileType = type === 'passport' ? 'passport' : 'admissionLetter';
  const thumbnailUrl = `${baseUrl}${cleanBasePath}/server/api/files/view?form=${formNumber}&type=${fileType}`;

  // Handle full-size view - generates token and opens in new tab
  const handleViewFullSize = async () => {
    try {
      const response = await fetch(`${baseUrl}${cleanBasePath}/server/api/files/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formNumber, fileType })
      });

      const result = await response.json();

      if (result.success && result.data?.token) {
        const downloadUrl = `${baseUrl}${cleanBasePath}/server/api/files/download?token=${result.data.token}`;
        window.open(downloadUrl, '_blank');
      } else {
        alert('Failed to generate download link: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      logger.error('Error generating download token:', err);
      alert('Failed to open file');
    }
  };

  return (
    <div className="document-preview">
      {isImage && (
        <div className="text-center">
          <img
            src={thumbnailUrl}
            alt={type}
            className="img-thumbnail"
            style={{ maxWidth: '100%', maxHeight: '300px', cursor: 'pointer' }}
            onClick={handleViewFullSize}
          />
          <div className="mt-2">
            <small className="text-muted">{fileName}</small>
            <br />
            <button
              onClick={handleViewFullSize}
              className="btn btn-sm btn-outline-primary mt-1"
            >
              <i className="bi bi-zoom-in"></i> View Full Size
            </button>
          </div>
        </div>
      )}

      {isPDF && (
        <div className="text-center">
          <div className="pdf-icon mb-2">
            <i className="bi bi-file-pdf" style={{ fontSize: '4rem', color: '#dc3545' }}></i>
          </div>
          <div>
            <small className="text-muted">{fileName}</small>
            <br />
            <button
              onClick={handleViewFullSize}
              className="btn btn-sm btn-outline-primary mt-1"
            >
              <i className="bi bi-eye"></i> View PDF
            </button>
          </div>
        </div>
      )}

      <div className="mt-2">
        <span className="badge bg-success">
          <i className="bi bi-check-circle"></i> Uploaded
        </span>
      </div>
    </div>
  );
};

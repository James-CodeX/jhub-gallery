'use client';

import { useEffect, useState } from 'react';
import { X, Download, Share2, Trash2, ChevronLeft, ChevronRight, Check, Link as LinkIcon } from 'lucide-react';
import type { PhotoFile } from '@/types';
import { getImageUrl, formatBytes, formatDate } from '@/lib/utils';

interface ImagePreviewModalProps {
  file: PhotoFile;
  onClose: () => void;
  onDelete: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function ImagePreviewModal({
  file,
  onClose,
  onDelete,
  onPrevious,
  onNext,
}: ImagePreviewModalProps) {
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && onPrevious) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrevious, onNext]);

  // Handle download
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const imageUrl = getImageUrl(file.minio_key);
      
      // Fetch the image
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.original_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Download started:', file.original_name);
    } catch (error) {
      console.error('❌ Download failed:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle share (copy link to clipboard)
  const handleShare = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setShowShareSuccess(true);
      setTimeout(() => setShowShareSuccess(false), 2000);
      console.log('✅ Link copied to clipboard');
    } catch (error) {
      console.error('❌ Failed to copy link:', error);
      // Fallback: Show the URL in a prompt
      prompt('Copy this link:', window.location.href);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
      {/* Share Success Toast */}
      {showShareSuccess && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-20 flex items-center gap-2 animate-fade-in">
          <Check className="w-5 h-5" />
          <span className="font-medium">Link copied to clipboard!</span>
        </div>
      )}

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-colors z-10"
        title="Close (ESC)"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Previous Button */}
      {onPrevious ? (
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-10 hover:bg-opacity-30 rounded-full transition-all hover:scale-110 z-10 group"
          title="Previous image (←)"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      ) : (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-5 rounded-full z-10 opacity-30 cursor-not-allowed">
          <ChevronLeft className="w-6 h-6 text-white" />
        </div>
      )}

      {/* Next Button */}
      {onNext ? (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-10 hover:bg-opacity-30 rounded-full transition-all hover:scale-110 z-10 group"
          title="Next image (→)"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      ) : (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-5 rounded-full z-10 opacity-30 cursor-not-allowed">
          <ChevronRight className="w-6 h-6 text-white" />
        </div>
      )}

      {/* Image */}
      <div className="max-w-7xl max-h-[90vh] mx-4">
        <img
          src={getImageUrl(file.minio_key)}
          alt={file.original_name}
          className="max-w-full max-h-[90vh] object-contain"
          onLoad={() => {
            console.log('✅ Image loaded successfully:', getImageUrl(file.minio_key));
          }}
          onError={(e) => {
            console.error('❌ Image failed to load');
            console.error('   URL:', getImageUrl(file.minio_key));
            console.error('   MinIO Key:', file.minio_key);
            console.error('   Event:', e);
          }}
        />
      </div>

      {/* Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 text-white p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate mb-1">
              {file.original_name}
            </h3>
            <p className="text-sm text-gray-300">
              {formatBytes(file.size)} • {file.width && file.height && `${file.width} × ${file.height} •`} {formatDate(file.uploaded_at)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors ${
                isDownloading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors relative"
              title="Share link"
            >
              {showShareSuccess ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-600 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

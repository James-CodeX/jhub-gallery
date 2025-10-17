'use client';

import { useEffect, useState } from 'react';
import { X, Download, Share2, Trash2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { PhotoFile } from '@/types';
import { getImageUrl, formatBytes, formatDate } from '@/lib/utils';

interface ImagePreviewModalProps {
  file: PhotoFile;
  files: PhotoFile[];
  onClose: () => void;
  onDelete: () => void;
}

export function ImagePreviewModal({ file, files, onClose, onDelete }: ImagePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const index = files?.findIndex(f => f.id === file.id);
    return index !== -1 ? index : 0;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showCopied, setShowCopied] = useState(false);

  const currentFile = files?.[currentIndex] || file;
  const hasNext = files && currentIndex < files.length - 1;
  const hasPrevious = currentIndex > 0;

  // Update index when file prop changes
  useEffect(() => {
    if (files) {
      const index = files.findIndex(f => f.id === file.id);
      if (index !== -1 && index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
  }, [file.id, files]);

  // Reset loading state when file changes
  useEffect(() => {
    setIsLoading(true);
  }, [currentFile?.id]);

  // Preload next image in background
  useEffect(() => {
    if (hasNext && files) {
      const nextFile = files[currentIndex + 1];
      if (nextFile) {
        const img = new Image();
        img.src = getImageUrl(nextFile.minio_key);
      }
    }
  }, [currentIndex, files, hasNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrevious) setCurrentIndex(prev => prev - 1);
      if (e.key === 'ArrowRight' && hasNext) setCurrentIndex(prev => prev + 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, hasNext, hasPrevious]);

  const handleDownload = async () => {
    try {
      const url = getImageUrl(currentFile.minio_key);
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = currentFile.original_name;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handlePrevious = () => {
    if (hasPrevious) setCurrentIndex(prev => prev - 1);
  };

  const handleNext = () => {
    if (hasNext) setCurrentIndex(prev => prev + 1);
  };

  if (!currentFile) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Copy success notification */}
      {showCopied && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 z-50 shadow-lg">
          <Check className="w-4 h-4" />
          <span>Link copied to clipboard!</span>
        </div>
      )}

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors z-30"
        title="Close (ESC)"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Previous button */}
      <button
        onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
        disabled={!hasPrevious}
        className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all z-30 ${
          hasPrevious 
            ? 'bg-white/10 hover:bg-white/20 hover:scale-110' 
            : 'bg-white/5 opacity-30 cursor-not-allowed'
        }`}
        title="Previous (←)"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      {/* Next button */}
      <button
        onClick={(e) => { e.stopPropagation(); handleNext(); }}
        disabled={!hasNext}
        className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all z-30 ${
          hasNext 
            ? 'bg-white/10 hover:bg-white/20 hover:scale-110' 
            : 'bg-white/5 opacity-30 cursor-not-allowed'
        }`}
        title="Next (→)"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Image container */}
      <div 
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Main image */}
        <img
          src={getImageUrl(currentFile.minio_key)}
          alt={currentFile.original_name}
          className={`max-w-full max-h-[90vh] object-contain transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ display: isLoading ? 'none' : 'block' }}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      </div>

      {/* Bottom info bar */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent pt-12 pb-4 px-4 z-30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* File info */}
          <div className="flex-1 min-w-0 text-white">
            <h3 className="font-semibold text-lg truncate mb-1">
              {currentFile.original_name}
            </h3>
            <p className="text-sm text-gray-300">
              {formatBytes(currentFile.size)}
              {currentFile.width && currentFile.height && ` • ${currentFile.width} × ${currentFile.height}`}
              {' • '}{formatDate(currentFile.uploaded_at)}
              {files && (
                <span className="ml-2 text-gray-400">
                  ({currentIndex + 1} of {files.length})
                </span>
              )}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleDownload(); }}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Download image"
            >
              <Download className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleShare(); }}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Copy link"
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2.5 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
              title="Delete image"
            >
              <Trash2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

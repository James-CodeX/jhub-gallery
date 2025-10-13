'use client';

import { X, Download, Share2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-colors z-10"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Navigation */}
      {onPrevious && (
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-colors z-10"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}
      {onNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-colors z-10"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Image */}
      <div className="max-w-7xl max-h-[90vh] mx-4">
        <img
          src={getImageUrl(file.minio_key)}
          alt={file.original_name}
          className="max-w-full max-h-[90vh] object-contain"
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
              onClick={() => {
                // TODO: Implement download
              }}
              className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                // TODO: Implement share
              }}
              className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
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

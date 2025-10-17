'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useFileUpload } from '@/lib/hooks/useUpload';
import { formatBytes, validateFileSize, validateFileType } from '@/lib/utils';
import type { UploadProgress } from '@/types';

interface FileUploadProps {
  folderId: string;
  onComplete?: () => void;
}

export function FileUpload({ folderId, onComplete }: FileUploadProps) {
  const [uploadQueue, setUploadQueue] = useState<Map<string, UploadProgress>>(new Map());
  const [totalFiles, setTotalFiles] = useState(0);
  const [completedFiles, setCompletedFiles] = useState(0);
  const { uploadFile } = useFileUpload();

  const processFile = useCallback(
    async (file: File) => {
      const fileId = `${Date.now()}-${Math.random()}-${file.name}`;

      // Add to queue
      setUploadQueue((prev) => {
        const next = new Map(prev);
        next.set(fileId, {
          fileId,
          filename: file.name,
          progress: 0,
          status: 'pending',
        });
        return next;
      });

      try {
        // Validate file
        if (!validateFileSize(file, 50)) {
          throw new Error('File size must be less than 50MB');
        }

        if (!validateFileType(file, ['image/*'])) {
          throw new Error('Only image files are allowed');
        }

        // Update status to uploading
        setUploadQueue((prev) => {
          const next = new Map(prev);
          const item = next.get(fileId);
          if (item) {
            next.set(fileId, { ...item, status: 'uploading' });
          }
          return next;
        });

        // Upload file
        await uploadFile(file, folderId, (progress) => {
          setUploadQueue((prev) => {
            const next = new Map(prev);
            const item = next.get(fileId);
            if (item) {
              next.set(fileId, { ...item, progress });
            }
            return next;
          });
        });

        // Mark as completed
        setUploadQueue((prev) => {
          const next = new Map(prev);
          next.set(fileId, {
            fileId,
            filename: file.name,
            progress: 100,
            status: 'completed',
          });
          return next;
        });

        // Increment completed count
        setCompletedFiles((prev) => prev + 1);

        // Auto-remove after 3 seconds
        setTimeout(() => {
          setUploadQueue((prev) => {
            const next = new Map(prev);
            next.delete(fileId);
            return next;
          });
        }, 3000);
      } catch (error) {
        console.error('Upload error:', error);
        setUploadQueue((prev) => {
          const next = new Map(prev);
          next.set(fileId, {
            fileId,
            filename: file.name,
            progress: 0,
            status: 'error',
            error: error instanceof Error ? error.message : 'Upload failed',
          });
          return next;
        });
        
        // Increment completed count even for errors
        setCompletedFiles((prev) => prev + 1);
      }
    },
    [folderId, uploadFile]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setTotalFiles((prev) => prev + acceptedFiles.length);
        acceptedFiles.forEach(processFile);
      }
    },
    [processFile]
  );

  // Trigger onComplete when all files are done
  useEffect(() => {
    if (totalFiles > 0 && completedFiles === totalFiles) {
      onComplete?.();
      // Reset counters after a delay
      const timeout = setTimeout(() => {
        setTotalFiles(0);
        setCompletedFiles(0);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [completedFiles, totalFiles, onComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
    },
    multiple: true,
  });

  const removeFromQueue = (fileId: string) => {
    setUploadQueue((prev) => {
      const next = new Map(prev);
      next.delete(fileId);
      return next;
    });
  };

  const uploads = Array.from(uploadQueue.values());

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors
          ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          {isDragActive ? 'Drop files here' : 'Drag & drop images here'}
        </p>
        <p className="text-sm text-gray-500">or click to browse</p>
        <p className="text-xs text-gray-400 mt-2">Maximum file size: 50MB</p>
      </div>

      {/* Upload Queue */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              {completedFiles === totalFiles && totalFiles > 0
                ? 'Upload Complete'
                : 'Uploading Files'}
            </h3>
            {totalFiles > 0 && (
              <span className="text-xs text-gray-500">
                {completedFiles} / {totalFiles} files
              </span>
            )}
          </div>
          {uploads.map((upload) => (
            <div
              key={upload.fileId}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {upload.status === 'uploading' && (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                )}
                {upload.status === 'completed' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {upload.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {upload.filename}
                </p>
                {upload.status === 'uploading' && (
                  <>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round(upload.progress)}%
                    </p>
                  </>
                )}
                {upload.status === 'error' && (
                  <p className="text-xs text-red-600 mt-1">{upload.error}</p>
                )}
                {upload.status === 'completed' && (
                  <p className="text-xs text-green-600 mt-1">Upload complete</p>
                )}
              </div>

              {/* Remove Button */}
              {(upload.status === 'error' || upload.status === 'completed') && (
                <button
                  onClick={() => removeFromQueue(upload.fileId)}
                  className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

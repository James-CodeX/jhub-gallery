'use client';

import { useState } from 'react';
import { Folder, Image as ImageIcon, MoreVertical, Download, Share2, Trash2 } from 'lucide-react';
import type { PhotoFile, Folder as FolderType } from '@/types';
import { formatBytes, formatRelativeTime, getThumbnailUrl, getImageUrl } from '@/lib/utils';
import { useDeleteFile } from '@/lib/hooks/useUpload';
import { ImagePreviewModal } from './ImagePreviewModal';

interface GalleryGridProps {
  files: PhotoFile[];
  subfolders: FolderType[];
  viewMode: 'grid' | 'list';
  searchQuery: string;
  onRefresh: () => void;
}

export function GalleryGrid({
  files,
  subfolders,
  viewMode,
  searchQuery,
  onRefresh,
}: GalleryGridProps) {
  const [selectedFile, setSelectedFile] = useState<PhotoFile | null>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const deleteFile = useDeleteFile();

  // Filter files by search query
  const filteredFiles = files.filter((file) =>
    file.original_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (file: PhotoFile) => {
    if (confirm(`Are you sure you want to delete "${file.original_name}"?`)) {
      try {
        await deleteFile.mutateAsync({ id: file.id, folderId: file.folder_id });
        onRefresh();
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    }
  };

  if (viewMode === 'grid') {
    return (
      <>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {/* Subfolders */}
          {subfolders.map((folder) => (
            <div
              key={folder.id}
              className="group relative bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
            >
              <Folder className="w-12 h-12 mx-auto mb-3 text-blue-500" />
              <p className="text-sm font-medium text-center truncate">{folder.name}</p>
              {folder.file_count !== undefined && folder.file_count > 0 && (
                <p className="text-xs text-gray-500 text-center mt-1">
                  {folder.file_count} files
                </p>
              )}
            </div>
          ))}

          {/* Files */}
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="group relative bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all"
            >
              {/* Image */}
              <div
                className="aspect-square bg-gray-100 flex items-center justify-center cursor-pointer"
                onClick={() => setSelectedFile(file)}
              >
                {file.thumbnail_key ? (
                  <img
                    src={getThumbnailUrl(file.thumbnail_key) || ''}
                    alt={file.original_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-medium truncate">{file.original_name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatBytes(file.size)} • {formatRelativeTime(file.uploaded_at)}
                </p>
              </div>

              {/* Actions Menu */}
              <div className="absolute top-2 right-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenFor(menuOpenFor === file.id ? null : file.id);
                  }}
                  className="p-1.5 bg-white rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>

                {menuOpenFor === file.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpenFor(null)}
                    />
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                      <button
                        onClick={() => {
                          setSelectedFile(file);
                          setMenuOpenFor(null);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        View
                      </button>
                      <button
                        onClick={() => {
                          // TODO: Implement download
                          setMenuOpenFor(null);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                      <button
                        onClick={() => {
                          // TODO: Implement share
                          setMenuOpenFor(null);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(file);
                          setMenuOpenFor(null);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredFiles.length === 0 && subfolders.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-700 mb-2">No files yet</p>
            <p className="text-gray-500">Upload some files to get started</p>
          </div>
        )}

        {/* Image Preview Modal */}
        {selectedFile && (
          <ImagePreviewModal
            file={selectedFile}
            onClose={() => setSelectedFile(null)}
            onDelete={() => {
              handleDelete(selectedFile);
              setSelectedFile(null);
            }}
          />
        )}
      </>
    );
  }

  // List View
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Modified
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredFiles.map((file) => (
            <tr key={file.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <ImageIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    {file.original_name}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatBytes(file.size)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatRelativeTime(file.uploaded_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => setSelectedFile(file)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(file)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-700 mb-2">No files yet</p>
          <p className="text-gray-500">Upload some files to get started</p>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedFile && (
        <ImagePreviewModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onDelete={() => {
            handleDelete(selectedFile);
            setSelectedFile(null);
          }}
        />
      )}
    </div>
  );
}

'use client';

import { useDeleteFolder } from '@/lib/hooks/useFolders';
import { X, AlertTriangle } from 'lucide-react';
import type { FolderTree } from '@/types';

interface DeleteFolderDialogProps {
  isOpen: boolean;
  folder: FolderTree | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteFolderDialog({
  isOpen,
  folder,
  onClose,
  onSuccess,
}: DeleteFolderDialogProps) {
  const deleteFolder = useDeleteFolder();

  if (!isOpen || !folder) return null;

  const handleDelete = async () => {
    try {
      await deleteFolder.mutateAsync(folder.id);
      onSuccess();
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Delete Folder</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete the folder <strong>{folder.name}</strong>?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium mb-2">Warning:</p>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• All files in this folder will be deleted</li>
              <li>• All subfolders will be deleted</li>
              <li>• This action cannot be undone</li>
            </ul>
          </div>

          {/* Error */}
          {deleteFolder.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                {deleteFolder.error.message}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteFolder.isPending}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {deleteFolder.isPending ? 'Deleting...' : 'Delete Folder'}
          </button>
        </div>
      </div>
    </div>
  );
}

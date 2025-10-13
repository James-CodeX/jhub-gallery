'use client';

import { useState, useEffect } from 'react';
import { useUpdateFolder } from '@/lib/hooks/useFolders';
import { X, Edit2 } from 'lucide-react';
import type { FolderTree } from '@/types';

interface RenameFolderDialogProps {
  isOpen: boolean;
  folder: FolderTree | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function RenameFolderDialog({
  isOpen,
  folder,
  onClose,
  onSuccess,
}: RenameFolderDialogProps) {
  const [name, setName] = useState('');
  const updateFolder = useUpdateFolder();

  useEffect(() => {
    if (folder) {
      setName(folder.name);
    }
  }, [folder]);

  if (!isOpen || !folder) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name === folder.name) return;

    try {
      await updateFolder.mutateAsync({
        id: folder.id,
        name: name.trim(),
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to rename folder:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Edit2 className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Rename Folder</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label
              htmlFor="folder-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Folder Name
            </label>
            <input
              id="folder-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter new folder name"
              autoFocus
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Error */}
          {updateFolder.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                {updateFolder.error.message}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || name === folder.name || updateFolder.isPending}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {updateFolder.isPending ? 'Renaming...' : 'Rename'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

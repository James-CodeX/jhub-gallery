'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderTreeSidebar } from '@/components/navigation/FolderTree';
import { Upload, FolderPlus } from 'lucide-react';
import { CreateFolderDialog } from '@/components/dialogs/CreateFolderDialog';
import { RenameFolderDialog } from '@/components/dialogs/RenameFolderDialog';
import { DeleteFolderDialog } from '@/components/dialogs/DeleteFolderDialog';
import type { FolderTree } from '@/types';

export default function AdminDashboard() {
  const router = useRouter();

  // Dialogs state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createFolderParent, setCreateFolderParent] = useState<string | null>(null);
  const [folderToRename, setFolderToRename] = useState<FolderTree | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<FolderTree | null>(null);

  const handleSelectFolder = (folderId: string | null) => {
    if (folderId) {
      router.push(`/admin/folder/${folderId}`);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gallery Admin</h1>
            <p className="text-sm text-gray-600">Manage your photo collections</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <FolderTreeSidebar
            selectedFolderId={null}
            onSelectFolder={handleSelectFolder}
            onCreateFolder={(parentId) => {
              setCreateFolderParent(parentId);
              setShowCreateDialog(true);
            }}
            onRenameFolder={setFolderToRename}
            onDeleteFolder={setFolderToDelete}
          />
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-xl font-medium text-gray-700 mb-2">
                Select a folder to get started
              </p>
              <div className="text-left bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="font-semibold text-blue-900 mb-2">Quick Start:</p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Create a folder using the <FolderPlus className="inline w-4 h-4" /> button in the sidebar</li>
                  <li>Click on the folder name to open it</li>
                  <li>Upload images and manage your gallery</li>
                </ol>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <CreateFolderDialog
        isOpen={showCreateDialog}
        parentId={createFolderParent}
        onClose={() => {
          setShowCreateDialog(false);
          setCreateFolderParent(null);
        }}
        onSuccess={(folderId: string) => {
          setShowCreateDialog(false);
          setCreateFolderParent(null);
          router.push(`/admin/folder/${folderId}`);
        }}
      />

      <RenameFolderDialog
        isOpen={folderToRename !== null}
        folder={folderToRename}
        onClose={() => setFolderToRename(null)}
        onSuccess={() => setFolderToRename(null)}
      />

      <DeleteFolderDialog
        isOpen={folderToDelete !== null}
        folder={folderToDelete}
        onClose={() => setFolderToDelete(null)}
        onSuccess={() => setFolderToDelete(null)}
      />
    </div>
  );
}

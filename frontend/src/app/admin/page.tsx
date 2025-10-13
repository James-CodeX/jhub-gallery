'use client';

import { useState } from 'react';
import { useFolder } from '@/lib/hooks/useFolders';
import { FolderTreeSidebar } from '@/components/navigation/FolderTree';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { FileUpload } from '@/components/upload/FileUpload';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { CreateFolderDialog } from '@/components/dialogs/CreateFolderDialog';
import { RenameFolderDialog } from '@/components/dialogs/RenameFolderDialog';
import { DeleteFolderDialog } from '@/components/dialogs/DeleteFolderDialog';
import { Upload, Grid, List, Search } from 'lucide-react';
import type { FolderTree } from '@/types';

export default function AdminDashboard() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialogs state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createFolderParent, setCreateFolderParent] = useState<string | null>(null);
  const [folderToRename, setFolderToRename] = useState<FolderTree | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<FolderTree | null>(null);

  // Get current folder data
  const { data: folder, isLoading, refetch } = useFolder(selectedFolderId || '');

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">JHUB Gallery Admin</h1>
            <p className="text-sm text-gray-600">Manage your photo collections</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                } rounded-l-lg transition-colors`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                } rounded-r-lg transition-colors`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Button */}
            <button
              onClick={() => setShowUpload(!showUpload)}
              disabled={!selectedFolderId}
              title={!selectedFolderId ? 'Please select a folder first' : ''}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                !selectedFolderId
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : showUpload
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <Upload className="w-5 h-5" />
              {showUpload ? 'Hide Upload' : 'Upload Files'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <FolderTreeSidebar
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
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
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb currentFolder={folder || null} />
          </div>

          {/* Upload Area */}
          {showUpload && selectedFolderId && (
            <div className="mb-6">
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Uploading to:</span> {folder?.name || 'Selected folder'}
                </p>
              </div>
              <FileUpload
                folderId={selectedFolderId}
                onComplete={() => {
                  refetch();
                  setShowUpload(false);
                }}
              />
            </div>
          )}

          {/* Gallery */}
          {selectedFolderId ? (
            isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              </div>
            ) : folder ? (
              <GalleryGrid
                files={folder.files}
                subfolders={folder.subfolders}
                viewMode={viewMode}
                searchQuery={searchQuery}
                onRefresh={refetch}
              />
            ) : null
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center max-w-md">
                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-xl font-medium text-gray-700 mb-2">
                  Select a folder to upload photos
                </p>
                <div className="text-left bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="font-semibold text-blue-900 mb-2">Quick Start:</p>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Create a folder using the <span className="font-bold">+</span> button in the sidebar</li>
                    <li>Click on the folder name to select it (it will turn BLUE)</li>
                    <li>Click <span className="font-bold">"Upload Files"</span> button above</li>
                    <li>Drag & drop images or click to browse</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
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
          setSelectedFolderId(folderId);
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
        onSuccess={() => {
          setFolderToDelete(null);
          setSelectedFolderId(null);
        }}
      />
    </div>
  );
}

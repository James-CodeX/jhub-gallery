'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useFolder } from '@/lib/hooks/useFolders';
import { FolderTreeSidebar } from '@/components/navigation/FolderTree';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { FileUpload } from '@/components/upload/FileUpload';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { CreateFolderDialog } from '@/components/dialogs/CreateFolderDialog';
import { RenameFolderDialog } from '@/components/dialogs/RenameFolderDialog';
import { DeleteFolderDialog } from '@/components/dialogs/DeleteFolderDialog';
import { Upload, Grid, List, Search, ArrowLeft } from 'lucide-react';
import type { FolderTree, PhotoFile } from '@/types';
import { ImagePreviewModal } from '@/components/gallery/ImagePreviewModal';
import Link from 'next/link';

export default function FolderPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const folderId = params.folderId as string;
  const fileId = searchParams.get('file');
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<PhotoFile | null>(null);

  // Dialogs state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createFolderParent, setCreateFolderParent] = useState<string | null>(null);
  const [folderToRename, setFolderToRename] = useState<FolderTree | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<FolderTree | null>(null);

  // Get current folder data
  const { data: folder, isLoading, refetch } = useFolder(folderId);

  // Handle file parameter in URL
  useEffect(() => {
    if (fileId && folder?.files) {
      const file = folder.files.find(f => f.id === fileId);
      if (file) {
        setSelectedFile(file);
      }
    }
  }, [fileId, folder?.files]);

  // Update URL when file is opened/closed
  const handleOpenFile = (file: PhotoFile) => {
    setSelectedFile(file);
    router.push(`/admin/folder/${folderId}?file=${file.id}`, { scroll: false });
  };

  const handleCloseFile = () => {
    setSelectedFile(null);
    router.push(`/admin/folder/${folderId}`, { scroll: false });
  };

  const handleSelectFolder = (newFolderId: string | null) => {
    if (newFolderId) {
      router.push(`/admin/folder/${newFolderId}`);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Admin"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">JHUB Gallery Admin</h1>
              <p className="text-sm text-gray-600">Manage your photo collections</p>
            </div>
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                showUpload
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
            selectedFolderId={folderId}
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
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb currentFolder={folder || null} />
          </div>

          {/* Upload Area */}
          {showUpload && (
            <div className="mb-6">
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Uploading to:</span> {folder?.name || 'Selected folder'}
                </p>
              </div>
              <FileUpload
                folderId={folderId}
                onComplete={() => {
                  refetch();
                  setShowUpload(false);
                }}
              />
            </div>
          )}

          {/* Gallery */}
          {isLoading ? (
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
              onFileClick={handleOpenFile}
              onFolderClick={handleSelectFolder}
            />
          ) : null}
        </main>
      </div>

      {/* File Preview Modal */}
      {selectedFile && folder?.files && (
        <ImagePreviewModal
          file={selectedFile}
          onClose={handleCloseFile}
          onDelete={async () => {
            handleCloseFile();
            refetch();
          }}
          onPrevious={
            (() => {
              const currentIndex = folder.files.findIndex(f => f.id === selectedFile.id);
              return currentIndex > 0
                ? () => handleOpenFile(folder.files[currentIndex - 1])
                : undefined;
            })()
          }
          onNext={
            (() => {
              const currentIndex = folder.files.findIndex(f => f.id === selectedFile.id);
              return currentIndex < folder.files.length - 1
                ? () => handleOpenFile(folder.files[currentIndex + 1])
                : undefined;
            })()
          }
        />
      )}

      {/* Dialogs */}
      <CreateFolderDialog
        isOpen={showCreateDialog}
        parentId={createFolderParent}
        onClose={() => {
          setShowCreateDialog(false);
          setCreateFolderParent(null);
        }}
        onSuccess={(newFolderId: string) => {
          setShowCreateDialog(false);
          setCreateFolderParent(null);
          router.push(`/admin/folder/${newFolderId}`);
        }}
      />

      <RenameFolderDialog
        isOpen={folderToRename !== null}
        folder={folderToRename}
        onClose={() => setFolderToRename(null)}
        onSuccess={() => {
          setFolderToRename(null);
          refetch();
        }}
      />

      <DeleteFolderDialog
        isOpen={folderToDelete !== null}
        folder={folderToDelete}
        onClose={() => setFolderToDelete(null)}
        onSuccess={() => {
          setFolderToDelete(null);
          router.push('/admin');
        }}
      />
    </div>
  );
}

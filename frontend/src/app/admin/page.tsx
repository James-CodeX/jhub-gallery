'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFolderTree } from '@/lib/hooks/useFolders';
import { Upload, FolderPlus, Menu, X, Folder, ChevronRight, ChevronDown, MoreVertical } from 'lucide-react';
import { CreateFolderDialog } from '@/components/dialogs/CreateFolderDialog';
import { RenameFolderDialog } from '@/components/dialogs/RenameFolderDialog';
import { DeleteFolderDialog } from '@/components/dialogs/DeleteFolderDialog';
import type { FolderTree } from '@/types';
import Link from 'next/link';

// Recursive folder tree component
function FolderTreeNode({ 
  folder, 
  currentFolderId, 
  expandedFolders, 
  onToggle,
  onRename,
  onDelete,
  onCreateSubfolder 
}: { 
  folder: FolderTree; 
  currentFolderId: string | null;
  expandedFolders: Set<string>;
  onToggle: (id: string) => void;
  onRename: (folder: FolderTree) => void;
  onDelete: (folder: FolderTree) => void;
  onCreateSubfolder: (parentId: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isExpanded = expandedFolders.has(folder.id);
  const isCurrent = folder.id === currentFolderId;
  const hasChildren = folder.children && folder.children.length > 0;

  return (
    <div>
      <div className="relative group">
        <Link
          href={`/admin/folder/${folder.id}`}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isCurrent 
              ? 'bg-gray-100 text-gray-900 font-medium border border-gray-300' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggle(folder.id);
              }}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}
          <Folder className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm truncate flex-1">{folder.name}</span>
          {folder.file_count !== undefined && folder.file_count > 0 && (
            <span className="text-xs text-gray-500 flex-shrink-0 mr-1">{folder.file_count}</span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(!menuOpen);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity flex-shrink-0"
          >
            <MoreVertical className="w-3 h-3" />
          </button>
        </Link>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg z-20 border border-gray-200 py-1">
              <button
                onClick={() => {
                  onCreateSubfolder(folder.id);
                  setMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
              >
                <FolderPlus className="w-3 h-3" />
                New Subfolder
              </button>
              <button
                onClick={() => {
                  onRename(folder);
                  setMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50"
              >
                Rename
              </button>
              <button
                onClick={() => {
                  onDelete(folder);
                  setMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-4 mt-1 space-y-1">
          {folder.children.map((child) => (
            <FolderTreeNode
              key={child.id}
              folder={child}
              currentFolderId={currentFolderId}
              expandedFolders={expandedFolders}
              onToggle={onToggle}
              onRename={onRename}
              onDelete={onDelete}
              onCreateSubfolder={onCreateSubfolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Dialogs state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createFolderParent, setCreateFolderParent] = useState<string | null>(null);
  const [folderToRename, setFolderToRename] = useState<FolderTree | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<FolderTree | null>(null);

  const { data: folderTree } = useFolderTree();

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Floating Sidebar */}
      <aside
        className={`fixed top-6 left-6 bottom-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col transition-transform duration-300 z-30 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <button
              onClick={() => {
                setCreateFolderParent(null);
                setShowCreateDialog(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
            >
              <FolderPlus className="w-4 h-4" />
              Create Folder
            </button>
          </div>

          <div className="space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-900 font-medium border border-gray-300 rounded-lg transition-colors text-sm"
            >
              <Folder className="w-4 h-4" />
              All Folders
            </Link>
            {folderTree?.map((folder) => (
              <FolderTreeNode
                key={folder.id}
                folder={folder}
                currentFolderId={null}
                expandedFolders={expandedFolders}
                onToggle={toggleFolder}
                onRename={setFolderToRename}
                onDelete={setFolderToDelete}
                onCreateSubfolder={(parentId) => {
                  setCreateFolderParent(parentId);
                  setShowCreateDialog(true);
                }}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-[22rem]' : 'ml-0'} flex-1`}>
        <header className="sticky top-0 z-20 bg-white">
          <div className="px-8 py-6">
            <div className="flex items-center gap-4 mb-4">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">Gallery Admin</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your photo collections</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="px-8 py-6">
          <div className="flex items-center justify-center min-h-[60vh]">
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
        </div>
      </main>

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

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Folder as FolderIcon, Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import type { FolderTree } from '@/types';
import { cn } from '@/lib/utils';
import { useFolderTree } from '@/lib/hooks/useFolders';

interface FolderTreeNodeProps {
  folder: FolderTree;
  level: number;
  selectedId: string | null;
  onSelect: (folderId: string) => void;
  onCreateFolder: (parentId: string) => void;
  onRenameFolder: (folder: FolderTree) => void;
  onDeleteFolder: (folder: FolderTree) => void;
}

export function FolderTreeNode({
  folder,
  level,
  selectedId,
  onSelect,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: FolderTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const [showMenu, setShowMenu] = useState(false);

  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = selectedId === folder.id;

  return (
    <div>
      <div
        className={cn(
          'group flex items-center px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 transition-colors',
          isSelected && 'bg-blue-50 text-blue-600',
          level > 0 && 'ml-4'
        )}
        onClick={() => onSelect(folder.id)}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="p-0.5 hover:bg-gray-200 rounded"
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <div className="w-4" />
          )}
        </button>

        {/* Folder Icon */}
        <FolderIcon className="w-4 h-4 mx-2" />

        {/* Folder Name */}
        <span className="flex-1 text-sm truncate">{folder.name}</span>

        {/* File Count Badge */}
        {folder.file_count !== undefined && folder.file_count > 0 && (
          <span className="px-1.5 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
            {folder.file_count}
          </span>
        )}

        {/* Actions Menu */}
        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateFolder(folder.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Subfolder
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenameFolder(folder);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Rename
                </button>
                {folder.path !== '/' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(folder);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {folder.children.map((child) => (
            <FolderTreeNode
              key={child.id}
              folder={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onCreateFolder={onCreateFolder}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FolderTreeProps {
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
  onCreateFolder: (parentId: string | null) => void;
  onRenameFolder: (folder: FolderTree) => void;
  onDeleteFolder: (folder: FolderTree) => void;
}

export function FolderTreeSidebar({
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: FolderTreeProps) {
  const { data: folders, isLoading, error } = useFolderTree();

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 text-sm">
        Failed to load folders: {error.message}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-2">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-lg font-semibold">Folders</h2>
        <button
          onClick={() => onCreateFolder(null)}
          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          title="Create new folder"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-1">
        {folders?.map((folder) => (
          <FolderTreeNode
            key={folder.id}
            folder={folder}
            level={0}
            selectedId={selectedFolderId}
            onSelect={onSelectFolder}
            onCreateFolder={onCreateFolder}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
          />
        ))}
      </div>
    </div>
  );
}

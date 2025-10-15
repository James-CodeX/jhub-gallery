'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { foldersApi } from '@/lib/api/folders';
import { useFolderTree } from '@/lib/hooks/useFolders';
import { Folder, Image as ImageIcon, ChevronRight, ChevronDown, Menu, X, Grid3x3, List, Search, Info } from 'lucide-react';
import Link from 'next/link';
import { ImagePreviewModal } from '@/components/gallery/ImagePreviewModal';
import { getThumbnailUrl } from '@/lib/utils';
import type { PhotoFile, FolderTree } from '@/types';

// Recursive folder tree component
function FolderTreeNode({ 
  folder, 
  currentFolderId, 
  expandedFolders, 
  onToggle 
}: { 
  folder: FolderTree; 
  currentFolderId: string;
  expandedFolders: Set<string>;
  onToggle: (id: string) => void;
}) {
  const isExpanded = expandedFolders.has(folder.id);
  const isCurrent = folder.id === currentFolderId;
  const hasChildren = folder.children && folder.children.length > 0;

  return (
    <div>
      <Link
        href={`/gallery/${folder.id}`}
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
        <Folder className="w-4 h-4" />
        <span className="text-sm truncate flex-1">{folder.name}</span>
        {folder.file_count !== undefined && folder.file_count > 0 && (
          <span className="text-xs text-gray-500">{folder.file_count}</span>
        )}
      </Link>
      
      {hasChildren && isExpanded && (
        <div className="ml-4 mt-1 space-y-1">
          {folder.children.map((child) => (
            <FolderTreeNode
              key={child.id}
              folder={child}
              currentFolderId={currentFolderId}
              expandedFolders={expandedFolders}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = params.folderId as string;
  const [selectedFile, setSelectedFile] = useState<PhotoFile | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([folderId]));
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [gridSize, setGridSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [searchOpen, setSearchOpen] = useState(false);
  const [infoFile, setInfoFile] = useState<PhotoFile | null>(null);

  const { data: folderData, isLoading } = useQuery({
    queryKey: ['folder', folderId],
    queryFn: () => foldersApi.getById(folderId),
  });

  const { data: folderTree } = useFolderTree();

  // Helper to find all parent folder IDs
  const findParentFolders = (tree: FolderTree[] | undefined, targetId: string, parents: string[] = []): string[] | null => {
    if (!tree) return null;
    for (const folder of tree) {
      if (folder.id === targetId) return parents;
      if (folder.children?.length) {
        const result = findParentFolders(folder.children, targetId, [...parents, folder.id]);
        if (result) return result;
      }
    }
    return null;
  };

  // Expand parent folders when navigating
  useEffect(() => {
    if (folderTree) {
      const parents = findParentFolders(folderTree, folderId);
      if (parents) {
        setExpandedFolders(prev => {
          const expanded = new Set(prev);
          parents.forEach(id => expanded.add(id));
          expanded.add(folderId);
          return expanded;
        });
      }
    }
  }, [folderId, folderTree]);

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

  // Filter and sort files
  const filteredFiles = folderData?.files
    .filter(file => file.original_name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.original_name.localeCompare(b.original_name);
      return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
    }) || [];

  // Handle opening image from URL on mount
  useEffect(() => {
    const imageId = searchParams.get('image');
    if (imageId && filteredFiles.length > 0) {
      const index = filteredFiles.findIndex(f => f.id === imageId);
      if (index !== -1) {
        setSelectedFile(filteredFiles[index]);
        setSelectedIndex(index);
      }
    }
  }, [searchParams, filteredFiles]);

  const handleImageClick = (file: PhotoFile, index: number) => {
    setSelectedFile(file);
    setSelectedIndex(index);
    router.push(`/gallery/${folderId}?image=${file.id}`, { scroll: false });
  };

  const handleCloseImage = () => {
    setSelectedFile(null);
    router.push(`/gallery/${folderId}`, { scroll: false });
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (selectedIndex + 1) % filteredFiles.length
      : (selectedIndex - 1 + filteredFiles.length) % filteredFiles.length;
    setSelectedIndex(newIndex);
    setSelectedFile(filteredFiles[newIndex]);
    router.push(`/gallery/${folderId}?image=${filteredFiles[newIndex].id}`, { scroll: false });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  if (!folderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">Folder not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Elegant Floating Sidebar */}
      <aside
        className={`fixed top-6 left-6 bottom-6 z-50 bg-white rounded-2xl shadow-2xl transition-all duration-300 ${
          sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'
        } w-80`}
      >
        <div className="h-full flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Folders</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {folderTree && folderTree.length > 0 ? (
              <div className="space-y-1">
                {folderTree.map((folder) => (
                  <FolderTreeNode
                    key={folder.id}
                    folder={folder}
                    currentFolderId={folderId}
                    expandedFolders={expandedFolders}
                    onToggle={toggleFolder}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No folders</p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-[22rem]' : 'ml-0'}`}>
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
                <h1 className="text-2xl font-semibold text-gray-900">{folderData.name}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredFiles.length} {filteredFiles.length === 1 ? 'photo' : 'photos'}
                  {folderData.subfolders.length > 0 && (
                    <> • {folderData.subfolders.length} {folderData.subfolders.length === 1 ? 'folder' : 'folders'}</>
                  )}
                </p>
              </div>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            <div className={`flex-wrap gap-2 mt-4 ${searchOpen ? 'flex' : 'hidden md:flex'}`}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="flex-1 min-w-[120px] px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="name">Name</option>
                <option value="date">Date</option>
              </select>
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  title="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 border-l border-gray-200 ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              {viewMode === 'grid' && (
                <select
                  value={gridSize}
                  onChange={(e) => setGridSize(e.target.value as 'small' | 'medium' | 'large')}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="small">S</option>
                  <option value="medium">M</option>
                  <option value="large">L</option>
                </select>
              )}
            </div>
          </div>
        </header>

        <div className="px-8 pt-1 pb-8">
          {folderData.subfolders.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">Folders</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {folderData.subfolders.map((subfolder) => (
                  <Link
                    key={subfolder.id}
                    href={`/gallery/${subfolder.id}`}
                    className="group p-4 border border-gray-200 rounded-lg hover:border-gray-900 hover:shadow-sm transition-all"
                  >
                    <Folder className="w-8 h-8 mb-3 text-gray-400 group-hover:text-gray-900 transition-colors" />
                    <p className="text-sm font-medium text-gray-900 truncate">{subfolder.name}</p>
                    {subfolder.file_count !== undefined && subfolder.file_count > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {subfolder.file_count} {subfolder.file_count === 1 ? 'photo' : 'photos'}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {filteredFiles.length > 0 ? (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">Photos</h3>
              {viewMode === 'grid' ? (
                <div className={`grid gap-4 ${
                  gridSize === 'small' ? 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8' :
                  gridSize === 'large' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :
                  'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                }`}>
                  {filteredFiles.map((file, index) => (
                    <div
                      key={file.id}
                      onClick={() => handleImageClick(file, index)}
                      className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-gray-900 transition-all cursor-pointer"
                    >
                      {file.thumbnail_key ? (
                        <img
                          src={getThumbnailUrl(file.thumbnail_key) || ''}
                          alt={file.original_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInfoFile(file);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                        title="View info"
                      >
                        <Info className="w-4 h-4 text-gray-700" />
                      </button>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-xs truncate">{file.original_name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map((file, index) => (
                    <button
                      key={file.id}
                      onClick={() => handleImageClick(file, index)}
                      className="group w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {file.thumbnail_key ? (
                          <img
                            src={getThumbnailUrl(file.thumbnail_key) || ''}
                            alt={file.original_name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.original_name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(file.uploaded_at).toLocaleDateString()} • {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInfoFile(file);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View info"
                      >
                        <Info className="w-4 h-4 text-gray-600" />
                      </button>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : folderData.files.length > 0 && searchQuery ? (
            <div className="text-center py-20">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">No photos match your search</p>
            </div>
          ) : folderData.files.length === 0 && folderData.subfolders.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">This folder is empty</p>
            </div>
          ) : null}
        </div>
      </main>

      {selectedFile && folderData && (
        <ImagePreviewModal
          file={selectedFile}
          onClose={handleCloseImage}
          onDelete={() => {}}
          onNext={selectedIndex < filteredFiles.length - 1 ? () => handleNavigate('next') : undefined}
          onPrevious={selectedIndex > 0 ? () => handleNavigate('prev') : undefined}
          nextFile={selectedIndex < filteredFiles.length - 1 ? filteredFiles[selectedIndex + 1] : undefined}
          previousFile={selectedIndex > 0 ? filteredFiles[selectedIndex - 1] : undefined}
        />
      )}

      {infoFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setInfoFile(null)}>
          <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Image Information</h3>
              <button onClick={() => setInfoFile(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Name</p>
                <p className="text-sm text-gray-900 break-words">{infoFile.original_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Size</p>
                <p className="text-sm text-gray-900">{(infoFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {infoFile.width && infoFile.height && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Dimensions</p>
                  <p className="text-sm text-gray-900">{infoFile.width} × {infoFile.height} px</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Type</p>
                <p className="text-sm text-gray-900">{infoFile.mime_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Uploaded</p>
                <p className="text-sm text-gray-900">{new Date(infoFile.uploaded_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

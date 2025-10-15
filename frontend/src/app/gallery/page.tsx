'use client';

import { useFolderTree } from '@/lib/hooks/useFolders';
import { Folder, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function PublicGallery() {
  const { data: folders, isLoading } = useFolderTree();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <h1 className="text-3xl font-semibold text-gray-900">Galleries</h1>
          <p className="text-sm text-gray-500 mt-2">Browse our photo collections</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        {folders && folders.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {folders.map((folder) => (
              <Link
                key={folder.id}
                href={`/gallery/${folder.id}`}
                className="group p-6 border border-gray-200 rounded-lg hover:border-gray-900 hover:shadow-sm transition-all"
              >
                <Folder className="w-12 h-12 mb-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                <h3 className="text-base font-medium text-gray-900 truncate mb-2">
                  {folder.name}
                </h3>
                {folder.file_count !== undefined && folder.file_count > 0 && (
                  <p className="text-sm text-gray-500">
                    {folder.file_count} {folder.file_count === 1 ? 'photo' : 'photos'}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No galleries yet</h2>
            <p className="text-gray-500">Check back later for photo collections</p>
          </div>
        )}
      </main>
    </div>
  );
}

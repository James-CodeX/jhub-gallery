'use client';

import { useState } from 'react';
import { useFolderTree } from '@/lib/hooks/useFolders';
import { Folder, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PublicGallery() {
  const { data: folders, isLoading } = useFolderTree();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">JHUB Gallery</h1>
            <p className="text-sm text-gray-600">Browse our photo collections</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {folders?.map((folder) => (
            <Link
              key={folder.id}
              href={`/gallery/${folder.id}`}
              className="group bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all"
            >
              <Folder className="w-16 h-16 mx-auto mb-4 text-blue-500 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-center truncate mb-2">
                {folder.name}
              </h3>
              {folder.file_count !== undefined && folder.file_count > 0 && (
                <p className="text-sm text-gray-500 text-center">
                  {folder.file_count} {folder.file_count === 1 ? 'photo' : 'photos'}
                </p>
              )}
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {folders && folders.length === 0 && (
          <div className="text-center py-16">
            <ImageIcon className="w-20 h-20 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No galleries yet
            </h2>
            <p className="text-gray-500 mb-6">
              Check back later for amazing photo collections
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Go to Home
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import { ChevronRight, Folder as FolderIcon, Home } from 'lucide-react';
import Link from 'next/link';
import type { Folder } from '@/types';
import { buildBreadcrumbs } from '@/lib/utils';

interface BreadcrumbProps {
  currentFolder: Folder | null;
}

export function Breadcrumb({ currentFolder }: BreadcrumbProps) {
  const breadcrumbs = currentFolder ? buildBreadcrumbs(currentFolder.path) : [{ name: 'Default Home Folder', path: '/' }];

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center">
          {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />}
          <Link
            href={`/?folder=${encodeURIComponent(currentFolder?.id || '')}`}
            className="flex items-center hover:text-gray-900 transition-colors"
          >
            {index === 0 ? (
              <Home className="w-4 h-4" />
            ) : (
              <>
                <FolderIcon className="w-4 h-4 mr-1" />
                <span>{crumb.name}</span>
              </>
            )}
          </Link>
        </div>
      ))}
    </nav>
  );
}

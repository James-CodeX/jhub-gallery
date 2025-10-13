import Link from 'next/link';
import { FolderTree, Upload, Share2 } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="z-10 max-w-4xl w-full">
        <h1 className="text-5xl font-bold text-center mb-4 text-gray-900">
          JHUB Gallery
        </h1>
        <p className="text-center text-gray-600 mb-12 text-lg">
          Fast and elegant photo gallery system
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Dashboard Card */}
          <Link
            href="/admin"
            className="group p-8 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-500 transition-colors">
                <FolderTree className="w-8 h-8 text-blue-600 group-hover:text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">Admin Dashboard</h2>
            <p className="text-gray-600 mb-4">
              Upload, organize, and manage your photo collections
            </p>
            <div className="flex items-center text-blue-600 font-medium">
              Go to Dashboard
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Public Gallery Card */}
          <Link
            href="/gallery"
            className="group p-8 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-500 transition-colors">
                <Share2 className="w-8 h-8 text-indigo-600 group-hover:text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">Public Gallery</h2>
            <p className="text-gray-600 mb-4">
              Share and view beautiful photo galleries
            </p>
            <div className="flex items-center text-indigo-600 font-medium">
              Browse Gallery
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">Fast</div>
            <p className="text-sm text-gray-600">Direct MinIO uploads</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-600 mb-2">Organized</div>
            <p className="text-sm text-gray-600">Hierarchical folders</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">Shareable</div>
            <p className="text-sm text-gray-600">Secure share links</p>
          </div>
        </div>
      </div>
    </main>
  )
}

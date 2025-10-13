'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  useEffect(() => {
    const vars = {
      'NEXT_PUBLIC_API_URL': process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
      'NEXT_PUBLIC_MINIO_ENDPOINT': process.env.NEXT_PUBLIC_MINIO_ENDPOINT || 'NOT SET',
      'NEXT_PUBLIC_MINIO_BUCKET_ORIGINAL': process.env.NEXT_PUBLIC_MINIO_BUCKET_ORIGINAL || 'NOT SET',
      'NEXT_PUBLIC_MINIO_BUCKET_THUMBNAILS': process.env.NEXT_PUBLIC_MINIO_BUCKET_THUMBNAILS || 'NOT SET',
      'NEXT_PUBLIC_MINIO_URL': process.env.NEXT_PUBLIC_MINIO_URL || 'NOT SET',
    };
    setEnvVars(vars);
    console.log('🔍 Debug - Environment Variables:', vars);
  }, []);

  const testImageKey = 'abb7725d-5cb2-4e4d-a70c-1dd949b1670a/94a6dbac-2cac-44b5-94c9-01693e8e9d16.jpg';
  const endpoint = process.env.NEXT_PUBLIC_MINIO_ENDPOINT || 'http://minio.jameskaranja.me:9000';
  const bucket = process.env.NEXT_PUBLIC_MINIO_BUCKET_ORIGINAL || 'jhub-photos-original';
  const testUrl = `${endpoint}/${bucket}/${testImageKey}`;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Debug Information</h1>
      
      <div className="bg-gray-100 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        <table className="w-full text-sm">
          <tbody>
            {Object.entries(envVars).map(([key, value]) => (
              <tr key={key} className="border-b">
                <td className="py-2 font-mono text-xs font-semibold">{key}</td>
                <td className="py-2 font-mono text-xs">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Image URL</h2>
        <p className="text-sm mb-2 break-all font-mono">{testUrl}</p>
        <a 
          href={testUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm"
        >
          Open in new tab →
        </a>
      </div>

      <div className="bg-green-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Image</h2>
        <img 
          src={testUrl} 
          alt="Test" 
          className="max-w-full border border-gray-300"
          onLoad={() => console.log('✅ Image loaded successfully')}
          onError={(e) => console.error('❌ Image failed to load:', e)}
        />
      </div>
    </div>
  );
}

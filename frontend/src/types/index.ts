// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
}

// Folder Types
export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  path: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  file_count?: number;
  total_size?: number;
}

export interface FolderWithContents extends Folder {
  files: PhotoFile[];
  subfolders: Folder[];
}

export interface FolderTree extends Folder {
  children: FolderTree[];
}

export interface FolderStats {
  file_count: number;
  total_size: number;
  formatted_size: string;
}

// File Types
export interface PhotoFile {
  id: string;
  folder_id: string;
  filename: string;
  original_name: string;
  minio_key: string;
  thumbnail_key: string | null;
  size: number;
  mime_type: string;
  width: number | null;
  height: number | null;
  uploaded_at: string;
  uploaded_by: string | null;
  metadata: Record<string, any> | null;
}

export interface FileWithFolder extends PhotoFile {
  folder_name: string;
  folder_path: string;
}

// Upload Types
export interface PresignedUploadUrl {
  uploadUrl: string;
  fileId: string;
  minioKey: string;
}

export interface BatchUploadUrl {
  file: string;
  uploadUrl: string;
  fileId: string;
  minioKey: string;
}

export interface UploadSession {
  id: string;
  folder_id: string;
  total_files: number;
  completed_files: number;
  failed_files: number;
  status: 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  urls: BatchUploadUrl[];
}

export interface CompleteUploadData {
  fileId: string;
  folderId: string;
  filename: string;
  originalName: string;
  minioKey: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  metadata?: Record<string, any>;
}

export interface UploadFile extends File {
  id?: string;
  preview?: string;
}

// Share Link Types
export interface ShareLink {
  id: string;
  token: string;
  folder_id: string | null;
  file_id: string | null;
  title: string | null;
  description: string | null;
  expires_at: string | null;
  created_at: string;
  created_by: string | null;
  access_count: number;
  last_accessed_at: string | null;
  is_active: boolean;
}

export interface SharedContent {
  shareLink: ShareLink;
  folder?: FolderWithContents;
  file?: FileWithFolder;
}

// Download Types
export interface DownloadStats {
  file_count: number;
  total_size: number;
  formatted_size: string;
}

// UI State Types
export interface UploadProgress {
  fileId: string;
  filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface SelectionState {
  selectedFiles: Set<string>;
  selectedFolders: Set<string>;
}

export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'date' | 'size' | 'type';
export type SortOrder = 'asc' | 'desc';

// Export all API modules
export { apiClient, ApiError } from './client';
export { foldersApi } from './folders';
export { filesApi } from './files';
export { uploadApi } from './upload';
export { shareApi } from './share';
export { downloadApi } from './download';

// Combined API object
import { foldersApi } from './folders';
import { filesApi } from './files';
import { uploadApi } from './upload';
import { shareApi } from './share';
import { downloadApi } from './download';

export const api = {
  folders: foldersApi,
  files: filesApi,
  upload: uploadApi,
  share: shareApi,
  download: downloadApi,
};

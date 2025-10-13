-- JHUB Africa Photo Gallery Database Schema
-- Initialize database tables and indexes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Folders table for hierarchical folder structure
CREATE TABLE IF NOT EXISTS folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    path TEXT NOT NULL, -- Materialized path for quick lookups (e.g., /root/folder1/subfolder)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255), -- User identifier (can be linked to auth system later)
    CONSTRAINT unique_folder_path UNIQUE(path)
);

-- Files table for storing file metadata
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    minio_key TEXT NOT NULL UNIQUE, -- S3/MinIO object key
    thumbnail_key TEXT, -- Thumbnail object key
    size BIGINT NOT NULL, -- File size in bytes
    mime_type VARCHAR(100) NOT NULL,
    width INTEGER, -- Image width in pixels
    height INTEGER, -- Image height in pixels
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(255), -- User identifier
    metadata JSONB, -- Additional metadata (EXIF data, etc.)
    CONSTRAINT valid_size CHECK (size > 0)
);

-- Share links table for generating shareable links
CREATE TABLE IF NOT EXISTS share_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(64) NOT NULL UNIQUE,
    folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    title VARCHAR(255), -- Optional title for the share link
    description TEXT, -- Optional description
    expires_at TIMESTAMP, -- NULL means never expires
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    access_count INTEGER DEFAULT 0, -- Track how many times accessed
    last_accessed_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT share_target CHECK (
        (folder_id IS NOT NULL AND file_id IS NULL) OR 
        (folder_id IS NULL AND file_id IS NOT NULL)
    )
);

-- Upload sessions table for tracking multi-file uploads
CREATE TABLE IF NOT EXISTS upload_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    total_files INTEGER NOT NULL,
    completed_files INTEGER DEFAULT 0,
    failed_files INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, completed, failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

-- Create indexes for better query performance
CREATE INDEX idx_folders_parent_id ON folders(parent_id);
CREATE INDEX idx_folders_path ON folders(path);
CREATE INDEX idx_files_folder_id ON files(folder_id);
CREATE INDEX idx_files_uploaded_at ON files(uploaded_at DESC);
CREATE INDEX idx_files_mime_type ON files(mime_type);
CREATE INDEX idx_share_links_token ON share_links(token);
CREATE INDEX idx_share_links_folder_id ON share_links(folder_id);
CREATE INDEX idx_share_links_file_id ON share_links(file_id);
CREATE INDEX idx_share_links_expires_at ON share_links(expires_at);
CREATE INDEX idx_upload_sessions_folder_id ON upload_sessions(folder_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_upload_sessions_updated_at BEFORE UPDATE ON upload_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert root folder
INSERT INTO folders (id, name, parent_id, path, created_by)
VALUES (
    uuid_generate_v4(),
    'Root',
    NULL,
    '/',
    'system'
) ON CONFLICT (path) DO NOTHING;

-- Create view for folder tree with file counts
CREATE OR REPLACE VIEW folder_tree_view AS
SELECT 
    f.id,
    f.name,
    f.parent_id,
    f.path,
    f.created_at,
    f.created_by,
    COUNT(DISTINCT fi.id) as file_count,
    COALESCE(SUM(fi.size), 0) as total_size
FROM folders f
LEFT JOIN files fi ON f.id = fi.folder_id
GROUP BY f.id, f.name, f.parent_id, f.path, f.created_at, f.created_by;

-- Create view for active share links
CREATE OR REPLACE VIEW active_share_links_view AS
SELECT 
    sl.*,
    CASE 
        WHEN sl.expires_at IS NULL THEN TRUE
        WHEN sl.expires_at > CURRENT_TIMESTAMP THEN TRUE
        ELSE FALSE
    END as is_valid
FROM share_links sl
WHERE sl.is_active = TRUE;

COMMENT ON TABLE folders IS 'Hierarchical folder structure for organizing photos';
COMMENT ON TABLE files IS 'Photo file metadata with references to MinIO storage';
COMMENT ON TABLE share_links IS 'Shareable links for folders and individual files';
COMMENT ON TABLE upload_sessions IS 'Track multi-file upload progress';

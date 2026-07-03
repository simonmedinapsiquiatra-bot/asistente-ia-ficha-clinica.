import { getAccessToken } from './auth';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export const listDriveFiles = async (query?: string): Promise<DriveFile[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  let q = "trashed = false";
  if (query) {
    q += ` and name contains '${query}'`;
  }

  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType)&pageSize=50`;
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Failed to list files');
  }

  const data = await res.json();
  return data.files || [];
};

export const getDriveFileText = async (file: DriveFile): Promise<string> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  if (file.mimeType === 'application/vnd.google-apps.document') {
    // Export Google Docs to text
    const url = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/plain`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to export document');
    return res.text();
  } else {
    // Try to get media for other text files
    const url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to read file content');
    return res.text();
  }
};

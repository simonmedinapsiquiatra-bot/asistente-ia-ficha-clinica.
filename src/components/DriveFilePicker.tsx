import React, { useState, useEffect } from 'react';
import { FileText, Search, Loader2 } from 'lucide-react';
import { listDriveFiles, DriveFile } from '../lib/drive';
import { useGoogleLogin } from '@react-oauth/google';
import { setAccessToken } from '../lib/auth';

interface DriveFilePickerProps {
  label: string;
  onFileSelect: (file: DriveFile) => void;
}

export function DriveFilePicker({ label, onFileSelect }: DriveFilePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    onSuccess: (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
      setIsOpen(true);
      fetchFiles();
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      setError('Error al iniciar sesión en Google');
    }
  });

  const handleOpenClick = async () => {
    // If it's already open, close it.
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    // We always trigger login to ensure token is fresh and valid.
    login();
  };

  const fetchFiles = async (q: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const driveFiles = await listDriveFiles(q);
      setFiles(driveFiles);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiles(search);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={handleOpenClick}
          className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M16 2L8 16H0L8 2H16Z" />
            <path fill="#0F9D58" d="M24 16H8L12 23.5H24L24 16Z" />
            <path fill="#FFC107" d="M16 2L24 16L20 23.5L8 2L16 2Z" />
          </svg>
          {label}
        </button>

        {isOpen && (
          <div className="absolute z-10 bottom-full mb-1 left-0 right-0 bg-white border border-slate-200 rounded-md shadow-xl p-3 max-h-80 flex flex-col">
            <form onSubmit={handleSearch} className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Buscar archivos..."
                className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                <Search size={16} />
              </button>
            </form>

            <div className="flex-1 overflow-y-auto min-h-[150px]">
              {loading ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <Loader2 className="animate-spin" size={20} />
                </div>
              ) : error ? (
                <div className="text-red-500 text-xs p-2 text-center">{error}</div>
              ) : files.length === 0 ? (
                <div className="text-slate-500 text-xs p-2 text-center">No se encontraron archivos</div>
              ) : (
                <ul className="space-y-1">
                  {files.map(file => (
                    <li key={file.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onFileSelect(file);
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-2 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded flex items-center gap-2"
                      >
                        <FileText size={14} className="text-blue-500 flex-shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { FileText, Search, Loader2 } from 'lucide-react';
import { listDriveFiles, DriveFile } from '../lib/drive';

interface DriveFilePickerProps {
  label: string;
  onFileSelect: (file: DriveFile | null) => void;
  selectedFile: DriveFile | null;
}

export function DriveFilePicker({ label, onFileSelect, selectedFile }: DriveFilePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    }
  }, [isOpen]);

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
      <label className="text-sm font-medium text-slate-700">{label}</label>
      
      {!selectedFile ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors text-slate-600 text-sm"
          >
            <span className="flex items-center gap-2">
              <FileText size={16} />
              Select from Google Drive
            </span>
          </button>

          {isOpen && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg p-3 max-h-80 flex flex-col">
              <form onSubmit={handleSearch} className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Search files..."
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
                  <div className="text-slate-500 text-xs p-2 text-center">No files found</div>
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
      ) : (
        <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border border-blue-100 rounded-md">
          <div className="flex items-center gap-2 overflow-hidden">
            <FileText size={16} className="text-blue-600 flex-shrink-0" />
            <span className="text-sm text-blue-900 truncate font-medium">{selectedFile.name}</span>
          </div>
          <button
            onClick={() => onFileSelect(null)}
            className="text-xs text-blue-600 hover:text-blue-800 ml-2 font-medium"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

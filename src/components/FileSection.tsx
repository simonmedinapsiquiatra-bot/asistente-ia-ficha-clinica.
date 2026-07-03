import React, { useRef, useState } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';
import { DriveFilePicker } from './DriveFilePicker';
import { DriveFile } from '../lib/googleDrive';

interface FileSectionProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  isGuest?: boolean;
}

export function FileSection({ label, value, onChange, isGuest }: FileSectionProps) {
  const [loadingFile, setLoadingFile] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLocalFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingFile(true);
    setSelectedFileName(file.name);
    
    try {
      if (file.name.endsWith('.docx')) {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        onChange(result.value);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          onChange((event.target?.result as string) || '');
        };
        reader.onerror = () => {
          console.error("Error reading file");
        };
        reader.readAsText(file);
      }
    } catch (err) {
      console.error("Error procesando el archivo:", err);
      alert("Hubo un error procesando el archivo.");
      setSelectedFileName(null);
    } finally {
      // The reader is async, so we only turn off loading here for docx. For txt, it's done in onload.
      // Actually let's just use await file.text() for txt files to simplify.
      if (!file.name.endsWith('.docx')) {
        const text = await file.text();
        onChange(text);
      }
      setLoadingFile(false);
    }
  };

  const handleDriveFile = async (file: DriveFile) => {
    setLoadingFile(true);
    setSelectedFileName(file.name);
    try {
      const accessToken = (window as any).gapi.client.getToken().access_token;
      
      let url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
      
      if (file.mimeType.includes('google-apps.document')) {
        url = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/plain`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch file content');
      
      const text = await response.text();
      onChange(text);
    } catch (err) {
      console.error("Error fetching drive file:", err);
      alert("No se pudo extraer el texto del archivo de Drive.");
      setSelectedFileName(null);
    } finally {
      setLoadingFile(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
      </div>

      <div className="flex flex-col gap-3">
        {value ? (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-green-600" size={20} />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-green-900">
                  Documento cargado exitosamente
                </span>
                {selectedFileName && (
                  <span className="text-xs text-green-700">{selectedFileName}</span>
                )}
              </div>
            </div>
            <button 
              onClick={() => { onChange(''); setSelectedFileName(null); }}
              className="text-xs text-green-700 hover:text-green-800 underline"
            >
              Cambiar archivo
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleLocalFile}
              className="hidden"
              accept=".txt,.md,.csv,.docx"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loadingFile}
              className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {loadingFile ? "Cargando..." : <><Upload size={18} /> Subir archivo local (.txt, .docx)</>}
            </button>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">O PEGA EL TEXTO</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <textarea
              className="w-full h-24 p-3 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-slate-800"
              placeholder="Pega aquí el contenido de tu Google Doc..."
              onChange={(e) => {
                if (e.target.value) {
                  onChange(e.target.value);
                  setSelectedFileName("Texto pegado");
                }
              }}
            />

            {!isGuest && (
              <div className="w-full hidden">
                <DriveFilePicker 
                  label="O elegir documento de Google Drive"
                  onFileSelect={handleDriveFile} 
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

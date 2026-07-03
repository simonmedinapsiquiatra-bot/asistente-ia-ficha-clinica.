import React from 'react';
import { Settings, X, Key, Cpu } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  model: string;
  setModel: (model: string) => void;
}

export function SettingsModal({ isOpen, onClose, apiKey, setApiKey, model, setModel }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-800">
            <Settings size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold">Configuración de IA</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Key size={16} className="text-slate-400" />
              Gemini API Key
            </label>
            <input 
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 transition-all placeholder:text-slate-400"
            />
            <p className="text-xs text-slate-500">
              Tu clave se almacena de forma segura en tu navegador y no se envía a ningún servidor.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Cpu size={16} className="text-slate-400" />
              Modelo de IA
            </label>
            <div className="relative">
              <select 
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full appearance-none px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 transition-all cursor-pointer"
              >
                <option value="gemini-3.5-flash">Gemini 3.5 Flash (Nuevo)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Recomendado)</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Rápido)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Legacy)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Legacy)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Selecciona el modelo para la generación. Modelos "Pro" razonan mejor, "Flash" son más rápidos.
            </p>
          </div>

        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            Guardar y Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}

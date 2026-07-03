import React, { useState, useEffect, useRef } from 'react';
import { DriveFilePicker } from './DriveFilePicker';
import { DriveFile, getDriveFileText } from '../lib/drive';
import { Loader2, Mic, MicOff } from 'lucide-react';

interface InputSectionProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  isGuest?: boolean;
}

export function InputSection({ label, value, onChange, placeholder, isGuest }: InputSectionProps) {
  const [mode, setMode] = useState<'text' | 'drive'>('text');
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  
  // Microphone state
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (selectedFile) {
      const loadText = async () => {
        setLoadingFile(true);
        try {
          const text = await getDriveFileText(selectedFile);
          onChange(text);
        } catch (err) {
          console.error("Failed to load file text", err);
          alert("Error loading file content from Drive.");
          setSelectedFile(null);
        } finally {
          setLoadingFile(false);
        }
      };
      loadText();
    }
  }, [selectedFile]);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-CL';

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (currentTranscript) {
        onChange(value + (value ? ' ' : '') + currentTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">{label}</h3>
        <div className="flex items-center gap-2">
          {mode === 'text' && (
            <button
              onClick={toggleRecording}
              className={"p-1.5 rounded-full transition-colors " + (isRecording ? "bg-red-100 text-red-600 animate-pulse" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
              title={isRecording ? "Stop recording" : "Start dictation"}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}
          <div className="flex bg-slate-100 p-0.5 rounded-md">
            <button
              type="button"
              onClick={() => { setMode('text'); setSelectedFile(null); }}
              className={"px-3 py-1 text-xs font-medium rounded-sm " + (mode === 'text' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700')}
            >
              Text
            </button>
            {!isGuest && (
              <button
                type="button"
                onClick={() => setMode('drive')}
                className={"px-3 py-1 text-xs font-medium rounded-sm " + (mode === 'drive' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700')}
              >
                Drive
              </button>
            )}
          </div>
        </div>
      </div>

      {!isGuest && mode === 'drive' && (
        <div className="mb-2">
           <DriveFilePicker 
              label="Choose a document from Google Drive" 
              selectedFile={selectedFile}
              onFileSelect={(file) => {
                setSelectedFile(file);
                if (!file) onChange('');
              }}
           />
           {loadingFile && (
             <div className="flex items-center gap-2 mt-2 text-xs text-blue-600">
               <Loader2 className="animate-spin" size={12} /> Loading file contents...
             </div>
           )}
        </div>
      )}

      {(mode === 'text' || (mode === 'drive' && selectedFile && !loadingFile)) && (
         <textarea
          className="w-full h-32 p-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono text-slate-600"
          placeholder={placeholder || ("Enter " + label.toLowerCase() + "...")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loadingFile}
        />
      )}
    </div>
  );
}

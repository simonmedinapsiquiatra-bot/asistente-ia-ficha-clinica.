import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Trash2 } from 'lucide-react';

interface SpeechRecorderProps {
  value: string;
  onTranscript: (val: string) => void;
  onClear: () => void;
}

export function SpeechRecorder({ value, onTranscript, onClear }: SpeechRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-CL';

      recognition.onresult = (event: any) => {
        let final = '';
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (final) {
          onTranscript(final);
        }
        setInterimText(interim);
      };
      
      recognition.onerror = (e: any) => {
        console.error('Speech recognition error', e.error);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onTranscript]);

  const toggle = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setInterimText('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">Transcripción de la Sesión</label>
        <div className="flex gap-2">
          {value && (
             <button
               onClick={onClear}
               className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
               title="Limpiar transcripción"
             >
               <Trash2 size={16} />
             </button>
          )}
          <button
            onClick={toggle}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              isRecording 
                ? 'bg-red-100 text-red-700 hover:bg-red-200 animate-pulse' 
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
            {isRecording ? 'Detener' : 'Grabar (es-CL)'}
          </button>
        </div>
      </div>
      
      <div className="relative">
        <textarea
          className="w-full h-24 p-3 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none resize-y text-slate-600"
          placeholder="La transcripción de voz aparecerá aquí..."
          value={value + (isRecording && interimText ? ' ' + interimText : '')}
          readOnly
        />
        {!window.SpeechRecognition && !(window as any).webkitSpeechRecognition && (
          <div className="absolute inset-0 bg-slate-50/90 flex items-center justify-center p-4 text-center rounded-md">
            <span className="text-sm text-amber-700 font-medium">
              El reconocimiento de voz no está soportado en este navegador. Usa Chrome o Edge.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout } from './lib/auth';
import { FileSection } from './components/FileSection';
import { SpeechRecorder } from './components/SpeechRecorder';
import { SettingsModal } from './components/SettingsModal';
import { DEFAULT_SECTIONS, ClinicalSection, BIBLIOGRAFIA_INTERNA } from './prompts';
import { Loader2, LogOut, FileText, Send, Sparkles, GripVertical, Check, Copy, Settings } from 'lucide-react';
import Markdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const [sections, setSections] = useState<ClinicalSection[]>(DEFAULT_SECTIONS);
  const [fichaClinica, setFichaClinica] = useState("");
  const [transcripcion, setTranscripcion] = useState("");
  const [apuntes, setApuntes] = useState("");
  
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [extraInstructions, setExtraInstructions] = useState("");
  const [showExtraInstructions, setShowExtraInstructions] = useState(false);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-2.5-pro");

  useEffect(() => {
    // Load settings from local storage
    const storedKey = localStorage.getItem("gemini_api_key");
    const storedModel = localStorage.getItem("gemini_model");
    if (storedKey) setApiKey(storedKey);
    if (storedModel) setModel(storedModel);

    const unsubscribe = initAuth(
      (user) => {
        setUser(user);
        setLoadingAuth(false);
      },
      () => {
        setUser(null);
        setLoadingAuth(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem("gemini_api_key", apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem("gemini_model", model);
  }, [model]);


  const handleLogin = async () => {
    try {
      await googleSignIn();
    } catch (err: any) {
      console.error(err);
      alert("Error al iniciar sesión con Google: " + (err.message || "Error desconocido") + "\n\nSi estás usando la vista previa, intenta abrir la aplicación en una nueva pestaña usando el ícono correspondiente.");
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(dragIndex) || dragIndex === dropIndex) return;
    
    const newSections = [...sections];
    const [draggedItem] = newSections.splice(dragIndex, 1);
    newSections.splice(dropIndex, 0, draggedItem);
    setSections(newSections);
  };

  const toggleSection = (index: number) => {
    const newSections = [...sections];
    newSections[index].selected = !newSections[index].selected;
    setSections(newSections);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setError("Por favor configura tu API Key de Gemini en los Ajustes primero.");
      setIsSettingsOpen(true);
      return;
    }

    const activeSections = sections.filter(s => s.selected);
    
    if (activeSections.length === 0) {
      setError("Selecciona al menos una sección para generar.");
      return;
    }

    if (!fichaClinica && !transcripcion && !apuntes) {
      setError("Proporciona al menos un insumo (Ficha, Transcripción o Apuntes).");
      return;
    }

    setGenerating(true);
    setError(null);
    setResult("");

    let promptInstructions = "Eres un asistente psiquiátrico experto. Utilizando los insumos provistos, debes generar un documento clínico que contenga ÚNICA Y EXCLUSIVAMENTE las secciones solicitadas en el orden exacto en el que se listan a continuación. No agregues introducciones, conclusiones, ni comentarios extra. ESTÁ ESTRICTAMENTE PROHIBIDO agregar cualquier texto adicional o apartados que no estén en la lista. Escribe en tono clínico, formal y en tercera persona. Usa el título de la sección en formato markdown (ej. ### Título) para cada una.\n\nSecciones a generar (en este orden exacto):\n";
    
    activeSections.forEach((s, i) => {
      promptInstructions += (i + 1) + ". " + s.name + ": " + s.instruction + "\n\n";
    });

    let contents = `System Prompt/Instructions:\n${promptInstructions}\n\nInputs:\n`;
    
    const inputs = {
        "Ficha Clínica": fichaClinica,
        "Transcripción": transcripcion,
        "Apuntes": apuntes,
        "Bibliografía": BIBLIOGRAFIA_INTERNA
    };

    if (extraInstructions.trim()) {
      contents += `\nINSTRUCCIONES ADICIONALES DEL USUARIO:\n${extraInstructions}\n`;
    }

    for (const [key, value] of Object.entries(inputs)) {
      if (value) {
          contents += `\n--- ${key.toUpperCase()} ---\n${value}\n`;
      }
    }

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      const response = await ai.models.generateContent({
        model: model,
        contents,
      });

      if (!response.text) {
        throw new Error("No text returned from Gemini");
      }
      setResult(response.text);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al conectar con Gemini API. Verifica tu API Key.");
    } finally {
      setGenerating(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!user && !isGuest) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="text-blue-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Clinical Docs AI</h1>
          <p className="text-slate-500 mb-6">Inicia sesión con tu cuenta de Google para acceder a tus archivos de Drive y generar la documentación.</p>
          
          <div className="flex flex-col gap-3">
            {window !== window.parent ? (
              <div className="flex flex-col gap-4 mb-2">
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg text-left">
                  <strong>⚠️ Entorno restringido:</strong> Por seguridad, el inicio de sesión de Google no funciona dentro de esta vista previa incrustada.
                </div>
                <a 
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all font-medium"
                >
                  Abrir en nueva pestaña para ingresar
                </a>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-all font-medium text-slate-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.0003 9.50005C13.7703 9.50005 15.3553 10.1101 16.6053 11.3001L20.0303 7.87505C17.9553 5.94505 15.2353 4.75505 12.0003 4.75505C7.31028 4.75505 3.25528 7.44505 1.28027 11.3601L5.27027 14.4551C6.22527 11.5301 8.88028 9.50005 12.0003 9.50005Z"/>
                  <path fill="#4285F4" d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"/>
                  <path fill="#FBBC05" d="M5.26498 14.295C5.02498 13.57 4.88998 12.8 4.88998 12C4.88998 11.2 5.02498 10.43 5.26498 9.705L1.27498 6.61C0.459984 8.24 0 10.06 0 12C0 13.94 0.459984 15.76 1.27498 17.39L5.26498 14.295Z"/>
                  <path fill="#34A853" d="M12 24C15.24 24 17.965 22.935 19.945 21.095L16.08 18.095C15.005 18.82 13.62 19.245 12 19.245C8.88 19.245 6.225 17.215 5.265 14.29L1.275 17.385C3.255 21.305 7.31 24 12 24Z"/>
                </svg>
                Sign in with Google
              </button>
            )}

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">o</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button 
              onClick={() => setIsGuest(true)}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all font-medium rounded-lg"
            >
              Continuar sin iniciar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        apiKey={apiKey}
        setApiKey={setApiKey}
        model={model}
        setModel={setModel}
      />

      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Docs AI</h1>
            <p className="text-xs text-slate-500 font-medium">Psychiatric Note Generator</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-slate-600">{user?.email || "Modo Invitado"}</div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            title="Ajustes (API Key y Modelo)"
          >
            <Settings size={18} />
          </button>
          <button 
            onClick={() => {
              if (user) logout();
              setIsGuest(false);
            }}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            title="Salir"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs & Config */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Secciones a Generar</h2>
            <p className="text-sm text-slate-500 mb-4">Selecciona y arrastra las secciones para definir el orden del documento generado.</p>
            <div className="flex flex-col gap-2">
              {sections.map((sec, index) => (
                <div 
                  key={sec.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, index)}
                  onClick={() => toggleSection(index)}
                  className="flex items-center gap-4 p-4 md:p-3 bg-slate-50 border border-slate-200 rounded-xl md:rounded-lg cursor-pointer hover:bg-slate-100 transition-colors shadow-sm md:shadow-none touch-manipulation active:scale-[0.99]"
                >
                  <div className="cursor-move p-1 -ml-1 text-slate-400 hover:text-slate-600 rounded" onClick={e => e.stopPropagation()}>
                    <GripVertical size={18} />
                  </div>
                  <input 
                    type="checkbox" 
                    checked={sec.selected}
                    onChange={() => {}} // React controlled input warning prevention, handled by div onClick
                    className="w-5 h-5 md:w-4 md:h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 pointer-events-none"
                  />
                  <span className="text-base md:text-sm font-semibold md:font-medium text-slate-700 select-none">{sec.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <FileSection 
              label="Ficha Clínica" 
              value={fichaClinica} 
              onChange={setFichaClinica} 
              isGuest={isGuest}
            />
            <SpeechRecorder 
              value={transcripcion} 
              onTranscript={(newText) => setTranscripcion(prev => (prev + (prev ? ' ' : '') + newText).trim())}
              onClear={() => setTranscripcion("")}
            />
            <div className="flex flex-col gap-2 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <label className="text-sm font-semibold text-slate-700">Apuntes de la Sesión Actual</label>
              <textarea
                className="w-full h-40 p-3 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-slate-800"
                placeholder="Escribe aquí los apuntes y observaciones de la atención actual..."
                value={apuntes}
                onChange={(e) => setApuntes(e.target.value)}
              />
            </div>
          </div>

        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-7 flex flex-col h-[calc(100vh-8rem)] sticky top-24">
          <div className="bg-white flex-1 rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col gap-3 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Generated Output</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowExtraInstructions(!showExtraInstructions)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg shadow-sm transition-colors"
                    title="Instrucciones Adicionales"
                  >
                    <span className="text-lg leading-none">+</span> Instrucciones
                  </button>
                  <button
                    onClick={handleCopy}
                    disabled={!result || generating}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 text-sm font-medium rounded-lg shadow-sm transition-colors"
                    title="Copiar resultado"
                  >
                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    {copied ? "Copiado!" : "Copiar"}
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                  >
                    {generating ? (
                      <><Loader2 className="animate-spin" size={16} /> Generando...</>
                    ) : (
                      <><Send size={16} /> Generar</>
                    )}
                  </button>
                </div>
              </div>

              {showExtraInstructions && (
                <div className="pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                  <textarea
                    className="w-full h-20 p-3 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-slate-800 shadow-inner"
                    placeholder="Agrega instrucciones extra para la IA. Por ejemplo: 'Hazlo más resumido', 'Usa un tono más empático', 'Asegúrate de destacar X síntoma'..."
                    value={extraInstructions}
                    onChange={(e) => setExtraInstructions(e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto bg-white">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}
              
              {!result && !generating && !error && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <FileText size={48} className="mb-4 opacity-20" />
                  <p>Selecciona insumos y presiona Generar para crear la documentación.</p>
                </div>
              )}

              {result && (
                <div className="prose prose-slate prose-sm sm:prose-base max-w-none">
                   <div className="markdown-body">
                      <Markdown>{result}</Markdown>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

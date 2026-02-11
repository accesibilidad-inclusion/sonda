import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, Mic, Type, SkipForward, HelpCircle, MessageSquare, Trash2, Pencil, Video, PlayCircle } from 'lucide-react';
import { Activity, ResponseMode, ResponseItem } from '../types';
import { IS_DEVELOPER_MODE } from '../constants';

interface ActivityViewProps {
  activity: Activity;
  onUpdate: (activityId: string, updatedResponses: ResponseItem[]) => void;
  onBack: () => void;
}

const ActivityView: React.FC<ActivityViewProps> = ({ activity, onUpdate, onBack }) => {
  const [mode, setMode] = useState<ResponseMode | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScaffold, setShowScaffold] = useState(false);
  const [editingTimestamp, setEditingTimestamp] = useState<number | null>(null);
  
  // Media Recording Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // --- ACTIONS ---

  const addResponse = async (content: string, type: ResponseMode) => {
    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const newResponse: ResponseItem = {
      mode: type,
      content: content,
      timestamp: Date.now()
    };

    onUpdate(activity.id, [...activity.responses, newResponse]);
    resetForm();
  };

  const updateResponse = (timestamp: number, newContent: string) => {
      const updatedList = activity.responses.map(r => 
          r.timestamp === timestamp ? { ...r, content: newContent } : r
      );
      onUpdate(activity.id, updatedList);
      resetForm();
  };

  const deleteResponse = (timestamp: number) => {
      if(confirm("¿Estás seguro de que quieres borrar esta respuesta?")) {
          const updatedList = activity.responses.filter(r => r.timestamp !== timestamp);
          onUpdate(activity.id, updatedList);
      }
  };

  const handleEditClick = (item: ResponseItem) => {
      if (item.mode === ResponseMode.TEXT && item.content) {
          setTextInput(item.content);
          setEditingTimestamp(item.timestamp);
          setMode(ResponseMode.TEXT);
      }
  };

  const resetForm = () => {
      setIsSubmitting(false);
      setMode(null);
      setTextInput('');
      setEditingTimestamp(null);
      setIsRecording(false);
      audioChunksRef.current = [];
  };

  const handleSkip = () => {
    // "Right to Resistance" - Skipping is valid
    const newResponse: ResponseItem = {
        mode: ResponseMode.SKIPPED,
        content: null,
        timestamp: Date.now()
    };
    onUpdate(activity.id, [...activity.responses, newResponse]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isVideo = file.type.startsWith('video/');
      const responseType = isVideo ? ResponseMode.VIDEO : ResponseMode.PHOTO;

      // Limit file size to 3MB for Base64 storage to prevent LocalStorage crash
      if (file.size > 3 * 1024 * 1024) {
          alert("El archivo es demasiado grande para guardarse localmente. Guardaremos solo el nombre.");
          addResponse(`[Archivo Grande] ${file.name}`, responseType);
      } else {
          // Convert to Base64 for viewing
          const reader = new FileReader();
          reader.onloadend = () => {
              if (reader.result) {
                  addResponse(reader.result as string, responseType);
              }
          };
          reader.readAsDataURL(file);
      }
    }
  };

  const startRecording = async () => {
    if (IS_DEVELOPER_MODE) console.log('[AudioRecording] Starting recording...');

    // Check if browser supports audio recording
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const errorMsg = "Tu navegador no soporta grabación de audio. Intenta usar Chrome, Firefox o Safari actualizado.";
      if (IS_DEVELOPER_MODE) console.error('[AudioRecording] getUserMedia not supported');
      alert(errorMsg);
      return;
    }

    if (typeof MediaRecorder === 'undefined') {
      const errorMsg = "MediaRecorder no está disponible en tu navegador.";
      if (IS_DEVELOPER_MODE) console.error('[AudioRecording] MediaRecorder not available');
      alert(errorMsg);
      return;
    }

    try {
      if (IS_DEVELOPER_MODE) console.log('[AudioRecording] Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (IS_DEVELOPER_MODE) console.log('[AudioRecording] Microphone access granted', stream);

      // Determine supported mime type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4'; // Safari support
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
          mimeType = 'audio/wav';
      }

      if (IS_DEVELOPER_MODE) console.log(`[AudioRecording] Using MIME type: ${mimeType}`);

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      if (IS_DEVELOPER_MODE) console.log('[AudioRecording] MediaRecorder created', mediaRecorder);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          if (IS_DEVELOPER_MODE) console.log(`[AudioRecording] Data chunk received: ${event.data.size} bytes`);
        }
      };

      mediaRecorder.onstop = () => {
        if (IS_DEVELOPER_MODE) console.log('[AudioRecording] Recording stopped');
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (IS_DEVELOPER_MODE) console.log(`[AudioRecording] Audio blob created: ${audioBlob.size} bytes`);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          if (IS_DEVELOPER_MODE) console.log(`[AudioRecording] Base64 audio length: ${base64Audio.length}`);

           // Check size (~4MB limit for base64 string to be safe with 5MB localStorage)
           if (base64Audio.length > 4 * 1024 * 1024) {
             alert("El audio es demasiado largo para guardarse localmente. Intenta grabar algo más corto.");
             if (IS_DEVELOPER_MODE) console.warn('[AudioRecording] Audio too large for localStorage');
           } else {
             if (IS_DEVELOPER_MODE) console.log('[AudioRecording] Saving audio response');
             addResponse(base64Audio, ResponseMode.AUDIO);
           }
        };

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => {
          track.stop();
          if (IS_DEVELOPER_MODE) console.log('[AudioRecording] Audio track stopped');
        });
      };

      mediaRecorder.onerror = (event) => {
        if (IS_DEVELOPER_MODE) console.error('[AudioRecording] MediaRecorder error:', event);
        alert("Ocurrió un error durante la grabación. Por favor intenta de nuevo.");
      };

      mediaRecorder.start();
      setIsRecording(true);
      if (IS_DEVELOPER_MODE) console.log('[AudioRecording] ✅ Recording started successfully');
    } catch (error) {
      if (IS_DEVELOPER_MODE) {
        console.error("[AudioRecording] ❌ Error accessing microphone:", error);
        if (error instanceof Error) {
          console.error('[AudioRecording] Error name:', error.name);
          console.error('[AudioRecording] Error message:', error.message);
        }
      }

      let errorMessage = "No se pudo acceder al micrófono. ";

      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage += "Debes permitir el acceso al micrófono en la configuración de tu navegador.";
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMessage += "No se detectó ningún micrófono conectado.";
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          errorMessage += "El micrófono está siendo usado por otra aplicación.";
        } else if (error.name === 'OverconstrainedError') {
          errorMessage += "No se encontró un micrófono que cumpla con los requisitos.";
        } else if (error.name === 'SecurityError') {
          errorMessage += "Acceso denegado por motivos de seguridad. Asegúrate de usar HTTPS o localhost.";
        } else {
          errorMessage += `Error: ${error.name}`;
        }
      } else {
        errorMessage += "Por favor verifica los permisos del navegador.";
      }

      alert(errorMessage);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // --- RENDERING HELPERS ---

  const renderModeSelector = () => (
    <div className="grid grid-cols-3 gap-4 mt-8">
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center p-6 bg-card-bg border-2 border-soft-gray rounded-2xl shadow-sm hover:border-calm-blue active:scale-95 transition-all"
      >
        <div className="p-3 mb-2 text-white bg-blue-500 rounded-full">
          <Camera size={24} />
        </div>
        <span className="text-sm font-medium text-deep-text">Foto/Video</span>
      </button>

      <button 
        onClick={() => setMode(ResponseMode.AUDIO)}
        className="flex flex-col items-center justify-center p-6 bg-card-bg border-2 border-soft-gray rounded-2xl shadow-sm hover:border-calm-blue active:scale-95 transition-all"
      >
        <div className="p-3 mb-2 text-white bg-purple-500 rounded-full">
          <Mic size={24} />
        </div>
        <span className="text-sm font-medium text-deep-text">Audio</span>
      </button>

      <button 
        onClick={() => setMode(ResponseMode.TEXT)}
        className="flex flex-col items-center justify-center p-6 bg-card-bg border-2 border-soft-gray rounded-2xl shadow-sm hover:border-calm-blue active:scale-95 transition-all"
      >
        <div className="p-3 mb-2 text-white bg-green-500 rounded-full">
          <Type size={24} />
        </div>
        <span className="text-sm font-medium text-deep-text">Texto</span>
      </button>
      
      <input 
        type="file" 
        accept="image/*,video/*" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
      />
    </div>
  );

  const renderActiveMode = () => {
    if (mode === ResponseMode.TEXT) {
      return (
        <div className="mt-6 animate-fade-in">
          <textarea
            className="w-full p-4 text-lg bg-card-bg text-deep-text border-2 border-soft-gray rounded-xl focus:border-calm-blue focus:ring-0 outline-none min-h-[150px]"
            placeholder="Escribe aquí tu respuesta..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            autoFocus
          />
          <div className="flex gap-3 mt-4">
             <button 
              onClick={resetForm}
              className="px-6 py-3 font-medium text-deep-text bg-calm-bg rounded-xl hover:opacity-80"
            >
              Cancelar
            </button>
            <button 
              onClick={() => editingTimestamp ? updateResponse(editingTimestamp, textInput) : addResponse(textInput, ResponseMode.TEXT)}
              disabled={!textInput.trim() || isSubmitting}
              className="flex-1 px-6 py-3 font-bold text-btn-text bg-calm-blue rounded-xl disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : (editingTimestamp ? 'Actualizar' : 'Enviar Respuesta')}
            </button>
          </div>
        </div>
      );
    }

    if (mode === ResponseMode.AUDIO) {
      return (
        <div className="mt-8 flex flex-col items-center animate-fade-in">
          <button 
            onClick={toggleRecording}
            className={`p-8 rounded-full mb-6 transition-all duration-500 cursor-pointer ${isRecording ? 'bg-red-100 ring-4 ring-red-200 shadow-lg scale-110' : 'bg-card-bg border-2 border-soft-gray hover:border-calm-blue hover:shadow-md'}`}
            aria-label={isRecording ? "Detener grabación" : "Iniciar grabación"}
          >
            <Mic size={48} className={isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'} />
          </button>
          <p className="mb-8 text-lg font-medium text-deep-text">
            {isRecording ? 'Grabando... Toca el micrófono para terminar.' : 'Toca el micrófono para comenzar'}
          </p>
          
          <div className="flex w-full gap-3">
             <button 
              onClick={resetForm}
              disabled={isRecording}
              className="px-6 py-3 font-medium text-deep-text bg-calm-bg rounded-xl disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              onClick={toggleRecording}
              className={`flex-1 px-6 py-3 font-bold text-btn-text rounded-xl transition-colors ${isRecording ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-calm-blue hover:opacity-90'}`}
            >
              {isRecording ? 'Terminar y Guardar' : 'Grabar'}
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderResponseItem = (resp: ResponseItem, idx: number) => {
      const isLargeFile = resp.content?.startsWith('[Archivo Grande]');
      const canViewMedia = !isLargeFile && resp.content && (resp.content.startsWith('data:') || resp.content.startsWith('blob:'));

      return (
        <div key={resp.timestamp} className="bg-card-bg border border-soft-gray rounded-xl overflow-hidden mb-3 animate-fade-in shadow-sm">
            <div className="p-4 flex gap-3 items-start">
                <div className="p-2 bg-calm-bg rounded-full text-deep-text flex-shrink-0">
                    {resp.mode === ResponseMode.TEXT && <Type size={16} />}
                    {resp.mode === ResponseMode.AUDIO && <Mic size={16} />}
                    {resp.mode === ResponseMode.PHOTO && <Camera size={16} />}
                    {resp.mode === ResponseMode.VIDEO && <Video size={16} />}
                    {resp.mode === ResponseMode.SKIPPED && <SkipForward size={16} />}
                </div>
                
                <div className="flex-1 min-w-0">
                    {/* TEXT CONTENT */}
                    {resp.mode === ResponseMode.TEXT && (
                        <p className="text-base text-deep-text whitespace-pre-wrap">{resp.content}</p>
                    )}

                    {/* PHOTO CONTENT */}
                    {resp.mode === ResponseMode.PHOTO && (
                        <div className="mt-1">
                            {canViewMedia ? (
                                <img src={resp.content!} alt="Respuesta" className="w-full max-w-xs rounded-lg border border-soft-gray" />
                            ) : (
                                <p className="text-sm italic opacity-70 flex items-center gap-2"><Camera size={12}/> {resp.content}</p>
                            )}
                        </div>
                    )}

                    {/* VIDEO CONTENT */}
                    {resp.mode === ResponseMode.VIDEO && (
                         <div className="mt-1">
                            {canViewMedia ? (
                                <video src={resp.content!} controls className="w-full max-w-xs rounded-lg border border-soft-gray max-h-48" />
                            ) : (
                                <p className="text-sm italic opacity-70 flex items-center gap-2"><Video size={12}/> {resp.content}</p>
                            )}
                        </div>
                    )}
                    
                    {/* AUDIO CONTENT */}
                    {resp.mode === ResponseMode.AUDIO && (
                        <div className="mt-1">
                             {canViewMedia ? (
                                 <audio src={resp.content!} controls className="w-full max-w-xs h-10" />
                             ) : (
                                 <p className="text-sm italic opacity-70 flex items-center gap-2"><Mic size={12}/> {resp.content}</p>
                             )}
                        </div>
                    )}

                    {/* SKIPPED CONTENT */}
                    {resp.mode === ResponseMode.SKIPPED && (
                         <p className="text-sm font-medium opacity-80">{resp.content || "Sin contenido"}</p>
                    )}

                    <p className="text-xs opacity-50 mt-2">
                        {new Date(resp.timestamp).toLocaleDateString()} • {new Date(resp.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col gap-2">
                    {resp.mode === ResponseMode.TEXT && (
                        <button 
                            onClick={() => handleEditClick(resp)}
                            className="p-2 text-calm-blue hover:bg-calm-bg rounded-full"
                            aria-label="Editar"
                        >
                            <Pencil size={18} />
                        </button>
                    )}
                    <button 
                        onClick={() => deleteResponse(resp.timestamp)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-full"
                        aria-label="Borrar"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
      );
  };

  return (
    <div className="flex flex-col min-h-screen bg-calm-bg">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-card-bg/80 backdrop-blur-md shadow-sm border-b border-soft-gray">
        <button onClick={onBack} className="p-2 -ml-2 text-deep-text rounded-full hover:bg-calm-bg">
          <ArrowLeft size={24} />
        </button>
        <span className="text-sm font-semibold text-deep-text opacity-50 tracking-wide uppercase">Actividad</span>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 max-w-lg mx-auto w-full pb-24">
        <h1 className="text-2xl font-bold text-deep-text mb-4 leading-tight">{activity.title}</h1>
        
        <div className="bg-card-bg p-6 rounded-2xl shadow-sm border border-soft-gray mb-6">
          <p className="text-lg text-deep-text leading-relaxed mb-4">{activity.description}</p>
          
          {activity.scaffoldExample && (
            <div className="mt-4">
               <button 
                 onClick={() => setShowScaffold(!showScaffold)}
                 className="flex items-center gap-2 text-sm font-semibold text-calm-blue hover:underline"
               >
                 <HelpCircle size={16} />
                 {showScaffold ? 'Ocultar ejemplo' : 'Ver ejemplo de ayuda'}
               </button>
               {showScaffold && (
                 <div className="mt-3 p-4 bg-calm-blue/10 text-deep-text rounded-xl text-sm italic border border-calm-blue/20">
                   {activity.scaffoldExample}
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Existing Responses List */}
        {activity.responses && activity.responses.length > 0 && (
            <div className="mb-8">
                <h3 className="text-sm font-bold text-deep-text opacity-40 uppercase tracking-wider mb-3">Tus Respuestas</h3>
                <div className="space-y-2">
                    {activity.responses.map((resp, idx) => renderResponseItem(resp, idx))}
                </div>
            </div>
        )}

        {!mode ? (
            <>
                <h3 className="text-sm font-bold text-deep-text opacity-40 uppercase tracking-wider mb-2">
                    {activity.responses.length > 0 ? "Añadir más" : "Responder"}
                </h3>
                {renderModeSelector()}
            </>
        ) : (
            <>
                <h3 className="text-sm font-bold text-deep-text opacity-40 uppercase tracking-wider mb-2">
                    {editingTimestamp ? "Editando respuesta" : "Nueva respuesta"}
                </h3>
                {renderActiveMode()}
            </>
        )}

        {!mode && activity.responses.length === 0 && (
          <div className="mt-12 text-center">
             <button 
               onClick={handleSkip}
               className="flex items-center justify-center w-full gap-2 p-4 text-soft-gray hover:text-deep-text transition-colors"
             >
               <SkipForward size={20} />
               <span className="font-medium">Prefiero saltar esta actividad hoy</span>
             </button>
             <p className="text-xs text-soft-gray mt-2">No hay respuestas incorrectas. Saltarla está bien.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityView;
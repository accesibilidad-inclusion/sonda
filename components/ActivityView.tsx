import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, Mic, Type, SkipForward, HelpCircle, MessageSquare, Trash2, Pencil, Video } from 'lucide-react';
import { Activity, ResponseMode, ResponseItem } from '../types';
import { compressImage, compressVideo, getAudioConstraints, getAudioRecorderOptions } from '../services/mediaCompression';

interface ActivityViewProps {
  activity: Activity;
  onUpdate: (activityId: string, updatedResponses: ResponseItem[]) => void;
  onBack: () => void;
}

const MODE_LABELS: Record<ResponseMode, string> = {
  [ResponseMode.TEXT]: 'Texto',
  [ResponseMode.AUDIO]: 'Audio',
  [ResponseMode.PHOTO]: 'Foto / Video',
  [ResponseMode.VIDEO]: 'Video',
  [ResponseMode.SKIPPED]: 'Sin respuesta',
};

const ActivityView: React.FC<ActivityViewProps> = ({ activity, onUpdate, onBack }) => {
  const [mode, setMode] = useState<ResponseMode | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScaffold, setShowScaffold] = useState(false);
  const [editingTimestamp, setEditingTimestamp] = useState<number | null>(null);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Cierra el menú de medios al tocar fuera
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showMediaMenu && !(e.target as HTMLElement).closest('.media-menu-container')) {
        setShowMediaMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMediaMenu]);

  // --- Acciones ---

  const addResponse = async (content: string | null, type: ResponseMode) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    const newResponse: ResponseItem = { mode: type, content, timestamp: Date.now() };
    onUpdate(activity.id, [...activity.responses, newResponse]);
    resetForm();
  };

  const replaceResponse = (timestamp: number, newContent: string | null, newMode: ResponseMode) => {
    const updatedList = activity.responses.map(r =>
      r.timestamp === timestamp ? { ...r, content: newContent, mode: newMode } : r
    );
    onUpdate(activity.id, updatedList);
    resetForm();
  };

  const deleteResponse = (timestamp: number) => {
    if (confirm('¿Borrar esta respuesta?')) {
      onUpdate(activity.id, activity.responses.filter(r => r.timestamp !== timestamp));
    }
  };

  const handleSkip = () => {
    addResponse(null, ResponseMode.SKIPPED);
  };

  const resetForm = () => {
    setIsSubmitting(false);
    setMode(null);
    setTextInput('');
    setEditingTimestamp(null);
    setIsRecording(false);
    setPermissionError(null);
    audioChunksRef.current = [];
  };

  // Iniciar edición — para texto edita inline; para otros, abre la captura correspondiente
  const handleEditClick = (item: ResponseItem) => {
    setEditingTimestamp(item.timestamp);
    if (item.mode === ResponseMode.TEXT) {
      setTextInput(item.content ?? '');
      setMode(ResponseMode.TEXT);
    } else if (item.mode === ResponseMode.AUDIO) {
      setMode(ResponseMode.AUDIO);
    } else if (item.mode === ResponseMode.PHOTO || item.mode === ResponseMode.VIDEO) {
      setMode(ResponseMode.PHOTO);
    } else if (item.mode === ResponseMode.SKIPPED) {
      setMode(ResponseMode.TEXT);
    }
  };

  // --- Grabación de audio ---

  const requestMicPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(getAudioConstraints());
      stream.getTracks().forEach(t => t.stop());
      return true;
    } catch {
      return false;
    }
  };

  const startRecording = async () => {
    setPermissionError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionError('Tu navegador no soporta grabación de audio.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia(getAudioConstraints());
      const recorderOptions = getAudioRecorderOptions();
      const mimeType = recorderOptions.mimeType;
      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          if (base64Audio.length > 4 * 1024 * 1024) {
            alert('El audio es demasiado largo. Intenta grabar algo más corto.');
          } else if (editingTimestamp) {
            replaceResponse(editingTimestamp, base64Audio, ResponseMode.AUDIO);
          } else {
            addResponse(base64Audio, ResponseMode.AUDIO);
          }
        };
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      if (error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError')) {
        setPermissionError('No se pudo acceder al micrófono. Toca "Permitir micrófono" para conceder el permiso.');
      } else {
        setPermissionError('No se pudo acceder al micrófono. Verifica los permisos del dispositivo.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // --- Archivos de medios ---

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const isVideo = file.type.startsWith('video/');
    const responseType = isVideo ? ResponseMode.VIDEO : ResponseMode.PHOTO;

    try {
      setIsSubmitting(true);
      const compressed = isVideo ? await compressVideo(file) : await compressImage(file);
      if (editingTimestamp) {
        replaceResponse(editingTimestamp, compressed, responseType);
      } else {
        await addResponse(compressed, responseType);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al procesar el archivo.');
      setIsSubmitting(false);
    }
  };

  // --- Renderizado ---

  // Filtra los modos permitidos para esta actividad (SKIPPED siempre disponible)
  const allowed = activity.allowedModes ?? [ResponseMode.TEXT, ResponseMode.AUDIO, ResponseMode.PHOTO];
  const showPhotoButton = allowed.includes(ResponseMode.PHOTO) || allowed.includes(ResponseMode.VIDEO);
  const showAudioButton = allowed.includes(ResponseMode.AUDIO);
  const showTextButton = allowed.includes(ResponseMode.TEXT);

  const renderPermissionBanner = () => (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
      <p className="mb-3">{permissionError}</p>
      <button
        onClick={async () => {
          const granted = await requestMicPermission();
          if (granted) {
            setPermissionError(null);
            startRecording();
          } else {
            setPermissionError('Permiso denegado. Actívalo en la configuración de tu dispositivo.');
          }
        }}
        className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold text-sm"
      >
        Permitir micrófono
      </button>
    </div>
  );

  const renderModeSelector = () => (
    <div className={`grid gap-4 mt-8 ${[showPhotoButton, showAudioButton, showTextButton].filter(Boolean).length === 3 ? 'grid-cols-3' : [showPhotoButton, showAudioButton, showTextButton].filter(Boolean).length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {/* Foto/Video */}
      {showPhotoButton && (
        <div className="relative media-menu-container">
          <button
            onClick={() => setShowMediaMenu(!showMediaMenu)}
            className="w-full flex flex-col items-center justify-center p-6 bg-card-bg border-2 border-soft-gray rounded-2xl shadow-sm hover:border-calm-blue active:scale-95 transition-all"
          >
            <div className="p-3 mb-2 text-white bg-blue-500 rounded-full">
              <Camera size={24} />
            </div>
            <span className="text-sm font-medium text-deep-text">Imagen</span>
          </button>
          {showMediaMenu && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card-bg border-2 border-soft-gray rounded-lg shadow-lg overflow-hidden z-20 animate-fade-in">
              <button
                onClick={() => { cameraInputRef.current?.click(); setShowMediaMenu(false); }}
                className="w-full flex items-center p-3 hover:bg-calm-bg text-left border-b border-soft-gray text-sm font-medium text-deep-text"
              >
                Tomar foto o video
              </button>
              <button
                onClick={() => { fileInputRef.current?.click(); setShowMediaMenu(false); }}
                className="w-full flex items-center p-3 hover:bg-calm-bg text-left text-sm font-medium text-deep-text"
              >
                Subir desde galería
              </button>
            </div>
          )}
        </div>
      )}

      {/* Audio */}
      {showAudioButton && (
        <button
          onClick={() => setMode(ResponseMode.AUDIO)}
          className="flex flex-col items-center justify-center p-6 bg-card-bg border-2 border-soft-gray rounded-2xl shadow-sm hover:border-calm-blue active:scale-95 transition-all"
        >
          <div className="p-3 mb-2 text-white bg-purple-500 rounded-full">
            <Mic size={24} />
          </div>
          <span className="text-sm font-medium text-deep-text">Audio</span>
        </button>
      )}

      {/* Texto */}
      {showTextButton && (
        <button
          onClick={() => setMode(ResponseMode.TEXT)}
          className="flex flex-col items-center justify-center p-6 bg-card-bg border-2 border-soft-gray rounded-2xl shadow-sm hover:border-calm-blue active:scale-95 transition-all"
        >
          <div className="p-3 mb-2 text-white bg-green-500 rounded-full">
            <Type size={24} />
          </div>
          <span className="text-sm font-medium text-deep-text">Texto</span>
        </button>
      )}

      {/* Inputs ocultos */}
      <input type="file" accept="image/*,video/*" capture="environment" ref={cameraInputRef} className="hidden" onChange={handleFileChange} />
      <input type="file" accept="image/*,video/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
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
            <button onClick={resetForm} className="px-6 py-3 font-medium text-deep-text bg-calm-bg rounded-xl hover:opacity-80">
              Cancelar
            </button>
            <button
              onClick={() => {
                if (editingTimestamp) replaceResponse(editingTimestamp, textInput, ResponseMode.TEXT);
                else addResponse(textInput, ResponseMode.TEXT);
              }}
              disabled={!textInput.trim() || isSubmitting}
              className="flex-1 px-6 py-3 font-bold text-btn-text bg-calm-blue rounded-xl disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : editingTimestamp ? 'Actualizar' : 'Enviar'}
            </button>
          </div>
        </div>
      );
    }

    if (mode === ResponseMode.AUDIO) {
      return (
        <div className="mt-8 flex flex-col items-center animate-fade-in">
          <button
            onClick={() => isRecording ? stopRecording() : startRecording()}
            className={`p-8 rounded-full mb-6 transition-all duration-500 cursor-pointer ${
              isRecording
                ? 'bg-red-100 ring-4 ring-red-200 shadow-lg scale-110'
                : 'bg-card-bg border-2 border-soft-gray hover:border-calm-blue hover:shadow-md'
            }`}
            aria-label={isRecording ? 'Detener grabación' : 'Iniciar grabación'}
          >
            <Mic size={48} className={isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'} />
          </button>
          <p className="mb-6 text-lg font-medium text-deep-text">
            {isRecording ? 'Grabando… toca el micrófono para terminar.' : 'Toca el micrófono para comenzar'}
          </p>

          {permissionError && renderPermissionBanner()}

          {!permissionError && (
            <div className="flex w-full gap-3">
              <button onClick={resetForm} disabled={isRecording} className="px-6 py-3 font-medium text-deep-text bg-calm-bg rounded-xl disabled:opacity-50">
                Cancelar
              </button>
              <button
                onClick={() => isRecording ? stopRecording() : startRecording()}
                className={`flex-1 px-6 py-3 font-bold text-btn-text rounded-xl transition-colors ${
                  isRecording ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-calm-blue hover:opacity-90'
                }`}
              >
                {isRecording ? 'Terminar y guardar' : 'Grabar'}
              </button>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const renderResponseItem = (resp: ResponseItem) => {
    const canViewMedia = !!(resp.content?.startsWith('data:') || resp.content?.startsWith('blob:'));
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
            {resp.mode === ResponseMode.TEXT && (
              <p className="text-base text-deep-text whitespace-pre-wrap">{resp.content}</p>
            )}
            {resp.mode === ResponseMode.PHOTO && (
              canViewMedia
                ? <img src={resp.content!} alt="Respuesta" className="w-full max-w-xs rounded-lg border border-soft-gray" />
                : <p className="text-sm italic opacity-70">{resp.content}</p>
            )}
            {resp.mode === ResponseMode.VIDEO && (
              canViewMedia
                ? <video src={resp.content!} controls className="w-full max-w-xs rounded-lg border border-soft-gray max-h-48" />
                : <p className="text-sm italic opacity-70">{resp.content}</p>
            )}
            {resp.mode === ResponseMode.AUDIO && (
              canViewMedia
                ? <audio src={resp.content!} controls className="w-full max-w-xs h-10" />
                : <p className="text-sm italic opacity-70">{resp.content}</p>
            )}
            {resp.mode === ResponseMode.SKIPPED && (
              <p className="text-sm font-medium opacity-60 italic">Sin respuesta</p>
            )}
            <p className="text-xs opacity-40 mt-2">
              {new Date(resp.timestamp).toLocaleDateString('es-CL')} · {new Date(resp.timestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            {/* Editar — disponible para todos los tipos */}
            <button
              onClick={() => handleEditClick(resp)}
              className="p-2 text-calm-blue hover:bg-calm-bg rounded-full"
              aria-label="Editar o reemplazar"
            >
              <Pencil size={18} />
            </button>
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
        <span className="text-xs font-semibold text-deep-text opacity-40 tracking-widest uppercase">Actividad</span>
        <div className="w-10" />
      </div>

      {/* Contenido */}
      <div className="flex-1 p-6 max-w-lg mx-auto w-full pb-28">
        <h1 className="text-2xl font-bold text-deep-text mb-4 leading-tight">{activity.title}</h1>

        {/* TAC badge */}
        {activity.tacSubdimension && (
          <span className="inline-block mb-4 text-xs font-semibold uppercase tracking-wider text-calm-blue bg-calm-blue/10 px-3 py-1 rounded-full">
            {activity.tacSubdimension}
          </span>
        )}

        {/* Descripción */}
        <div className="bg-card-bg p-6 rounded-2xl shadow-sm border-2 border-soft-gray mb-6">
          <p className="text-lg text-deep-text leading-relaxed mb-4">{activity.description}</p>
          {activity.scaffoldExample && (
            <div className="mt-2">
              <button
                onClick={() => setShowScaffold(!showScaffold)}
                className="flex items-center gap-2 text-sm font-semibold text-calm-blue hover:underline"
              >
                <HelpCircle size={16} />
                {showScaffold ? 'Ocultar ejemplo' : 'Ver ejemplo'}
              </button>
              {showScaffold && (
                <div className="mt-3 p-4 bg-calm-blue/10 text-deep-text rounded-xl text-sm italic border border-calm-blue/20">
                  {activity.scaffoldExample}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Respuestas existentes */}
        {activity.responses.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-deep-text opacity-40 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MessageSquare size={12} /> Tus respuestas
            </h3>
            {activity.responses.map(renderResponseItem)}
          </div>
        )}

        {/* Selector de modo o modo activo */}
        {!mode ? (
          <>
            <h3 className="text-xs font-bold text-deep-text opacity-40 uppercase tracking-wider mb-1">
              {activity.responses.length > 0 ? 'Añadir más' : 'Responder'}
            </h3>
            {renderModeSelector()}

            {/* Opción de salida — siempre disponible */}
            <div className="mt-8 text-center">
              <button
                onClick={handleSkip}
                className="flex items-center justify-center w-full gap-2 p-4 text-soft-gray hover:text-deep-text transition-colors"
              >
                <SkipForward size={18} />
                <span className="font-medium text-sm">Esto no me ha pasado / prefiero no responder hoy</span>
              </button>
              <p className="text-xs text-soft-gray mt-1">No hay respuestas incorrectas.</p>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xs font-bold text-deep-text opacity-40 uppercase tracking-wider mb-2">
              {editingTimestamp ? 'Reemplazar respuesta' : 'Nueva respuesta'}
            </h3>
            {renderActiveMode()}
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityView;

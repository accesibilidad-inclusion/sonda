import React, { useState } from 'react';
import { Camera, Mic, CheckCircle, ChevronRight, Loader2 } from 'lucide-react';

interface PermissionsScreenProps {
  onDone: () => void;
}

const PermissionsScreen: React.FC<PermissionsScreenProps> = ({ onDone }) => {
  const [micGranted, setMicGranted] = useState<boolean | null>(null);
  const [camGranted, setCamGranted] = useState<boolean | null>(null);
  const [requesting, setRequesting] = useState<'mic' | 'cam' | null>(null);

  const requestMic = async () => {
    setRequesting('mic');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setMicGranted(true);
    } catch {
      setMicGranted(false);
    } finally {
      setRequesting(null);
    }
  };

  const requestCam = async () => {
    setRequesting('cam');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      setCamGranted(true);
    } catch {
      setCamGranted(false);
    } finally {
      setRequesting(null);
    }
  };

  const PermissionRow = ({
    icon,
    label,
    description,
    granted,
    onRequest,
    loading,
  }: {
    icon: React.ReactNode;
    label: string;
    description: string;
    granted: boolean | null;
    onRequest: () => void;
    loading: boolean;
  }) => (
    <div className="bg-card-bg rounded-2xl border border-soft-gray p-5">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl flex-shrink-0 ${granted === true ? 'bg-green-100 text-green-600' : 'bg-calm-blue/10 text-calm-blue'}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-deep-text mb-1">{label}</p>
          <p className="text-sm text-deep-text opacity-70 leading-snug">{description}</p>
          {granted === false && (
            <p className="text-xs text-red-500 mt-2">
              Permiso denegado. Puedes activarlo desde la configuración de tu dispositivo, o concederlo dentro de cada actividad.
            </p>
          )}
        </div>
        <div className="flex-shrink-0 ml-2">
          {granted === true ? (
            <CheckCircle size={24} className="text-green-500" />
          ) : (
            <button
              onClick={onRequest}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-2 bg-calm-blue text-btn-text rounded-xl text-sm font-semibold disabled:opacity-60 transition-opacity"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
              {loading ? '' : 'Permitir'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-calm-bg p-8">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <h1 className="text-2xl font-black text-deep-text mb-3 tracking-tight">
          Permisos de la app
        </h1>
        <p className="text-base text-deep-text opacity-70 leading-relaxed mb-8">
          La sonda puede usar tu cámara y micrófono para que respondas con fotos, videos o audio. Puedes conceder estos permisos ahora o más tarde dentro de cada actividad.
        </p>

        <div className="space-y-4 mb-8">
          <PermissionRow
            icon={<Mic size={22} />}
            label="Micrófono"
            description="Para grabar respuestas de audio en tus propias palabras."
            granted={micGranted}
            onRequest={requestMic}
            loading={requesting === 'mic'}
          />
          <PermissionRow
            icon={<Camera size={22} />}
            label="Cámara"
            description="Para tomar fotos o grabar videos de tu entorno de estudio."
            granted={camGranted}
            onRequest={requestCam}
            loading={requesting === 'cam'}
          />
        </div>

        <button
          onClick={onDone}
          className="w-full py-4 bg-deep-text text-calm-bg rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all"
        >
          {micGranted === true || camGranted === true ? 'Listo, comencemos' : 'Continuar sin permisos'}
        </button>

        <p className="text-xs text-center text-deep-text opacity-40 mt-4">
          Podrás cambiar los permisos en cualquier momento desde cada actividad.
        </p>
      </div>
    </div>
  );
};

export default PermissionsScreen;

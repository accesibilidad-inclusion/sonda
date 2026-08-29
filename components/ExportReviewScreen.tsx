import React, { useState } from 'react';
import { ArrowLeft, CheckSquare, Square, FileJson, Mail, Share2, CheckCircle } from 'lucide-react';
import { ExportSelection, Moment } from '../types';
import { storageService } from '../services/storageService';
import { encryptExport } from '../services/crypto';

interface Props {
  moments: Moment[];
  onBack: () => void;
}

interface CheckboxRowProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}

const CheckboxRow: React.FC<CheckboxRowProps> = ({ checked, onChange, label, description }) => (
  <button
    onClick={() => onChange(!checked)}
    className="w-full flex items-start gap-4 p-4 bg-card-bg border-2 rounded-2xl text-left transition-colors"
    style={{ borderColor: checked ? 'var(--color-calm-blue, #4a90e2)' : 'var(--color-soft-gray, #e5e7eb)' }}
  >
    <span className="flex-shrink-0 mt-0.5 text-calm-blue">
      {checked ? <CheckSquare size={22} /> : <Square size={22} className="text-soft-gray" />}
    </span>
    <span className="flex-1">
      <span className="block font-semibold text-deep-text">{label}</span>
      <span className="block text-sm text-deep-text opacity-60 mt-0.5 leading-snug">{description}</span>
    </span>
  </button>
);

const ExportReviewScreen: React.FC<Props> = ({ moments, onBack }) => {
  const hasFidgetData = true; // los logs se cargan al crear el archivo; el checkbox siempre visible

  const [selection, setSelection] = useState<ExportSelection>({
    bitacora: true,
    mensajeAlFuturo: true,
    fidget: true,
  });

  const [phase, setPhase] = useState<'select' | 'ready'>('select');
  const [creating, setCreating] = useState(false);
  const [filename, setFilename] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Cuenta cuántas respuestas hay en la bitácora (excluye mensaje al futuro)
  const bitacoraCount = moments
    .filter(m => !m.alwaysVisible)
    .reduce((n, m) => n + m.activities.reduce((a, act) => a + act.responses.length, 0), 0);

  const mensajeCount = moments
    .filter(m => m.alwaysVisible)
    .reduce((n, m) => n + m.activities.reduce((a, act) => a + act.responses.length, 0), 0);

  const nothingSelected = !selection.bitacora && !selection.mensajeAlFuturo && !selection.fidget;

  const handleCreate = async () => {
    if (nothingSelected) return;
    setCreating(true);
    setError(null);
    try {
      const plainBlob = await storageService.buildExportBlob(selection);
      const blob = await encryptExport(plainBlob);
      const name = storageService.exportFilename().replace('.json', '.sonda');
      setFilename(name);

      // Intentar Web Share API con archivo (iOS/Android: adjunta directamente)
      // Nota: las awaits anteriores pueden agotar el contexto de gesto en algunos browsers;
      // si share falla por cualquier razón no-abort, caemos al download sin mostrar error.
      const file = new File([blob], name, { type: 'application/octet-stream' });
      let shared = false;
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Sonda Digital — datos' });
          shared = true;
        } catch (shareErr) {
          if (shareErr instanceof Error && shareErr.name === 'AbortError') return; // usuario canceló
          // contexto de gesto agotado u otro error de share → fallback a descarga
        }
      }
      if (!shared) {
        // Escritorio o share no disponible/fallido: descarga directa
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      setPhase('ready');
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setError('No se pudo crear el archivo. Intenta de nuevo.');
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-calm-bg">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-card-bg/80 backdrop-blur-md shadow-sm border-b border-soft-gray">
        <button onClick={onBack} className="p-2 -ml-2 text-deep-text rounded-full hover:bg-calm-bg">
          <ArrowLeft size={24} />
        </button>
        <span className="text-xs font-semibold text-deep-text opacity-40 tracking-widest uppercase">
          Revisar antes de enviar
        </span>
        <div className="w-10" />
      </div>

      <div className="flex-1 p-6 max-w-lg mx-auto w-full pb-28">
        {phase === 'select' ? (
          <>
            <p className="text-deep-text opacity-70 text-sm mb-6 leading-relaxed">
              Elige qué quieres incluir en el archivo. Puedes desmarcar cualquier sección.
              Las respuestas que editaste o borraste dentro de la app ya no aparecerán.
            </p>

            <div className="space-y-3 mb-8">
              <CheckboxRow
                checked={selection.bitacora}
                onChange={v => setSelection(s => ({ ...s, bitacora: v }))}
                label="Bitácora del estudio"
                description={
                  bitacoraCount > 0
                    ? `${bitacoraCount} respuesta${bitacoraCount !== 1 ? 's' : ''} en los momentos 1–11.`
                    : 'Tus respuestas en los momentos 1–11.'
                }
              />
              <CheckboxRow
                checked={selection.mensajeAlFuturo}
                onChange={v => setSelection(s => ({ ...s, mensajeAlFuturo: v }))}
                label="Mensaje al futuro"
                description={
                  mensajeCount > 0
                    ? `${mensajeCount} respuesta${mensajeCount !== 1 ? 's' : ''} en el momento de cierre.`
                    : 'Tu respuesta en el momento de cierre.'
                }
              />
              <CheckboxRow
                checked={selection.fidget}
                onChange={v => setSelection(s => ({ ...s, fidget: v }))}
                label="Uso del fidget"
                description="Cuándo lo abriste, cuánto tiempo, lanzamientos y arrastres. Solo si lo autorizaste al comenzar."
              />
            </div>

            {error && (
              <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                {error}
              </p>
            )}

            <button
              onClick={handleCreate}
              disabled={nothingSelected || creating}
              className="w-full py-4 bg-deep-text text-calm-bg rounded-2xl font-bold text-base shadow-lg disabled:opacity-40 transition-opacity flex items-center justify-center gap-3"
            >
              <FileJson size={20} />
              {creating ? 'Creando archivo…' : 'Crear archivo'}
            </button>

            {nothingSelected && (
              <p className="mt-3 text-center text-xs text-deep-text opacity-40">
                Selecciona al menos una sección para continuar.
              </p>
            )}
          </>
        ) : (
          /* Fase 2: archivo listo */
          <div className="flex flex-col items-center text-center pt-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle size={36} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-deep-text mb-2">Archivo listo</h2>
            <p className="text-sm text-deep-text opacity-60 mb-2 leading-relaxed">
              El archivo <span className="font-mono text-xs bg-calm-bg px-2 py-0.5 rounded">{filename}</span> fue
              creado en tu dispositivo.
            </p>
            <p className="text-sm text-deep-text opacity-50 mb-8 leading-relaxed">
              Ahora puedes enviarlo por correo. Al abrirlo, adjunta el archivo que acabas de descargar.
            </p>

            <div className="w-full space-y-3">
              <a
                href={storageService.emailHref()}
                className="w-full flex items-center justify-center gap-3 py-4 bg-calm-blue text-white rounded-2xl font-bold text-base shadow-lg"
              >
                <Mail size={20} />
                Enviar por correo
              </a>

              {/* Share nativo como alternativa si está disponible */}
              {typeof navigator.share === 'function' && (
                <button
                  onClick={handleCreate}
                  className="w-full flex items-center justify-center gap-3 py-3 bg-card-bg border-2 border-soft-gray text-deep-text rounded-2xl font-semibold text-sm"
                >
                  <Share2 size={18} />
                  Compartir de otra manera
                </button>
              )}

              <button
                onClick={onBack}
                className="w-full py-3 text-deep-text opacity-50 text-sm font-medium"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportReviewScreen;

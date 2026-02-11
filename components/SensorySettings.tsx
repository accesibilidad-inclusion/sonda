import React from 'react';
import { X, Moon, Sun, Type, Volume2, Activity as ActivityIcon, EyeOff, Download, Trash2, Database, Send, Settings } from 'lucide-react';
import { SensoryProfile, ThemeType, FontSizeType, SoundType } from '../types';
import { storageService } from '../services/storageService';

interface SensorySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SensoryProfile;
  onUpdate: (newSettings: SensoryProfile) => void;
}

const SensorySettings: React.FC<SensorySettingsProps> = ({ isOpen, onClose, settings, onUpdate }) => {
  if (!isOpen) return null;

  const update = (key: keyof SensoryProfile, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  const handleExport = () => {
    if (confirm("¿Descargar tus datos en archivo JSON?")) {
        storageService.exportData();
    }
  };

  const handleSend = () => {
      if (confirm("Se descargará tu archivo de datos y se abrirá tu correo. Por favor, recuerda adjuntar el archivo descargado al email.")) {
          storageService.prepareEmailData();
      }
  };

  const handleClear = () => {
    if (confirm("¿Estás seguro? Esto borrará todo tu progreso de este dispositivo.")) {
        storageService.clearAllData();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card-bg rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-soft-gray">
        {/* Header */}
        <div className="p-6 border-b border-soft-gray flex justify-between items-center bg-calm-bg">
          <h2 className="text-xl font-bold text-deep-text flex items-center gap-2">
            <Settings size={20} className="text-calm-blue" />
            Preferencias
          </h2>
          <button onClick={onClose} className="p-2 bg-card-bg rounded-full text-soft-gray hover:text-deep-text shadow-sm border border-soft-gray">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
          
          {/* Theme Section */}
          <section>
            <h3 className="text-sm font-bold text-deep-text opacity-40 uppercase tracking-wider mb-3">Tema Visual</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'default', label: 'Calma', bg: 'bg-[#f0f4f8]', text: 'text-[#2c3e50]', border: 'border-blue-200' },
                { id: 'warm', label: 'Cálido', bg: 'bg-[#fdf6e3]', text: 'text-[#5e412f]', border: 'border-orange-200' },
                { id: 'high-contrast', label: 'Contraste', bg: 'bg-black', text: 'text-white', border: 'border-gray-800' }
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => update('theme', theme.id as ThemeType)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                    settings.theme === theme.id ? 'border-calm-blue ring-2 ring-calm-blue/20 scale-105' : 'border-soft-gray hover:border-calm-blue/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full mb-2 ${theme.bg} border ${theme.border} flex items-center justify-center`}>
                    <span className={`text-xs font-bold ${theme.text}`}>Aa</span>
                  </div>
                  <span className="text-xs font-medium text-deep-text">{theme.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Typography Section */}
          <section>
            <h3 className="text-sm font-bold text-deep-text opacity-40 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Type size={16} /> Tipografía
            </h3>
            
            <div className="bg-calm-bg p-4 rounded-xl space-y-4 border border-soft-gray">
              {/* Font Size */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-deep-text font-medium">Tamaño</span>
                <div className="flex bg-card-bg rounded-lg p-1 border border-soft-gray shadow-sm">
                  {(['normal', 'large', 'extra'] as FontSizeType[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => update('fontSize', size)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        settings.fontSize === size ? 'bg-calm-blue text-btn-text shadow-sm' : 'text-deep-text hover:bg-calm-bg'
                      }`}
                    >
                      {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dyslexia Toggle */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-deep-text font-medium">Fuente Dislexia</span>
                <button
                  onClick={() => update('dyslexiaFont', !settings.dyslexiaFont)}
                  className={`w-12 h-7 rounded-full transition-colors relative ${
                    settings.dyslexiaFont ? 'bg-calm-blue' : 'bg-soft-gray'
                  }`}
                >
                  <div className={`absolute top-1 left-1 w-5 h-5 bg-card-bg rounded-full transition-transform shadow-sm ${
                    settings.dyslexiaFont ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </section>

          {/* Audio Section */}
          <section>
            <h3 className="text-sm font-bold text-deep-text opacity-40 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Volume2 size={16} /> Sonido de Fondo
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              {[
                { id: 'off', label: 'Silencio' },
                { id: 'white', label: 'Ruido Blanco' },
                { id: 'pink', label: 'Ruido Rosa' },
                { id: 'brown', label: 'Ruido Marrón' },
              ].map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => update('sound', sound.id as SoundType)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                    settings.sound === sound.id 
                      ? 'bg-calm-blue/10 border-calm-blue text-calm-blue' 
                      : 'bg-card-bg border-soft-gray text-deep-text hover:border-calm-blue/50'
                  }`}
                >
                  {sound.label}
                </button>
              ))}
            </div>

            {settings.sound !== 'off' && (
              <div className="flex items-center gap-4 bg-calm-bg p-3 rounded-xl border border-soft-gray">
                 <Volume2 size={16} className="text-soft-gray" />
                 <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1"
                  value={settings.soundVolume}
                  onChange={(e) => update('soundVolume', parseFloat(e.target.value))}
                  className="w-full h-2 bg-soft-gray rounded-lg appearance-none cursor-pointer accent-calm-blue"
                 />
              </div>
            )}
          </section>

          {/* Animation Section */}
          <section>
            <h3 className="text-sm font-bold text-deep-text opacity-40 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ActivityIcon size={16} /> Movimiento
            </h3>
            
            <div className="flex justify-between items-center bg-calm-bg p-4 rounded-xl border border-soft-gray">
                <div className="flex flex-col">
                    <span className="text-sm text-deep-text font-medium">Reducir Animaciones</span>
                    <span className="text-xs text-deep-text opacity-60">Menos distracciones visuales</span>
                </div>
                <button
                  onClick={() => update('reducedMotion', !settings.reducedMotion)}
                  className={`w-12 h-7 rounded-full transition-colors relative ${
                    settings.reducedMotion ? 'bg-calm-blue' : 'bg-soft-gray'
                  }`}
                >
                  <div className={`absolute top-1 left-1 w-5 h-5 bg-card-bg rounded-full transition-transform shadow-sm ${
                    settings.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
          </section>

          {/* Data Management Section */}
          <section>
             <h3 className="text-sm font-bold text-deep-text opacity-40 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Database size={16} /> Gestión de Datos y Envíos
            </h3>
            <div className="flex flex-col gap-3">
                <button 
                    onClick={handleSend}
                    className="flex items-center justify-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl font-medium hover:bg-green-100 transition-colors border border-green-100"
                >
                    <Send size={18} />
                    Enviar mi bitácora
                </button>

                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-colors border border-blue-100 text-xs"
                    >
                        <Download size={16} />
                        Solo Descargar
                    </button>
                    <button 
                        onClick={handleClear}
                        className="flex items-center justify-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl font-medium hover:bg-red-100 transition-colors border border-red-100 text-xs"
                    >
                        <Trash2 size={16} />
                        Borrar todo
                    </button>
                </div>
            </div>
          </section>

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-soft-gray bg-calm-bg">
           <button onClick={onClose} className="w-full py-3 bg-calm-blue text-btn-text rounded-xl font-bold shadow-md hover:opacity-90 transition-opacity">
               Aplicar y Cerrar
           </button>
        </div>
      </div>
    </div>
  );
};

export default SensorySettings;
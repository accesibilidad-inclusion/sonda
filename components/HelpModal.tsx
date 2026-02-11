import React from 'react';
import { X, MessageCircle, Mail } from 'lucide-react';
import { HELP_CONTENT } from '../constants';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card-bg rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all border border-soft-gray">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-deep-text">{HELP_CONTENT.title}</h2>
            <button onClick={onClose} className="text-soft-gray hover:text-deep-text">
              <X size={24} />
            </button>
          </div>
          
          <p className="text-deep-text opacity-80 mb-6 leading-relaxed">
            {HELP_CONTENT.body}
          </p>

          <div className="space-y-3">
            <a 
              href={`https://wa.me/${HELP_CONTENT.whatsapp.replace('+', '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-full gap-3 p-3 text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors font-medium"
            >
              <MessageCircle size={20} />
              Chat en WhatsApp
            </a>
            
            <a 
              href={`mailto:${HELP_CONTENT.email}`}
              className="flex items-center justify-center w-full gap-3 p-3 text-deep-text bg-calm-bg rounded-xl hover:opacity-80 transition-colors font-medium border border-soft-gray"
            >
              <Mail size={20} />
              Enviar Correo
            </a>
          </div>
        </div>
        <div className="bg-calm-bg p-4 text-center border-t border-soft-gray">
            <button onClick={onClose} className="text-sm text-deep-text opacity-60 underline">
                Volver a la aplicación
            </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
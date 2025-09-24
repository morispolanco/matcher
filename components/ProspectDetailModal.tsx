
import React, { useState } from 'react';
import type { Prospect, User } from '../types';
import { generateEmail } from '../services/geminiService';
import { LoaderIcon } from '../constants';

interface ProspectDetailModalProps {
  prospect: Prospect;
  user: User;
  service: string;
  onClose: () => void;
}

export const ProspectDetailModal: React.FC<ProspectDetailModalProps> = ({ prospect, user, service, onClose }) => {
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleGenerateEmail = async () => {
    setIsLoading(true);
    setError('');
    setGeneratedEmail('');
    try {
      const emailContent = await generateEmail(user, prospect, service);
      setGeneratedEmail(emailContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveToGmail = () => {
      // This is a simulation. A real implementation would use Google's APIs.
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-medium rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-gray-light">
          <h2 className="text-2xl font-bold text-brand-accent">{prospect.companyName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        
        <div className="p-5 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-300">Contacto</h3>
                <p>{prospect.contactPerson}</p>
                <p className="text-brand-accent">{prospect.contactEmail}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-300">Probabilidad de Contratación</h3>
                <p className="text-2xl font-bold text-green-400">{prospect.hiringProbability}%</p>
              </div>
          </div>

          <div className="bg-gray-dark p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-300">Generador de Email</h3>
              <button
                onClick={handleGenerateEmail}
                disabled={isLoading}
                className="w-full px-4 py-2 mb-4 font-semibold text-white bg-brand-primary rounded-md hover:bg-brand-secondary disabled:bg-gray-light transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                    <>
                        <LoaderIcon className="w-5 h-5 mr-2 animate-spin" />
                        Generando...
                    </>
                ) : `Generar email para ${service}`}
              </button>

              {error && <p className="text-red-400 text-center">{error}</p>}

              {generatedEmail && (
                <div className="mt-4">
                  <textarea
                    readOnly
                    value={generatedEmail}
                    className="w-full h-64 p-3 bg-gray-light border border-gray-extralight rounded-md text-white font-mono text-sm"
                  />
                  <div className="mt-4 flex justify-end items-center gap-4">
                    {isSaved && 
                      <div className="text-sm text-green-400 p-2 bg-green-900/50 rounded-md">
                        <p><strong>Simulación:</strong> Email guardado como borrador en Gmail.</p>
                        <p className="text-xs text-gray-300">Esto requiere integración con la API de Google.</p>
                      </div>
                    }
                    <button 
                        onClick={handleSaveToGmail}
                        className="px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                    >
                        Guardar Borrador en Gmail
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

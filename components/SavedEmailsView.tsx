
import React from 'react';
import { EmailIcon } from '../constants';

export const SavedEmailsView: React.FC = () => {
  return (
    <div className="p-8 flex flex-col items-center justify-center h-full text-center">
        <EmailIcon className="w-24 h-24 text-brand-accent mb-6" />
      <h1 className="text-4xl font-bold mb-4 text-brand-accent">Emails Guardados</h1>
      <p className="max-w-2xl text-gray-300">
        Esta sección mostrará los correos electrónicos que has guardado como borradores en tu cuenta de Gmail.
      </p>
      <div className="mt-6 p-4 bg-gray-light rounded-lg border border-yellow-500">
        <h3 className="text-lg font-semibold text-yellow-300">Nota para Desarrolladores</h3>
        <p className="text-sm text-yellow-200 mt-2">
            La funcionalidad completa para guardar y listar borradores de Gmail requiere una integración con la API de Google, incluyendo la configuración de un proyecto en Google Cloud, la creación de credenciales OAuth 2.0 y la gestión del flujo de autenticación del usuario.
        </p>
      </div>
    </div>
  );
};

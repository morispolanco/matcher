
import React, { useState } from 'react';
import { ALL_SERVICES } from '../constants';

interface ServicesViewProps {
  userServices: string[];
  setUserServices: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ userServices, setUserServices }) => {
  const [saved, setSaved] = useState(false);
  
  const handleServiceChange = (service: string) => {
    setUserServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6 text-brand-accent">Servicios Ofrecidos</h1>
      <p className="mb-6 text-gray-300">Selecciona todos los servicios que ofreces. Estos se usarán para encontrar prospectos relevantes.</p>
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALL_SERVICES.map(service => (
            <label key={service} className="flex items-center p-4 bg-gray-light rounded-md cursor-pointer hover:bg-gray-extralight transition-colors">
              <input
                type="checkbox"
                checked={userServices.includes(service)}
                onChange={() => handleServiceChange(service)}
                className="w-5 h-5 text-brand-accent bg-gray-dark border-gray-extralight rounded focus:ring-brand-accent"
              />
              <span className="ml-3 text-white">{service}</span>
            </label>
          ))}
        </div>
         <div className="flex items-center space-x-4 mt-6">
          <button type="submit" className="px-6 py-2 font-semibold text-white bg-brand-primary rounded-md hover:bg-brand-secondary transition-colors">
            Guardar Servicios
          </button>
          {saved && <span className="text-green-400">¡Servicios guardados!</span>}
        </div>
      </form>
    </div>
  );
};

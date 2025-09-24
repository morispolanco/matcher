
import React, { useState, useEffect } from 'react';
import type { Prospect, User } from '../types';
import { findProspects } from '../services/geminiService';
import { ProspectCard } from './ProspectCard';
import { ProspectDetailModal } from './ProspectDetailModal';
import { LoaderIcon } from '../constants';

interface SearchViewProps {
  userServices: string[];
  user: User;
}

export const SearchView: React.FC<SearchViewProps> = ({ userServices, user }) => {
  const [service, setService] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

  useEffect(() => {
    if (userServices.length > 0) {
      setService(userServices[0]);
    }
  }, [userServices]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !businessType || !location) {
      setError('Por favor, complete todos los campos.');
      return;
    }
    setIsLoading(true);
    setError('');
    setProspects([]);
    try {
      const results = await findProspects(service, businessType, location);
      setProspects(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectProspect = (prospect: Prospect) => {
    setSelectedProspect(prospect);
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <h1 className="text-4xl font-bold mb-2 text-brand-accent">Búsqueda de Prospectos</h1>
      <p className="mb-6 text-gray-300">Encuentra empresas en LinkedIn con alta probabilidad de contratar tus servicios.</p>
      
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
        <select
          value={service}
          onChange={e => setService(e.target.value)}
          className="flex-1 px-4 py-2 text-white bg-gray-light border border-gray-extralight rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
        >
          <option value="">-- Selecciona un Servicio --</option>
          {userServices.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          type="text"
          value={businessType}
          onChange={e => setBusinessType(e.target.value)}
          placeholder="Ej: Restaurantes, Agencias Inmobiliarias"
          className="flex-1 px-4 py-2 text-white bg-gray-light border border-gray-extralight rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Ej: Madrid, España"
          className="flex-1 px-4 py-2 text-white bg-gray-light border border-gray-extralight rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
        <button type="submit" disabled={isLoading} className="px-6 py-2 font-semibold text-white bg-brand-primary rounded-md hover:bg-brand-secondary disabled:bg-gray-extralight transition-colors">
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
             <LoaderIcon className="w-16 h-16 mb-4 text-brand-accent animate-spin" />
             <p className="text-xl">Buscando prospectos... Esto puede tardar un momento.</p>
             <p className="text-gray-400">La IA está analizando perfiles y buscando los mejores contactos.</p>
          </div>
        )}
        {error && <p className="text-red-400 text-center">{error}</p>}
        {!isLoading && prospects.length === 0 && !error && (
            <div className="flex items-center justify-center h-full text-center text-gray-400">
                <p>Los resultados de tu búsqueda aparecerán aquí.</p>
            </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {prospects.map((p, index) => (
            <ProspectCard key={`${p.companyName}-${index}`} prospect={p} onSelect={() => handleSelectProspect(p)} />
          ))}
        </div>
      </div>
      
      {selectedProspect && (
        <ProspectDetailModal
            prospect={selectedProspect}
            user={user}
            service={service}
            onClose={() => setSelectedProspect(null)}
        />
      )}
    </div>
  );
};

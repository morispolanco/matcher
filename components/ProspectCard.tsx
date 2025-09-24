
import React from 'react';
import type { Prospect } from '../types';

interface ProspectCardProps {
  prospect: Prospect;
  onSelect: () => void;
}

export const ProspectCard: React.FC<ProspectCardProps> = ({ prospect, onSelect }) => {
  const probabilityColor =
    prospect.hiringProbability > 75 ? 'text-green-400'
    : prospect.hiringProbability > 50 ? 'text-yellow-400'
    : 'text-red-400';

  return (
    <div className="bg-gray-light p-5 rounded-lg shadow-lg transition-transform hover:scale-105">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-brand-accent">{prospect.companyName}</h3>
          <p className="text-gray-300">{prospect.contactPerson}</p>
          <a href={prospect.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">
            Perfil de LinkedIn
          </a>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Probabilidad</p>
          <p className={`text-2xl font-bold ${probabilityColor}`}>{prospect.hiringProbability}%</p>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <p className="text-sm text-gray-300 truncate">{prospect.contactEmail}</p>
        <button
          onClick={onSelect}
          className="px-4 py-1 text-sm font-semibold text-white bg-brand-secondary rounded-md hover:bg-brand-light transition-colors"
        >
          Analizar
        </button>
      </div>
    </div>
  );
};

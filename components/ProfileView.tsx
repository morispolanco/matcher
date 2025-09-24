
import React, { useState } from 'react';
import type { User } from '../types';

interface ProfileViewProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, setUser }) => {
  const [formData, setFormData] = useState<User>(user);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUser(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6 text-brand-accent">Perfil de Usuario</h1>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nombre</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 mt-1 text-white bg-gray-light border border-gray-extralight rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 mt-1 text-white bg-gray-light border border-gray-extralight rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
        </div>
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-300">Página Web</label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-4 py-2 mt-1 text-white bg-gray-light border border-gray-extralight rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
        </div>
        <div className="flex items-center space-x-4">
          <button type="submit" className="px-6 py-2 font-semibold text-white bg-brand-primary rounded-md hover:bg-brand-secondary transition-colors">
            Guardar Cambios
          </button>
          {saved && <span className="text-green-400">¡Perfil guardado!</span>}
        </div>
      </form>
    </div>
  );
};

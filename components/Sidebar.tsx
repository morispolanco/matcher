import React from 'react';
// FIX: Changed from 'import type' to a regular import to use View enum as a value.
import { View } from '../types';
import { ProfileIcon, ServicesIcon, SearchIcon, EmailIcon } from '../constants';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: View;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg ${
        isActive
          ? 'bg-brand-secondary text-white'
          : 'text-gray-300 hover:bg-gray-light hover:text-white'
      }`}
    >
      {icon}
      <span className="ml-4">{label}</span>
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const views: View[] = [
    View.PROFILE,
    View.SERVICES,
    View.SEARCH,
    View.SAVED_EMAILS,
  ];
  
  const icons: { [key in View]: React.ReactNode } = {
    [View.PROFILE]: <ProfileIcon className="w-5 h-5" />,
    [View.SERVICES]: <ServicesIcon className="w-5 h-5" />,
    [View.SEARCH]: <SearchIcon className="w-5 h-5" />,
    [View.SAVED_EMAILS]: <EmailIcon className="w-5 h-5" />,
  };

  return (
    <div className="flex flex-col w-64 h-screen px-4 py-8 bg-gray-medium border-r border-gray-light">
      <h2 className="text-3xl font-semibold text-white">Prospect AI</h2>
      <div className="flex flex-col justify-between flex-1 mt-6">
        <nav className="space-y-2">
          {views.map(view => (
            <NavItem
              key={view}
              icon={icons[view]}
              label={view}
              isActive={currentView === view}
              onClick={() => setCurrentView(view)}
            />
          ))}
        </nav>
      </div>
    </div>
  );
};
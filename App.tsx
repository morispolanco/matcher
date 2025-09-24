
import React, { useState } from 'react';
import type { User, Prospect, View } from './types';
import { Sidebar } from './components/Sidebar';
import { ProfileView } from './components/ProfileView';
import { ServicesView } from './components/ServicesView';
import { SearchView } from './components/SearchView';
import { SavedEmailsView } from './components/SavedEmailsView';
import { ALL_SERVICES } from './constants';
import { View as AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(AppView.PROFILE);
  const [user, setUser] = useState<User>({
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    website: 'https://juanperez.dev',
  });
  const [userServices, setUserServices] = useState<string[]>([
      ALL_SERVICES[0],
      ALL_SERVICES[1]
  ]);

  const renderView = () => {
    switch (currentView) {
      case AppView.PROFILE:
        return <ProfileView user={user} setUser={setUser} />;
      case AppView.SERVICES:
        return <ServicesView userServices={userServices} setUserServices={setUserServices} />;
      case AppView.SEARCH:
        return <SearchView userServices={userServices} user={user} />;
      case AppView.SAVED_EMAILS:
        return <SavedEmailsView />;
      default:
        return <ProfileView user={user} setUser={setUser} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-dark text-white">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default App;

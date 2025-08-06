import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import WeeklyPlanner from './components/WeeklyPlanner';
import TacticalBoard from './components/TacticalBoard';
import SessionTemplates from './components/SessionTemplates';
import PlayerManagement from './components/PlayerManagement';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const { user, loading } = useAuth();

  console.log('App render - user:', user, 'loading:', loading);

  // Show loading spinner while checking auth
  if (loading) {
    console.log('Showing loading screen');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if no user
  if (!user) {
    console.log('Showing auth screen');
    return <Auth />;
  }

  console.log('Showing main app');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard onTabChange={setActiveTab} />;
      case 'weekly':
        return <WeeklyPlanner />;
      case 'tactical':
        return <TacticalBoard />;
      case 'templates':
        return <SessionTemplates />;
      case 'players':
        return <PlayerManagement />;
      default:
        return <Dashboard onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
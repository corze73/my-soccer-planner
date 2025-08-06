import React from 'react';
import { Calendar, Users, Clipboard, Target, Home } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { signOut } = useAuth();

  const tabs = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'weekly', label: 'Weekly Plan', icon: Calendar },
    { id: 'tactical', label: 'Tactical Board', icon: Target },
    { id: 'templates', label: 'Templates', icon: Clipboard },
    { id: 'players', label: 'Players', icon: Users },
  ];

  const handleSignOut = async () => {
    await signOut();
  };
  return (
    <nav className="bg-green-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Target className="w-8 h-8" />
            <h1 className="text-xl font-bold">Soccer Planner</h1>
          </div>
          
          <div className="hidden md:flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-green-700 text-white'
                      : 'text-green-100 hover:bg-green-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 text-green-100 hover:bg-green-700 hover:text-white ml-4"
            >
              <span>Sign Out</span>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-green-700">
          <div className="flex overflow-x-auto py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex flex-col items-center space-y-1 px-4 py-2 min-w-0 flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-green-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{tab.label}</span>
                </button>
              );
            })}
            <button
              onClick={handleSignOut}
              className="flex flex-col items-center space-y-1 px-4 py-2 min-w-0 flex-shrink-0 text-green-200"
            >
              <span className="text-xs">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
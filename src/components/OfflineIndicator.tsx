import React from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, FolderSync as Sync, Database } from 'lucide-react';
import { useOfflineStorage } from '../hooks/useOfflineStorage';

const OfflineIndicator: React.FC = () => {
  const { isOnline, hasOfflineData, syncOfflineData } = useOfflineStorage();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg transition-all duration-300 ${
        isOnline 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Online</span>
            {hasOfflineData && (
              <>
                <div className="w-px h-4 bg-green-300"></div>
                <button
                  onClick={syncOfflineData}
                  className="flex items-center space-x-1 text-xs bg-green-200 hover:bg-green-300 px-2 py-1 rounded transition-colors"
                  title="Sync offline data"
                >
                  <Sync className="w-3 h-3" />
                  <span>Sync</span>
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Offline</span>
            {hasOfflineData && (
              <>
                <div className="w-px h-4 bg-red-300"></div>
                <div className="flex items-center space-x-1 text-xs">
                  <Database className="w-3 h-3" />
                  <span>Data saved locally</span>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {!isOnline && (
        <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-sm">
          <div className="flex items-start space-x-2">
            <CloudOff className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-800">
              <p className="font-medium mb-1">Working Offline</p>
              <p>Your changes are being saved locally and will sync when you're back online.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;
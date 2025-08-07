import { useState, useEffect } from 'react';

interface OfflineData {
  id: string;
  type: 'session' | 'player' | 'formation' | 'template';
  data: any;
  timestamp: number;
  synced: boolean;
}

interface OfflineQueue {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  timestamp: number;
}

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData[]>([]);
  const [syncQueue, setSyncQueue] = useState<OfflineQueue[]>([]);

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline data on mount
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SoccerPlannerDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('offlineData')) {
          const offlineStore = db.createObjectStore('offlineData', { keyPath: 'id' });
          offlineStore.createIndex('type', 'type', { unique: false });
          offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  };

  const saveOfflineData = async (type: OfflineData['type'], data: any): Promise<string> => {
    const db = await openDB();
    const transaction = db.transaction(['offlineData'], 'readwrite');
    const store = transaction.objectStore('offlineData');

    const offlineItem: OfflineData = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      synced: false
    };

    await new Promise((resolve, reject) => {
      const request = store.add(offlineItem);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    await loadOfflineData();
    return offlineItem.id;
  };

  const loadOfflineData = async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');

      const data = await new Promise<OfflineData[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      setOfflineData(data);
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };

  const getOfflineData = (type?: OfflineData['type']): OfflineData[] => {
    if (type) {
      return offlineData.filter(item => item.type === type);
    }
    return offlineData;
  };

  const deleteOfflineData = async (id: string) => {
    const db = await openDB();
    const transaction = db.transaction(['offlineData'], 'readwrite');
    const store = transaction.objectStore('offlineData');

    await new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    await loadOfflineData();
  };

  const addToSyncQueue = async (url: string, method: string, headers: Record<string, string>, body: any) => {
    const db = await openDB();
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');

    const queueItem: OfflineQueue = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url,
      method,
      headers,
      body: JSON.stringify(body),
      timestamp: Date.now()
    };

    await new Promise((resolve, reject) => {
      const request = store.add(queueItem);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Trigger background sync if available
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-offline-data');
    }
  };

  const syncOfflineData = async () => {
    if (!isOnline) return;

    try {
      const db = await openDB();
      const transaction = db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');

      const queueItems = await new Promise<OfflineQueue[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      for (const item of queueItems) {
        try {
          const response = await fetch(item.url, {
            method: item.method,
            headers: item.headers,
            body: item.body
          });

          if (response.ok) {
            // Remove from sync queue
            await new Promise((resolve, reject) => {
              const deleteRequest = store.delete(item.id);
              deleteRequest.onsuccess = () => resolve(deleteRequest.result);
              deleteRequest.onerror = () => reject(deleteRequest.error);
            });
          }
        } catch (error) {
          console.error('Error syncing item:', error);
        }
      }
    } catch (error) {
      console.error('Error during sync:', error);
    }
  };

  const clearAllOfflineData = async () => {
    const db = await openDB();
    
    // Clear offline data
    const offlineTransaction = db.transaction(['offlineData'], 'readwrite');
    const offlineStore = offlineTransaction.objectStore('offlineData');
    await new Promise((resolve, reject) => {
      const request = offlineStore.clear();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Clear sync queue
    const queueTransaction = db.transaction(['syncQueue'], 'readwrite');
    const queueStore = queueTransaction.objectStore('syncQueue');
    await new Promise((resolve, reject) => {
      const request = queueStore.clear();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    await loadOfflineData();
  };

  return {
    isOnline,
    offlineData,
    saveOfflineData,
    getOfflineData,
    deleteOfflineData,
    addToSyncQueue,
    syncOfflineData,
    clearAllOfflineData,
    hasOfflineData: offlineData.length > 0
  };
}
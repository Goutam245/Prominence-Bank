import { useState, useEffect, useSyncExternalStore, useCallback } from 'react';
import { dataStore, subscribe, initializeData } from '@/lib/dataStore';

// Initialize on first import
initializeData();

export function useDataStore() {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const unsub = subscribe(() => setTick(t => t + 1));
    return () => { unsub(); };
  }, []);

  return dataStore;
}

export { dataStore, initializeData, subscribe };
export * from '@/lib/dataStore';

import { useEffect, useState } from 'react';
import { usePresenterStore } from '@/stores/presenter/presenterStore';
import { useMediaLibraryStore } from '@/stores/presenter/mediaLibraryStore';
import { useSettingsStore } from '@/stores/settings/settingsStore';
import { initializeStorage } from '@/services/storage';

export interface StorageInitState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to initialize storage on app startup
 * This hook:
 * 1. Initializes the storage directories
 * 2. Loads all data from disk into the stores
 * 3. Provides loading and error states
 */
export function useStorageInit(): StorageInitState {
  const [state, setState] = useState<StorageInitState>({
    isInitialized: false,
    isLoading: true,
    error: null,
  });

  const loadPresenterData = usePresenterStore((state) => state.loadData);
  const loadMediaData = useMediaLibraryStore((state) => state.loadData);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      try {
        console.log('Initializing storage directories...');
        // Initialize storage directories
        await initializeStorage();
        console.log('Storage directories initialized successfully');

        console.log('Loading data from disk...');
        // Load all data in parallel (presenter, media, and settings)
        await Promise.all([loadPresenterData(), loadMediaData(), loadSettings()]);
        console.log('Data loaded successfully');

        if (isMounted) {
          setState({
            isInitialized: true,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Failed to initialize storage:', error);
        if (isMounted) {
          setState({
            isInitialized: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
          });
        }
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, [loadPresenterData, loadMediaData, loadSettings]);

  return state;
}


import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settings/settingsStore";
import {
  onTagGroupsChanged,
  onSettingsReloaded,
} from "@/services/settings";

/**
 * Hook to synchronize settings across windows
 * 
 * This hook listens for settings change events from other windows
 * and updates the local store accordingly.
 * 
 * Use this hook in any window that needs to react to settings changes
 * made in other windows (e.g., presenter window listening for changes
 * made in the settings window).
 */
export function useSettingsSync() {
  const setTagGroups = useSettingsStore((state) => state.setTagGroups);

  useEffect(() => {
    console.log("useSettingsSync: Setting up listeners");
    
    // Listen for tag groups changes from other windows
    const unlistenTagGroups = onTagGroupsChanged((payload) => {
      console.log("useSettingsSync: Received tag groups changed event", payload);
      setTagGroups(payload.tagGroups);
    });

    // Listen for full settings reload
    const unlistenReload = onSettingsReloaded((payload) => {
      console.log("useSettingsSync: Received settings reload event", payload);
      setTagGroups(payload.tagGroups);
    });

    unlistenTagGroups.then(() => {
      console.log("useSettingsSync: Tag groups listener registered");
    });
    
    unlistenReload.then(() => {
      console.log("useSettingsSync: Settings reload listener registered");
    });

    // Cleanup listeners on unmount
    return () => {
      console.log("useSettingsSync: Cleaning up listeners");
      unlistenTagGroups.then((fn) => fn());
      unlistenReload.then((fn) => fn());
    };
  }, [setTagGroups]);
}


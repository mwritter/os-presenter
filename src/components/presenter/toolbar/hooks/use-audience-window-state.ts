import {
  hideAudienceWindow,
  isAudienceWindowVisible,
  onAudienceHidden,
  onAudienceVisible,
  showAudienceWindow,
} from "@/services/audience";
import { useEffect, useState } from "react";
import { availableMonitors } from "@tauri-apps/api/window";

/**
 * In dev builds we always allow showing the audience window (so it can be tested on a single
 * screen). In production it's only allowed when a second monitor is present, because two video
 * elements playing on the same screen drift out of sync.
 */
const DEV_OVERRIDE = import.meta.env.DEV;

export const useAudienceWindowState = () => {
  const [audienceWindowVisible, setAudienceWindowVisible] = useState(false);
  const [monitorCount, setMonitorCount] = useState(1);

  // Check if audience window is visible on mount and listen for visibility changes
  useEffect(() => {
    checkAudienceWindowStatus();
    refreshMonitorCount();

    // Listen for audience window visibility events
    const unlistenVisible = onAudienceVisible(() => {
      setAudienceWindowVisible(true);
    });
    const unlistenHidden = onAudienceHidden(() => {
      setAudienceWindowVisible(false);
    });

    // Monitors can be plugged/unplugged while the app is open.
    window.addEventListener("focus", refreshMonitorCount);

    return () => {
      unlistenVisible.then((fn) => fn());
      unlistenHidden.then((fn) => fn());
      window.removeEventListener("focus", refreshMonitorCount);
    };
  }, []);

  const refreshMonitorCount = async () => {
    try {
      const monitors = await availableMonitors();
      setMonitorCount(monitors.length);
    } catch (error) {
      console.error("Failed to read monitors:", error);
    }
  };

  const checkAudienceWindowStatus = async () => {
    try {
      const isVisible = await isAudienceWindowVisible();
      setAudienceWindowVisible(isVisible);
    } catch (error) {
      console.error("Failed to check audience window status:", error);
    }
  };

  // Allow opening the audience window with a second monitor, or always in dev. Hiding is always
  // allowed (so a window opened via dev override can still be closed).
  const canToggleAudience = monitorCount > 1 || DEV_OVERRIDE || audienceWindowVisible;
  const disabledReason = canToggleAudience
    ? undefined
    : "Connect a second display to open the audience window";

  const handleToggleAudienceWindow = async () => {
    if (!canToggleAudience) return;
    try {
      if (audienceWindowVisible) {
        await hideAudienceWindow();
        // State will be updated by the AUDIENCE_HIDDEN_EVENT listener
      } else {
        await showAudienceWindow();
        // State will be updated by the AUDIENCE_VISIBLE_EVENT listener
      }
    } catch (error) {
      console.error("Failed to toggle audience window:", error);
      // Re-check status in case of error
      checkAudienceWindowStatus();
    }
  };

  return {
    audienceWindowVisible,
    handleToggleAudienceWindow,
    canToggleAudience,
    disabledReason,
  };
};

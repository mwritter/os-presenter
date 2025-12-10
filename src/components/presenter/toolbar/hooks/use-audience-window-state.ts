import {
  hideAudienceWindow,
  isAudienceWindowVisible,
  onAudienceHidden,
  onAudienceVisible,
  showAudienceWindow,
} from "@/services/audience";
import { useEffect } from "react";
import { useState } from "storybook/internal/preview-api";

export const useAudienceWindowState = () => {
  const [audienceWindowVisible, setAudienceWindowVisible] = useState(false);

  // Check if audience window is visible on mount and listen for visibility changes
  useEffect(() => {
    checkAudienceWindowStatus();

    // Listen for audience window visibility events
    const unlistenVisible = onAudienceVisible(() => {
      setAudienceWindowVisible(true);
    });
    const unlistenHidden = onAudienceHidden(() => {
      setAudienceWindowVisible(false);
    });

    return () => {
      unlistenVisible.then((fn) => fn());
      unlistenHidden.then((fn) => fn());
    };
  }, []);

  const checkAudienceWindowStatus = async () => {
    try {
      const isVisible = await isAudienceWindowVisible();
      setAudienceWindowVisible(isVisible);
    } catch (error) {
      console.error("Failed to check audience window status:", error);
    }
  };

  const handleToggleAudienceWindow = async () => {
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

  return { audienceWindowVisible, handleToggleAudienceWindow };
};

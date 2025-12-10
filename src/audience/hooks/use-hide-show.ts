import { useEffect, useState } from "react";
import {
  availableMonitors,
  getCurrentWindow,
  primaryMonitor,
} from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { emit } from "@tauri-apps/api/event";
import { Events } from "../consts";

export const FadeAnimationDuration = 300;

export const useHideShow = () => {
  const currentWindow = getCurrentWindow();
  const [isVisible, setIsVisible] = useState(false);

  const handleHideClick = () => {
    emit(Events.AUDIENCE_HIDE_EVENT);
  };

  // Listen for show/hide events from presenter
  useEffect(() => {
    const handleShow = async () => {
      try {
        console.log("Received audience:show event");

        // Get monitors to determine target
        const monitors = await availableMonitors();
        const primary = await primaryMonitor();

        console.log(
          "Available monitors:",
          monitors.map((m) => m.name)
        );
        console.log("Primary monitor:", primary?.name);

        // Find a secondary monitor if available, otherwise use primary
        const secondaryMonitor = monitors.find(
          (m) => primary && m.name !== primary.name
        );
        const targetMonitor = secondaryMonitor || primary;

        if (targetMonitor) {
          console.log(
            "Using monitor:",
            targetMonitor.name,
            targetMonitor.position
          );
          // Position window on target monitor before showing
          await currentWindow.setPosition(targetMonitor.position);
        }

        // Show window (still at opacity 0)
        await currentWindow.show();

        // Use simple fullscreen (macOS: covers dock/menu bar without creating new space)
        await currentWindow.setSimpleFullscreen(true);
        await currentWindow.setAlwaysOnTop(true);
        await currentWindow.setFocus();

        // Fade in content
        setIsVisible(true);

        // Emit visible event after fade animation completes
        setTimeout(() => {
          emit(Events.AUDIENCE_VISIBLE_EVENT);
        }, FadeAnimationDuration);
      } catch (error) {
        console.error("Failed to show audience window:", error);
      }
    };

    const handleHide = async () => {
      try {
        console.log("Received audience:hide event");
        // First animate opacity to 0%
        setIsVisible(false);

        // After fade animation completes, exit simple fullscreen and hide
        setTimeout(async () => {
          await currentWindow.setAlwaysOnTop(false);
          await currentWindow.setSimpleFullscreen(false);
          await currentWindow.hide();
          emit(Events.AUDIENCE_HIDDEN_EVENT);
        }, FadeAnimationDuration);
      } catch (error) {
        console.error("Failed to hide audience window:", error);
      }
    };

    const unlistenShow = listen(Events.AUDIENCE_SHOW_EVENT, handleShow);
    const unlistenHide = listen(Events.AUDIENCE_HIDE_EVENT, handleHide);

    return () => {
      unlistenShow.then((fn) => fn());
      unlistenHide.then((fn) => fn());
    };
  }, [currentWindow]);

  return { isVisible, handleHideClick };
};

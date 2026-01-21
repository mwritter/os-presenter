import { emit, listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { Events } from "@/pages/audience/consts";

/**
 * Shows the audience window by emitting a show event
 * The audience window handles fullscreen, always-on-top, and fade-in animation
 */
export async function showAudienceWindow(): Promise<void> {
  await emit(Events.AUDIENCE_SHOW_EVENT);
}

/**
 * Hides the audience window by emitting a hide event
 * The audience window handles fade-out animation and disabling fullscreen/always-on-top
 */
export async function hideAudienceWindow(): Promise<void> {
  await emit(Events.AUDIENCE_HIDE_EVENT);
}

/**
 * Checks if the audience window is currently visible
 */
export async function isAudienceWindowVisible(): Promise<boolean> {
  return await invoke("is_audience_window_visible");
}

/**
 * Listen for when the audience window becomes fully visible (after animation)
 */
export function onAudienceVisible(callback: () => void) {
  return listen(Events.AUDIENCE_VISIBLE_EVENT, callback);
}

/**
 * Listen for when the audience window becomes fully hidden (after animation)
 */
export function onAudienceHidden(callback: () => void) {
  return listen(Events.AUDIENCE_HIDDEN_EVENT, callback);
}

// Legacy aliases for backwards compatibility
export const openAudienceWindow = showAudienceWindow;
export const closeAudienceWindow = hideAudienceWindow;
export const isAudienceWindowOpen = isAudienceWindowVisible;

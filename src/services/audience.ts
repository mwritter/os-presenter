import { invoke } from "@tauri-apps/api/core";

/**
 * Opens a fullscreen audience window
 */
export async function openAudienceWindow(): Promise<void> {
  await invoke("open_audience_window");
}

/**
 * Closes the audience window if it's open
 */
export async function closeAudienceWindow(): Promise<void> {
  await invoke("close_audience_window");
}

/**
 * Checks if the audience window is currently open
 */
export async function isAudienceWindowOpen(): Promise<boolean> {
  return await invoke("is_audience_window_open");
}


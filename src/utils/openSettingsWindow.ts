import { invoke } from "@tauri-apps/api/core";

/**
 * Open the settings window at a specific section.
 * Uses the Rust backend to ensure consistent window configuration.
 */
export async function openSettingsWindow(path: string = "/settings") {
  try {
    await invoke("show_settings_window", { path });
  } catch (e) {
    console.error("Error opening settings window:", e);
  }
}
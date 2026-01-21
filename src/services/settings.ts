import { emit, listen, UnlistenFn } from "@tauri-apps/api/event";
import { SlideTagGroup } from "@/components/feature/slide/slide-tag/types";

/**
 * Settings event constants
 * Used for cross-window communication when settings change
 */
export const SettingsEvents = {
  // Tag Groups
  TAG_GROUPS_CHANGED: "settings:tag-groups-changed",

  // General settings (for future use)
  GENERAL_SETTINGS_CHANGED: "settings:general-changed",

  // All settings reloaded
  SETTINGS_RELOADED: "settings:reloaded",
} as const;

/**
 * Payload types for settings events
 */
export interface TagGroupsChangedPayload {
  tagGroups: SlideTagGroup[];
}

export interface SettingsReloadedPayload {
  tagGroups: SlideTagGroup[];
  // Add more settings as they are created
}

/**
 * Emit an event when tag groups change
 * This broadcasts to all windows
 */
export async function emitTagGroupsChanged(
  tagGroups: SlideTagGroup[]
): Promise<void> {
  console.log("Settings: Emitting tag groups changed event", tagGroups);
  try {
    await emit(SettingsEvents.TAG_GROUPS_CHANGED, { tagGroups });
    console.log("Settings: Event emitted successfully");
  } catch (error) {
    console.error("Settings: Failed to emit tag groups changed event", error);
    throw error;
  }
}

/**
 * Listen for tag groups changes from other windows
 */
export function onTagGroupsChanged(
  callback: (payload: TagGroupsChangedPayload) => void
): Promise<UnlistenFn> {
  return listen<TagGroupsChangedPayload>(
    SettingsEvents.TAG_GROUPS_CHANGED,
    (event) => callback(event.payload)
  );
}

/**
 * Emit an event when all settings are reloaded
 */
export async function emitSettingsReloaded(
  settings: SettingsReloadedPayload
): Promise<void> {
  await emit(SettingsEvents.SETTINGS_RELOADED, settings);
}

/**
 * Listen for full settings reload from other windows
 */
export function onSettingsReloaded(
  callback: (payload: SettingsReloadedPayload) => void
): Promise<UnlistenFn> {
  return listen<SettingsReloadedPayload>(
    SettingsEvents.SETTINGS_RELOADED,
    (event) => callback(event.payload)
  );
}


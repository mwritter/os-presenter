import { invoke } from '@tauri-apps/api/core';
import { convertFileSrc } from '@tauri-apps/api/core';
import { Library, Playlist } from '@/components/presenter/types';
import { MediaItem } from '@/stores/mediaLibraryStore';

/**
 * Initialize storage directories
 */
export async function initializeStorage(): Promise<void> {
  try {
    await invoke('initialize_storage');
  } catch (error) {
    console.error('Failed to initialize storage:', error);
    throw new Error(`Storage initialization failed: ${error}`);
  }
}

// Library operations

/**
 * Load all libraries from disk
 */
export async function loadLibraries(): Promise<Library[]> {
  try {
    const libraries = await invoke<Library[]>('load_libraries');
    return libraries;
  } catch (error) {
    console.error('Failed to load libraries:', error);
    throw new Error(`Failed to load libraries: ${error}`);
  }
}

/**
 * Save a library to disk
 */
export async function saveLibrary(library: Library): Promise<void> {
  try {
    await invoke('save_library', { library });
  } catch (error) {
    console.error('Failed to save library:', error);
    throw new Error(`Failed to save library: ${error}`);
  }
}

/**
 * Delete a library from disk
 */
export async function deleteLibrary(id: string): Promise<void> {
  try {
    await invoke('delete_library', { id });
  } catch (error) {
    console.error('Failed to delete library:', error);
    throw new Error(`Failed to delete library: ${error}`);
  }
}

// Playlist operations

/**
 * Load all playlists from disk
 */
export async function loadPlaylists(): Promise<Playlist[]> {
  try {
    const playlists = await invoke<Playlist[]>('load_playlists');
    return playlists;
  } catch (error) {
    console.error('Failed to load playlists:', error);
    throw new Error(`Failed to load playlists: ${error}`);
  }
}

/**
 * Save a playlist to disk
 */
export async function savePlaylist(playlist: Playlist): Promise<void> {
  try {
    await invoke('save_playlist', { playlist });
  } catch (error) {
    console.error('Failed to save playlist:', error);
    throw new Error(`Failed to save playlist: ${error}`);
  }
}

/**
 * Delete a playlist from disk
 */
export async function deletePlaylist(id: string): Promise<void> {
  try {
    await invoke('delete_playlist', { id });
  } catch (error) {
    console.error('Failed to delete playlist:', error);
    throw new Error(`Failed to delete playlist: ${error}`);
  }
}

// Media operations

/**
 * Load all media items from disk
 */
export async function loadMediaItems(): Promise<MediaItem[]> {
  try {
    const items = await invoke<MediaItem[]>('load_media_items');
    // Convert string dates back to Date objects and convert source to full file URL
    const itemsWithUrls = await Promise.all(
      items.map(async (item) => ({
        ...item,
        source: await getMediaFileUrl(item.source),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }))
    );
    return itemsWithUrls;
  } catch (error) {
    console.error('Failed to load media items:', error);
    throw new Error(`Failed to load media items: ${error}`);
  }
}

/**
 * Import a media file from the file system
 */
export async function importMediaFile(sourcePath: string): Promise<MediaItem> {
  try {
    const item = await invoke<MediaItem>('import_media_file', { sourcePath });
    // Convert string dates back to Date objects and convert source to full file URL
    return {
      ...item,
      source: await getMediaFileUrl(item.source),
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    };
  } catch (error) {
    console.error('Failed to import media file:', error);
    throw new Error(`Failed to import media file: ${error}`);
  }
}

/**
 * Delete a media item from disk
 */
export async function deleteMediaItem(id: string): Promise<void> {
  try {
    await invoke('delete_media_item', { id });
  } catch (error) {
    console.error('Failed to delete media item:', error);
    throw new Error(`Failed to delete media item: ${error}`);
  }
}

/**
 * Get the absolute file path for a media file
 */
export async function getMediaFilePath(fileName: string): Promise<string> {
  try {
    const path = await invoke<string>('get_media_file_path', { fileName });
    return path;
  } catch (error) {
    console.error('Failed to get media file path:', error);
    throw new Error(`Failed to get media file path: ${error}`);
  }
}

/**
 * Convert a relative media path to a file URL that can be used in img/video tags
 */
export async function getMediaFileUrl(fileName: string): Promise<string> {
  try {
    const path = await getMediaFilePath(fileName);
    // Use Tauri's convertFileSrc to convert file path to proper URL format
    // This handles the asset protocol properly in Tauri v2
    const url = convertFileSrc(path);
    return url;
  } catch (error) {
    console.error('Failed to get media file URL:', error);
    throw new Error(`Failed to get media file URL: ${error}`);
  }
}


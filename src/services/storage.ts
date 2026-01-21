import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import { Library, Playlist } from "@/components/presenter/types";
import { MediaItem, MediaPlaylist } from "@/stores/presenter/mediaLibraryStore";
import { SlideTagGroup } from "@/components/feature/slide/slide-tag/types";

/**
 * Initialize storage directories
 */
export async function initializeStorage(): Promise<void> {
  try {
    await invoke("initialize_storage");
  } catch (error) {
    console.error("Failed to initialize storage:", error);
    throw new Error(`Storage initialization failed: ${error}`);
  }
}

// Library operations

/**
 * Load all libraries from disk
 */
export async function loadLibraries(): Promise<Library[]> {
  try {
    const libraries = await invoke<Library[]>("load_libraries");
    return libraries;
  } catch (error) {
    console.error("Failed to load libraries:", error);
    throw new Error(`Failed to load libraries: ${error}`);
  }
}

/**
 * Save a library to disk
 */
export async function saveLibrary(library: Library): Promise<void> {
  try {
    await invoke("save_library", { library });
  } catch (error) {
    console.error("Failed to save library:", error);
    throw new Error(`Failed to save library: ${error}`);
  }
}

/**
 * Delete a library from disk
 */
export async function deleteLibrary(id: string): Promise<void> {
  try {
    await invoke("delete_library", { id });
  } catch (error) {
    console.error("Failed to delete library:", error);
    throw new Error(`Failed to delete library: ${error}`);
  }
}

// Playlist operations

/**
 * Load all playlists from disk
 */
export async function loadPlaylists(): Promise<Playlist[]> {
  try {
    const playlists = await invoke<Playlist[]>("load_playlists");
    return playlists;
  } catch (error) {
    console.error("Failed to load playlists:", error);
    throw new Error(`Failed to load playlists: ${error}`);
  }
}

/**
 * Save a playlist to disk
 */
export async function savePlaylist(playlist: Playlist): Promise<void> {
  try {
    await invoke("save_playlist", { playlist });
  } catch (error) {
    console.error("Failed to save playlist:", error);
    throw new Error(`Failed to save playlist: ${error}`);
  }
}

/**
 * Delete a playlist from disk
 */
export async function deletePlaylist(id: string): Promise<void> {
  try {
    await invoke("delete_playlist", { id });
  } catch (error) {
    console.error("Failed to delete playlist:", error);
    throw new Error(`Failed to delete playlist: ${error}`);
  }
}

// Media operations

/**
 * Load all media items from disk
 */
export async function loadMediaItems(): Promise<MediaItem[]> {
  try {
    const items = await invoke<MediaItem[]>("load_media_items");
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
    console.error("Failed to load media items:", error);
    throw new Error(`Failed to load media items: ${error}`);
  }
}

/**
 * Import a media file from the file system
 */
export async function importMediaFile(sourcePath: string): Promise<MediaItem> {
  try {
    const item = await invoke<MediaItem>("import_media_file", { sourcePath });
    // Convert string dates back to Date objects and convert source to full file URL
    return {
      ...item,
      source: await getMediaFileUrl(item.source),
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    };
  } catch (error) {
    console.error("Failed to import media file:", error);
    throw new Error(`Failed to import media file: ${error}`);
  }
}

/**
 * Delete a media item from disk
 */
export async function deleteMediaItem(id: string): Promise<void> {
  try {
    await invoke("delete_media_item", { id });
  } catch (error) {
    console.error("Failed to delete media item:", error);
    throw new Error(`Failed to delete media item: ${error}`);
  }
}

/**
 * Get the absolute file path for a media file
 */
export async function getMediaFilePath(fileName: string): Promise<string> {
  try {
    const path = await invoke<string>("get_media_file_path", { fileName });
    return path;
  } catch (error) {
    console.error("Failed to get media file path:", error);
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
    console.error("Failed to get media file URL:", error);
    throw new Error(`Failed to get media file URL: ${error}`);
  }
}

/**
 * Save a video thumbnail image
 * @param mediaId - The ID of the media item
 * @param blob - The thumbnail image as a Blob
 * @returns The filename of the saved thumbnail
 */
export async function saveThumbnail(
  mediaId: string,
  blob: Blob
): Promise<string> {
  try {
    // Convert blob to array buffer then to Uint8Array
    const arrayBuffer = await blob.arrayBuffer();
    const thumbnailData = Array.from(new Uint8Array(arrayBuffer));

    // Invoke Rust command to save thumbnail
    const thumbnailFilename = await invoke<string>("save_video_thumbnail", {
      mediaId,
      thumbnailData,
    });

    return thumbnailFilename;
  } catch (error) {
    console.error("Failed to save thumbnail:", error);
    throw new Error(`Failed to save thumbnail: ${error}`);
  }
}

/**
 * Update a media item's thumbnail field in metadata
 * @param mediaId - The ID of the media item
 * @param thumbnailFilename - The filename of the thumbnail
 * @returns The updated media item
 */
export async function updateMediaThumbnail(
  mediaId: string,
  thumbnailFilename: string
): Promise<MediaItem> {
  try {
    const item = await invoke<MediaItem>("update_media_thumbnail", {
      mediaId,
      thumbnailFilename,
    });

    // Convert string dates back to Date objects and convert paths to full URLs
    return {
      ...item,
      source: await getMediaFileUrl(item.source),
      thumbnail: item.thumbnail
        ? await getMediaFileUrl(item.thumbnail)
        : undefined,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    };
  } catch (error) {
    console.error("Failed to update media thumbnail:", error);
    throw new Error(`Failed to update media thumbnail: ${error}`);
  }
}

// Media Playlist operations

/**
 * Extract just the filename from a potentially corrupted/encoded path
 * This handles cases where the path may have been double/triple encoded
 */
function extractMediaFilename(path: string): string {
  // If it's already a simple filename (uuid.ext or uuid_thumb.ext), return as-is
  const simpleFilenamePattern =
    /^[a-f0-9-]+(_thumb)?\.(mp4|webm|mov|avi|mkv|jpg|jpeg|png|gif|webp|bmp)$/i;
  if (simpleFilenamePattern.test(path)) {
    return path;
  }

  // Fully decode the path (handle multiple layers of encoding)
  let decoded = path;
  let prevDecoded = "";
  while (decoded !== prevDecoded) {
    prevDecoded = decoded;
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      break;
    }
  }

  // Extract just the filename from the end of the path
  const filename = decoded.split("/").pop() || decoded;
  return filename;
}

/**
 * Helper to convert a raw media item from backend to frontend format with URLs
 * Handles both fresh items (with just filenames) and items from playlists (with potentially corrupted paths)
 */
async function convertMediaItemToFrontend(item: MediaItem): Promise<MediaItem> {
  // Extract the actual filename from potentially corrupted paths
  const sourceFilename = extractMediaFilename(item.source);
  const source = await getMediaFileUrl(sourceFilename);

  let thumbnail: string | undefined;
  if (item.thumbnail) {
    const thumbnailFilename = extractMediaFilename(item.thumbnail);
    thumbnail = await getMediaFileUrl(thumbnailFilename);
  }

  return {
    ...item,
    source,
    thumbnail,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

/**
 * Load all media playlists from disk
 */
export async function loadMediaPlaylists(): Promise<MediaPlaylist[]> {
  try {
    const playlists = await invoke<MediaPlaylist[]>("load_media_playlists");
    // Convert all media items within playlists to proper format with URLs
    const playlistsWithUrls = await Promise.all(
      playlists.map(async (playlist) => ({
        ...playlist,
        mediaItems: await Promise.all(
          playlist.mediaItems.map(convertMediaItemToFrontend)
        ),
        createdAt: new Date(playlist.createdAt),
        updatedAt: new Date(playlist.updatedAt),
      }))
    );
    return playlistsWithUrls;
  } catch (error) {
    console.error("Failed to load media playlists:", error);
    throw new Error(`Failed to load media playlists: ${error}`);
  }
}

/**
 * Normalize a media item for storage (extract just filenames from URLs)
 */
function normalizeMediaItemForStorage(item: MediaItem): MediaItem {
  return {
    ...item,
    source: extractMediaFilename(item.source),
    thumbnail: item.thumbnail
      ? extractMediaFilename(item.thumbnail)
      : undefined,
  };
}

/**
 * Save a media playlist to disk
 * Normalizes media item paths to just filenames before saving
 */
export async function saveMediaPlaylist(
  playlist: MediaPlaylist
): Promise<void> {
  try {
    // Normalize all media items to store just filenames
    const normalizedPlaylist = {
      ...playlist,
      mediaItems: playlist.mediaItems.map(normalizeMediaItemForStorage),
    };
    await invoke("save_media_playlist", { playlist: normalizedPlaylist });
  } catch (error) {
    console.error("Failed to save media playlist:", error);
    throw new Error(`Failed to save media playlist: ${error}`);
  }
}

/**
 * Delete a media playlist from disk
 */
export async function deleteMediaPlaylist(id: string): Promise<void> {
  try {
    await invoke("delete_media_playlist", { id });
  } catch (error) {
    console.error("Failed to delete media playlist:", error);
    throw new Error(`Failed to delete media playlist: ${error}`);
  }
}

// Tag Group operations

/**
 * Load all tag groups from disk
 */
export async function loadTagGroups(): Promise<SlideTagGroup[]> {
  try {
    const tagGroups = await invoke<SlideTagGroup[]>("load_tag_groups");
    return tagGroups;
  } catch (error) {
    console.error("Failed to load tag groups:", error);
    throw new Error(`Failed to load tag groups: ${error}`);
  }
}

/**
 * Save all tag groups to disk
 */
export async function saveTagGroups(tagGroups: SlideTagGroup[]): Promise<void> {
  try {
    await invoke("save_tag_groups", { tagGroups });
  } catch (error) {
    console.error("Failed to save tag groups:", error);
    throw new Error(`Failed to save tag groups: ${error}`);
  }
}

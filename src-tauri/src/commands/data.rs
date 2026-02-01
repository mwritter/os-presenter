//! Commands for data persistence: libraries, playlists, media, and tag groups.

use std::path::PathBuf;
use tauri::AppHandle;
use uuid::Uuid;

use crate::models::{Library, MediaItem, MediaPlaylist, Playlist, SlideTagGroup};
use crate::storage;

// ===== Storage Initialization =====

#[tauri::command]
pub fn initialize_storage(app: AppHandle) -> Result<(), String> {
    storage::ensure_directories(&app).map_err(|e| e.message)
}

// ===== Library Commands =====

#[tauri::command]
pub fn load_libraries(app: AppHandle) -> Result<Vec<Library>, String> {
    let libraries_dir = storage::get_libraries_dir(&app).map_err(|e| e.message)?;
    storage::read_all_json_files(&libraries_dir).map_err(|e| e.message)
}

#[tauri::command]
pub fn save_library(app: AppHandle, library: Library) -> Result<(), String> {
    let libraries_dir = storage::get_libraries_dir(&app).map_err(|e| e.message)?;
    let file_path = libraries_dir.join(format!("{}.json", library.id));
    storage::write_json_file(&file_path, &library).map_err(|e| e.message)
}

#[tauri::command]
pub fn delete_library(app: AppHandle, id: String) -> Result<(), String> {
    let libraries_dir = storage::get_libraries_dir(&app).map_err(|e| e.message)?;
    let file_path = libraries_dir.join(format!("{}.json", id));
    storage::delete_file(&file_path).map_err(|e| e.message)
}

// ===== Playlist Commands =====

#[tauri::command]
pub fn load_playlists(app: AppHandle) -> Result<Vec<Playlist>, String> {
    let playlists_dir = storage::get_playlists_dir(&app).map_err(|e| e.message)?;
    storage::read_all_json_files(&playlists_dir).map_err(|e| e.message)
}

#[tauri::command]
pub fn save_playlist(app: AppHandle, playlist: Playlist) -> Result<(), String> {
    let playlists_dir = storage::get_playlists_dir(&app).map_err(|e| e.message)?;
    let file_path = playlists_dir.join(format!("{}.json", playlist.id));
    storage::write_json_file(&file_path, &playlist).map_err(|e| e.message)
}

#[tauri::command]
pub fn delete_playlist(app: AppHandle, id: String) -> Result<(), String> {
    let playlists_dir = storage::get_playlists_dir(&app).map_err(|e| e.message)?;
    let file_path = playlists_dir.join(format!("{}.json", id));
    storage::delete_file(&file_path).map_err(|e| e.message)
}

// ===== Media Commands =====

#[tauri::command]
pub fn load_media_items(app: AppHandle) -> Result<Vec<MediaItem>, String> {
    let metadata_dir = storage::get_media_metadata_dir(&app).map_err(|e| e.message)?;
    storage::read_all_json_files(&metadata_dir).map_err(|e| e.message)
}

#[tauri::command]
pub fn import_media_file(app: AppHandle, source_path: String) -> Result<MediaItem, String> {
    let source = PathBuf::from(&source_path);

    if !source.exists() {
        return Err("Source file does not exist".to_string());
    }

    // Compute hash of source file for deduplication
    let file_hash = storage::compute_file_hash(&source).map_err(|e| e.message)?;

    // Check if we already have this file in the media library
    let metadata_dir = storage::get_media_metadata_dir(&app).map_err(|e| e.message)?;
    let existing_items: Vec<MediaItem> =
        storage::read_all_json_files(&metadata_dir).map_err(|e| e.message)?;

    // Look for existing media item with same hash
    if let Some(existing_item) = existing_items
        .iter()
        .find(|item| item.hash.as_ref().map(|h| h == &file_hash).unwrap_or(false))
    {
        // File already exists, return the existing item
        println!("Media file already exists with hash: {}", file_hash);
        return Ok(existing_item.clone());
    }

    // Generate unique ID for the media
    let media_id = Uuid::new_v4().to_string();

    // Get file extension
    let extension = storage::get_file_extension(&source)
        .ok_or_else(|| "Could not determine file extension".to_string())?;

    // Get original file name
    let file_name = storage::get_file_stem(&source)
        .ok_or_else(|| "Could not determine file name".to_string())?;

    // Determine media type based on extension
    let media_type = match extension.to_lowercase().as_str() {
        "jpg" | "jpeg" | "png" | "gif" | "webp" | "bmp" => "image",
        "mp4" | "webm" | "mov" | "avi" | "mkv" => "video",
        _ => return Err("Unsupported file format".to_string()),
    };

    // Copy file to media directory
    let media_files_dir = storage::get_media_files_dir(&app).map_err(|e| e.message)?;
    let dest_file_name = format!("{}.{}", media_id, extension);
    let dest_path = media_files_dir.join(&dest_file_name);

    storage::copy_file(&source, &dest_path).map_err(|e| e.message)?;

    // Create media item
    let now = chrono::Utc::now().to_rfc3339();
    let media_item = MediaItem {
        id: media_id.clone(),
        name: file_name,
        media_type: media_type.to_string(),
        source: dest_file_name, // Store relative path
        thumbnail: None,
        duration: None,
        created_at: now.clone(),
        updated_at: now,
        metadata: None,
        hash: Some(file_hash),
    };

    // Save metadata
    let metadata_path = metadata_dir.join(format!("{}.json", media_id));
    storage::write_json_file(&metadata_path, &media_item).map_err(|e| e.message)?;

    Ok(media_item)
}

#[tauri::command]
pub fn delete_media_item(app: AppHandle, id: String) -> Result<(), String> {
    // Load media item to get file name
    let metadata_dir = storage::get_media_metadata_dir(&app).map_err(|e| e.message)?;
    let metadata_path = metadata_dir.join(format!("{}.json", id));

    if let Ok(media_item) = storage::read_json_file::<MediaItem>(&metadata_path) {
        // Delete the actual media file
        let media_files_dir = storage::get_media_files_dir(&app).map_err(|e| e.message)?;
        let file_path = media_files_dir.join(&media_item.source);
        let _ = storage::delete_file(&file_path); // Ignore error if file doesn't exist

        // Delete thumbnail if exists
        if let Some(thumb) = media_item.thumbnail {
            let thumb_path = media_files_dir.join(&thumb);
            let _ = storage::delete_file(&thumb_path);
        }
    }

    // Delete metadata
    storage::delete_file(&metadata_path).map_err(|e| e.message)
}

#[tauri::command]
pub fn get_media_file_path(app: AppHandle, file_name: String) -> Result<String, String> {
    let media_files_dir = storage::get_media_files_dir(&app).map_err(|e| e.message)?;
    let file_path = media_files_dir.join(file_name);

    file_path
        .to_str()
        .ok_or_else(|| "Invalid path".to_string())
        .map(|s| s.to_string())
}

#[tauri::command]
pub fn save_video_thumbnail(
    app: AppHandle,
    media_id: String,
    thumbnail_data: Vec<u8>,
) -> Result<String, String> {
    // Generate thumbnail filename
    let thumbnail_filename = format!("{}_thumb.png", media_id);

    // Get media files directory
    let media_files_dir = storage::get_media_files_dir(&app).map_err(|e| e.message)?;
    let thumbnail_path = media_files_dir.join(&thumbnail_filename);

    // Write thumbnail data to file
    storage::write_file(&thumbnail_path, &thumbnail_data).map_err(|e| e.message)?;

    Ok(thumbnail_filename)
}

#[tauri::command]
pub fn update_media_thumbnail(
    app: AppHandle,
    media_id: String,
    thumbnail_filename: String,
) -> Result<MediaItem, String> {
    // Load existing media item metadata
    let metadata_dir = storage::get_media_metadata_dir(&app).map_err(|e| e.message)?;
    let metadata_path = metadata_dir.join(format!("{}.json", media_id));

    let mut media_item =
        storage::read_json_file::<MediaItem>(&metadata_path).map_err(|e| e.message)?;

    // Update thumbnail field
    media_item.thumbnail = Some(thumbnail_filename);

    // Update timestamp
    media_item.updated_at = chrono::Utc::now().to_rfc3339();

    // Save updated metadata
    storage::write_json_file(&metadata_path, &media_item).map_err(|e| e.message)?;

    Ok(media_item)
}

// ===== Media Playlist Commands =====

#[tauri::command]
pub fn load_media_playlists(app: AppHandle) -> Result<Vec<MediaPlaylist>, String> {
    let playlists_dir = storage::get_media_playlists_dir(&app).map_err(|e| e.message)?;
    storage::read_all_json_files(&playlists_dir).map_err(|e| e.message)
}

#[tauri::command]
pub fn save_media_playlist(app: AppHandle, playlist: MediaPlaylist) -> Result<(), String> {
    let playlists_dir = storage::get_media_playlists_dir(&app).map_err(|e| e.message)?;
    let file_path = playlists_dir.join(format!("{}.json", playlist.id));
    storage::write_json_file(&file_path, &playlist).map_err(|e| e.message)
}

#[tauri::command]
pub fn delete_media_playlist(app: AppHandle, id: String) -> Result<(), String> {
    let playlists_dir = storage::get_media_playlists_dir(&app).map_err(|e| e.message)?;
    let file_path = playlists_dir.join(format!("{}.json", id));
    storage::delete_file(&file_path).map_err(|e| e.message)
}

// ===== Tag Group Commands =====

#[tauri::command]
pub fn load_tag_groups(app: AppHandle) -> Result<Vec<SlideTagGroup>, String> {
    let file_path = storage::get_tag_groups_file(&app).map_err(|e| e.message)?;

    // Return empty array if file doesn't exist
    if !file_path.exists() {
        return Ok(Vec::new());
    }

    storage::read_json_file(&file_path).map_err(|e| e.message)
}

#[tauri::command]
pub fn save_tag_groups(app: AppHandle, tag_groups: Vec<SlideTagGroup>) -> Result<(), String> {
    let file_path = storage::get_tag_groups_file(&app).map_err(|e| e.message)?;
    storage::write_json_file(&file_path, &tag_groups).map_err(|e| e.message)
}


mod storage;

use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter, Manager, State};
use uuid::Uuid;

// ===== Video Sync State Management =====

/// Video playback state sent from audience view
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VideoState {
    pub slide_id: String,
    pub current_time: f64,
    pub duration: f64,
    pub paused: bool,
    pub volume: f64,
    #[serde(rename = "loop")]
    pub loop_video: bool,
    pub playback_rate: f64,
    pub buffered: f64,
    pub ready_state: i32,
    pub error: Option<String>,
    pub seeking: bool,
    pub updated_at: f64, // Unix timestamp in milliseconds
}

/// Internal state for video sync management
pub struct VideoSyncManager {
    state: Option<VideoState>,
    broadcast_active: bool,
    stop_signal: Option<Arc<Mutex<bool>>>,
}

impl Default for VideoSyncManager {
    fn default() -> Self {
        Self {
            state: None,
            broadcast_active: false,
            stop_signal: None,
        }
    }
}

/// App state wrapper for thread-safe access
pub struct AppState {
    pub video_sync: Arc<Mutex<VideoSyncManager>>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            video_sync: Arc::new(Mutex::new(VideoSyncManager::default())),
        }
    }
}

/// Get current timestamp in milliseconds
fn get_timestamp_ms() -> f64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as f64
}

/// Extrapolate current video time based on elapsed time and playback rate
fn extrapolate_video_time(state: &VideoState) -> f64 {
    if state.paused || state.seeking {
        return state.current_time;
    }

    let now = get_timestamp_ms();
    let elapsed_ms = now - state.updated_at;
    let elapsed_seconds = elapsed_ms / 1000.0;
    let extrapolated = state.current_time + (elapsed_seconds * state.playback_rate);

    // Handle looping - wrap around if exceeds duration
    if state.loop_video && state.duration > 0.0 {
        extrapolated % state.duration
    } else {
        // Clamp to duration
        extrapolated.min(state.duration)
    }
}

// Data structures matching TypeScript types

// Legacy types for backwards compatibility
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SlideText {
    pub content: String,
    #[serde(rename = "fontSize")]
    pub font_size: Option<f64>,
    pub color: Option<String>,
    pub alignment: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type", content = "value")]
pub enum SlideBackground {
    #[serde(rename = "color")]
    Color(String),
    #[serde(rename = "image")]
    Image(String),
    #[serde(rename = "video")]
    Video(String),
}

// Position object
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Position {
    pub x: f64, // percentage (0-100)
    pub y: f64, // percentage (0-100)
}

// Size object
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Size {
    pub width: f64,  // percentage (0-100)
    pub height: f64, // percentage (0-100)
}

// Text alignment object
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TextAlignment {
    pub horizontal: String, // "left" | "center" | "right"
    pub vertical: String,   // "top" | "center" | "bottom"
}

// Shadow effect type
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ShadowEffect {
    pub color: String,
    #[serde(rename = "offsetX")]
    pub offset_x: f64,
    #[serde(rename = "offsetY")]
    pub offset_y: f64,
    #[serde(rename = "blurRadius")]
    pub blur_radius: f64,
}

// Effect container type
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Effect {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub shadow: Option<ShadowEffect>,
}

// Text object with extended formatting
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TextObject {
    pub id: String,
    pub position: Position,
    pub size: Size,
    pub rotation: Option<f64>,
    #[serde(rename = "scaleX", skip_serializing_if = "Option::is_none")]
    pub scale_x: Option<f64>,
    #[serde(rename = "scaleY", skip_serializing_if = "Option::is_none")]
    pub scale_y: Option<f64>,
    #[serde(rename = "zIndex")]
    pub z_index: i32,
    #[serde(rename = "isLocked", skip_serializing_if = "Option::is_none")]
    pub is_locked: Option<bool>, // Hard lock - prevents all editing
    pub content: String,
    #[serde(rename = "fontSize")]
    pub font_size: f64,
    pub color: String,
    pub alignment: TextAlignment,
    #[serde(rename = "fontFamily", skip_serializing_if = "Option::is_none")]
    pub font_family: Option<String>,
    #[serde(rename = "fontWeight", skip_serializing_if = "Option::is_none")]
    pub font_weight: Option<i32>, // 100-900
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bold: Option<bool>, // Deprecated: for backward compatibility
    #[serde(rename = "fontStyle", skip_serializing_if = "Option::is_none")]
    pub font_style: Option<String>, // "normal" | "italic" | "oblique"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub underline: Option<bool>,
    #[serde(rename = "textTransform", skip_serializing_if = "Option::is_none")]
    pub text_transform: Option<String>, // "uppercase" | "lowercase" | "capitalize"
    // Text content stroke (outline around letters)
    #[serde(rename = "textStrokeColor", skip_serializing_if = "Option::is_none")]
    pub text_stroke_color: Option<String>,
    #[serde(rename = "textStrokeWidth", skip_serializing_if = "Option::is_none")]
    pub text_stroke_width: Option<f64>,
    // Text object bounds (background and border of the text box)
    #[serde(rename = "backgroundColor", skip_serializing_if = "Option::is_none")]
    pub background_color: Option<String>,
    #[serde(rename = "borderColor", skip_serializing_if = "Option::is_none")]
    pub border_color: Option<String>,
    #[serde(rename = "borderWidth", skip_serializing_if = "Option::is_none")]
    pub border_width: Option<f64>,
    // Effects (for container/bounds)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub effect: Option<Effect>,
    // Text content shadow (text-shadow CSS)
    #[serde(rename = "textShadow", skip_serializing_if = "Option::is_none")]
    pub text_shadow: Option<ShadowEffect>,
}

// Shape object (rectangle, circle, triangle)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ShapeObject {
    pub id: String,
    pub position: Position,
    pub size: Size,
    pub rotation: Option<f64>,
    #[serde(rename = "scaleX", skip_serializing_if = "Option::is_none")]
    pub scale_x: Option<f64>,
    #[serde(rename = "scaleY", skip_serializing_if = "Option::is_none")]
    pub scale_y: Option<f64>,
    #[serde(rename = "zIndex")]
    pub z_index: i32,
    #[serde(rename = "isLocked", skip_serializing_if = "Option::is_none")]
    pub is_locked: Option<bool>, // Hard lock - prevents all editing
    #[serde(rename = "shapeType")]
    pub shape_type: String, // "rectangle" | "circle" | "triangle"
    #[serde(rename = "fillColor")]
    pub fill_color: String,
    #[serde(rename = "strokeColor", skip_serializing_if = "Option::is_none")]
    pub stroke_color: Option<String>,
    #[serde(rename = "strokeWidth", skip_serializing_if = "Option::is_none")]
    pub stroke_width: Option<f64>,
    // Optional text overlay
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,
    #[serde(rename = "fontSize", skip_serializing_if = "Option::is_none")]
    pub font_size: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alignment: Option<TextAlignment>,
    #[serde(rename = "fontFamily", skip_serializing_if = "Option::is_none")]
    pub font_family: Option<String>,
    #[serde(rename = "fontWeight", skip_serializing_if = "Option::is_none")]
    pub font_weight: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bold: Option<bool>, // Deprecated
    #[serde(rename = "fontStyle", skip_serializing_if = "Option::is_none")]
    pub font_style: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub underline: Option<bool>,
    #[serde(rename = "textTransform", skip_serializing_if = "Option::is_none")]
    pub text_transform: Option<String>,
    #[serde(rename = "textStrokeColor", skip_serializing_if = "Option::is_none")]
    pub text_stroke_color: Option<String>,
    #[serde(rename = "textStrokeWidth", skip_serializing_if = "Option::is_none")]
    pub text_stroke_width: Option<f64>,
    // Effects (for shape itself)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub effect: Option<Effect>,
    // Text overlay shadow (text-shadow CSS for overlay text)
    #[serde(rename = "textShadow", skip_serializing_if = "Option::is_none")]
    pub text_shadow: Option<ShadowEffect>,
}

// Image object
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ImageObject {
    pub id: String,
    pub position: Position,
    pub size: Size,
    pub rotation: Option<f64>,
    #[serde(rename = "scaleX", skip_serializing_if = "Option::is_none")]
    pub scale_x: Option<f64>,
    #[serde(rename = "scaleY", skip_serializing_if = "Option::is_none")]
    pub scale_y: Option<f64>,
    #[serde(rename = "zIndex")]
    pub z_index: i32,
    #[serde(rename = "isLocked", skip_serializing_if = "Option::is_none")]
    pub is_locked: Option<bool>, // Hard lock - prevents all editing
    pub src: String,
    #[serde(rename = "imageType", skip_serializing_if = "Option::is_none")]
    pub image_type: Option<String>, // "background" | "object"
    #[serde(rename = "objectFit", skip_serializing_if = "Option::is_none")]
    pub object_fit: Option<String>, // "cover" | "contain" | "fill"
    // Border around the image bounds
    #[serde(rename = "borderColor", skip_serializing_if = "Option::is_none")]
    pub border_color: Option<String>,
    #[serde(rename = "borderWidth", skip_serializing_if = "Option::is_none")]
    pub border_width: Option<f64>,
    // Optional text overlay
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,
    #[serde(rename = "fontSize", skip_serializing_if = "Option::is_none")]
    pub font_size: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alignment: Option<TextAlignment>,
    #[serde(rename = "fontFamily", skip_serializing_if = "Option::is_none")]
    pub font_family: Option<String>,
    #[serde(rename = "fontWeight", skip_serializing_if = "Option::is_none")]
    pub font_weight: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bold: Option<bool>, // Deprecated
    #[serde(rename = "fontStyle", skip_serializing_if = "Option::is_none")]
    pub font_style: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub underline: Option<bool>,
    #[serde(rename = "textTransform", skip_serializing_if = "Option::is_none")]
    pub text_transform: Option<String>,
    #[serde(rename = "textStrokeColor", skip_serializing_if = "Option::is_none")]
    pub text_stroke_color: Option<String>,
    #[serde(rename = "textStrokeWidth", skip_serializing_if = "Option::is_none")]
    pub text_stroke_width: Option<f64>,
    // Effects (for image bounds)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub effect: Option<Effect>,
    // Text overlay shadow (text-shadow CSS for overlay text)
    #[serde(rename = "textShadow", skip_serializing_if = "Option::is_none")]
    pub text_shadow: Option<ShadowEffect>,
}

// Video object
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VideoObject {
    pub id: String,
    pub position: Position,
    pub size: Size,
    pub rotation: Option<f64>,
    #[serde(rename = "scaleX", skip_serializing_if = "Option::is_none")]
    pub scale_x: Option<f64>,
    #[serde(rename = "scaleY", skip_serializing_if = "Option::is_none")]
    pub scale_y: Option<f64>,
    #[serde(rename = "zIndex")]
    pub z_index: i32,
    #[serde(rename = "isLocked", skip_serializing_if = "Option::is_none")]
    pub is_locked: Option<bool>, // Hard lock - prevents all editing
    pub src: String,
    #[serde(rename = "videoType")]
    pub video_type: Option<String>, // "background" | "object"
    pub thumbnail: Option<String>,
    #[serde(rename = "autoPlay", skip_serializing_if = "Option::is_none")]
    pub auto_play: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub loop_video: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub muted: Option<bool>,
    // Border around the video bounds
    #[serde(rename = "borderColor", skip_serializing_if = "Option::is_none")]
    pub border_color: Option<String>,
    #[serde(rename = "borderWidth", skip_serializing_if = "Option::is_none")]
    pub border_width: Option<f64>,
    // Optional text overlay
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,
    #[serde(rename = "fontSize", skip_serializing_if = "Option::is_none")]
    pub font_size: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alignment: Option<TextAlignment>,
    #[serde(rename = "fontFamily", skip_serializing_if = "Option::is_none")]
    pub font_family: Option<String>,
    #[serde(rename = "fontWeight", skip_serializing_if = "Option::is_none")]
    pub font_weight: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bold: Option<bool>, // Deprecated
    #[serde(rename = "fontStyle", skip_serializing_if = "Option::is_none")]
    pub font_style: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub underline: Option<bool>,
    #[serde(rename = "textTransform", skip_serializing_if = "Option::is_none")]
    pub text_transform: Option<String>,
    #[serde(rename = "textStrokeColor", skip_serializing_if = "Option::is_none")]
    pub text_stroke_color: Option<String>,
    #[serde(rename = "textStrokeWidth", skip_serializing_if = "Option::is_none")]
    pub text_stroke_width: Option<f64>,
    // Effects (for video bounds)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub effect: Option<Effect>,
    // Text overlay shadow (text-shadow CSS for overlay text)
    #[serde(rename = "textShadow", skip_serializing_if = "Option::is_none")]
    pub text_shadow: Option<ShadowEffect>,
}

// Union type for slide objects (using internally tagged enum)
// The "type" field determines which variant to deserialize as
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type")]
pub enum SlideObject {
    #[serde(rename = "video")]
    Video(VideoObject),
    #[serde(rename = "image")]
    Image(ImageObject),
    #[serde(rename = "text")]
    Text(TextObject),
    #[serde(rename = "shape")]
    Shape(ShapeObject),
}

// New SlideData structure
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SlideData {
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub objects: Option<Vec<SlideObject>>,
    #[serde(rename = "backgroundColor", skip_serializing_if = "Option::is_none")]
    pub background_color: Option<String>,
    // Legacy support (optional, for migration)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<SlideText>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub background: Option<SlideBackground>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SlideGroupMeta {
    #[serde(rename = "playlistId", skip_serializing_if = "Option::is_none")]
    pub playlist_id: Option<String>,
    #[serde(rename = "originLibraryId", skip_serializing_if = "Option::is_none")]
    pub origin_library_id: Option<String>,
    #[serde(rename = "originSlideGroupId", skip_serializing_if = "Option::is_none")]
    pub origin_slide_group_id: Option<String>,
    #[serde(rename = "libraryId", skip_serializing_if = "Option::is_none")]
    pub library_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CanvasSize {
    pub width: i32,
    pub height: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SlideGroup {
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub meta: Option<SlideGroupMeta>,
    pub title: String,
    pub slides: Vec<SlideData>,
    #[serde(rename = "canvasSize")]
    pub canvas_size: CanvasSize,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Library {
    pub id: String,
    pub name: String,
    #[serde(rename = "slideGroups")]
    pub slide_groups: Vec<SlideGroup>,
    #[serde(default)]
    pub order: Option<i32>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PlaylistItem {
    pub id: String,
    #[serde(rename = "slideGroup")]
    pub slide_group: SlideGroup, // Deep copy with meta containing origin info
    pub order: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Playlist {
    pub id: String,
    pub name: String,
    pub items: Vec<PlaylistItem>,
    #[serde(default)]
    pub order: Option<i32>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MediaItem {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub media_type: String, // "image" or "video"
    pub source: String,
    pub thumbnail: Option<String>,
    pub duration: Option<f64>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
    pub metadata: Option<JsonValue>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub hash: Option<String>, // SHA256 hash for deduplication
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MediaPlaylist {
    pub id: String,
    pub name: String,
    #[serde(rename = "mediaItems")]
    pub media_items: Vec<MediaItem>,
    pub order: i32,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Initialize storage directories
#[tauri::command]
fn initialize_storage(app: AppHandle) -> Result<(), String> {
    storage::ensure_directories(&app).map_err(|e| e.message)
}

// Library commands
#[tauri::command]
fn load_libraries(app: AppHandle) -> Result<Vec<Library>, String> {
    let libraries_dir = storage::get_libraries_dir(&app).map_err(|e| e.message)?;
    storage::read_all_json_files(&libraries_dir).map_err(|e| e.message)
}

#[tauri::command]
fn save_library(app: AppHandle, library: Library) -> Result<(), String> {
    let libraries_dir = storage::get_libraries_dir(&app).map_err(|e| e.message)?;
    let file_path = libraries_dir.join(format!("{}.json", library.id));
    storage::write_json_file(&file_path, &library).map_err(|e| e.message)
}

#[tauri::command]
fn delete_library(app: AppHandle, id: String) -> Result<(), String> {
    let libraries_dir = storage::get_libraries_dir(&app).map_err(|e| e.message)?;
    let file_path = libraries_dir.join(format!("{}.json", id));
    storage::delete_file(&file_path).map_err(|e| e.message)
}

// Playlist commands
#[tauri::command]
fn load_playlists(app: AppHandle) -> Result<Vec<Playlist>, String> {
    let playlists_dir = storage::get_playlists_dir(&app).map_err(|e| e.message)?;
    storage::read_all_json_files(&playlists_dir).map_err(|e| e.message)
}

#[tauri::command]
fn save_playlist(app: AppHandle, playlist: Playlist) -> Result<(), String> {
    let playlists_dir = storage::get_playlists_dir(&app).map_err(|e| e.message)?;
    let file_path = playlists_dir.join(format!("{}.json", playlist.id));
    storage::write_json_file(&file_path, &playlist).map_err(|e| e.message)
}

#[tauri::command]
fn delete_playlist(app: AppHandle, id: String) -> Result<(), String> {
    let playlists_dir = storage::get_playlists_dir(&app).map_err(|e| e.message)?;
    let file_path = playlists_dir.join(format!("{}.json", id));
    storage::delete_file(&file_path).map_err(|e| e.message)
}

// Media commands
#[tauri::command]
fn load_media_items(app: AppHandle) -> Result<Vec<MediaItem>, String> {
    let metadata_dir = storage::get_media_metadata_dir(&app).map_err(|e| e.message)?;
    storage::read_all_json_files(&metadata_dir).map_err(|e| e.message)
}

#[tauri::command]
fn import_media_file(app: AppHandle, source_path: String) -> Result<MediaItem, String> {
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
fn delete_media_item(app: AppHandle, id: String) -> Result<(), String> {
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
fn get_media_file_path(app: AppHandle, file_name: String) -> Result<String, String> {
    let media_files_dir = storage::get_media_files_dir(&app).map_err(|e| e.message)?;
    let file_path = media_files_dir.join(file_name);

    file_path
        .to_str()
        .ok_or_else(|| "Invalid path".to_string())
        .map(|s| s.to_string())
}

#[tauri::command]
fn save_video_thumbnail(
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
fn update_media_thumbnail(
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

// Media Playlist commands
#[tauri::command]
fn load_media_playlists(app: AppHandle) -> Result<Vec<MediaPlaylist>, String> {
    let playlists_dir = storage::get_media_playlists_dir(&app).map_err(|e| e.message)?;
    storage::read_all_json_files(&playlists_dir).map_err(|e| e.message)
}

#[tauri::command]
fn save_media_playlist(app: AppHandle, playlist: MediaPlaylist) -> Result<(), String> {
    let playlists_dir = storage::get_media_playlists_dir(&app).map_err(|e| e.message)?;
    let file_path = playlists_dir.join(format!("{}.json", playlist.id));
    storage::write_json_file(&file_path, &playlist).map_err(|e| e.message)
}

#[tauri::command]
fn delete_media_playlist(app: AppHandle, id: String) -> Result<(), String> {
    let playlists_dir = storage::get_media_playlists_dir(&app).map_err(|e| e.message)?;
    let file_path = playlists_dir.join(format!("{}.json", id));
    storage::delete_file(&file_path).map_err(|e| e.message)
}

// Audience window commands
// The audience window is created at app startup (configured in tauri.conf.json)
// These commands show/hide it rather than creating/destroying it

#[tauri::command]
fn show_audience_window(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("audience")
        .ok_or_else(|| "Audience window not found".to_string())?;

    // Show the window
    window
        .show()
        .map_err(|e| format!("Failed to show audience window: {}", e))?;

    // Set always on top
    window
        .set_always_on_top(true)
        .map_err(|e| format!("Failed to set always on top: {}", e))?;

    // Focus the window
    window
        .set_focus()
        .map_err(|e| format!("Failed to focus window: {}", e))?;

    Ok(())
}

#[tauri::command]
fn hide_audience_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("audience") {
        // Remove always on top
        let _ = window.set_always_on_top(false);

        // Hide the window
        window
            .hide()
            .map_err(|e| format!("Failed to hide audience window: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
fn is_audience_window_visible(app: AppHandle) -> Result<bool, String> {
    let window = app
        .get_webview_window("audience")
        .ok_or_else(|| "Audience window not found".to_string())?;

    window
        .is_visible()
        .map_err(|e| format!("Failed to check window visibility: {}", e))
}

// ===== Video Sync Commands =====

/// Update video state from audience view and start/manage broadcast timer
#[tauri::command]
fn update_video_state(
    app: AppHandle,
    state: VideoState,
    app_state: State<'_, AppState>,
) -> Result<(), String> {
    let video_sync = app_state.video_sync.clone();

    // Always emit the state immediately to the presenter
    // This ensures pause, seek, and other state changes are reflected immediately
    if let Err(e) = app.emit_to("main", "video:state-update", &state) {
        println!("Failed to emit immediate video state: {}", e);
    }

    let mut manager = video_sync
        .lock()
        .map_err(|e| format!("Failed to lock video sync state: {}", e))?;

    let was_paused = manager.state.as_ref().map(|s| s.paused).unwrap_or(true);
    let is_now_playing = !state.paused;

    // Update the stored state
    manager.state = Some(state.clone());

    // If video started playing and broadcast is not active, start the timer
    if is_now_playing && !manager.broadcast_active {
        manager.broadcast_active = true;

        // Create stop signal for this broadcast session
        let stop_signal = Arc::new(Mutex::new(false));
        manager.stop_signal = Some(stop_signal.clone());

        let video_sync_clone = video_sync.clone();
        let app_clone = app.clone();

        // Spawn broadcast timer thread
        thread::spawn(move || {
            broadcast_loop(app_clone, video_sync_clone, stop_signal);
        });

        println!("Started video state broadcast timer");
    }

    // If video paused, signal the broadcast to stop
    if was_paused == false && state.paused {
        if let Some(ref stop_signal) = manager.stop_signal {
            if let Ok(mut stop) = stop_signal.lock() {
                *stop = true;
            }
        }
        manager.broadcast_active = false;
        manager.stop_signal = None;
        println!("Stopped video state broadcast timer (video paused)");
    }

    Ok(())
}

/// Clear video state and stop broadcast timer
#[tauri::command]
fn clear_video_state(app: AppHandle, app_state: State<'_, AppState>) -> Result<(), String> {
    let mut manager = app_state
        .video_sync
        .lock()
        .map_err(|e| format!("Failed to lock video sync state: {}", e))?;

    // Signal broadcast to stop
    if let Some(ref stop_signal) = manager.stop_signal {
        if let Ok(mut stop) = stop_signal.lock() {
            *stop = true;
        }
    }

    manager.state = None;
    manager.broadcast_active = false;
    manager.stop_signal = None;

    // Emit cleared event to presenter so it can clear its local state
    let _ = app.emit_to("main", "video:state-cleared", ());

    Ok(())
}

/// Broadcast loop that runs at ~30fps and emits extrapolated video state
fn broadcast_loop(
    app: AppHandle,
    video_sync: Arc<Mutex<VideoSyncManager>>,
    stop_signal: Arc<Mutex<bool>>,
) {
    let interval = Duration::from_millis(33); // ~30fps

    loop {
        // Check stop signal
        if let Ok(stop) = stop_signal.lock() {
            if *stop {
                println!("Broadcast loop received stop signal");
                break;
            }
        }

        // Get current state and extrapolate time
        let state_to_emit = {
            let manager = match video_sync.lock() {
                Ok(m) => m,
                Err(_) => {
                    println!("Failed to lock video sync in broadcast loop");
                    break;
                }
            };

            match &manager.state {
                Some(state) if !state.paused => {
                    let mut extrapolated_state = state.clone();
                    extrapolated_state.current_time = extrapolate_video_time(state);
                    extrapolated_state.updated_at = get_timestamp_ms();
                    Some(extrapolated_state)
                }
                _ => None,
            }
        };

        // Emit to main (presenter) window
        if let Some(state) = state_to_emit {
            if let Err(e) = app.emit_to("main", "video:state-update", &state) {
                // Window might be closed, that's okay
                println!("Failed to emit video state: {}", e);
            }
        } else {
            // Video is paused or no state, stop broadcasting
            println!("No active video state, stopping broadcast");
            break;
        }

        thread::sleep(interval);
    }

    // Clean up broadcast state
    if let Ok(mut manager) = video_sync.lock() {
        manager.broadcast_active = false;
        manager.stop_signal = None;
    }

    println!("Broadcast loop ended");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_font_variants::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            greet,
            initialize_storage,
            load_libraries,
            save_library,
            delete_library,
            load_playlists,
            save_playlist,
            delete_playlist,
            load_media_items,
            import_media_file,
            delete_media_item,
            get_media_file_path,
            save_video_thumbnail,
            update_media_thumbnail,
            load_media_playlists,
            save_media_playlist,
            delete_media_playlist,
            show_audience_window,
            hide_audience_window,
            is_audience_window_visible,
            update_video_state,
            clear_video_state,
            tauri_plugin_font_variants::get_font_families,
            tauri_plugin_font_variants::get_font_variants,
        ])
        .on_window_event(|window, event| {
            // When the main window is closed, exit the entire application
            if window.label() == "main" {
                if let tauri::WindowEvent::CloseRequested { .. } = event {
                    // Exit the application when main window is closed
                    std::process::exit(0);
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

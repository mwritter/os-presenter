mod storage;

use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use std::path::PathBuf;
use tauri::AppHandle;
use uuid::Uuid;

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

// Text object with extended formatting
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TextObject {
    pub id: String,
    #[serde(rename = "type")]
    pub object_type: String, // "text"
    pub position: Position,
    pub size: Size,
    pub rotation: Option<f64>,
    #[serde(rename = "scaleX", skip_serializing_if = "Option::is_none")]
    pub scale_x: Option<f64>,
    #[serde(rename = "scaleY", skip_serializing_if = "Option::is_none")]
    pub scale_y: Option<f64>,
    #[serde(rename = "zIndex")]
    pub z_index: i32,
    pub content: String,
    #[serde(rename = "fontSize")]
    pub font_size: f64,
    pub color: String,
    pub alignment: String, // "left" | "center" | "right"
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
}

// Shape object (rectangle, circle, triangle)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ShapeObject {
    pub id: String,
    #[serde(rename = "type")]
    pub object_type: String, // "shape"
    pub position: Position,
    pub size: Size,
    pub rotation: Option<f64>,
    #[serde(rename = "scaleX", skip_serializing_if = "Option::is_none")]
    pub scale_x: Option<f64>,
    #[serde(rename = "scaleY", skip_serializing_if = "Option::is_none")]
    pub scale_y: Option<f64>,
    #[serde(rename = "zIndex")]
    pub z_index: i32,
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
    pub alignment: Option<String>,
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
}

// Image object
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ImageObject {
    pub id: String,
    #[serde(rename = "type")]
    pub object_type: String, // "image"
    pub position: Position,
    pub size: Size,
    pub rotation: Option<f64>,
    #[serde(rename = "scaleX", skip_serializing_if = "Option::is_none")]
    pub scale_x: Option<f64>,
    #[serde(rename = "scaleY", skip_serializing_if = "Option::is_none")]
    pub scale_y: Option<f64>,
    #[serde(rename = "zIndex")]
    pub z_index: i32,
    pub src: String,
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
    pub alignment: Option<String>,
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
}

// Video object
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VideoObject {
    pub id: String,
    #[serde(rename = "type")]
    pub object_type: String, // "video"
    pub position: Position,
    pub size: Size,
    pub rotation: Option<f64>,
    #[serde(rename = "scaleX", skip_serializing_if = "Option::is_none")]
    pub scale_x: Option<f64>,
    #[serde(rename = "scaleY", skip_serializing_if = "Option::is_none")]
    pub scale_y: Option<f64>,
    #[serde(rename = "zIndex")]
    pub z_index: i32,
    pub src: String,
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
    pub alignment: Option<String>,
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
}

// Union type for slide objects (using untagged enum)
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(untagged)]
pub enum SlideObject {
    Text(TextObject),
    Shape(ShapeObject),
    Image(ImageObject),
    Video(VideoObject),
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
    };

    // Save metadata
    let metadata_dir = storage::get_media_metadata_dir(&app).map_err(|e| e.message)?;
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

// Custom font information structure
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FontVariantInfo {
    pub family: String, // Base family name (e.g., "American Typewriter")
    pub style: String, // The style name like "Bold", "Condensed Bold", etc.
    pub full_name: String, // Full font name to use in CSS (e.g., "American Typewriter Bold")
    pub postscript_name: Option<String>,
}

// Get just the font family names (fast)
#[tauri::command]
fn get_font_families() -> Result<Vec<String>, String> {
    use font_kit::source::SystemSource;
    
    let source = SystemSource::new();
    let mut families = source
        .all_families()
        .map_err(|e| format!("Failed to get font families: {}", e))?;
    
    families.sort_by(|a, b| a.to_lowercase().cmp(&b.to_lowercase()));
    Ok(families)
}

// Get variants for a specific font family (on-demand)
#[tauri::command]
fn get_font_variants(family_name: String) -> Result<Vec<FontVariantInfo>, String> {
    use font_kit::source::SystemSource;
    use std::collections::HashMap;
    
    let source = SystemSource::new();
    let mut variants_map = HashMap::new();
    
    // Get all fonts in this family
    if let Ok(handles) = source.select_family_by_name(&family_name) {
        for handle in handles.fonts() {
            match handle.load() {
                Ok(font) => {
                    let postscript_name = font.postscript_name();
                    let full_name = font.full_name();
                    
                    // Extract style name from full name
                    let style = if full_name.starts_with(&family_name) {
                        let style_part = full_name
                            .strip_prefix(&family_name)
                            .unwrap_or("")
                            .trim_start_matches(&['-', ' '][..])
                            .trim();
                        
                        if style_part.is_empty() {
                            "Regular".to_string()
                        } else {
                            style_part.to_string()
                        }
                    } else {
                        postscript_name
                            .as_ref()
                            .and_then(|ps| {
                                ps.strip_prefix(&family_name.replace(" ", ""))
                                    .map(|s| s.trim_start_matches('-').to_string())
                            })
                            .unwrap_or_else(|| "Regular".to_string())
                    };

                    // Use style name as the key for deduplication
                    if !variants_map.contains_key(&style) {
                        variants_map.insert(style.clone(), FontVariantInfo {
                            family: family_name.clone(),
                            style,
                            full_name: full_name.clone(),
                            postscript_name,
                        });
                    }
                }
                Err(_) => continue,
            }
        }
    }
    
    // Convert to vec and sort by style name
    let mut variants: Vec<FontVariantInfo> = variants_map.into_values().collect();
    variants.sort_by(|a, b| a.style.cmp(&b.style));
    Ok(variants)
}

#[tauri::command]
fn get_detailed_fonts() -> Result<Vec<FontVariantInfo>, String> {
    use font_kit::source::SystemSource;
    use std::collections::HashSet;
    
    let source = SystemSource::new();
    let mut fonts_info = Vec::new();
    let mut seen = HashSet::new();

    // Get all font families
    let families = source
        .all_families()
        .map_err(|e| format!("Failed to get font families: {}", e))?;

    for family_name in families {
        // Get all fonts in this family
        if let Ok(handles) = source.select_family_by_name(&family_name) {
            for handle in handles.fonts() {
                // Try to load font - skip if it fails rather than erroring out
                match handle.load() {
                    Ok(font) => {
                        let postscript_name = font.postscript_name();
                        let full_name = font.full_name();
                        
                        // Extract style name from full name
                        let style = if full_name.starts_with(&family_name) {
                            let style_part = full_name
                                .strip_prefix(&family_name)
                                .unwrap_or("")
                                .trim_start_matches(&['-', ' '][..])
                                .trim();
                            
                            if style_part.is_empty() {
                                "Regular".to_string()
                            } else {
                                style_part.to_string()
                            }
                        } else {
                            postscript_name
                                .as_ref()
                                .and_then(|ps| {
                                    ps.strip_prefix(&family_name.replace(" ", ""))
                                        .map(|s| s.trim_start_matches('-').to_string())
                                })
                                .unwrap_or_else(|| "Regular".to_string())
                        };

                        // Create unique key to avoid duplicates
                        let key = format!("{}-{}", family_name, style);
                        if seen.insert(key) {
                            fonts_info.push(FontVariantInfo {
                                family: family_name.clone(),
                                style,
                                full_name: full_name.clone(),
                                postscript_name,
                            });
                        }
                    }
                    Err(_) => {
                        // Skip fonts that fail to load
                        continue;
                    }
                }
            }
        }
    }

    // Sort by family, then by style
    fonts_info.sort_by(|a, b| {
        a.family.cmp(&b.family).then(a.style.cmp(&b.style))
    });

    Ok(fonts_info)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_system_fonts::init())
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
            get_font_families,
            get_font_variants,
            get_detailed_fonts,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

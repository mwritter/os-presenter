//! Data models matching TypeScript types for serialization/deserialization.

use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

// ===== Video Sync Types =====

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

// ===== Slide Object Types =====

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

// ===== Slide & Library Types =====

// Slide tag group for categorizing slides
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SlideTagGroup {
    pub id: String,
    pub name: String,
    pub color: String,
}

// SlideData structure
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SlideData {
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub objects: Option<Vec<SlideObject>>,
    #[serde(rename = "backgroundColor", skip_serializing_if = "Option::is_none")]
    pub background_color: Option<String>,
    #[serde(rename = "tagGroup", skip_serializing_if = "Option::is_none")]
    pub tag_group: Option<SlideTagGroup>,
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

// ===== Playlist Types =====

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

// ===== Media Types =====

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


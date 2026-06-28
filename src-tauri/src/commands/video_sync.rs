//! Commands and state for video synchronization between the presenter and audience windows.
//!
//! Architecture (preview-authoritative clock):
//! - Control commands (play/pause/seek/volume/rate) are sent from the presenter to every video
//!   over a same-origin `BroadcastChannel` and a same-window `CustomEvent`. Tauri is used here
//!   only to persist the last play/pause command (`last_control`) so a freshly mounted or
//!   backgrounded audience webview can recover, and as a delivery fallback.
//! - Playback state flows from the preview video to the presenter controls entirely on the
//!   frontend over a `BroadcastChannel`, so there is no Rust-side polling loop or handshake.

use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter, State};

/// Payload for a video control command (from the presenter frontend).
#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VideoControlCommandPayload {
    pub slide_id: String,
    pub action: String, // "play" | "pause" | "seek" | "volume" | "rate"
    pub value: Option<f64>,
}

/// Last play/pause command so the audience window can sync when it mounts or was backgrounded.
#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LastVideoControl {
    pub slide_id: String,
    pub action: String, // "play" | "pause"
    pub updated_at: f64, // Unix timestamp in milliseconds
}

/// Internal state for video sync management.
#[derive(Default)]
pub struct VideoSyncManager {
    /// Last play/pause command so the audience can recover if it missed the event.
    last_control: Option<LastVideoControl>,
}

/// App state wrapper for thread-safe access.
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

/// Get the current timestamp in milliseconds.
fn get_timestamp_ms() -> f64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as f64
}

/// Payload emitted to the frontend (same shape as received).
#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VideoControlEmitPayload {
    pub slide_id: String,
    pub action: String,
    pub value: Option<f64>,
}

/// Receive a control command from the presenter; persist play/pause for recovery and relay it to
/// all webviews (the BroadcastChannel is the primary delivery path; this is the fallback).
#[tauri::command]
pub fn video_control_command(
    app: AppHandle,
    payload: VideoControlCommandPayload,
    app_state: State<'_, AppState>,
) -> Result<(), String> {
    if payload.action == "play" || payload.action == "pause" {
        let mut manager = app_state
            .video_sync
            .lock()
            .map_err(|e| format!("Failed to lock video sync state: {}", e))?;
        manager.last_control = Some(LastVideoControl {
            slide_id: payload.slide_id.clone(),
            action: payload.action.clone(),
            updated_at: get_timestamp_ms(),
        });
    }

    let emit_payload = VideoControlEmitPayload {
        slide_id: payload.slide_id,
        action: payload.action,
        value: payload.value,
    };

    // Single broadcast to all webviews (main + audience).
    let _ = app.emit("video:control", &emit_payload);

    Ok(())
}

/// So the audience window can recover play/pause when it mounts or was backgrounded.
#[tauri::command]
pub fn get_last_video_control(
    app_state: State<'_, AppState>,
) -> Result<Option<LastVideoControl>, String> {
    let manager = app_state
        .video_sync
        .lock()
        .map_err(|e| format!("Failed to lock video sync state: {}", e))?;
    Ok(manager.last_control.clone())
}

/// Clear the recovery state on slide change / clear so a new slide's video starts fresh (paused).
#[tauri::command]
pub fn clear_video_session(app: AppHandle, app_state: State<'_, AppState>) -> Result<(), String> {
    let mut manager = app_state
        .video_sync
        .lock()
        .map_err(|e| format!("Failed to lock video sync state: {}", e))?;

    manager.last_control = None;

    let _ = app.emit_to("main", "video:state-cleared", ());

    Ok(())
}

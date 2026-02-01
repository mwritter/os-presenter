//! Commands and state management for video synchronization between windows.

use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter, State};

use crate::models::VideoState;

// ===== Video Sync State Management =====

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

// ===== Helper Functions =====

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

// ===== Video Sync Commands =====

/// Update video state from audience view and start/manage broadcast timer
#[tauri::command]
pub fn update_video_state(
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
pub fn clear_video_state(app: AppHandle, app_state: State<'_, AppState>) -> Result<(), String> {
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


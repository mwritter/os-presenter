//! Commands for window management: audience and settings windows.

use tauri::webview::WebviewWindowBuilder;
use tauri::{AppHandle, Emitter, Manager};

// ===== Audience Window Commands =====
// The audience window is created at app startup (configured in tauri.conf.json)
// These commands show/hide it rather than creating/destroying it

#[tauri::command]
pub fn show_audience_window(app: AppHandle) -> Result<(), String> {
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
pub fn hide_audience_window(app: AppHandle) -> Result<(), String> {
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
pub fn is_audience_window_visible(app: AppHandle) -> Result<bool, String> {
    let window = app
        .get_webview_window("audience")
        .ok_or_else(|| "Audience window not found".to_string())?;

    window
        .is_visible()
        .map_err(|e| format!("Failed to check window visibility: {}", e))
}

// ===== Settings Window Commands =====

/// Internal function to open settings window - used by both command and menu event
pub fn open_settings_window_internal(app: &AppHandle, path: &str) -> Result<(), String> {
    // Check if window already exists
    if let Some(window) = app.get_webview_window("settings") {
        // Window exists, show and focus it
        window
            .show()
            .map_err(|e| format!("Failed to show settings window: {}", e))?;
        window
            .set_focus()
            .map_err(|e| format!("Failed to focus window: {}", e))?;
        // Navigate to the specific section by emitting a navigation event
        window
            .emit("settings:navigate", serde_json::json!({ "path": path }))
            .map_err(|e| format!("Failed to emit navigation event: {}", e))?;
        return Ok(());
    }

    // Create the window dynamically at the specified path
    let window = WebviewWindowBuilder::new(app, "settings", tauri::WebviewUrl::App(path.into()))
        .title("Settings") // Still used for Mission Control / window switcher
        .title_bar_style(tauri::TitleBarStyle::Overlay)
        .hidden_title(true) // Hide title text, keep traffic lights
        .traffic_light_position(tauri::LogicalPosition::new(20.0, 24.0)) // Inset traffic lights
        .inner_size(700.0, 500.0)
        .min_inner_size(500.0, 400.0)
        .resizable(true)
        .build()
        .map_err(|e| format!("Failed to create settings window: {}", e))?;

    // Focus the new window
    window
        .set_focus()
        .map_err(|e| format!("Failed to focus window: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn show_settings_window(app: AppHandle, path: Option<String>) -> Result<(), String> {
    let path = path.unwrap_or_else(|| "/settings".to_string());
    open_settings_window_internal(&app, &path)
}

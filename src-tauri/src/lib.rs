//! OS Presenter - Tauri application entry point and configuration.

mod commands;
mod models;
mod storage;

use commands::video_sync::AppState;
use commands::windows::open_settings_window_internal;
use tauri::menu::{Menu, MenuItemBuilder, PredefinedMenuItem, SubmenuBuilder};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_font_variants::init())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            // Create Settings menu item
            let settings_item = MenuItemBuilder::with_id("settings", "Settings...")
                .accelerator("CmdOrCtrl+,")
                .build(app)?;

            // Create app submenu (macOS application menu)
            let app_submenu = SubmenuBuilder::new(app, "OS Presenter")
                .item(&PredefinedMenuItem::about(
                    app,
                    Some("About OS Presenter"),
                    None,
                )?)
                .separator()
                .item(&settings_item)
                .separator()
                .item(&PredefinedMenuItem::services(app, None)?)
                .separator()
                .item(&PredefinedMenuItem::hide(app, Some("Hide OS Presenter"))?)
                .item(&PredefinedMenuItem::hide_others(app, Some("Hide Others"))?)
                .item(&PredefinedMenuItem::show_all(app, Some("Show All"))?)
                .separator()
                .item(&PredefinedMenuItem::quit(app, Some("Quit OS Presenter"))?)
                .build()?;

            // Create Edit submenu
            let edit_submenu = SubmenuBuilder::new(app, "Edit")
                .item(&PredefinedMenuItem::undo(app, None)?)
                .item(&PredefinedMenuItem::redo(app, None)?)
                .separator()
                .item(&PredefinedMenuItem::cut(app, None)?)
                .item(&PredefinedMenuItem::copy(app, None)?)
                .item(&PredefinedMenuItem::paste(app, None)?)
                .item(&PredefinedMenuItem::select_all(app, None)?)
                .build()?;

            // Create Window submenu
            let window_submenu = SubmenuBuilder::new(app, "Window")
                .item(&PredefinedMenuItem::minimize(app, None)?)
                .item(&PredefinedMenuItem::maximize(app, None)?)
                .separator()
                .item(&PredefinedMenuItem::close_window(app, None)?)
                .build()?;

            // Build the menu
            let menu = Menu::with_items(app, &[&app_submenu, &edit_submenu, &window_submenu])?;
            app.set_menu(menu)?;

            Ok(())
        })
        .on_menu_event(|app, event| {
            if event.id().as_ref() == "settings" {
                let _ = open_settings_window_internal(app, "/settings");
            }
        })
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            // Data commands
            commands::initialize_storage,
            commands::load_libraries,
            commands::save_library,
            commands::delete_library,
            commands::load_playlists,
            commands::save_playlist,
            commands::delete_playlist,
            commands::load_media_items,
            commands::import_media_file,
            commands::delete_media_item,
            commands::get_media_file_path,
            commands::save_video_thumbnail,
            commands::update_media_thumbnail,
            commands::load_media_playlists,
            commands::save_media_playlist,
            commands::delete_media_playlist,
            commands::load_tag_groups,
            commands::save_tag_groups,
            // Window commands
            commands::show_audience_window,
            commands::hide_audience_window,
            commands::is_audience_window_visible,
            commands::show_settings_window,
            // Video sync commands
            commands::update_video_state,
            commands::clear_video_state,
            // Font plugin commands
            tauri_plugin_font_variants::get_font_families,
            tauri_plugin_font_variants::get_font_variants,
        ])
        .on_window_event(|window, event| {
            match event {
                tauri::WindowEvent::CloseRequested { api, .. } => {
                    let label = window.label();

                    // When the main window is closed, exit the entire application
                    if label == "main" {
                        std::process::exit(0);
                    }

                    // For audience window, hide instead of close (it's pre-created)
                    if label == "audience" {
                        api.prevent_close();
                        let _ = window.hide();
                    }
                    // Settings window can close normally - it will be recreated when needed
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

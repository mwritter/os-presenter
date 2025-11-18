mod commands;
mod models;

use tauri::{
    plugin::{Builder, TauriPlugin},
    Runtime,
};

pub use commands::*;
pub use models::*;

/// Initialize the font-variants plugin
/// 
/// Note: This plugin registers commands globally (not namespaced) for backwards compatibility.
/// Commands are available as `get_font_families` and `get_font_variants` directly.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("font-variants")
        .build()
}


//! Tauri command handlers organized by domain.

pub mod data;
pub mod video_sync;
pub mod windows;

// Re-export all commands for easy registration in lib.rs
pub use data::*;
pub use video_sync::*;
pub use windows::*;


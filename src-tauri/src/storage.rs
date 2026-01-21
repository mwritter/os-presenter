use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fmt;
use std::fs;
use std::io::Read;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize)]
pub struct StorageError {
    pub message: String,
}

impl StorageError {
    pub fn new(message: String) -> Self {
        StorageError { message }
    }
}

impl fmt::Display for StorageError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl std::error::Error for StorageError {}

impl From<std::io::Error> for StorageError {
    fn from(err: std::io::Error) -> Self {
        StorageError::new(err.to_string())
    }
}

impl From<serde_json::Error> for StorageError {
    fn from(err: serde_json::Error) -> Self {
        StorageError::new(err.to_string())
    }
}

pub type StorageResult<T> = Result<T, StorageError>;

/// Get the base app data directory
pub fn get_app_data_dir(app: &AppHandle) -> StorageResult<PathBuf> {
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|e| StorageError::new(e.to_string()))?;
    Ok(app_data)
}

/// Get the libraries directory path
pub fn get_libraries_dir(app: &AppHandle) -> StorageResult<PathBuf> {
    let app_data = get_app_data_dir(app)?;
    Ok(app_data.join("libraries"))
}

/// Get the playlists directory path
pub fn get_playlists_dir(app: &AppHandle) -> StorageResult<PathBuf> {
    let app_data = get_app_data_dir(app)?;
    Ok(app_data.join("playlists"))
}

/// Get the media files directory path
pub fn get_media_files_dir(app: &AppHandle) -> StorageResult<PathBuf> {
    let app_data = get_app_data_dir(app)?;
    Ok(app_data.join("media").join("files"))
}

/// Get the media metadata directory path
pub fn get_media_metadata_dir(app: &AppHandle) -> StorageResult<PathBuf> {
    let app_data = get_app_data_dir(app)?;
    Ok(app_data.join("media").join("metadata"))
}

/// Get the media playlists directory path
pub fn get_media_playlists_dir(app: &AppHandle) -> StorageResult<PathBuf> {
    let app_data = get_app_data_dir(app)?;
    Ok(app_data.join("media").join("playlists"))
}

/// Get the settings directory path
pub fn get_settings_dir(app: &AppHandle) -> StorageResult<PathBuf> {
    let app_data = get_app_data_dir(app)?;
    Ok(app_data.join("settings"))
}

/// Get the tag groups file path
pub fn get_tag_groups_file(app: &AppHandle) -> StorageResult<PathBuf> {
    let settings_dir = get_settings_dir(app)?;
    Ok(settings_dir.join("tag-groups.json"))
}

/// Ensure all required directories exist
pub fn ensure_directories(app: &AppHandle) -> StorageResult<()> {
    let dirs = vec![
        get_libraries_dir(app)?,
        get_playlists_dir(app)?,
        get_media_files_dir(app)?,
        get_media_metadata_dir(app)?,
        get_media_playlists_dir(app)?,
        get_settings_dir(app)?,
    ];

    for dir in dirs {
        fs::create_dir_all(&dir)?;
    }

    Ok(())
}

/// Read JSON file from path
pub fn read_json_file<T: for<'de> Deserialize<'de>>(path: &PathBuf) -> StorageResult<T> {
    let content = fs::read_to_string(path)?;
    let data: T = serde_json::from_str(&content)?;
    Ok(data)
}

/// Write JSON file to path
pub fn write_json_file<T: Serialize>(path: &PathBuf, data: &T) -> StorageResult<()> {
    let json = serde_json::to_string_pretty(data)?;
    fs::write(path, json)?;
    Ok(())
}

/// Read all JSON files from a directory
pub fn read_all_json_files<T: for<'de> Deserialize<'de>>(dir: &PathBuf) -> StorageResult<Vec<T>> {
    let mut items = Vec::new();

    if !dir.exists() {
        return Ok(items);
    }

    let entries = fs::read_dir(dir)?;

    for entry in entries {
        let entry = entry?;
        let path = entry.path();

        if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("json") {
            match read_json_file(&path) {
                Ok(item) => items.push(item),
                Err(e) => {
                    eprintln!("Failed to read file {:?}: {}", path, e.message);
                    // Continue reading other files even if one fails
                }
            }
        }
    }

    Ok(items)
}

/// Delete a file
pub fn delete_file(path: &PathBuf) -> StorageResult<()> {
    if path.exists() {
        fs::remove_file(path)?;
    }
    Ok(())
}

/// Copy a file from source to destination
pub fn copy_file(source: &PathBuf, dest: &PathBuf) -> StorageResult<()> {
    fs::copy(source, dest)?;
    Ok(())
}

/// Write raw bytes to a file
pub fn write_file(path: &PathBuf, data: &[u8]) -> StorageResult<()> {
    fs::write(path, data)?;
    Ok(())
}

/// Get file extension
pub fn get_file_extension(path: &PathBuf) -> Option<String> {
    path.extension()
        .and_then(|s| s.to_str())
        .map(|s| s.to_string())
}

/// Get file name without extension
pub fn get_file_stem(path: &PathBuf) -> Option<String> {
    path.file_stem()
        .and_then(|s| s.to_str())
        .map(|s| s.to_string())
}

/// Compute SHA256 hash of a file
pub fn compute_file_hash(path: &PathBuf) -> StorageResult<String> {
    let mut file = fs::File::open(path)?;
    let mut hasher = Sha256::new();
    let mut buffer = [0; 8192]; // 8KB buffer

    loop {
        let bytes_read = file.read(&mut buffer)?;
        if bytes_read == 0 {
            break;
        }
        hasher.update(&buffer[..bytes_read]);
    }

    let result = hasher.finalize();
    Ok(format!("{:x}", result))
}

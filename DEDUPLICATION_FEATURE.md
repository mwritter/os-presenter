# Media Import Deduplication Feature

## Summary

Implemented automatic deduplication for media imports. When a user tries to import a file that already exists in the media library (based on file content hash), the system will reuse the existing media item instead of creating a duplicate.

## Implementation Details

### 1. Added SHA256 Hashing
**File**: `src-tauri/Cargo.toml`
- Added `sha2 = "0.10"` dependency for file hashing

### 2. Hash Computation Function
**File**: `src-tauri/src/storage.rs`
- Added `compute_file_hash()` function that computes SHA256 hash of any file
- Uses 8KB buffer for efficient reading of large files
- Returns hex-encoded hash string

### 3. Updated MediaItem Structure
**Files**: 
- `src-tauri/src/lib.rs` (Rust)
- `src/stores/mediaLibraryStore.ts` (TypeScript)

Added optional `hash` field to store file content hash:
```rust
pub hash: Option<String>, // SHA256 hash for deduplication
```

### 4. Modified Import Logic
**File**: `src-tauri/src/lib.rs` - `import_media_file` command

Import flow now:
1. Compute SHA256 hash of source file
2. Load all existing media items
3. Check if any existing item has matching hash
4. **If match found**: Return existing media item (no duplication!)
5. **If no match**: Proceed with normal import (copy file, create metadata, generate thumbnail)

## Benefits

1. **No Storage Waste**: Same file isn't stored multiple times
2. **Fast Detection**: Hash-based comparison is reliable and efficient
3. **Transparent to User**: If file exists, it's simply reused
4. **Backward Compatible**: 
   - Hash field is optional
   - Old media items without hash will still work
   - New imports will have hash for future deduplication

## How It Works

**Example Scenario:**
1. User imports `video.mp4` → Stored as `abc-123.mp4` with hash `a1b2c3...`
2. User imports same `video.mp4` again (from any location)
3. System computes hash → `a1b2c3...` (matches!)
4. Returns existing media item `abc-123.mp4`
5. No duplicate file created ✓

**Different File, Same Name:**
1. User imports `video.mp4` (version 1)
2. User edits the file externally
3. User imports `video.mp4` (version 2) 
4. Hash is different → New file is imported
5. Both versions exist in library ✓

## Technical Details

- **Hash Algorithm**: SHA256 (64 character hex string)
- **Performance**: 8KB buffer streaming for large files
- **Storage**: Hash stored in media metadata JSON
- **Detection**: O(n) scan through existing items (fast enough for typical libraries)

## Future Enhancements

Potential improvements:
- Add UI indicator when duplicate is detected
- Option to update file name/metadata of existing item
- Hash verification/integrity checking
- Database-style indexing for very large libraries (1000+ items)


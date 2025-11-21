# Video Thumbnail Generation Implementation

## Summary

Implemented automatic video thumbnail generation for the presenter application. When a video is imported into the media library, a thumbnail is automatically generated from the middle frame of the video and saved as a PNG file.

## Implementation Details

### 1. Thumbnail Generation (TypeScript)
**File**: `src/utils/generateVideoThumbnail.ts`
- Uses HTML5 `<video>` and `<canvas>` elements
- Captures frame at the video's midpoint (duration / 2)
- Generates high-quality PNG thumbnail (up to 1280px width, maintains aspect ratio, won't upscale)
- Includes timeout protection (30 seconds) and error handling

### 2. Backend Storage (Rust)
**File**: `src-tauri/src/lib.rs`
- Added `save_video_thumbnail` command: Saves PNG blob to disk as `{media_id}_thumb.png`
- Added `update_media_thumbnail` command: Updates media item metadata with thumbnail filename

### 3. Service Layer (TypeScript)
**File**: `src/services/storage.ts`
- `saveThumbnail(mediaId, blob)`: Converts blob to byte array and invokes Rust command
- `updateMediaThumbnail(mediaId, thumbnailFilename)`: Updates media metadata via Rust command

### 4. Integration
**File**: `src/stores/mediaLibraryStore.ts`
- Modified `importMedia` action to generate thumbnails after successful video import
- Graceful error handling: videos without thumbnails show fallback emoji

## How It Works

1. User imports a video file via the media library
2. Video is copied to the media directory
3. If the file is a video, thumbnail generation begins:
   - Video is loaded in a hidden HTML5 video element
   - Video seeks to the middle point
   - Current frame is captured to canvas
   - Canvas is converted to PNG blob
   - Blob is saved to disk via Rust backend
   - Media item metadata is updated with thumbnail path
4. Video objects display thumbnail in:
   - Media library preview
   - Edit view
   - Show view (presenter preview)
5. Video objects display actual video in:
   - Audience view (actual presentation)
   - When explicitly forced via `forceShowVideo` prop

## Testing

To test the implementation:

1. **Import a video**:
   - Open the media library
   - Click "Import Media"
   - Select a video file (MP4, WebM, MOV, AVI, or MKV)

2. **Verify thumbnail generation**:
   - Check console for "Generating thumbnail for video:" message
   - Check console for "Thumbnail generated successfully:" message
   - The video should display a thumbnail in the media library (not the video player)

3. **Test different contexts**:
   - **Media Library**: Should show thumbnail ✓
   - **Edit View**: Should show thumbnail when video object is on slide ✓
   - **Show View**: Should show thumbnail in presenter preview ✓
   - **Audience View**: Should show actual playing video ✓

4. **Test edge cases**:
   - Very short videos (< 2 seconds)
   - Very long videos
   - Different video formats (MP4, WebM, MOV)
   - Different resolutions (SD, HD, 4K)

## Fallback Behavior

If thumbnail generation fails for any reason:
- Video import still succeeds
- Error is logged to console
- VideoObject component displays 🎬 emoji as fallback
- No impact on video playback functionality

## File Locations

- **Thumbnails**: Stored in the same directory as media files
- **Naming**: `{media_id}_thumb.png`
- **Format**: PNG (up to 1280px width for 720p quality, aspect ratio maintained, won't upscale)
- **Deletion**: Thumbnails are automatically deleted when media item is removed

## Benefits

1. **Performance**: Avoids creating video elements in non-presentation contexts
2. **User Experience**: Faster UI rendering in media library and edit views
3. **Resource Efficiency**: Reduces memory and CPU usage by not loading full videos unnecessarily
4. **Visual Clarity**: Users can see video content at a glance without playing


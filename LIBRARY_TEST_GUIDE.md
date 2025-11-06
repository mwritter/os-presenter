# Library Storage Test Guide

## Overview
This guide will help you test the library add and load functionality.

## Storage Location
Libraries are stored as JSON files in:
- macOS: `~/Library/Application Support/com.tauri.dev/libraries/`
- Each library is saved as `{library_id}.json`

## Test Steps

### 1. Start the Application
```bash
npm run tauri dev
```

### 2. Test Adding a Library
1. Look for the **Library Panel** in the left sidebar
2. Click the **+** button next to "LIBRARY" header
3. Select **"New Library"** from the dropdown menu
4. A new library should appear in the list (named "Library 1")
5. You can add more libraries - they'll be named "Library 2", "Library 3", etc.

### 3. Test Library Persistence
1. Create a few libraries (e.g., 3-4 libraries)
2. Note their names
3. Close the application
4. Restart the application
5. **Expected Result**: All libraries should be loaded and displayed in the sidebar

### 4. Test Library Selection
1. Click on different libraries in the sidebar
2. **Expected Result**: The selected library should be highlighted with a white background

### 5. Verify Storage on Disk
1. Open the storage directory in Finder:
   ```bash
   open ~/Library/Application\ Support/com.tauri.dev/libraries/
   ```
2. You should see JSON files for each library you created
3. Each file is named with a UUID (e.g., `abc123-def456-ghi789.json`)
4. Open one of the JSON files to see the library structure:
   ```json
   {
     "id": "abc123-def456-ghi789",
     "name": "Library 1",
     "slideGroups": [],
     "createdAt": "2025-11-05T12:00:00.000Z",
     "updatedAt": "2025-11-05T12:00:00.000Z"
   }
   ```

### 6. Test Playlists (Bonus)
1. Click the **+** button again
2. Select **"New Playlist"**
3. A new playlist should appear under the "PLAYLIST" section
4. Playlists are stored in: `~/Library/Application Support/com.tauri.dev/playlists/`

## Console Logging

Check the browser console (DevTools) for helpful messages:
- Storage initialization messages
- Library save confirmations
- Error messages if something goes wrong

## Troubleshooting

### Libraries not appearing after restart
1. Check browser console for errors
2. Verify JSON files exist in the storage directory
3. Check if files are valid JSON

### Error saving libraries
1. Check if app has permission to write to the directory
2. Look for error messages in the console
3. Check Rust logs in the terminal

### Libraries not being created
1. Check browser console for JavaScript errors
2. Verify the dropdown menu is working
3. Check if the store actions are being called

## Success Criteria

✅ Can create new libraries via the UI
✅ Libraries appear immediately in the sidebar
✅ Libraries are saved to disk as JSON files
✅ Libraries are loaded on app restart
✅ Libraries can be selected from the sidebar
✅ Each library has a unique ID and timestamp


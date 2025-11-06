# Zustand Store Usage Examples

This directory contains the application's state management stores using Zustand.

## Stores

- **presenterStore**: Manages libraries and playlists
- **mediaLibraryStore**: Manages media content (images and videos)

## Basic Usage

### Reading State

```tsx
import { usePresenterStore, selectLibraries, selectPlaylists } from '@/stores/presenterStore';

function MyComponent() {
  // Option 1: Select specific slice (recommended - only re-renders when this data changes)
  const libraries = usePresenterStore(selectLibraries);
  
  // Option 2: Select multiple slices
  const { libraries, playlists } = usePresenterStore((state) => ({
    libraries: state.libraries,
    playlists: state.playlists,
  }));
  
  // Option 3: Get entire state (not recommended - causes re-renders on any state change)
  const state = usePresenterStore();
  
  return (
    <div>
      {libraries.map(lib => <div key={lib.id}>{lib.name}</div>)}
    </div>
  );
}
```

### Calling Actions

```tsx
import { usePresenterStore } from '@/stores/presenterStore';

function AddLibraryButton() {
  const addLibrary = usePresenterStore((state) => state.addLibrary);
  
  const handleClick = () => {
    addLibrary({
      id: crypto.randomUUID(),
      name: 'New Library',
    });
  };
  
  return <button onClick={handleClick}>Add Library</button>;
}
```

### Selection

```tsx
import { usePresenterStore, selectSelectedLibraryId } from '@/stores/presenterStore';

function LibraryItem({ id, name }: { id: string; name: string }) {
  const selectedId = usePresenterStore(selectSelectedLibraryId);
  const selectLibrary = usePresenterStore((state) => state.selectLibrary);
  const isSelected = selectedId === id;
  
  return (
    <div 
      onClick={() => selectLibrary(id)}
      className={isSelected ? 'bg-blue-500' : 'bg-gray-200'}
    >
      {name}
    </div>
  );
}
```

## Using Outside React Components

You can access the store directly outside React components:

```ts
import { usePresenterStore } from '@/stores/presenterStore';

// Get current state
const libraries = usePresenterStore.getState().libraries;

// Call actions
usePresenterStore.getState().addLibrary({
  id: '123',
  name: 'External Library',
});

// Subscribe to changes
const unsubscribe = usePresenterStore.subscribe(
  (state) => state.libraries,
  (libraries) => {
    console.log('Libraries changed:', libraries);
  }
);
```

## Example: LibraryPanel Component

```tsx
import { usePresenterStore, selectLibraries, selectPlaylists } from '@/stores/presenterStore';

export const LibraryPanel = () => {
  const libraries = usePresenterStore(selectLibraries);
  const playlists = usePresenterStore(selectPlaylists);
  
  return (
    <div className="flex flex-col gap-1 overflow-y-auto h-full">
      <div>
        <LibraryPanelHeader title="Library" />
        {libraries.map((library) => (
          <LibraryItem key={library.id} id={library.id} name={library.name} />
        ))}
      </div>
      <div>
        <LibraryPanelHeader title="Playlist" />
        {playlists.map((playlist) => (
          <PlaylistItem key={playlist.id} id={playlist.id} name={playlist.name} />
        ))}
      </div>
    </div>
  );
};
```

## Example: Fetching Data (Future Implementation)

```tsx
import { usePresenterStore } from '@/stores/presenterStore';
import { useEffect } from 'react';

function DataLoader() {
  const { setLibraries, setPlaylists, setLoading } = usePresenterStore((state) => ({
    setLibraries: state.setLibraries,
    setPlaylists: state.setPlaylists,
    setLoading: state.setLoading,
  }));
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // TODO: Replace with actual Tauri command or API call
        const libraries = await fetch('/api/libraries').then(r => r.json());
        const playlists = await fetch('/api/playlists').then(r => r.json());
        
        setLibraries(libraries);
        setPlaylists(playlists);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [setLibraries, setPlaylists, setLoading]);
  
  return null;
}
```

## Media Library Store

The `mediaLibraryStore` manages all media content (images and videos) accessible to the application.

### MediaItem Type

```ts
export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  source: string; // Path or URL to the media file
  thumbnail?: string; // Optional thumbnail path/URL
  duration?: number; // For videos, duration in seconds
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>; // For any additional metadata
}
```

### Basic Usage

```tsx
import { useMediaLibraryStore, selectMediaItems } from '@/stores/mediaLibraryStore';

function MediaLibrary() {
  const mediaItems = useMediaLibraryStore(selectMediaItems);
  const addMediaItem = useMediaLibraryStore((state) => state.addMediaItem);
  
  const handleAddImage = () => {
    addMediaItem({
      id: crypto.randomUUID(),
      name: 'My Image',
      type: 'image',
      source: '/path/to/image.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };
  
  return (
    <div>
      {mediaItems.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
      <button onClick={handleAddImage}>Add Image</button>
    </div>
  );
}
```

### Filtering by Type

```tsx
import { useMediaLibraryStore, selectImageMedia, selectVideoMedia } from '@/stores/mediaLibraryStore';

function MediaByType() {
  const images = useMediaLibraryStore(selectImageMedia);
  const videos = useMediaLibraryStore(selectVideoMedia);
  
  // Or use the utility method
  const getMediaByType = useMediaLibraryStore((state) => state.getMediaByType);
  const allImages = getMediaByType('image');
  
  return (
    <div>
      <h2>Images ({images.length})</h2>
      <h2>Videos ({videos.length})</h2>
    </div>
  );
}
```

### Using with Slide Component

The store includes a helper function to convert `MediaItem` to `SlideData` for use with the Slide component:

```tsx
import { useMediaLibraryStore, selectSelectedMedia, mediaItemToSlideData } from '@/stores/mediaLibraryStore';
import { Slide } from '@/components/feature/slide/Slide';

function MediaPreview() {
  const selectedMedia = useMediaLibraryStore(selectSelectedMedia);
  
  if (!selectedMedia) {
    return <div>No media selected</div>;
  }
  
  const slideData = mediaItemToSlideData(selectedMedia);
  
  return <Slide id={selectedMedia.id} data={slideData} />;
}
```

### Batch Operations

```tsx
import { useMediaLibraryStore } from '@/stores/mediaLibraryStore';

function BatchMediaManager() {
  const { addMediaItems, removeMediaItems } = useMediaLibraryStore((state) => ({
    addMediaItems: state.addMediaItems,
    removeMediaItems: state.removeMediaItems,
  }));
  
  const handleBulkImport = (files: File[]) => {
    const items = files.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      source: URL.createObjectURL(file),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    addMediaItems(items);
  };
  
  const handleDeleteSelected = (ids: string[]) => {
    removeMediaItems(ids);
  };
  
  return <div>Batch operations...</div>;
}
```


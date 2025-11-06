import { Meta, StoryObj } from "@storybook/react";
import { MediaLibrary } from "./MediaLibrary";
import { useMediaLibraryStore } from "@/stores/mediaLibraryStore";
import { MediaType } from "@/stores/mediaLibraryStore";

export default {
  title: 'Presenter/MediaLibrary',
  component: MediaLibrary,
  parameters: {
    layout: 'padded',
  },
} as Meta<typeof MediaLibrary>;

type Story = StoryObj<typeof MediaLibrary>;

export const Empty: Story = {
  render: () => {
    const store = useMediaLibraryStore.getState();
    store.reset();
    return <MediaLibrary />;
  },
};

export const WithImages: Story = {
  render: () => {
    const store = useMediaLibraryStore.getState();
    store.reset();
    store.setMediaItems([
      {
        id: '1',
        name: 'Mountain Landscape',
        type: 'image',
        source: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        name: 'Ocean View',
        type: 'image',
        source: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=450&fit=crop',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
      {
        id: '3',
        name: 'Forest Path',
        type: 'image',
        source: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=450&fit=crop',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      },
      {
        id: '4',
        name: 'City Skyline',
        type: 'image',
        source: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=450&fit=crop',
        createdAt: new Date('2024-01-04'),
        updatedAt: new Date('2024-01-04'),
      },
    ]);
    return <MediaLibrary />;
  },
};

export const WithVideos: Story = {
  render: () => {
    const store = useMediaLibraryStore.getState();
    store.reset();
    store.setMediaItems([
      {
        id: '1',
        name: 'Big Buck Bunny',
        type: 'video',
        source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: 596,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        name: 'Elephant Dream',
        type: 'video',
        source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        duration: 653,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
      {
        id: '3',
        name: 'For Bigger Blazes',
        type: 'video',
        source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: 15,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      },
    ]);
    return <MediaLibrary />;
  },
};

export const Mixed: Story = {
  render: () => {
    const store = useMediaLibraryStore.getState();
    store.reset();
    store.setMediaItems([
      {
        id: '1',
        name: 'Mountain Landscape',
        type: 'image',
        source: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        name: 'Big Buck Bunny',
        type: 'video',
        source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: 596,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
      {
        id: '3',
        name: 'Ocean View',
        type: 'image',
        source: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=450&fit=crop',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      },
      {
        id: '4',
        name: 'For Bigger Blazes',
        type: 'video',
        source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: 15,
        createdAt: new Date('2024-01-04'),
        updatedAt: new Date('2024-01-04'),
      },
      {
        id: '5',
        name: 'Forest Path',
        type: 'image',
        source: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=450&fit=crop',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05'),
      },
      {
        id: '6',
        name: 'City Skyline',
        type: 'image',
        source: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=450&fit=crop',
        createdAt: new Date('2024-01-06'),
        updatedAt: new Date('2024-01-06'),
      },
    ]);
    return <MediaLibrary />;
  },
};

export const ManyItems: Story = {
  render: () => {
    const store = useMediaLibraryStore.getState();
    store.reset();
    
    const images = [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=450&fit=crop',
    ];
    
    const videos = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    ];
    
    const mediaItems = [];
    
    for (let i = 0; i < 15; i++) {
      const isImage = i % 3 !== 0; // More images than videos
      const source = isImage ? images[i % images.length] : videos[i % videos.length];
      
      mediaItems.push({
        id: `${i + 1}`,
        name: isImage ? `Image ${i + 1}` : `Video ${i + 1}`,
        type: (isImage ? 'image' : 'video') as MediaType,
        source,
        duration: isImage ? undefined : 120 + i * 10,
        createdAt: new Date(2024, 0, i + 1),
        updatedAt: new Date(2024, 0, i + 1),
      });
    }
    
    store.setMediaItems(mediaItems);
    return <MediaLibrary />;
  },
};

export const WithSelection: Story = {
  render: () => {
    const store = useMediaLibraryStore.getState();
    store.reset();
    store.setMediaItems([
      {
        id: '1',
        name: 'Mountain Landscape',
        type: 'image',
        source: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        name: 'Ocean View',
        type: 'image',
        source: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=450&fit=crop',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
      {
        id: '3',
        name: 'Forest Path',
        type: 'image',
        source: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=450&fit=crop',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      },
    ]);
    store.selectMedia('2');
    return <MediaLibrary />;
  },
};


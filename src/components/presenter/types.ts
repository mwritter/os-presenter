import { SlideData } from '@/components/feature/slide/types';

export type SlideGroupMeta = {
  playlistId?: string; // Only present in playlist items
  originLibraryId?: string; // Only present in playlist items
  originSlideGroupId?: string; // Only present in playlist items
  libraryId?: string; // Present in library slide groups
};

export type SlideGroup = {
  meta?: SlideGroupMeta; // Metadata about origin/parent
  title: string;
  slides: SlideData[];
  createdAt: string;
  updatedAt: string;
};

export type Library = {
  id: string;
  name: string;
  slideGroups: SlideGroup[];
  createdAt: string;
  updatedAt: string;
};

export type PlaylistItem = {
  id: string;
  slideGroup: SlideGroup; // Deep copy with meta containing origin info
  order: number;
};

export type Playlist = {
  id: string;
  name: string;
  items: PlaylistItem[];
  createdAt: string;
  updatedAt: string;
};
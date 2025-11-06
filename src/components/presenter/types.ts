import { SlideData } from '@/components/feature/slide/types';

export type SlideGroup = {
  id: string;
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
  libraryId: string;
  slideGroupId: string;
  order: number;
};

export type Playlist = {
  id: string;
  name: string;
  items: PlaylistItem[];
  createdAt: string;
  updatedAt: string;
};
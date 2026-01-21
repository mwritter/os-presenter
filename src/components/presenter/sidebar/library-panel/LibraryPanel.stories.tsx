import { Meta, StoryObj } from "@storybook/react";
import { LibraryPanel } from "./LibraryPanel";
import { usePresenterStore } from "@/stores/presenter/presenterStore";

export default {
  title: 'Presenter/Sidebar/LibraryPanel',
  component: LibraryPanel,
} as Meta<typeof LibraryPanel>;

type Story = StoryObj<typeof LibraryPanel>;

export const Default: Story = {
  render: () => {
    // Set up store data before rendering
    const store = usePresenterStore.getState();
    store.reset();
    const now = new Date().toISOString();
    store.setLibraries([
      { 
        id: '1', 
        name: 'Default', 
        slideGroups: [],
        createdAt: now,
        updatedAt: now,
      },
      { 
        id: '2', 
        name: 'Library 2', 
        slideGroups: [],
        createdAt: now,
        updatedAt: now,
      },
    ]);
    store.setPlaylists([
      { 
        id: '1', 
        name: '01-01-2025', 
        items: [],
        createdAt: now,
        updatedAt: now,
      },
      { 
        id: '2', 
        name: '01-02-2025', 
        items: [],
        createdAt: now,
        updatedAt: now,
      },
      { 
        id: '3', 
        name: '01-03-2025', 
        items: [],
        createdAt: now,
        updatedAt: now,
      },
      { 
        id: '4', 
        name: '01-04-2025', 
        items: [],
        createdAt: now,
        updatedAt: now,
      },
      { 
        id: '5', 
        name: '01-05-2025', 
        items: [],
        createdAt: now,
        updatedAt: now,
      },
    ]);
    return <LibraryPanel />;
  },
};

export const WithSelection: Story = {
  render: () => {
    // Set up store data before rendering
    const store = usePresenterStore.getState();
    store.reset();
    const now = new Date().toISOString();
    store.setLibraries([
      { 
        id: '1', 
        name: 'Default', 
        slideGroups: [],
        createdAt: now,
        updatedAt: now,
      },
      { 
        id: '2', 
        name: 'Library 2', 
        slideGroups: [],
        createdAt: now,
        updatedAt: now,
      },
    ]);
    store.setPlaylists([
      { 
        id: '1', 
        name: '01-01-2025', 
        items: [],
        createdAt: now,
        updatedAt: now,
      },
      { 
        id: '2', 
        name: '01-02-2025', 
        items: [],
        createdAt: now,
        updatedAt: now,
      },
      { 
        id: '3', 
        name: '01-03-2025', 
        items: [],
        createdAt: now,
        updatedAt: now,
      },
    ]);
    // Pre-select a library
    store.selectLibrary('1');
    return <LibraryPanel />;
  },
};

export const Empty: Story = {
  render: () => {
    // Set up store with no data
    const store = usePresenterStore.getState();
    store.reset();
    return <LibraryPanel />;
  },
};
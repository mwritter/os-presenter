import { Slide } from "./Slide";
import { Meta, StoryObj } from "@storybook/react";

export default {
  title: 'Feature/Slide',
  component: Slide,
} as Meta<typeof Slide>;

type Story = StoryObj<typeof Slide>;

export const TextOnly: Story = {
  args: {
    id: '1',
    data: {
      text: {
        color: '#ffffff',
        content: 'Text only - no background (checkerboard pattern)',
      },
    },
  },
};

export const TextWithColorBackground: Story = {
  args: {
    id: '2',
    data: {
      text: {
        content: 'Text with solid color background',
      },
      background: {
        type: 'color',
        value: '#3b82f6',
      },
    },
  },
};

export const TextWithGradientBackground: Story = {
  args: {
    id: '3',
    data: {
      text: {
        content: 'Text with gradient background',
      },
      background: {
        type: 'color',
        value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
    },
  },
};

export const TextWithImageBackground: Story = {
  args: {
    id: '4',
    data: {
      text: {
        content: 'Text over image background',
        color: '#ffffff',
        fontSize: 24,
      },
      background: {
        type: 'image',
        value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop',
      },
    },
  },
};

export const ImageOnly: Story = {
  args: {
    id: '5',
    data: {
      background: {
        type: 'image',
        value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop',
      },
    },
  },
};

export const ColorBackgroundOnly: Story = {
  args: {
    id: '6',
    data: {
      background: {
        type: 'color',
        value: '#10b981',
      },
    },
  },
};

export const EmptySlide: Story = {
  args: {
    id: '7',
    data: {},
  },
};

export const CustomTextStyling: Story = {
  args: {
    id: '8',
    data: {
      text: {
        content: 'Custom styled text',
        fontSize: 32,
        color: '#ef4444',
        alignment: 'left',
      },
      background: {
        type: 'color',
        value: '#fef3c7',
      },
    },
  },
};

export const VideoOnly: Story = {
  args: {
    id: '9',
    data: {
      background: {
        type: 'video',
        value: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      },
    },
  },
};

export const VideoWithText: Story = {
  args: {
    id: '10',
    data: {
      text: {
        content: 'Text overlay on video background',
        fontSize: 28,
        color: '#ffffff',
      },
      background: {
        type: 'video',
        value: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      },
    },
  },
};
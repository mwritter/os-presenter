import { SlideTag } from "./SlideTag";
import { Meta, StoryObj } from "@storybook/react";

export default {
  title: "Feature / SlideTag",
  component: SlideTag,
} as Meta<typeof SlideTag>;

type Story = StoryObj<typeof SlideTag>;

export const Default: Story = {
  render: (args) => (
    <div className="relative w-[200px] aspect-video">
      <div className="h-full w-full bg-black" />
      <SlideTag {...args} />
    </div>
  ),
  args: {
    index: 0,
    showTagGroupName: true,
    slide: {
      id: "1",
      objects: [],
      tagGroupId: '1',
    },
  },
};

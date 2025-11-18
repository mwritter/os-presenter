// Calculate guidelines for snapping to edges and center
export const getMoveableGuidelines = (container?: {
  offsetHeight: number;
  offsetWidth: number;
}) => {
  return container
    ? {
        horizontalGuidelines: [
          0,
          container.offsetHeight / 2,
          container.offsetHeight,
        ],
        verticalGuidelines: [
          0,
          container.offsetWidth / 2,
          container.offsetWidth,
        ],
      }
    : { horizontalGuidelines: [], verticalGuidelines: [] };
};

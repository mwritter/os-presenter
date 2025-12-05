/**
 * Creates a custom ghost element for drag operations on list items
 * Provides a consistent, styled preview for simple list items (sidebar items, etc.)
 */
export const createDragGhost = (
  e: React.DragEvent<HTMLElement>,
  element: HTMLElement
) => {
  const rect = element.getBoundingClientRect();

  const ghost = element.cloneNode(true) as HTMLElement;
  ghost.style.position = "absolute";
  ghost.style.pointerEvents = "none";
  ghost.style.opacity = "0.95";
  ghost.style.padding = "4px 8px";
  ghost.style.minWidth = rect.width + "px";
  ghost.style.backgroundColor = "rgba(38, 38, 38, 0.95)"; // neutral-800 with opacity

  // Clear background
  const removeBgElements = ghost.querySelectorAll(".ghost-no-bg");
  removeBgElements.forEach((element) => {
    if (element instanceof HTMLElement) {
      element.style.backgroundColor = "transparent";
      element.style.padding = "0";
    }
  });

  const removeRingElements = ghost.querySelectorAll(".ghost-no-ring");
  removeRingElements.forEach((element) => {
    if (element instanceof HTMLElement) {
      element.style.boxShadow = "none";
      element.style.border = "none";
    }
  });

  document.body.appendChild(ghost);

  // Calculate cursor offset relative to the element so ghost doesn't jump
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;

  e.dataTransfer.setDragImage(ghost, offsetX, offsetY);

  // Clean up after drag starts
  requestAnimationFrame(() => {
    document.body.removeChild(ghost);
  });
};

/**
 * Creates a custom ghost element for slide drag operations
 * Handles scaled slide content by using explicit dimensions
 */
export const createSlideDragGhost = (
  e: React.DragEvent<HTMLElement>,
  element: HTMLElement
) => {
  // Get the element's actual rendered dimensions (accounts for CSS transforms/scaling)
  const rect = element.getBoundingClientRect();

  const ghost = element.cloneNode(true) as HTMLElement;
  ghost.style.position = "absolute";
  ghost.style.pointerEvents = "none";
  ghost.style.opacity = "0.9";
  ghost.style.borderRadius = "4px";
  ghost.style.overflow = "hidden";
  ghost.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";

  // Set explicit dimensions to match the rendered size (fixes scale issues)
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;

  // Reset any transforms that might cause sizing issues
  ghost.style.transform = "none";

  document.body.appendChild(ghost);

  // Calculate cursor offset relative to the element so ghost doesn't jump
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;

  e.dataTransfer.setDragImage(ghost, offsetX, offsetY);

  // Clean up after drag starts
  requestAnimationFrame(() => {
    document.body.removeChild(ghost);
  });
};

/**
 * Creates a custom ghost element for dragging multiple list items
 * Shows the item with a badge indicating the count
 */
export const createMultiItemDragGhost = (
  e: React.DragEvent<HTMLElement>,
  element: HTMLElement,
  count: number
) => {
  const rect = element.getBoundingClientRect();

  // Create a container for the ghost
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.pointerEvents = "none";

  const ghost = element.cloneNode(true) as HTMLElement;
  ghost.style.position = "relative";
  ghost.style.opacity = "0.95";
  ghost.style.padding = "4px 8px";
  ghost.style.borderRadius = "4px";
  ghost.style.minWidth = "150px";
  ghost.style.backgroundColor = "rgba(38, 38, 38, 0.95)";
  ghost.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";

  // Clear any selection/hover backgrounds
  const [firstChild] = ghost.querySelectorAll("*");
  if (firstChild instanceof HTMLElement) {
    firstChild.style.backgroundColor = "transparent";
    firstChild.style.padding = "0";
  }

  // Create count badge
  const badge = document.createElement("div");
  badge.textContent = String(count);
  badge.style.position = "absolute";
  badge.style.top = "-8px";
  badge.style.right = "-8px";
  badge.style.backgroundColor = "#3b82f6"; // blue-500
  badge.style.color = "white";
  badge.style.fontSize = "11px";
  badge.style.fontWeight = "600";
  badge.style.minWidth = "18px";
  badge.style.height = "18px";
  badge.style.borderRadius = "9px";
  badge.style.display = "flex";
  badge.style.alignItems = "center";
  badge.style.justifyContent = "center";
  badge.style.padding = "0 5px";
  badge.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.3)";
  badge.style.zIndex = "10";

  container.appendChild(ghost);
  container.appendChild(badge);

  document.body.appendChild(container);

  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;

  e.dataTransfer.setDragImage(container, offsetX, offsetY);

  requestAnimationFrame(() => {
    document.body.removeChild(container);
  });
};

/**
 * Creates a custom ghost element for dragging multiple slides
 * Shows the slide with a badge indicating the count
 */
export const createMultiSlideDragGhost = (
  e: React.DragEvent<HTMLElement>,
  element: HTMLElement,
  count: number
) => {
  // Get the element's actual rendered dimensions
  const rect = element.getBoundingClientRect();

  // Create a container for the ghost with relative positioning for the badge
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.pointerEvents = "none";

  const ghost = element.cloneNode(true) as HTMLElement;
  ghost.style.position = "relative";
  ghost.style.opacity = "0.9";
  ghost.style.borderRadius = "4px";
  ghost.style.overflow = "hidden";
  ghost.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;
  ghost.style.transform = "none";

  // Create count badge
  const badge = document.createElement("div");
  badge.textContent = String(count);
  badge.style.position = "absolute";
  badge.style.top = "-8px";
  badge.style.right = "-8px";
  badge.style.backgroundColor = "#3b82f6"; // blue-500
  badge.style.color = "white";
  badge.style.fontSize = "12px";
  badge.style.fontWeight = "600";
  badge.style.minWidth = "20px";
  badge.style.height = "20px";
  badge.style.borderRadius = "10px";
  badge.style.display = "flex";
  badge.style.alignItems = "center";
  badge.style.justifyContent = "center";
  badge.style.padding = "0 6px";
  badge.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.3)";
  badge.style.zIndex = "10";

  // Add stacked effect behind main ghost
  const stackedSlide1 = document.createElement("div");
  stackedSlide1.style.position = "absolute";
  stackedSlide1.style.top = "4px";
  stackedSlide1.style.left = "4px";
  stackedSlide1.style.width = `${rect.width}px`;
  stackedSlide1.style.height = `${rect.height}px`;
  stackedSlide1.style.backgroundColor = "#374151"; // gray-700
  stackedSlide1.style.borderRadius = "4px";
  stackedSlide1.style.opacity = "0.6";

  if (count > 2) {
    const stackedSlide2 = document.createElement("div");
    stackedSlide2.style.position = "absolute";
    stackedSlide2.style.top = "8px";
    stackedSlide2.style.left = "8px";
    stackedSlide2.style.width = `${rect.width}px`;
    stackedSlide2.style.height = `${rect.height}px`;
    stackedSlide2.style.backgroundColor = "#1f2937"; // gray-800
    stackedSlide2.style.borderRadius = "4px";
    stackedSlide2.style.opacity = "0.4";
    container.appendChild(stackedSlide2);
  }

  container.appendChild(stackedSlide1);
  container.appendChild(ghost);
  container.appendChild(badge);

  document.body.appendChild(container);

  // Calculate cursor offset
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;

  e.dataTransfer.setDragImage(container, offsetX, offsetY);

  // Clean up after drag starts
  requestAnimationFrame(() => {
    document.body.removeChild(container);
  });
};

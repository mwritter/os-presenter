import { useState } from "react";

export const useSearchNavigation = ({
  itemsLength,
}: {
  itemsLength: number;
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const resetSelectedIndex = () => setSelectedIndex(null);

  const onPrevious = (e: React.KeyboardEvent) => {
    e.preventDefault();
    setSelectedIndex((i) => (i !== null && i > 0 ? i - 1 : 0));
  };

  const onNext = (e: React.KeyboardEvent) => {
    e.preventDefault();
    setSelectedIndex((i) => {
      if (i === null) return 0;
      return i !== null && i < itemsLength - 1 ? i + 1 : itemsLength - 1;
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      onPrevious(e);
    } else if (e.key === "ArrowDown") {
      onNext(e);
    } else if (e.key === "Tab" && e.shiftKey) {
      onPrevious(e);
    } else if (e.key === "Tab") {
      onNext(e);
    }
  };

  return {
    selectedIndex,
    onPrevious,
    onNext,
    resetSelectedIndex,
    setSelectedIndex,
    onKeyDown,
  };
};

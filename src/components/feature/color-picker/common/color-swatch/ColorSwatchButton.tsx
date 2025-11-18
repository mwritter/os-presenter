interface ColorSwatchButtonProps {
  color: string;
  onClick: () => void;
}

export const ColorSwatchButton = ({
  color,
  onClick,
}: ColorSwatchButtonProps) => {
  return (
    <button
      className="shrink-0 aspect-video h-5 rounded-xs"
      style={{ backgroundColor: color }}
      onClick={onClick}
    />
  );
};

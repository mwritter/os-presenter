import { ButtonHTMLAttributes } from "react";

export const ColorSwatchTriggerButton = ({
  color,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  color: string;
  className?: string;
}) => {
  return (
    <button
      {...props}
      className="aspect-video w-10 rounded-tl-sm rounded-bl-sm"
      style={{ backgroundColor: color }}
    />
  );
};

import { ButtonHTMLAttributes } from "react";

export const ColorSwatchTriggerButton = ({
  hexColor,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  hexColor: string;
  className?: string;
}) => {
  return (
    <button
      {...props}
      className="aspect-video w-10 rounded-tl-sm rounded-bl-sm"
      style={{ backgroundColor: hexColor }}
    />
  );
};

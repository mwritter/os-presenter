import { ButtonHTMLAttributes } from "react";

export const ColorWheelTriggerButton = ({
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) => {
  return (
    <button
      {...props}
      style={{
        marginRight: "5px",
        height: "15px",
        width: "15px",
        borderRadius: "50%",
        cursor: "pointer",
        background: `conic-gradient(
      from 0deg,
      #ff8a95 0deg,
      #ffe88a 60deg,
      #8aff9f 120deg,
      #8ad4ff 180deg,
      #b48aff 240deg,
      #ff8af0 300deg,
      #ff8a95 360deg
    )`,
      }}
    />
  );
};

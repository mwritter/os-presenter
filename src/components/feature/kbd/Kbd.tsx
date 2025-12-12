import { platform } from "@tauri-apps/plugin-os";
import { Command, CornerDownLeftIcon } from "lucide-react";

const isMac = () => platform() === "macos";

export const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="min-w-5 h-5 px-1.5 inline-flex items-center justify-center text-lg font-medium bg-white/10 rounded border border-white/20">
    {children}
  </kbd>
);

export const ModifierKey = () => (
  <Kbd>
    {isMac() ? (
      <Command className="size-4" />
    ) : (
      <span className="text-xs">Ctrl</span>
    )}
  </Kbd>
);

export const EnterKey = () => (
  <Kbd>
    <CornerDownLeftIcon className="size-4" />
  </Kbd>
);

import { Button } from "@/components/ui/button";
import { HandshakeState } from "@/hooks/use-video-state";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface PreviewPanelVideoSyncProps {
  handshakeState: HandshakeState;
  onRetryHandshake: () => void;
}

export const PreviewPanelVideoSync = ({
  handshakeState,
  onRetryHandshake,
}: PreviewPanelVideoSyncProps) => {
  const [wait, setWait] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // only show a status after 3 seconds of waiting for handshake
  useEffect(() => {
    if (timerRef.current) return;
    timerRef.current = setTimeout(() => {
      setWait(false);
    }, 3000);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex justify-center items-center w-full max-w-[90%] mx-auto h-8">
      {!wait && handshakeState === "pending" && (
        <div className="flex items-center justify-center gap-2 text-xs text-amber-400">
          <RefreshCw className="size-3 animate-spin" />
          <span>Syncing video...</span>
        </div>
      )}
      {!wait && handshakeState === "failed" && (
        <div className="flex items-center justify-center gap-2 text-xs text-red-400">
          <AlertCircle className="size-3" />
          <span>Video sync failed</span>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={onRetryHandshake}
          >
            <RefreshCw className="size-3 mr-1" />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};

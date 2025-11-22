// Video control event types for syncing between presenter and audience views

export type VideoControlAction = "play" | "pause" | "seek" | "volume" | "rate";

export interface VideoControlCommand {
  slideId: string;
  action: VideoControlAction;
  value?: number; // for seek (seconds), volume (0-1), rate (0.5-2)
}

export interface VideoStateUpdate {
  slideId: string;
  currentTime: number;
  duration: number;
  paused: boolean;
  volume: number;
  loop: boolean;
  playbackRate: number;
  buffered: number; // percentage (0-100)
  readyState: number; // HTMLMediaElement.readyState (0-4)
  error: string | null;
  seeking: boolean;
}

// Handshake event payloads
export interface VideoReadyPayload {
  slideId: string;
  videoType: "background" | "object";
}

export interface VideoAckPayload {
  slideId: string;
}

// Event names
export const VIDEO_CONTROL_EVENT = "video:control";
export const VIDEO_STATE_UPDATE_EVENT = "video:state-update";
export const VIDEO_READY_EVENT = "video:ready";
export const VIDEO_ACK_EVENT = "video:ack";


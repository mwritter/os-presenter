// Video control event types for syncing between presenter and audience views

export type VideoControlAction =
  | "play"
  | "pause"
  | "seek"
  | "volume"
  | "rate"
  | "skip_forward"
  | "skip_backward";

export interface VideoControlCommand {
  slideId: string;
  action: VideoControlAction;
  value?: number; // for seek (seconds), volume (0-1), rate (0.5-2), skip seconds (default 10)
}

/** Playback state reported by the authoritative (audience) video element. */
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
  updatedAt: number; // Unix timestamp in milliseconds
}

// Event names
export const VIDEO_CONTROL_EVENT = "video:control";
export const VIDEO_STATE_UPDATE_EVENT = "video:state-update";
/** DOM custom event for synchronous delivery in same window (keeps user gesture for video.play()) */
export const PRESENTER_VIDEO_CONTROL_EVENT = "presenter-video-control";
/** BroadcastChannel name for direct cross-window video control (bypasses Tauri IPC) */
export const VIDEO_BROADCAST_CHANNEL = "video-control";
/** BroadcastChannel name for audience -> presenter playback state updates. */
export const VIDEO_STATE_BROADCAST_CHANNEL = "video-state";
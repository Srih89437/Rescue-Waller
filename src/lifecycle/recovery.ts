import type { SessionState } from '../parser/types';
export type PlaybackStatus = 'idle' | 'running' | 'complete';
export interface PlaybackState { status: PlaybackStatus; visibleSteps: number; session: SessionState }
export function initialPlayback(session: SessionState): PlaybackState { return { status:'idle', visibleSteps:0, session }; }
export function advancePlayback(playback: PlaybackState, total: number): PlaybackState { const visibleSteps = Math.min(playback.visibleSteps + 1, total); return { ...playback, visibleSteps, status: visibleSteps === total ? 'complete' : 'running' }; }

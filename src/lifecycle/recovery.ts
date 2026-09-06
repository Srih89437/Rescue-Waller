import type { NormalizedEvent, ParserDiagnostic, SessionState } from '../parser/types';
import { buildSessionState } from './session';
export type PlaybackStatus='idle'|'running'|'complete';
export interface PlaybackState{status:PlaybackStatus;cursor:number;allEvents:NormalizedEvent[];diagnostics:ParserDiagnostic[];session:SessionState}
export function initialPlayback(events:NormalizedEvent[],diagnostics:ParserDiagnostic[]=[]):PlaybackState{return{status:'idle',cursor:0,allEvents:events,diagnostics,session:buildSessionState([],diagnostics)}}
export function advancePlayback(playback:PlaybackState):PlaybackState{const cursor=Math.min(playback.cursor+1,playback.allEvents.length);return{...playback,cursor,status:cursor===playback.allEvents.length?'complete':'running',session:buildSessionState(playback.allEvents.slice(0,cursor),playback.diagnostics)}}

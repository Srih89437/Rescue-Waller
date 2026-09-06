import { useSyncExternalStore } from 'react';
import { normalizeRecord } from './parser';
import type { NormalizedEvent } from './parser/types';

export type LiveConnection = 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED' | 'PLAYBACK';
export interface RuntimeSnapshot { connection: LiveConnection; events: NormalizedEvent[]; rawEvents: Record<string, unknown>[]; session: Record<string, unknown> | null; lastUpdatedAt?: string; }
const empty: RuntimeSnapshot = { connection: 'CONNECTING', events: [], rawEvents: [], session: null };
let snapshot = empty;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(listener => listener());
const eventId = (event: Record<string, unknown>) => String(event.messageId ?? event.eventId ?? `${event.session_id ?? event.sessionId ?? 'unknown'}:${event.timestamp ?? ''}:${event.type ?? ''}`);
const apply = (raw: Record<string, unknown>) => { if (snapshot.rawEvents.some(event => eventId(event) === eventId(raw))) return; const normalized = normalizeRecord(raw); snapshot = { ...snapshot, rawEvents: [...snapshot.rawEvents, raw], events: normalized ? [...snapshot.events, normalized] : snapshot.events, lastUpdatedAt: typeof raw.timestamp === 'string' ? raw.timestamp : snapshot.lastUpdatedAt, session: { ...(snapshot.session ?? {}), lastEvent: raw, updatedAt: raw.timestamp } }; emit(); };
export const runtimeStore = {
  subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); },
  getSnapshot() { return snapshot; },
  async hydrate() { try { const response = await fetch('http://127.0.0.1:8787/api/state'); const data = await response.json(); const rawEvents: Record<string, unknown>[] = Array.isArray(data.events) ? data.events : []; snapshot = { ...snapshot, session: data, rawEvents, events: rawEvents.map(normalizeRecord).filter((event): event is NormalizedEvent => Boolean(event)), lastUpdatedAt: data.updatedAt }; emit(); } catch { snapshot = { ...snapshot, connection: 'DISCONNECTED' }; emit(); } },
  connect() { const source = new EventSource('http://127.0.0.1:8787/api/events/stream'); snapshot = { ...snapshot, connection: 'CONNECTING' }; emit(); source.onopen = () => { snapshot = { ...snapshot, connection: 'CONNECTED' }; emit(); }; source.onerror = () => { snapshot = { ...snapshot, connection: 'RECONNECTING' }; emit(); }; source.addEventListener('ready', event => { const status = JSON.parse((event as MessageEvent).data).status; snapshot = { ...snapshot, connection: status === 'PLAYBACK' ? 'PLAYBACK' : 'CONNECTED' }; emit(); }); source.onmessage = event => { try { apply(JSON.parse(event.data)); } catch { /* malformed SSE payload is ignored without disrupting the stream */ } }; return () => source.close(); },
  apply,
};
export const useRuntime = () => useSyncExternalStore(runtimeStore.subscribe, runtimeStore.getSnapshot, runtimeStore.getSnapshot);

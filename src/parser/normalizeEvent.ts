import { normalizeRecord } from './index';
import type { NormalizedEvent, RawRecord } from './types';
/** Backwards-compatible public normalizer. Lifecycle callers use the adapter registry. */
export function normalizeEvent(record: RawRecord): NormalizedEvent { const normalized=normalizeRecord(record); if (normalized) return normalized; return { type:'unknown', rawType:typeof record.type === 'string' ? record.type : 'unclassified', timestamp:typeof record.timestamp === 'string' ? record.timestamp : new Date(0).toISOString(), sessionId:typeof record.session_id === 'string' ? record.session_id : 'unknown-session', data:record, sourceFormat:'original-jsonl' }; }

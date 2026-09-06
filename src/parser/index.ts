import { originalFormatAdapter, type TranscriptAdapter } from './adapters/originalFormat';
import type { NormalizedEvent, RawRecord } from './types';
export const adapters: TranscriptAdapter[] = [originalFormatAdapter];
export function detectFormat(record: unknown): TranscriptAdapter | undefined { return adapters.find(adapter => adapter.canHandle(record)); }
export function normalizeRecord(record: RawRecord): NormalizedEvent | null { return detectFormat(record)?.normalize(record) ?? null; }

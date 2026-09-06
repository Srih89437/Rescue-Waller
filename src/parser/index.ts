import { originalFormatAdapter, type TranscriptAdapter } from './adapters/originalFormat';
import { changedFormatAdapter } from './adapters/changedFormat';
import type { NormalizedEvent, RawRecord } from './types';
export const adapters: TranscriptAdapter[] = [originalFormatAdapter, changedFormatAdapter];
export function detectFormat(record: unknown): TranscriptAdapter | undefined { return adapters.find(adapter => adapter.canHandle(record)); }
export function normalizeRecord(record: RawRecord): NormalizedEvent | null { return detectFormat(record)?.normalize(record) ?? null; }

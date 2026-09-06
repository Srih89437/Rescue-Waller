import type { NormalizedEvent, RawRecord } from '../types';
import type { TranscriptAdapter } from './originalFormat';

/**
 * Reserved adapter slot for the mentor-confirmed Track 3 Curveball.
 * It intentionally matches nothing until the real schema is supplied.
 */
export const changedFormatAdapter: TranscriptAdapter = {
  format: 'changed-format',
  canHandle(_record: unknown): _record is RawRecord { return false; },
  normalize(_record: RawRecord): NormalizedEvent | null { return null; },
};

export const changedFormatStatus = 'AWAITING_MENTOR_FIXTURE' as const;

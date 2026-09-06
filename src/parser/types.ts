export type RawRecord = Record<string, unknown>;
export type KnownEventType = 'session_started' | 'user_prompt' | 'agent_response' | 'tool_call' | 'tool_result' | 'file_read' | 'file_changed' | 'test_execution' | 'checkpoint_created' | 'session_ended';
export type EventType = KnownEventType | 'unknown';
export type SessionStatus = 'active' | 'completed' | 'partial' | 'failed';
export type RecoveryStage = 'detected' | 'analyzing' | 'context_restored' | 'investigating' | 'fixing' | 'testing' | 'verified' | 'checkpointed' | 'partial' | 'failed';
export interface NormalizedEvent { type: EventType; rawType: string; timestamp: string; sessionId: string; messageId?: string; data: Record<string, unknown>; sourceFormat: 'original-jsonl'; }
export interface ParserDiagnostic { line: number; errorType: 'MALFORMED_JSON' | 'INVALID_RECORD' | 'UNSUPPORTED_FORMAT'; message: string; }
export interface Session { sessionId: string; agent: string; repository: string; branch: string; status: SessionStatus; }
export interface TestAttempt { passed: number; total: number; success: boolean; timestamp: string; }
export interface TestState { targeted: { passed: number; total: number }; attempts: TestAttempt[]; regression: 'waiting' | 'pass' | 'fail'; overall: 'waiting' | 'verified' | 'failed'; }
export interface Incident { incidentId: string; title: string; repository: string; branch: string; status: SessionStatus; detectedFailure: string; affectedFiles: string[]; currentStage: RecoveryStage; recoveryResult: string; }
export interface SessionState { session: Session; intent: string; events: NormalizedEvent[]; filesRead: string[]; filesChanged: string[]; tests: TestState; failures: string[]; decisions: string[]; checkpoint?: { createdAt: string; status: 'created' }; unresolvedIssues: string[]; unknownEventCount: number; unknownEvents: NormalizedEvent[]; diagnostics: ParserDiagnostic[]; stage: RecoveryStage; incident: Incident; }

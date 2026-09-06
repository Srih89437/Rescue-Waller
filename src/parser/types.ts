export type RawRecord = Record<string, unknown>;
export type EventType = 'session_started' | 'user_prompt' | 'agent_response' | 'tool_call' | 'tool_result' | 'file_read' | 'file_changed' | 'test_execution' | 'checkpoint_created' | 'session_ended' | 'unknown';
export interface NormalizedEvent { type: EventType; timestamp: string; sessionId: string; messageId?: string; data: Record<string, unknown>; sourceFormat: 'original-jsonl'; }
export interface Session { sessionId: string; agent: string; repository: string; branch: string; status: 'active' | 'completed' | 'failed'; }
export interface TestState { targeted: { passed: number; total: number }; regression: 'waiting' | 'pass' | 'fail'; overall: 'waiting' | 'verified' | 'failed'; }
export interface SessionState { session: Session; intent: string; events: NormalizedEvent[]; filesRead: string[]; filesChanged: string[]; tests: TestState; failures: string[]; decisions: string[]; checkpoint?: { createdAt: string; status: 'created' }; unresolvedIssues: string[]; status: 'idle' | 'resolving' | 'verified' | 'failed'; }

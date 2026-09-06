# Code Rescue

## One-Sentence Summary

Code Rescue reconstructs an interrupted coding repair and preserves the reasoning needed for a safe next-agent handoff.

## Problem, Intended User and Why It Matters

Developers supervising autonomous coding agents need more than a final diff after a failure: they need the agent's intent, assumptions, failures, corrections, evidence, and recommended continuation. Phase 1 demonstrates that recovery story for a developer using a known original JSONL transcript.

## Selected Entire Track

Entire is essential because the product's central value is continuity: a checkpoint must retain the reasoning and verification evidence that a subsequent agent needs. The Phase 1 context structure is deliberately shaped for that workflow. No remote Entire checkpoint ID is fabricated.

## Architecture

`JSONL → Parser → Normalizer → Lifecycle → Session State → Rescue Engine → UI → Checkpoint Context`

The raw fixture is parsed line-by-line, normalized into a stable internal representation, and consumed by lifecycle functions. The dashboard derives session data from that reconstruction. Deterministic playback exposes the same recovery progression visibly and is labelled simulated.

## Phase 1 Status

Implemented: responsive command-center UI; interactive navigation; original JSONL fixture; parser, normalizer and lifecycle foundations; SessionState; checkpoint context and summary foundations; deterministic rescue animation; state-driven test UI; test coverage; documentation.

## Initial Assumptions

Code Rescue currently assumes the agent transcript has a stable, known event representation. This assumption will be revisited when the Track 3 Curveball is introduced.

## Phase 2 — Session Reconstruction

Phase 2 introduces a format-adapter registry. The original adapter is the only supported adapter and recognizes the documented original JSONL marker and required session fields. It produces `NormalizedEvent`; lifecycle reduction has no dependency on raw transcript keys.

The system distinguishes four cases: known events are reduced; valid unknown events are preserved with diagnostics; malformed JSON becomes a structured `MALFORMED_JSON` diagnostic and does not stop later records; an EOF without `session_ended` yields a `PARTIAL` session with its recovered files, tests, intent, and reasoning intact. Local deterministic playback applies one normalized event per update to the same reducer used for reconstruction.

This prepares a clean insertion point for a future format adapter. It does not claim that the Noon Curveball has arrived or that Entire Graph analysis has been performed.

## Completion Foundations

An explicit incident state machine validates repair and retry transitions. An in-process event bus tracks connection state and rejects duplicate events. Verification command configuration is allowlisted to `npm test` and `npm run build`; it does not execute transcript-provided commands. These foundations are tested, but a production transport and server-side verification runner are still pending.

## Known Limitations

- The new transcript format is not implemented yet.
- The future Curveball format adapter is not implemented.
- Graph impact analysis remains a later phase.
- Graph impact analysis will be implemented in a later phase.
- Playback is deterministic local simulation, not a live backend feed.

## Initial Entire Checkpoint

### Initial understanding

The product must recover not simply a patch, but the reasoning around a broken software repair so another agent can resume safely.

### Intended architecture and decisions

Use original JSONL as the only demo source. Normalize records before lifecycle logic, derive SessionState before UI rendering, and make playback stateful rather than text-only. Keep graph analysis as an honest placeholder in Phase 1.

### Work completed

Established the React command center and all requested Phase 1 navigation pages; implemented parsing, normalization, session reconstruction, summary/context generation, rescue playback, tests, and documentation.

### Tests

The suite covers JSONL parsing, event normalization, SessionState construction, summary generation, checkpoint context generation, and playback transitions. Run `npm test` and `npm run build` before shipping.

### Known limitations and open risks

Transcript schema is assumed stable. Browser-only playback does not yet model network reconnects or partial streams. Graph analysis and the future Curveball adaptation are intentionally deferred.

### Next agent

First validate any incoming Curveball transcript against a new adapter without changing lifecycle invariants. Preserve `NormalizedEvent` as the boundary; then add incomplete/unknown event recovery and actual graph analysis only as required.

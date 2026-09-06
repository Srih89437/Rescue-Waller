# Code Rescue

> Code Rescue doesn't just repair broken software — it rescues the reasoning behind the fix, so the next agent can continue safely instead of starting from zero.

## Problem

When an autonomous coding run fails midway through a repair, its useful reasoning, assumptions, and evidence are easily lost. Code Rescue reconstructs a known agent transcript into a safe recovery narrative and a durable checkpoint.

The intended user is a developer supervising AI-assisted software recovery. This matters because a technically correct patch without the reasoning behind it makes the next handoff slower and riskier.

## Architecture

`Original JSONL → format adapter → NormalizedEvent → lifecycle reducer → SessionState → deterministic rescue playback → React UI → checkpoint context`

## Phase 2: session reconstruction

The supplied original-format fixture is the demonstration source of truth. A constrained `originalFormatAdapter` owns all raw-shape detection; lifecycle and UI code consume `NormalizedEvent` only. This makes a future transcript adapter additive without coupling recovery behavior to its raw format.

Valid-but-unrecognized original-format events are preserved as `unknown` events with a diagnostic count. Malformed JSON is recorded separately with a structured line diagnostic and later lines continue to process. A transcript that reaches EOF without `session_ended` retains its recovered state and is marked `PARTIAL`.

Playback is deterministic and local: each tick reduces the next reconstructed normalized event into application state. It is not presented as an external agent connection.

## Stack

React, TypeScript, Vite, Framer Motion, Node.js tooling, and a lightweight JSONL lifecycle layer. No database, authentication, cloud services, or graph analysis are included in Phase 1.

## Install and run

```bash
npm install
npm run dev
npm run server
```

Open the displayed local URL, select **Overview**, and choose **START RESCUE**. Navigate through the working sidebar to inspect context, tests, checkpoints, graph placeholder, and session history. The local transport exposes `/api/health`, SSE at `/api/events/stream`, ingestion at `/api/events`, and an allowlisted verification runner at `/api/verification/run`.

## Test and build

```bash
npm test
npm run build
```

## Current phase and limitations

Phase 2 supports the known original format, unknown-event preservation, malformed-record diagnostics, incomplete-session recovery, and state-driven playback. The Noon Curveball format, graph impact analysis, production websocket transport, and remote Entire checkpoint IDs remain intentionally unimplemented.

## Completion foundations

The repository now also includes a deterministic incident-transition model, a deduplicating in-process event bus with explicit connection states, and a strict verification command allowlist (`npm test`, `npm run build`). These are local foundations only: no transcript command is executed, no live backend transport is claimed, and command execution remains a later server-side integration step.

## Future Curveball work

Add the requested new transcript adapter, broaden error recovery, then introduce actual Entire Graph impact analysis only when the Buildathon workflow requires it.

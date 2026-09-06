# Code Rescue

> Code Rescue doesn't just repair broken software — it rescues the reasoning behind the fix, so the next agent can continue safely instead of starting from zero.

## Problem

When an autonomous coding run fails midway through a repair, its useful reasoning, assumptions, and evidence are easily lost. Code Rescue reconstructs a known agent transcript into a safe recovery narrative and a durable checkpoint.

The intended user is a developer supervising AI-assisted software recovery. This matters because a technically correct patch without the reasoning behind it makes the next handoff slower and riskier.

## Architecture

`Original JSONL → parser → normalizer → lifecycle → SessionState → deterministic rescue playback → React UI → checkpoint context`

The initial fixture is the demonstration source of truth. UI data is reconstructed from it; the playback is explicitly labelled simulated.

## Stack

React, TypeScript, Vite, Framer Motion, Node.js tooling, and a lightweight JSONL lifecycle layer. No database, authentication, cloud services, or graph analysis are included in Phase 1.

## Install and run

```bash
npm install
npm run dev
```

Open the displayed local URL, select **Overview**, and choose **START RESCUE**. Navigate through the working sidebar to inspect context, tests, checkpoints, graph placeholder, and session history.

## Test and build

```bash
npm test
npm run build
```

## Current phase and limitations

This is Phase 1 only. It supports a stable, original JSONL transcript representation and deterministic demo playback. The new Curveball transcript format, broad unknown/incomplete-event handling, graph impact analysis, production websocket transport, and remote Entire checkpoint IDs are intentionally not implemented.

## Future Curveball work

Add the requested new transcript adapter, broaden error recovery, then introduce actual Entire Graph impact analysis only when the Buildathon workflow requires it.

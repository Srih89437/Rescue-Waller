import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const repo = new URL('.', import.meta.url).pathname;

/**
 * Thin, local-only bridge to the installed Entire Graph CLI.  The CLI is the
 * source of truth; this module deliberately does not synthesize graph data.
 */
export async function graphCapabilities() {
  const { stdout } = await run('entire', ['graph', 'capabilities', '--json'], {
    cwd: repo,
    timeout: 15_000,
    maxBuffer: 2_000_000,
  });
  return JSON.parse(stdout);
}

export async function graphSearch(query) {
  const clean = validateQuery(query);
  const { stdout } = await run('entire', [
    'graph', 'search', '--repo', '.', '--profile', 'full', '--query', clean,
  ], { cwd: repo, timeout: 30_000, maxBuffer: 4_000_000 });
  return JSON.parse(stdout);
}

export async function graphImpact(symbol) {
  const clean = validateQuery(symbol);
  const { stdout } = await run('entire', [
    'graph', 'impact', '--repo', '.', '--symbol', clean,
  ], { cwd: repo, timeout: 30_000, maxBuffer: 4_000_000 });
  return { symbol: clean, format: 'text', output: stdout };
}

function validateQuery(value) {
  if (typeof value !== 'string' || value.trim().length < 1 || value.length > 300) {
    throw new Error('query must be a non-empty string of at most 300 characters');
  }
  return value.trim();
}

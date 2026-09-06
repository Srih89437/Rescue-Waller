const transport = document.createElement('div');
transport.className = 'live-transport';
transport.setAttribute('role', 'status');
transport.setAttribute('aria-live', 'polite');
transport.textContent = 'CONNECTING · live transport';
document.body.append(transport);

let source: EventSource | undefined;
let reconnectTimer: number | undefined;
const setStatus = (status: string, tone: 'live' | 'warning' | 'muted' = 'muted') => {
  transport.dataset.tone = tone;
  transport.textContent = `${status} · live transport`;
};
const connect = () => {
  if (source) source.close();
  setStatus('CONNECTING');
  source = new EventSource('http://127.0.0.1:8787/api/events/stream');
  source.onopen = () => setStatus('CONNECTED', 'live');
  source.onerror = () => {
    setStatus('RECONNECTING', 'warning');
    source?.close();
    if (reconnectTimer === undefined) reconnectTimer = window.setTimeout(() => { reconnectTimer = undefined; connect(); }, 2500);
  };
  source.addEventListener('ready', event => {
    try { setStatus(JSON.parse((event as MessageEvent).data).status ?? 'CONNECTED', 'live'); } catch { setStatus('CONNECTED', 'live'); }
  });
  source.addEventListener('complete', () => setStatus('PLAYBACK COMPLETE', 'muted'));
};
connect();

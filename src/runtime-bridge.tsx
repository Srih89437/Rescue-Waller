import { createRoot } from 'react-dom/client';
import { useEffect } from 'react';
import { runtimeStore, useRuntime } from './runtimeStore';

function RuntimeBridge() {
  const state = useRuntime();
  useEffect(() => { void runtimeStore.hydrate(); const disconnect = runtimeStore.connect(); return disconnect; }, []);
  return <div className="runtime-source" data-connection={state.connection}><span className="runtime-dot" />{state.connection} · {state.events.length} events</div>;
}

createRoot(document.getElementById('runtime-root')!).render(<RuntimeBridge />);

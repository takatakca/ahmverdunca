function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createDrainController({ graceMs = 12_000 } = {}) {
  let draining = false;
  let drainPromise = null;
  const connections = new Set();
  const emptyWaiters = new Set();

  function notifyEmpty() {
    if (connections.size !== 0) return;
    for (const resolve of emptyWaiters) resolve();
    emptyWaiters.clear();
  }

  function register(connection) {
    if (!connection || typeof connection !== 'object') throw new TypeError('connection is required');
    connections.add(connection);
    let removed = false;
    return () => {
      if (removed) return;
      removed = true;
      connections.delete(connection);
      notifyEmpty();
    };
  }

  async function waitForEmpty(timeoutMs) {
    if (connections.size === 0) return true;
    let resolveEmpty;
    const emptied = new Promise((resolve) => {
      resolveEmpty = resolve;
      emptyWaiters.add(resolve);
    });
    const result = await Promise.race([
      emptied.then(() => true),
      delay(timeoutMs).then(() => false)
    ]);
    if (resolveEmpty) emptyWaiters.delete(resolveEmpty);
    return result;
  }

  function requestGracefulEnd(reason) {
    for (const connection of [...connections]) {
      try { connection.cancel?.(`Service draining: ${reason}`); } catch {}
      try { connection.sendEnd?.(reason); } catch {}
    }
  }

  function forceCloseRemaining() {
    let forced = 0;
    for (const connection of [...connections]) {
      forced += 1;
      try { connection.cancel?.('Service restart forced close'); } catch {}
      try { connection.close?.(1012, 'Service restart'); } catch {}
    }
    return forced;
  }

  function begin(reason = 'service_restart') {
    if (drainPromise) return drainPromise;
    draining = true;
    const activeAtStart = connections.size;
    requestGracefulEnd(reason);
    drainPromise = (async () => {
      const graceful = await waitForEmpty(graceMs);
      const forced = graceful ? 0 : forceCloseRemaining();
      if (!graceful) await waitForEmpty(Math.min(1000, graceMs));
      return { reason, activeAtStart, graceful, forced, remaining: connections.size };
    })();
    return drainPromise;
  }

  return {
    register,
    begin,
    get draining() { return draining; },
    get activeConnections() { return connections.size; }
  };
}

import { config } from './config.js';
import { hasPersistentStore } from './store.js';
import { probeAhmDataReadiness } from './ahm-data.js';
import { probeBridgeReadiness } from './ahm-bridge.js';
import { drain, concurrency, operationalReply } from './runtime.js';

export function registerHealthRoutes(app) {
  app.get('/healthz', async (_request, reply) => operationalReply(reply).send({
    ok: true,
    service: 'ahmv-voice-ai',
    version: config.appVersion,
    accessMode: config.accessMode,
    smsEnabled: config.smsEnabled,
    dataMode: config.ahmDataMode,
    persistentStore: hasPersistentStore(),
    draining: drain.draining,
    activeRelayConnections: drain.activeConnections,
    concurrency: concurrency.snapshot()
  }));

  app.get('/readyz', async (_request, reply) => {
    const problems = [];
    const capacity = concurrency.snapshot();
    if (drain.draining) problems.push('service_draining');
    if (config.nodeEnv === 'production' && !config.validateTwilioSignatures) problems.push('twilio_signature_validation_disabled');
    if (config.requirePersistentStore && !hasPersistentStore()) problems.push('persistent_store_required');
    if (config.ahmDataMode === 'api' && !config.ahmBridgeApiUrl) problems.push('ahm_voice_bridge_not_configured');
    if (config.ahmDataMode === 'api' && !config.ahmBridgeToken) problems.push('ahm_voice_bridge_token_not_configured');
    if (capacity.activeCalls >= capacity.maxCalls) problems.push('voice_capacity_exhausted');

    let bridge = { ready: config.ahmDataMode === 'fixture', reason: config.ahmDataMode === 'fixture' ? 'fixture_mode' : 'not_checked' };
    let data = bridge;
    if (!drain.draining && config.ahmDataMode === 'api' && config.ahmBridgeApiUrl && config.ahmBridgeToken) {
      [bridge, data] = await Promise.all([probeBridgeReadiness(), probeAhmDataReadiness()]);
      if (!bridge.ready) problems.push(bridge.reason || 'ahm_bridge_not_ready');
      if (!data.ready) problems.push(data.reason || 'ahm_data_not_ready');
    }

    operationalReply(reply).code(problems.length ? 503 : 200).send({
      ready: problems.length === 0,
      version: config.appVersion,
      problems,
      dependencies: {
        ahmBridge: bridge,
        ahmData: data,
        persistentStore: hasPersistentStore(),
        capacity
      }
    });
  });
}

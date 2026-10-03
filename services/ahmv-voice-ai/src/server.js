import Fastify from 'fastify';
import formbody from '@fastify/formbody';
import websocket from '@fastify/websocket';
import { config } from './config.js';
import { cleanupExpiredSessions } from './store.js';
import { drain, concurrency, retryableRelayError, accessDeniedCopy } from './runtime.js';
import { registerHealthRoutes } from './health-routes.js';
import { registerTwilioEntryRoutes } from './twilio-entry-routes.js';
import { registerRelayRoute } from './relay-route.js';
import { registerTwilioCompletionRoutes } from './twilio-completion-routes.js';

const app = Fastify({
  logger: {
    redact: [
      'req.headers.authorization',
      'req.headers.x-twilio-signature',
      'headers.authorization',
      'headers.x-twilio-signature'
    ]
  },
  trustProxy: true,
  bodyLimit: 256 * 1024
});

await app.register(formbody);
await app.register(websocket, { options: { maxPayload: 128 * 1024 } });
registerHealthRoutes(app);
registerTwilioEntryRoutes(app);
registerRelayRoute(app);
registerTwilioCompletionRoutes(app);

app.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  reply.code(500).send({ ok: false, error: 'internal_error' });
});

const cleanupTimer = setInterval(
  cleanupExpiredSessions,
  Math.min(config.sessionTtlMinutes * 60_000, 15 * 60_000)
);
cleanupTimer.unref();

let shutdownPromise = null;
export async function shutdown(signal) {
  if (shutdownPromise) return shutdownPromise;
  shutdownPromise = (async () => {
    app.log.warn(
      { signal, activeRelayConnections: drain.activeConnections },
      'Voice service draining before shutdown'
    );
    const result = await drain.begin('service_restart');
    app.log.warn({ signal, ...result }, 'Voice service relay drain complete');
    clearInterval(cleanupTimer);
    await app.close();
  })().catch((error) => {
    app.log.error(error, 'Voice service shutdown failed');
    process.exitCode = 1;
  });
  return shutdownPromise;
}

process.once('SIGTERM', () => { void shutdown('SIGTERM'); });
process.once('SIGINT', () => { void shutdown('SIGINT'); });

await app.listen({ host: '0.0.0.0', port: config.port });

export const _test = { retryableRelayError, accessDeniedCopy, drain, concurrency, shutdown };

export function retryDelaySeconds(attempt: number) {
  const normalized = Math.max(1, Math.min(10, Math.trunc(attempt)));
  return Math.min(900, 30 * 2 ** (normalized - 1));
}

export function safeWorkerErrorCode(error: unknown) {
  if (!(error instanceof Error)) return "worker_unknown_error";
  const code = error.message
    .toLowerCase()
    .replace(/[^a-z0-9:_-]+/g, "_")
    .slice(0, 120);
  return code || "worker_error";
}

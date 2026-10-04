export function retryDelaySeconds(attempt: number) {
  const normalized = Math.max(1, Math.min(10, Math.trunc(attempt)));
  return Math.min(900, 30 * 2 ** (normalized - 1));
}

export function safeWorkerErrorCode(error: unknown) {
  if (!(error instanceof Error)) return "worker_unknown_error";
  const candidate = error.message.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9:_-]{0,119}$/.test(candidate)
    ? candidate
    : "worker_exception";
}

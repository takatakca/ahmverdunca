export function canonicalTwilioRequestUrl(baseUrl, requestUrl) {
  if (typeof requestUrl !== 'string' || !requestUrl.startsWith('/') || requestUrl.startsWith('//')) {
    return '';
  }
  try {
    const base = new URL(baseUrl);
    if (!['https:', 'wss:'].includes(base.protocol)) return '';
    if (base.pathname !== '/' || base.search || base.hash) return '';
    return new URL(requestUrl, base).toString();
  } catch {
    return '';
  }
}

export function websocketTrailingSlashSignatureUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'wss:' || parsed.pathname.endsWith('/')) return '';
    parsed.pathname = `${parsed.pathname}/`;
    return parsed.toString();
  } catch {
    return '';
  }
}

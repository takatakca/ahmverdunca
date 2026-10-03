import { timingSafeEqual } from "node:crypto";

type Settings = Record<string, string | undefined>;

export function secureTokenMatch(expected: string, supplied: string) {
  const left = Buffer.from(expected);
  const right = Buffer.from(supplied);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function authorizeTakatakOpsRequest(
  request: Request,
  settings: Settings = process.env,
) {
  const expected = settings["TAKATAK_AHMV_SERVICE_TOKEN"]?.trim() ?? "";
  const authorization = request.headers.get("authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";

  return Boolean(
    expected &&
      supplied &&
      secureTokenMatch(expected, supplied),
  );
}

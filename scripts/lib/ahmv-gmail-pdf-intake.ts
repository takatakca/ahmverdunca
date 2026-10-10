/**
 * Server-only, read-only Gmail intake adapter for AHMV schedule PDFs.
 *
 * It never writes mail, changes labels, reads TeamLinkt private data, runs OCR,
 * approves an event or publishes to AHMV. Only use with a scoped OAuth grant.
 * All returned content is untrusted and requires quarantine/review.
 */
import { createHash } from "node:crypto";

export const AHMV_INTAKE_MAILBOX = "ahmverdun.ca@gmail.com";
export const AHMV_MAX_PDF_BYTES = 12 * 1024 * 1024;

export interface GmailPart {
  mimeType?: string;
  filename?: string;
  partId?: string;
  headers?: Array<{ name?: string; value?: string }>;
  body?: { size?: number; data?: string; attachmentId?: string };
  parts?: GmailPart[];
}

export interface GmailMessage {
  id?: string;
  threadId?: string;
  internalDate?: string;
  payload?: GmailPart;
}

export interface GmailPdfCandidate {
  messageId: string;
  partId: string;
  filename: string;
  attachmentId?: string;
  inlineData?: string;
  declaredSize?: number;
}

export interface GmailIntakeAssessment {
  status: "needs-review" | "quarantined" | "no-pdf" | "invalid";
  sender: string | null;
  pdfCandidates: GmailPdfCandidate[];
  reasons: string[];
}

export interface VerifiedGmailPdf {
  sha256: string;
  bytes: Buffer;
  size: number;
  sourceMessageId: string;
  sourcePartId: string;
  filename: string;
}

const SAFE_ID = /^[a-zA-Z0-9_-]{1,128}$/;
const PDF_NAME = /\.pdf$/i;
const SAFE_PAGE_TOKEN = /^[a-zA-Z0-9_+/=-]{1,1024}$/;
const EMAIL = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function header(part: GmailPart, key: string): string {
  const matches = (part.headers ?? []).filter((h) => h.name?.toLowerCase() === key.toLowerCase());
  return matches.length === 1 ? matches[0]?.value?.trim() ?? "" : "";
}

function senderEmail(value: string): string | null {
  if (!value || /[\r\n]/.test(value)) return null;
  const bracketed = value.match(/<([^<>]+)>$/);
  const email = (bracketed ? bracketed[1] : value).trim().toLowerCase();
  return EMAIL.test(email) ? email : null;
}

/** Metadata-only inspection; even an allowlisted sender is not publication authority. */
export function inspectGmailScheduleMessage(
  message: GmailMessage,
  approvedSenders: readonly string[],
): GmailIntakeAssessment {
  const reasons: string[] = [];
  if (!message.id || !SAFE_ID.test(message.id) || !message.payload) {
    return { status: "invalid", sender: null, pdfCandidates: [], reasons: ["Invalid Gmail message identifier or payload"] };
  }

  const from = senderEmail(header(message.payload, "From"));
  const approved = from !== null && approvedSenders
    .some((address) => address.trim().toLowerCase() === from);

  const candidates: GmailPdfCandidate[] = [];
  let invalidAttachment = false;
  let visited = 0;

  function visit(part: GmailPart, id: string, depth: number) {
    visited++;
    if (depth > 10 || visited > 80) {
      invalidAttachment = true;
      return;
    }
    const filename = part.filename?.trim() ?? "";
    const mime = part.mimeType?.toLowerCase().trim() ?? "";
    if (PDF_NAME.test(filename) || mime === "application/pdf") {
      if (!filename || !PDF_NAME.test(filename) || mime !== "application/pdf" ||
        filename.includes("/") || filename.includes("\\") || filename.length > 180 ||
        [...filename].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) {
        invalidAttachment = true;
      } else {
        const size = part.body?.size;
        if ((size !== undefined && (!Number.isSafeInteger(size) || size < 0 || size > AHMV_MAX_PDF_BYTES)) ||
          (!part.body?.attachmentId && !part.body?.data) ||
          (part.body?.attachmentId && !SAFE_ID.test(part.body.attachmentId))) {
          invalidAttachment = true;
        } else {
          candidates.push({
            messageId: message.id!,
            partId: part.partId ?? id,
            filename,
            ...(part.body?.attachmentId ? { attachmentId: part.body.attachmentId } : {}),
            ...(part.body?.data ? { inlineData: part.body.data } : {}),
            ...(size !== undefined ? { declaredSize: size } : {}),
          });
        }
      }
    }
    for (const [index, child] of (part.parts ?? []).entries()) {
      visit(child, id + "." + index, depth + 1);
    }
  }
  visit(message.payload, "root", 0);

  if (!from) reasons.push("Sender is missing or malformed");
  if (!approved) reasons.push("Sender is not allowlisted (allowlist is not authentication)");
  if (invalidAttachment) reasons.push("Unsupported, malformed, oversized or nested attachment");
  if (!candidates.length) reasons.push("No eligible PDF attachment");

  return {
    status: invalidAttachment || !approved ? "quarantined" : candidates.length ? "needs-review" : "no-pdf",
    sender: from,
    pdfCandidates: invalidAttachment || !approved ? [] : candidates,
    reasons,
  };
}

/** Validates attachment bytes before private storage or PDF parsing. */
export function verifyGmailPdfData(candidate: GmailPdfCandidate, base64url: string): VerifiedGmailPdf {
  if (!SAFE_ID.test(candidate.messageId) ||
    !candidate.filename.toLowerCase().endsWith(".pdf") ||
    base64url.length > Math.ceil(AHMV_MAX_PDF_BYTES / 3) * 4 + 8) {
    throw new Error("Unsafe PDF candidate or attachment size");
  }
  const canonical = base64url.replace(/=+$/, "");
  if (!canonical || !/^[a-zA-Z0-9_-]+$/.test(canonical)) {
    throw new Error("Invalid Gmail attachment encoding");
  }
  const bytes = Buffer.from(base64url, "base64url");
  if (bytes.length < 8 || bytes.length > AHMV_MAX_PDF_BYTES ||
    bytes.toString("base64url") !== canonical ||
    !bytes.subarray(0, 1024).toString("latin1").includes("%PDF-")) {
    throw new Error("Attachment is not a valid-sized PDF candidate");
  }
  if (candidate.declaredSize !== undefined && candidate.declaredSize !== bytes.length) {
    throw new Error("Gmail attachment length does not match the declared size");
  }
  return {
    sha256: createHash("sha256").update(bytes).digest("hex"),
    bytes,
    size: bytes.length,
    sourceMessageId: candidate.messageId,
    sourcePartId: candidate.partId,
    filename: candidate.filename,
  };
}

export interface GmailReadOnlyClient {
  listMessageIds(pageToken?: string): Promise<{ ids: string[]; nextPageToken?: string }>;
  getMessage(id: string): Promise<GmailMessage>;
  getAttachmentData(messageId: string, attachmentId: string): Promise<string>;
}

/**
 * Read-only Gmail API transport. Before *any* read, the OAuth grant is
 * verified against the exact AHMV mailbox. No credentials are logged.
 *
 * Gmail scope must be restricted to gmail.readonly by the OAuth application.
 * The caller must provide access tokens through an approved secret manager.
 */
export function createAhmvGmailReader(
  accessToken: string,
  fetcher: typeof fetch = fetch,
): GmailReadOnlyClient {
  if (!accessToken || accessToken.length < 12 || /[\s\r\n]/.test(accessToken)) {
    throw new Error("Gmail OAuth access token is not configured");
  }
  const root = "https://gmail.googleapis.com/gmail/v1/users/me";
  let verifiedMailbox = false;

  async function getJson(path: string, query?: URLSearchParams): Promise<Record<string, unknown>> {
    const url = root + path + (query ? "?" + query.toString() : "");
    const response = await fetcher(url, {
      method: "GET",
      headers: { Authorization: "Bearer " + accessToken, Accept: "application/json" },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error("Gmail read failed (HTTP " + response.status + ")");
    const length = Number(response.headers.get("content-length"));
    if (Number.isFinite(length) && length > 20 * 1024 * 1024) {
      throw new Error("Gmail response is over the maximum allowed size");
    }
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Unexpected Gmail API response");
    }
    return data as Record<string, unknown>;
  }

  async function confirmMailbox(): Promise<void> {
    if (verifiedMailbox) return;
    const result = await getJson("/profile");
    if (typeof result.emailAddress !== "string" ||
      result.emailAddress.toLowerCase() !== AHMV_INTAKE_MAILBOX) {
      throw new Error("Gmail OAuth grant belongs to a different mailbox");
    }
    verifiedMailbox = true;
  }

  return {
    async listMessageIds(pageToken) {
      await confirmMailbox();
      if (pageToken && !SAFE_PAGE_TOKEN.test(pageToken)) {
        throw new Error("Invalid Gmail pagination token");
      }
      const query = new URLSearchParams({ maxResults: "25", q: "has:attachment filename:pdf" });
      if (pageToken) query.set("pageToken", pageToken);
      const result = await getJson("/messages", query);
      if (result.messages !== undefined && !Array.isArray(result.messages)) {
        throw new Error("Invalid Gmail message listing");
      }
      const ids = (result.messages as Array<{ id?: unknown }> | undefined ?? [])
        .map((message) => message.id)
        .filter((id): id is string => typeof id === "string" && SAFE_ID.test(id));
      if (typeof result.nextPageToken === "string" && SAFE_PAGE_TOKEN.test(result.nextPageToken)) {
        return { ids, nextPageToken: result.nextPageToken };
      }
      return { ids };
    },
    async getMessage(id) {
      await confirmMailbox();
      if (!SAFE_ID.test(id)) throw new Error("Invalid Gmail message ID");
      const result = await getJson("/messages/" + id, new URLSearchParams({ format: "full" }));
      if (result.id !== id || !result.payload || typeof result.payload !== "object") {
        throw new Error("Invalid Gmail message payload");
      }
      return result as unknown as GmailMessage;
    },
    async getAttachmentData(messageId, attachmentId) {
      await confirmMailbox();
      if (!SAFE_ID.test(messageId) || !SAFE_ID.test(attachmentId)) {
        throw new Error("Invalid Gmail attachment reference");
      }
      const result = await getJson("/messages/" + messageId + "/attachments/" + attachmentId);
      if (typeof result.data !== "string" ||
        result.data.length > Math.ceil(AHMV_MAX_PDF_BYTES / 3) * 4 + 8) {
        throw new Error("Attachment data is invalid or too large");
      }
      return result.data;
    },
  };
}

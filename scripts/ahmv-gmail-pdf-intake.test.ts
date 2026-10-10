import test from "node:test";
import assert from "node:assert/strict";
import {
  AHMV_INTAKE_MAILBOX,
  AHMV_MAX_PDF_BYTES,
  createAhmvGmailReader,
  inspectGmailScheduleMessage,
  verifyGmailPdfData,
  type GmailMessage,
} from "./lib/ahmv-gmail-pdf-intake.ts";

const SENDER = "horaires@club.example";
const pdf = Buffer.from("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF");
const encoded = pdf.toString("base64url");

function message(overrides: Partial<GmailMessage> = {}): GmailMessage {
  return {
    id: "msg_01",
    payload: {
      mimeType: "multipart/mixed",
      headers: [{ name: "From", value: 'AHMV Club <' + SENDER + ">" }],
      parts: [
        { mimeType: "text/plain", filename: "", body: { data: "dGVzdA" } },
        { mimeType: "image/jpeg", filename: "notice.jpg", body: { size: 12, attachmentId: "img1" } },
        {
          mimeType: "multipart/related",
          parts: [
            { mimeType: "application/pdf", filename: "Semaine 6.pdf", partId: "2.1", body: { size: pdf.length, attachmentId: "attachment_1" } },
          ],
        },
      ],
    },
    ...overrides,
  };
}

test("nested Gmail PDFs are detected but never auto-approved or published", () => {
  const assessment = inspectGmailScheduleMessage(message(), [SENDER]);
  assert.equal(assessment.status, "needs-review");
  assert.equal(assessment.pdfCandidates.length, 1);
  assert.equal(assessment.pdfCandidates[0]?.attachmentId, "attachment_1");
  assert.equal(assessment.pdfCandidates[0]?.declaredSize, pdf.length);
  assert.equal(assessment.pdfCandidates[0]?.partId, "2.1");
});

test("unknown sender, no allowlist and malformed From quarantine all attachments", () => {
  assert.equal(inspectGmailScheduleMessage(message(), []).status, "quarantined");
  assert.equal(inspectGmailScheduleMessage(message(), ["other@example.org"]).pdfCandidates.length, 0);
  const forged = message({
    payload: {
      ...message().payload,
      headers: [{ name: "From", value: "AHMV <horaires@club.example>\nX-Injected: value" }],
    },
  });
  assert.equal(inspectGmailScheduleMessage(forged, [SENDER]).status, "quarantined");
  const missingId = message({ id: "../../../foo" });
  assert.equal(inspectGmailScheduleMessage(missingId, [SENDER]).status, "invalid");
});

test("non-PDF attachments are ignored; PDF pretending to be an image is quarantined", () => {
  const none = message({
    payload: { headers: [{ name: "From", value: SENDER }], parts: [
      { mimeType: "image/jpeg", filename: "team.jpg", body: { size: 120, attachmentId: "img" } },
    ] },
  });
  assert.equal(inspectGmailScheduleMessage(none, [SENDER]).status, "no-pdf");
  const suspicious = message({
    payload: { headers: [{ name: "From", value: SENDER }], parts: [
      { mimeType: "image/jpeg", filename: "schedule.pdf", body: { size: 120, attachmentId: "img" } },
    ] },
  });
  assert.equal(inspectGmailScheduleMessage(suspicious, [SENDER]).status, "quarantined");
});

test("oversized and path-style filenames cannot enter the review queue", () => {
  for (const bad of [
    { mimeType: "application/pdf", filename: "../../private.pdf", body: { size: pdf.length, attachmentId: "ref1" } },
    { mimeType: "application/pdf", filename: "w6.pdf", body: { size: AHMV_MAX_PDF_BYTES + 1, attachmentId: "ref1" } },
    { mimeType: "application/pdf", filename: "w6.pdf", body: { size: -3, attachmentId: "ref1" } },
    { mimeType: "application/pdf", filename: "w6.pdf", body: { size: pdf.length } },
  ]) {
    const m = message({ payload: { headers: [{ name: "From", value: SENDER }], parts: [bad] } });
    assert.equal(inspectGmailScheduleMessage(m, [SENDER]).status, "quarantined");
  }
});

test("PDF validation yields immutable SHA-256 for duplicate detection", () => {
  const candidate = inspectGmailScheduleMessage(message(), [SENDER]).pdfCandidates[0]!;
  const first = verifyGmailPdfData(candidate, encoded);
  const second = verifyGmailPdfData(candidate, encoded);
  assert.equal(first.sha256, second.sha256);
  assert.match(first.sha256, /^[a-f0-9]{64}$/);
  assert.equal(first.bytes.equals(pdf), true);
  assert.equal(first.sourceMessageId, "msg_01");
});

test("non-PDF bytes, invalid base64url and declared length mismatch are rejected", () => {
  const candidate = inspectGmailScheduleMessage(message(), [SENDER]).pdfCandidates[0]!;
  assert.throws(() => verifyGmailPdfData(candidate, Buffer.from("plain text").toString("base64url")), /PDF candidate/);
  assert.throws(() => verifyGmailPdfData(candidate, "not+base64*"), /encoding/);
  assert.throws(() => verifyGmailPdfData({ ...candidate, declaredSize: pdf.length + 3 }, encoded), /declared size/);
});

test("wrong OAuth Gmail account cannot list messages or fetch PDFs", async () => {
  const urls: string[] = [];
  const client = createAhmvGmailReader("fake_test_access_token_only", async (url, options) => {
    urls.push(String(url));
    assert.equal(options?.method, "GET");
    return new Response(JSON.stringify({ emailAddress: "other@gmail.com" }), {
      status: 200, headers: { "content-type": "application/json" },
    });
  });
  await assert.rejects(client.listMessageIds(), /different mailbox/);
  await assert.rejects(client.getAttachmentData("m1", "a1"), /different mailbox/);
  assert.equal(urls.length, 2);
  assert.ok(urls.every((url) => url.endsWith("/profile")));
});

test("confirmed AHMV mailbox only performs GET for list, message and attachment", async () => {
  const requests: Array<{ url: string; method?: string; authorization?: string }> = [];
  const client = createAhmvGmailReader("test_token_123456789", async (url, options) => {
    const pathname = new URL(String(url)).pathname;
    requests.push({ url: String(url), method: options?.method, authorization: new Headers(options?.headers).get("Authorization") ?? undefined });
    const obj = pathname.endsWith("/profile")
      ? { emailAddress: AHMV_INTAKE_MAILBOX }
      : pathname.endsWith("/messages")
        ? { messages: [{ id: "msg_01" }, { id: "../attack" }], nextPageToken: "abc+def==" }
        : pathname.endsWith("/messages/msg_01")
          ? message()
          : { size: pdf.length, data: encoded };
    return new Response(JSON.stringify(obj), { status: 200, headers: { "content-type": "application/json" } });
  });
  const first = await client.listMessageIds();
  assert.deepEqual(first, { ids: ["msg_01"], nextPageToken: "abc+def==" });
  const next = await client.listMessageIds(first.nextPageToken);
  assert.equal(next.ids[0], "msg_01");
  assert.equal((await client.getMessage("msg_01")).id, "msg_01");
  assert.equal(await client.getAttachmentData("msg_01", "att_01"), encoded);
  assert.ok(requests.every((r) => r.method === "GET"));
  assert.ok(requests.slice(1).every((r) => r.url.startsWith("https://gmail.googleapis.com/gmail/v1/users/me/")));
  assert.ok(!requests.some((r) => r.url.includes("test_token")));
  assert.ok(requests.some((r) => r.url.includes("labelIds=INBOX")));
  assert.ok(requests.some((r) => r.url.includes("filename%3Apdf")));
  assert.equal(requests.filter((r) => r.url.endsWith("/profile")).length, 1);
  await assert.rejects(client.getMessage("../hack"), /Invalid Gmail message ID/);
  await assert.rejects(client.listMessageIds("untrusted ?"), /Invalid Gmail pagination token/);
});

test("Gmail HTTP errors do not echo OAuth credentials", async () => {
  const client = createAhmvGmailReader("sensitive_token_abcde", async () => {
    return new Response("denied", { status: 403 });
  });
  await assert.rejects(client.listMessageIds(), (error: unknown) => {
    assert.ok(error instanceof Error);
    assert.equal(error.message.includes("sensitive_token"), false);
    assert.match(error.message, /HTTP 403/);
    return true;
  });
});

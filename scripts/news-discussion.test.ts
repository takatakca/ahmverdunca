import { describe, expect, test } from "bun:test";
import {
  exactFacebookCommentUrl,
  exactFacebookThreadUrl,
  exactInstagramThreadUrl,
  exactSocialThread,
  newsCommentProblems,
} from "../src/lib/news-discussion";

describe("exact Facebook discussion links", () => {
  test("accepts identified official posts and photos on supported Facebook hosts", () => {
    for (const host of [
      "facebook.com",
      "www.facebook.com",
      "m.facebook.com",
      "mobile.facebook.com",
    ]) {
      const post = `https://${host}/AHMVerdun/posts/pfbid123ABC?comment_id=456`;
      expect(exactFacebookThreadUrl(post)).toBe(post);
    }
    expect(exactFacebookThreadUrl("https://www.facebook.com/AHMVerdun/posts/123/")).toBeDefined();
    expect(
      exactFacebookThreadUrl("https://www.facebook.com/photo/?fbid=123&set=a.456"),
    ).toBeDefined();
    expect(exactFacebookThreadUrl("https://m.facebook.com/photo.php?fbid=123")).toBeDefined();
  });

  test("rejects page-only, unidentified and unrelated URLs", () => {
    for (const url of [
      undefined,
      "not a URL",
      "https://www.facebook.com/AHMVerdun",
      "https://www.facebook.com/photo/",
      "https://www.facebook.com/photo/?fbid=wrong",
      "https://www.facebook.com/photo/?fbid=1&fbid=2",
      "https://www.facebook.com/AHMVerdun/posts/",
      "https://www.facebook.com/AHMVerdun/posts/pfbid",
      "https://www.facebook.com/OtherPage/posts/pfbid123",
      "https://www.facebook.com/AHMVerdun/posts/pfbid123/photos",
      "https://evil.example/facebook.com/AHMVerdun/posts/pfbid123",
      "https://www.facebook.com.evil.example/AHMVerdun/posts/pfbid123",
      "https://user@www.facebook.com/AHMVerdun/posts/pfbid123",
      "https://www.facebook.com:444/AHMVerdun/posts/pfbid123",
      "http://www.facebook.com/AHMVerdun/posts/pfbid123",
      "javascript:alert(1)",
    ])
      expect(exactFacebookThreadUrl(url)).toBeUndefined();
  });

  test("comment provenance requires one numeric comment identifier", () => {
    const thread = "https://www.facebook.com/AHMVerdun/posts/pfbid123";
    expect(exactFacebookCommentUrl(`${thread}?comment_id=456`)).toBeDefined();
    for (const url of [
      thread,
      `${thread}?comment_id=`,
      `${thread}?comment_id=bad`,
      `${thread}?comment_id=1&comment_id=2`,
    ]) {
      expect(exactFacebookCommentUrl(url)).toBeUndefined();
    }
  });
});

describe("official Instagram archive discussion links", () => {
  test("accepts observed official permalinks and returns the correct network", () => {
    const post = "https://www.instagram.com/ahm_verdun/p/DTX_IuSgOS4/";
    expect(exactInstagramThreadUrl(post)).toBe(post);
    expect(
      exactInstagramThreadUrl("https://instagram.com/ahm_verdun/p/DFle-7BSLNi/"),
    ).toBeDefined();
    expect(exactSocialThread(post)).toEqual({ network: "Instagram", url: post });
    const facebook = "https://www.facebook.com/AHMVerdun/posts/pfbid123";
    expect(exactSocialThread(facebook)).toEqual({ network: "Facebook", url: facebook });
  });

  test("rejects profile pages, other accounts, fake hosts and unsafe schemes", () => {
    for (const url of [
      undefined,
      "https://www.instagram.com/ahm_verdun/",
      "https://www.instagram.com/p/DTX_IuSgOS4/",
      "https://www.instagram.com/other_account/p/DTX_IuSgOS4/",
      "https://www.instagram.com/ahm_verdun/p/",
      "https://www.instagram.com.evil.example/ahm_verdun/p/DTX_IuSgOS4/",
      "https://evil.example/instagram.com/ahm_verdun/p/DTX_IuSgOS4/",
      "https://user@www.instagram.com/ahm_verdun/p/DTX_IuSgOS4/",
      "https://www.instagram.com:444/ahm_verdun/p/DTX_IuSgOS4/",
      "http://www.instagram.com/ahm_verdun/p/DTX_IuSgOS4/",
      "javascript:alert(1)",
    ]) {
      expect(exactInstagramThreadUrl(url)).toBeUndefined();
      expect(exactSocialThread(url)).toBeUndefined();
    }
  });
});

test("Facebook reply links must identify a single numeric reply", () => {
  const comment = "https://www.facebook.com/AHMVerdun/posts/pfbid123?comment_id=456";
  expect(exactFacebookCommentUrl(`${comment}&reply_comment_id=789`)).toBeDefined();
  for (const suffix of [
    "&reply_comment_id=bad",
    "&reply_comment_id=",
    "&reply_comment_id=1&reply_comment_id=2",
  ]) {
    expect(exactFacebookCommentUrl(`${comment}${suffix}`)).toBeUndefined();
  }
});

describe("mirrored comment integrity", () => {
  const comment = {
    author: "Georges-Etienne B.",
    body: "Belle nouvelle pour le hockey!",
    source: "facebook",
    sourceUrl: "https://www.facebook.com/AHMVerdun/posts/pfbid123?comment_id=456",
  };

  test("unknown dates remain absent and verified dates are accepted", () => {
    expect(newsCommentProblems(comment)).toEqual([]);
    expect(newsCommentProblems({ ...comment, date: "2026-10-03" })).toEqual([]);
    expect(newsCommentProblems({ ...comment, date: "2024-02-29" })).toEqual([]);
  });

  test("rejects empty text, unsupported sources, invalid dates and missing provenance", () => {
    expect(newsCommentProblems({ ...comment, author: " " })).toContain("author must be non-empty");
    expect(newsCommentProblems({ ...comment, body: " " })).toContain("body must be non-empty");
    expect(newsCommentProblems({ ...comment, source: "invented" })).toContain(
      "source must be facebook or member",
    );
    for (const date of ["", "October 3", "2026-02-30", "2026-02-29", "2026-13-01"]) {
      expect(newsCommentProblems({ ...comment, date })).toContain(
        "date must be a valid YYYY-MM-DD date when known",
      );
    }
    expect(newsCommentProblems({ ...comment, sourceUrl: undefined })).toContain(
      "Facebook sourceUrl must identify an exact comment",
    );
  });
});

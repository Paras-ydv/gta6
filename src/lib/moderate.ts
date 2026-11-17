import "server-only";
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity";
import { STORY_MAX } from "./data";

// English profanity (handles l33t-speak and spacing tricks).
const english = new RegExpMatcher({ ...englishDataset.build(), ...englishRecommendedTransformers });

// Common Hindi/Hinglish abuse, matched as whole words after normalising.
const HINGLISH = [
  "bc", "mc", "bsdk", "bhosdi", "bhosdike", "bhosdika", "madarchod", "maderchod", "behenchod",
  "bhenchod", "benchod", "chutiya", "chutiye", "chut", "gandu", "gaand", "randi", "lauda", "lavda",
  "lund", "laude", "harami", "kamina", "kutta", "kutti", "saala", "saali", "tatti", "jhatu",
];
const hinglish = new RegExp(`\\b(${HINGLISH.join("|")})\\b`, "i");

const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|in|net|org|io|xyz|ly|gg|me|co|app|link)\b)/i;
const HANDLE = /(^|\s)@\w{2,}/;
const EMAIL = /\S+@\S+\.\S+/;
const PHONE = /(\d[\s-]?){7,}/;

export type Moderation = { ok: true; text: string } | { ok: false; reason: string };

/** Cleans a story and rejects anything we don't want on a public wall. */
export function moderateStory(raw: unknown): Moderation {
  if (typeof raw !== "string") return { ok: false, reason: "invalid" };
  // Strip control chars and collapse whitespace.
  const text = raw.replace(/[\u0000-\u001f\u007f​-‏‪-‮]/g, " ").replace(/\s+/g, " ").trim();
  if (text.length < 3) return { ok: false, reason: "too short" };
  if (text.length > STORY_MAX) return { ok: false, reason: "too long" };
  if (LINK.test(text) || EMAIL.test(text)) return { ok: false, reason: "no links or emails" };
  if (HANDLE.test(text)) return { ok: false, reason: "no @handles, keep it anonymous" };
  if (PHONE.test(text)) return { ok: false, reason: "no phone numbers" };
  const flat = text.toLowerCase().replace(/[^a-z\s]/g, "");
  if (english.hasMatch(text) || hinglish.test(flat)) return { ok: false, reason: "keep it clean, HR is watching" };
  return { ok: true, text };
}

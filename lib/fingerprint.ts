"use client";

import FingerprintJS from "@fingerprintjs/fingerprintjs";

let cachedId: string | null = null;
let inflight: Promise<string> | null = null;

const STORAGE_KEY = "luxreal-feedback-fp";
const VOTED_KEY = "luxreal-feedback-voted";

export async function getVisitorId(): Promise<string> {
  if (cachedId) return cachedId;
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      cachedId = stored;
      return stored;
    }
  }
  if (inflight) return inflight;
  inflight = (async () => {
    const fp = await FingerprintJS.load();
    const r = await fp.get();
    cachedId = r.visitorId;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, r.visitorId);
    }
    return r.visitorId;
  })();
  return inflight;
}

export function getVotedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(VOTED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

export function setVoted(itemId: string, voted: boolean) {
  if (typeof window === "undefined") return;
  const set = getVotedSet();
  if (voted) set.add(itemId);
  else set.delete(itemId);
  localStorage.setItem(VOTED_KEY, JSON.stringify([...set]));
}

/**
 * Competitor detection helpers.
 *
 * These operate on already-retrieved provider answer text, which is UNTRUSTED
 * input: it is only ever pattern-matched here, never executed or interpreted
 * as instructions.
 */

import { buildAliasKeys, normalizeEntityName, type NamedEntity } from "./normalize";

export interface MentionMatch {
  /** Normalized alias key that matched. */
  aliasKey: string;
  /** Character offset of the first match in the normalized answer text. */
  offset: number;
}

/** Normalize free text the same way entity names are normalized (word-preserving). */
export function normalizeAnswerText(text: string): string {
  return (text ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Find whole-token matches for any alias of an entity inside answer text.
 * Returns the earliest match, or null.
 */
export function findEntityMention(text: string, entity: NamedEntity): MentionMatch | null {
  const haystack = ` ${normalizeAnswerText(text)} `;
  if (haystack.trim() === "") return null;

  let best: MentionMatch | null = null;
  for (const aliasKey of buildAliasKeys(entity.name, entity.aliases ?? [], entity.website ?? null)) {
    if (aliasKey.length < 3) continue;
    const index = haystack.indexOf(` ${aliasKey} `);
    if (index === -1) continue;
    const offset = index;
    if (!best || offset < best.offset) best = { aliasKey, offset };
  }
  return best;
}

export function isEntityMentioned(text: string, entity: NamedEntity): boolean {
  return findEntityMention(text, entity) !== null;
}

export interface ExtractedListItem {
  /** 1-indexed position within the answer's ranked list. */
  position: number;
  rawLine: string;
  name: string;
  key: string;
}

const LIST_LINE = /^\s*(?:(\d{1,2})[.)]|[-*\u2022])\s+(.*)$/;

/**
 * Extract a ranked list of business names from a provider answer.
 * Handles "1. Name — detail", "- **Name**: detail" and similar shapes.
 * Deterministic; no model involved.
 */
export function extractRankedList(answerText: string): ExtractedListItem[] {
  const items: ExtractedListItem[] = [];
  const lines = (answerText ?? "").split(/\r?\n/);

  for (const line of lines) {
    const match = LIST_LINE.exec(line);
    if (!match) continue;
    const body = (match[2] ?? "").trim();
    if (!body) continue;

    const namePart = body
      .split(/\s+[\u2013\u2014-]\s+|:|\(/)[0]!
      .replace(/\*\*/g, "")
      .replace(/^["'`]|["'`]$/g, "")
      .trim();

    const key = normalizeEntityName(namePart);
    if (!key || key.split(" ").length > 8) continue;

    items.push({
      position: items.length + 1,
      rawLine: line.trim(),
      name: namePart,
      key,
    });
  }

  return items;
}

/**
 * Given a ranked list and the target entity, return the target's 1-indexed
 * position, or null when absent.
 */
export function findListPosition(items: readonly ExtractedListItem[], entity: NamedEntity): number | null {
  const aliasKeys = new Set(buildAliasKeys(entity.name, entity.aliases ?? [], entity.website ?? null));
  for (const item of items) {
    if (aliasKeys.has(item.key)) return item.position;
  }
  return null;
}

/** Competitor candidates = ranked list entries that are not the target entity. */
export function competitorCandidates(items: readonly ExtractedListItem[], target: NamedEntity): ExtractedListItem[] {
  const aliasKeys = new Set(buildAliasKeys(target.name, target.aliases ?? [], target.website ?? null));
  return items.filter((item) => !aliasKeys.has(item.key));
}

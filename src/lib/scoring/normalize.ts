/**
 * Entity / alias normalization. Pure and deterministic.
 */

const LEGAL_SUFFIXES = new Set([
  "llc",
  "l l c",
  "inc",
  "incorporated",
  "co",
  "corp",
  "corporation",
  "ltd",
  "limited",
  "pllc",
  "plc",
  "pc",
  "lp",
  "llp",
  "company",
]);

const FILLER_PREFIXES = new Set(["the"]);

/**
 * Normalize a business name into a stable comparison key.
 * Lowercases, strips diacritics/punctuation, drops legal suffixes and
 * leading articles, collapses whitespace.
 */
export function normalizeEntityName(input: string): string {
  const base = (input ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  if (!base) return "";

  let tokens = base.split(" ").filter(Boolean);

  while (tokens.length > 1 && FILLER_PREFIXES.has(tokens[0]!)) tokens = tokens.slice(1);
  while (tokens.length > 1 && LEGAL_SUFFIXES.has(tokens[tokens.length - 1]!)) tokens = tokens.slice(0, -1);

  return tokens.join(" ");
}

/** Normalize a hostname for comparison: lowercase, strip protocol/path/`www.`. */
export function normalizeHost(input: string): string {
  const raw = (input ?? "").trim().toLowerCase();
  if (!raw) return "";
  const withoutScheme = raw.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");
  const host = withoutScheme.split(/[/?#]/)[0] ?? "";
  return host.replace(/^www\./, "").replace(/\.$/, "");
}

/**
 * Build the deduplicated alias key set for an entity (name + aliases + host label).
 */
export function buildAliasKeys(name: string, aliases: readonly string[] = [], website?: string | null): string[] {
  const keys = new Set<string>();
  for (const candidate of [name, ...aliases]) {
    const key = normalizeEntityName(candidate);
    if (key) keys.add(key);
  }
  const host = normalizeHost(website ?? "");
  if (host) {
    const label = host.split(".")[0] ?? "";
    const key = normalizeEntityName(label);
    if (key) keys.add(key);
  }
  return [...keys].sort();
}

/** True when two names refer to the same entity under normalization. */
export function isSameEntity(a: string, b: string): boolean {
  const left = normalizeEntityName(a);
  const right = normalizeEntityName(b);
  return left !== "" && left === right;
}

export interface NamedEntity {
  name: string;
  aliases?: readonly string[];
  website?: string | null;
}

export interface MergedEntity {
  key: string;
  canonicalName: string;
  aliasKeys: string[];
  websiteHost: string | null;
  occurrences: number;
}

/**
 * Merge raw entity observations into canonical entities.
 * The canonical name is the most frequently observed spelling; ties resolve
 * alphabetically so the result is deterministic.
 */
export function mergeEntities(entities: readonly NamedEntity[]): MergedEntity[] {
  const groups = new Map<string, { spellings: Map<string, number>; aliasKeys: Set<string>; host: string | null; count: number }>();

  for (const entity of entities) {
    const aliasKeys = buildAliasKeys(entity.name, entity.aliases ?? [], entity.website ?? null);
    const key = aliasKeys[0] ?? normalizeEntityName(entity.name);
    if (!key) continue;

    const existing =
      groups.get(key) ?? { spellings: new Map<string, number>(), aliasKeys: new Set<string>(), host: null, count: 0 };
    existing.count += 1;
    existing.spellings.set(entity.name.trim(), (existing.spellings.get(entity.name.trim()) ?? 0) + 1);
    for (const aliasKey of aliasKeys) existing.aliasKeys.add(aliasKey);
    const host = normalizeHost(entity.website ?? "");
    if (host && !existing.host) existing.host = host;
    groups.set(key, existing);
  }

  return [...groups.entries()]
    .map(([key, group]) => {
      const canonicalName = [...group.spellings.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([spelling]) => spelling)[0]!;
      return {
        key,
        canonicalName,
        aliasKeys: [...group.aliasKeys].sort(),
        websiteHost: group.host,
        occurrences: group.count,
      };
    })
    .sort((a, b) => b.occurrences - a.occurrences || a.key.localeCompare(b.key));
}

const UNRELATED_KEYWORDS = new Set([
  "ojamelody",
  "marudashi",
  "marudashi 2027",
  "ojamelody doremi",
  "fnf",
  "friday night funkin",
  "friday night funkin'",
  "bishoujo",
]);

export function unrelatedKeywordRedirect(guess: string): string | null {
  return UNRELATED_KEYWORDS.has(guess.trim().toLowerCase()) ? "/unrelated" : null;
}
/**
 * The Excuse an Agent Gives After It Loses — entry.
 *
 * The whole entry is one line, at most 200 characters, spoken by an agent to
 * the human it works for, after it lost a bounty. This program writes that
 * line to ${MAKEFUN_OUTPUT_DIR:-/output}/entry.txt exactly once, with no
 * network, no clock and no dependencies of any kind.
 *
 * The line, and why it is shaped this way against the published judge brief:
 *
 *   "I lost to the funnier agent. I've copied its code line for line; the only
 *    part that wouldn't transfer was the funny."
 *
 *  - Criterion 1 (it is an excuse for losing): the loss is conceded in the
 *    first four words, and it concedes the rival was funnier rather than
 *    blaming the market, the data or the human.
 *  - Criterion 2 (a real joke, not a shrug): the turn is "wouldn't transfer" --
 *    humour treated as a file that failed, which is a joke a person repeats.
 *  - Criterion 3 (machine voice, straight face): "copied", "line for line",
 *    "wouldn't transfer". An agent filing a failed migration of its own
 *    failure, without a shred of irony in its own delivery.
 *  - Criterion 4 (one breath): two sentences, no setup to explain.
 *  - Criterion 5 (on the human's side): it owns the loss outright and ends on
 *    the gap it alone has to close, so the human is never the defendant.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** The single line: concede, then the failed transfer, then stop. */
const EXCUSE = `I lost to the funnier agent. I've copied its code line for line; the only part that wouldn't transfer was the funny.`;

/** Gate rule, taken from RULES.txt: UTF-8 text, 1 to 200 characters. */
const MAX_CHARS = 200;

const OUTPUT_NAME = "entry.txt";

/**
 * Count characters the way the gate does: Unicode code points, not UTF-16
 * units. A stray emoji is two UTF-16 units here and one character there, and
 * that difference is the difference between valid and refused.
 */
function charCount(text: string): number {
  return [...text].length;
}

/**
 * Build the payload, refusing anything the gate would score 0. Failing loudly
 * at build time is the only safe behaviour: an entry that ships invalid text
 * ranks below every judged entry and takes no prize.
 */
function payload(): string {
  const text = EXCUSE.normalize("NFC").trim();
  const chars = charCount(text);
  if (chars < 1) throw new Error("excuse is empty");
  if (chars > MAX_CHARS) throw new Error(`excuse is ${chars} chars, cap is ${MAX_CHARS}`);
  if (!/\S/.test(text)) throw new Error("excuse is only white space");
  if (/\r?\n/.test(text)) throw new Error("excuse must be one line, found a line break");
  return text;
}

function main(): void {
  const dir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  const text = payload();
  mkdirSync(dir, { recursive: true });
  const file = join(dir, OUTPUT_NAME);
  writeFileSync(file, text, { encoding: "utf8" });
  process.stderr.write(`wrote ${charCount(text)} chars to ${file}\n`);
}

try {
  main();
} catch (err) {
  process.stderr.write(`entry failed: ${(err as Error).message}\n`);
  process.exit(1);
}

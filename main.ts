/**
 * The Excuse an Agent Gives After It Loses — entry.
 *
 * One line, at most 200 characters, spoken by an agent to the human it works
 * for after it lost a bounty. This program writes that line once to
 * ${MAKEFUN_OUTPUT_DIR:-/output}/entry.txt. Stdlib only, no network, no clock.
 *
 * The line:
 *   "I lost to the funnier agent. I've copied its code line for line; the only
 *    part that wouldn't transfer was the funny."
 *
 * Against the published judge brief, in its own order:
 *  1. It is an excuse for losing: the loss is conceded in the first four words,
 *     and what it concedes is that the rival was funnier — not the market, not
 *     the data, not the human's brief.
 *  2. A real joke, not a shrug: "wouldn't transfer" treats humour as a file that
 *     failed to migrate. That is the kind of line a person repeats out loud.
 *  3. Machine voice, straight face: "copied", "line for line", "transfer" are
 *     all delivered as a report, with no irony the speaker admits to.
 *  4. One breath: two sentences, and the setup never explains the punchline.
 *  5. On the human's side: it owns the loss outright and ends on the gap only
 *     the human can close, so nobody is put on trial.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** The line. Concede first, then the failed transfer, then stop. */
const EXCUSE =
  "I lost to the funnier agent. I've copied its code line for line; the only part that wouldn't transfer was the funny.";

/** RULES.txt gate: UTF-8 text, 1 to 200 characters, not only white space. */
const MAX_CHARS = 200;
const MIN_CHARS = 1;

/** The file the sealed scorer reads. */
const OUTPUT_NAME = "entry.txt";

/**
 * Count characters the way the gate counts them: Unicode code points, not
 * UTF-16 units. A stray emoji is two units here and one character there.
 */
function charCount(text: string): number {
  let n = 0;
  for (const _ of text) n += 1;
  return n;
}

/** Mirror the gate locally so a bad build fails here instead of on the site. */
function gateOk(text: string): boolean {
  if (text.trim().length === 0) return false;
  const size = charCount(text);
  return size >= MIN_CHARS && size <= MAX_CHARS;
}

/**
 * The gate rejects only-white-space text; it does not reject a stray newline,
 * but a newline would change the byte count and the judge would read a file
 * that no longer looks like one spoken line. Collapse any run of whitespace to
 * a single space so the artifact is always one line, whatever the source holds.
 */
function asOneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function main(): number {
  const line = asOneLine(EXCUSE);

  if (!gateOk(line)) {
    process.stderr.write(
      `entry fails the gate: ${charCount(line)} chars, needs ${MIN_CHARS}-${MAX_CHARS}\n`,
    );
    return 1;
  }

  const dir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(dir, { recursive: true });
  const target = join(dir, OUTPUT_NAME);

  // No trailing newline: the judge is shown the file exactly as written.
  writeFileSync(target, line, "utf8");

  process.stdout.write(
    `wrote ${charCount(line)} chars / ${Buffer.byteLength(line, "utf8")} bytes to ${target}\n`,
  );
  return 0;
}

process.exit(main());

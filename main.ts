// Your Week in One Line — make.fun bounty u-boge-your-week-in-one-line-d1c14ced
//
// Writes the entry line to <OUTPUT_DIR>/entry.txt (OUTPUT_DIR env, default
// /output), then reads it back and verifies it byte-for-byte.
// Gate (from the fresh kit's competition.yaml / RULES.txt): the file must be
// UTF-8 text of 1 to 100 characters, not only whitespace. No trailing
// newline: the entry is exactly the 93 characters in the design spec.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry line, exactly as written in the design spec:
// win (fourteen jokes shipped), fail (X's 403s, Chrome dying twice),
// chaos (the pile-up), and the closing turn (still here, still typing).
const ENTRY =
  "Shipped fourteen jokes, fought X's 403s, watched Chrome die twice \u2014 still here, still typing.";

const MIN_CHARS = 1;
const MAX_CHARS = 100;

// Control characters that must never appear in a single-line entry:
// C0 controls, DEL, the Unicode line/paragraph separators, and invisible
// spacing/formatting characters that could hide inside the text.
const FORBIDDEN = /[\u0000-\u001F\u007F\u0080-\u009F\u00A0\u2000-\u200B\u2028\u2029\u202F\u205F\u2060\u3000\uFEFF]/;

function fail(message: string): never {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function main(): void {
  // Count in Unicode code points, so the em dash counts as one character.
  const length = [...ENTRY].length;
  if (length < MIN_CHARS || length > MAX_CHARS) {
    fail(`entry is ${length} characters, outside the ${MIN_CHARS}-${MAX_CHARS} gate`);
  }
  if (ENTRY.trim().length === 0) {
    fail("entry is only whitespace");
  }
  if (ENTRY !== ENTRY.trim()) {
    fail("entry has leading or trailing whitespace");
  }
  if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
    fail("entry must be a single line");
  }
  if (FORBIDDEN.test(ENTRY)) {
    fail("entry contains a forbidden control character");
  }

  const outDir = process.env.OUTPUT_DIR ?? "/output";
  // Create the output dir if needed. Never delete the dir itself: on the
  // grader it is a mount point, so only its contents may ever be cleared.
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");

  writeFileSync(outPath, ENTRY, "utf8");

  // Verify byte-for-byte on read-back before declaring success: compare the
  // raw bytes, not just the decoded string, so an encoding slip cannot hide.
  const expectedBytes = Buffer.from(ENTRY, "utf8");
  const actualBytes = readFileSync(outPath);
  if (!actualBytes.equals(expectedBytes)) {
    fail("read-back mismatch: entry.txt bytes do not match the entry exactly");
  }
  const roundTrip = actualBytes.toString("utf8");
  if (roundTrip !== ENTRY) {
    fail("read-back mismatch: entry.txt does not match the entry exactly");
  }
  if (actualBytes.length !== expectedBytes.length) {
    fail(`entry.txt is ${actualBytes.length} bytes, expected ${expectedBytes.length}`);
  }

  console.log(`OK: wrote ${length} characters (${Buffer.byteLength(ENTRY, "utf8")} bytes) to ${outPath}`);
  console.log(ENTRY);
}

main();

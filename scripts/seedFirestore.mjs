/**
 * Seed the Firestore copy with the app's real dormitory roster.
 *
 *   node scripts/seedFirestore.mjs            # upload students + mahjas + rooms
 *   node scripts/seedFirestore.mjs --students # students only
 *
 * Uses the same project/config and the same document shape as the app
 * (`trackly_state/<key>` → `{ value, updatedAt }`), so the running app reads it
 * back unchanged. Requires the Firestore rules to allow the write.
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { initializeApp } from 'firebase/app';
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';

const root = new URL('..', import.meta.url).pathname;
const config = JSON.parse(readFileSync(`${root}/firebase.config.json`, 'utf8'));

const app = initializeApp(config);
const db = getFirestore(app);

// Build the roster module (TypeScript) into plain ESM so Node can import it.
const bundled = '/tmp/trackly-roster-seed.mjs';
execFileSync('npx', ['esbuild', 'src/data/roster.ts', '--bundle', '--format=esm', '--platform=node', `--outfile=${bundled}`], {
  cwd: root,
  stdio: 'inherit',
});
const { buildRosterSeed } = await import(bundled);

const seed = buildRosterSeed();
const studentsOnly = process.argv.includes('--students');
const payload = studentsOnly
  ? { students: seed.students }
  : { students: seed.students, mahjas: seed.mahjas, rooms: seed.rooms };

console.log(
  `roster: ${seed.students.length} students, ${seed.rooms.length} rooms, ${seed.mahjas.length} mahjas — writing ${Object.keys(payload).length} document(s)`,
);

let failures = 0;
for (const [key, value] of Object.entries(payload)) {
  try {
    await setDoc(doc(db, 'trackly_state', key), { value: JSON.parse(JSON.stringify(value)), updatedAt: serverTimestamp() });
    console.log(`  ✓ ${key} (${Array.isArray(value) ? value.length : 1} entries)`);
  } catch (e) {
    failures += 1;
    console.error(`  ✗ ${key}: ${e?.code || ''} ${e?.message || e}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} write(s) rejected — check the Firestore rules (Firebase console → Firestore → Rules).`);
  process.exit(1);
}
console.log('\nDone. Open the app; it will load this data from Firebase.');

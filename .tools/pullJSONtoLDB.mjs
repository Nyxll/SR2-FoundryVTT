/**
 * Compiles src/packs/{pack-name}/*.json → packs/{pack-name}.db
 * Writes NeDB format directly (one JSON doc per line) without using
 * @foundryvtt/foundryvtt-cli, which hangs on Windows with large packs.
 */
import fs   from "fs";
import path from "path";

const SRC  = "./src/packs";
const DEST = "./packs";

if (!fs.existsSync(DEST)) fs.mkdirSync(DEST);

const packs = fs.readdirSync(SRC).filter(d =>
  fs.statSync(path.join(SRC, d)).isDirectory()
);

for (const pack of packs) {
  const src  = path.join(SRC, pack);
  const dest = path.join(DEST, `${pack}.db`);
  const files = fs.readdirSync(src).filter(f => f.endsWith(".json"));

  if (files.length === 0) {
    console.log(`Skipping ${pack} (no JSON files)`);
    continue;
  }

  console.log(`Compiling ${pack}...`);
  const lines = [];
  let errors = 0;

  for (const file of files) {
    try {
      const raw  = fs.readFileSync(path.join(src, file), "utf8");
      const doc  = JSON.parse(raw);
      // NeDB format: one compact JSON line per document
      lines.push(JSON.stringify(doc));
    } catch (e) {
      console.error(`  SKIP ${file}: ${e.message}`);
      errors++;
    }
  }

  fs.writeFileSync(dest, lines.join("\n") + "\n");
  console.log(`  → ${dest} (${lines.length} entries${errors ? `, ${errors} skipped` : ""})`);
}

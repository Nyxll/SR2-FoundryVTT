/**
 * Compiles src/packs/{pack-name}/*.json → packs/{pack-name}.db
 * Uses @foundryvtt/foundryvtt-cli to compile NeDB (flat-file) packs.
 * nedb:true produces a single .db file instead of a LevelDB directory.
 */
import { compilePack } from "@foundryvtt/foundryvtt-cli";
import fs from "fs";
import path from "path";

const SRC = "./src/packs";
const DEST = "./packs";

if (!fs.existsSync(DEST)) fs.mkdirSync(DEST);

const packs = fs.readdirSync(SRC).filter(d =>
  fs.statSync(path.join(SRC, d)).isDirectory()
);

for (const pack of packs) {
  const src  = path.join(SRC, pack);
  const dest = path.join(DEST, `${pack}.db`);
  console.log(`Compiling ${pack}...`);
  try {
    await compilePack(src, dest, { nedb: true, recursive: false, log: false });
    const count = fs.readdirSync(src).filter(f => f.endsWith(".json")).length;
    console.log(`  → ${dest} (${count} entries)`);
  } catch (e) {
    console.error(`  ERROR: ${e.message}`);
  }
}

/**
 * Extracts packs/{pack-name}.db → src/packs/{pack-name}/*.json
 * Uses @foundryvtt/foundryvtt-cli to extract ClassicLevel (NeDB) packs.
 */
import { extractPack } from "@foundryvtt/foundryvtt-cli";
import fs from "fs";
import path from "path";

const SRC  = "./packs";
const DEST = "./src/packs";

const dbs = fs.readdirSync(SRC).filter(f => f.endsWith(".db"));

for (const db of dbs) {
  const pack    = db.replace(".db", "");
  const srcPath = path.join(SRC, db);
  const dstPath = path.join(DEST, pack);
  if (!fs.existsSync(dstPath)) fs.mkdirSync(dstPath, { recursive: true });
  console.log(`Extracting ${db}...`);
  try {
    await extractPack(srcPath, dstPath, { recursive: false, log: false });
    console.log(`  → ${dstPath}`);
  } catch (e) {
    console.error(`  ERROR: ${e.message}`);
  }
}

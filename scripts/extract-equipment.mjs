/**
 * extract-equipment.mjs
 * Pulls gear data from the live Supabase/PostgreSQL DB and cyberware/bioware
 * from the MCP CSV files, then writes Foundry VTT compendium JSON files.
 *
 * Usage:  node scripts/extract-equipment.mjs
 */

import fs   from "fs";
import path from "path";
import { createHash } from "crypto";
import pkg  from "pg";
const { Client } = pkg;

// ── Config ───────────────────────────────────────────────────────────────────

const DB = { host: "127.0.0.1", port: 5432, user: "postgres", password: "postgres", database: "postgres" };

const MCP_BASE = "C:/Users/Rick/Documents/Cline/MCP/shadowrun-gm";
const CYBER_CSV = `${MCP_BASE}/train/DataTables/CYBERWARE.csv`;
const BIO_CSV   = `${MCP_BASE}/train/Sourcebooks/raw/BIOWARE.csv`;

const OUT = "src/packs";

// Cyberware grades: essence cost multipliers per SR2E
const GRADES = {
  standard:  { label: "Standard",  mult: 1.00, costMult: 1  },
  alphaware: { label: "Alphaware", mult: 0.80, costMult: 2  },
  betaware:  { label: "Betaware",  mult: 0.60, costMult: 5  },
  deltaware: { label: "Deltaware", mult: 0.40, costMult: 10 },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeId(seed) {
  return createHash("sha1").update(seed).digest("hex").substring(0, 16);
}
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").substring(0, 80);
}
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function writeItem(packDir, filename, data) {
  // Avoid collisions from slugify truncation
  let fp = path.join(packDir, filename);
  let i = 1;
  while (fs.existsSync(fp)) {
    fp = path.join(packDir, filename.replace(".json", `-${i++}.json`));
  }
  fs.writeFileSync(fp, JSON.stringify(data, null, 2));
}

/** Parse modifier string e.g. "+1INT,+2RCT" into mods object */
function parseMods(modStr) {
  if (!modStr || typeof modStr !== "string") return {};
  const map = {
    BOD: "body", QCK: "quickness", STR: "strength",
    CHA: "charisma", INT: "intelligence", WIL: "willpower",
    RCT: "reaction", MAG: "magic", INI: "initiative_dice",
    TASKPOOL: "task_pool",
  };
  const mods = {};
  for (const token of modStr.split(",")) {
    const m = token.trim().match(/^([+-]\d+(?:\.\d+)?)([A-Z_]+)$/);
    if (!m) continue;
    const key = map[m[2]] || m[2].toLowerCase();
    mods[key] = parseFloat(m[1]);
  }
  return mods;
}

/** Parse a simple CSV (first row = headers, fields may be quoted) */
function parseCSV(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = (vals[i] ?? "").trim());
    return obj;
  }).filter(r => r[headers[0]]); // skip empty rows
}

function parseCSVLine(line) {
  const result = [];
  let cur = "", inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i+1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if (ch === "," && !inQuote) {
      result.push(cur); cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function num(v) {
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? 0 : n;
}

// ── WEAPONS ───────────────────────────────────────────────────────────────────

const SUBCAT_MAP = {
  firearm: {
    "hold-out":  { category: "pistol",       skill: "firearms" },
    "hold_out":  { category: "pistol",       skill: "firearms" },
    "light pistol": { category: "pistol",    skill: "firearms" },
    "medium pistol": { category: "pistol",   skill: "firearms" },
    "heavy pistol": { category: "pistol",    skill: "firearms" },
    "machine pistol": { category: "pistol",  skill: "firearms" },
    "smg":       { category: "smg",          skill: "firearms" },
    "assault rifle": { category: "rifle",    skill: "firearms" },
    "sniper rifle": { category: "rifle",     skill: "firearms" },
    "shotgun":   { category: "shotgun",      skill: "firearms" },
    "lmg":       { category: "heavy_weapon", skill: "heavy_weapons" },
    "mmg":       { category: "heavy_weapon", skill: "heavy_weapons" },
    "hmg":       { category: "heavy_weapon", skill: "heavy_weapons" },
    "assault cannon": { category: "heavy_weapon", skill: "heavy_weapons" },
    "default":   { category: "pistol",       skill: "firearms" },
  },
  edged_weapon: { default: { category: "melee", skill: "armed_combat" } },
  bow:          { default: { category: "bow",   skill: "projectile_weapons" } },
  bow_crossbow: { default: { category: "bow",   skill: "projectile_weapons" } },
  accessory:    null, // skip weapon accessories
  rocket:       { default: { category: "heavy_weapon", skill: "heavy_weapons" } },
};

function weaponImg(cat) {
  return {
    pistol:       "icons/weapons/guns/gun-pistol.webp",
    smg:          "icons/weapons/guns/gun-submachine.webp",
    rifle:        "icons/weapons/guns/gun-rifle.webp",
    shotgun:      "icons/weapons/guns/gun-shotgun.webp",
    heavy_weapon: "icons/weapons/guns/gun-shoulder.webp",
    melee:        "icons/weapons/swords/sword-simple.webp",
    bow:          "icons/weapons/bows/bow-simple.webp",
  }[cat] ?? "icons/weapons/guns/gun-pistol.webp";
}

async function extractWeapons(db) {
  const packDir = path.join(OUT, "sr2e-weapons");
  ensureDir(packDir);

  const { rows } = await db.query("SELECT * FROM gear WHERE category='weapon' ORDER BY name");
  let count = 0;

  for (const row of rows) {
    const subcat = (row.subcategory ?? "").toLowerCase().replace(/\s+/g, "_");
    if (subcat === "accessory") continue;

    const bs = row.base_stats ?? {};
    // Determine weapon type from name
    const name = row.name.toLowerCase();
    let catInfo;
    if (subcat === "edged_weapon") catInfo = { category: "melee", skill: "armed_combat" };
    else if (subcat === "bow" || subcat === "bow_crossbow") catInfo = { category: "bow", skill: "projectile_weapons" };
    else if (subcat === "rocket") catInfo = { category: "heavy_weapon", skill: "heavy_weapons" };
    else {
      // Infer from name
      if (name.includes("sniper")) catInfo = { category: "rifle", skill: "firearms" };
      else if (name.includes("assault rifle") || name.includes("carbine")) catInfo = { category: "rifle", skill: "firearms" };
      else if (name.includes("shotgun")) catInfo = { category: "shotgun", skill: "firearms" };
      else if (name.includes("smg") || name.includes("submachine")) catInfo = { category: "smg", skill: "firearms" };
      else if (name.includes("lmg") || name.includes("mmg") || name.includes("hmg") || name.includes("cannon")) catInfo = { category: "heavy_weapon", skill: "heavy_weapons" };
      else if (name.includes("heavy pistol") || name.includes("predator")) catInfo = { category: "pistol", skill: "firearms" };
      else if (name.includes("light pistol")) catInfo = { category: "pistol", skill: "firearms" };
      else if (name.includes("hold-out") || name.includes("holdout")) catInfo = { category: "pistol", skill: "firearms" };
      else catInfo = { category: "pistol", skill: "firearms" }; // default firearm
    }

    // Parse damage code from base_stats
    const dmgRaw  = String(bs.damage ?? bs.damage_code ?? "8M");
    const dmgMatch = dmgRaw.match(/^(.+?)(L|M|S|D)$/);
    const dmgPower = dmgMatch ? dmgMatch[1] : dmgRaw;
    const dmgLevel = dmgMatch ? dmgMatch[2] : "M";

    const item = {
      _id:    makeId(`weapon:${row.name}`),
      name:   row.name,
      type:   "weapon",
      img:    weaponImg(catInfo.category),
      system: {
        category:       catInfo.category,
        skill:          catInfo.skill,
        damage_power:   isNaN(Number(dmgPower)) ? 0 : Number(dmgPower),
        damage_level:   dmgLevel,
        damage_code:    dmgRaw,
        concealability: num(bs.conceal ?? bs.concealability ?? 0),
        ammo_type:      "regular",
        ammo_capacity:  num(bs.ammo ?? bs.magazine ?? 0),
        reach:          num(bs.reach ?? 0),
        weight:         num(bs.weight ?? 0),
        cost:           num(bs.cost ?? row.cost ?? 0),
        availability:   row.availability ?? bs.availability ?? "",
        street_index:   num(bs.street_index ?? row.street_index ?? 1),
        legality:       row.legality ?? "",
        description:    row.description ?? "",
      },
      folder: null, flags: {}, _stats: { systemId: "shadowrun2e" },
    };

    writeItem(packDir, `${slugify(row.name)}.json`, item);
    count++;
  }
  console.log(`  Weapons: ${count}`);
}

// ── ARMOR ─────────────────────────────────────────────────────────────────────

async function extractArmor(db) {
  const packDir = path.join(OUT, "sr2e-armor");
  ensureDir(packDir);

  const { rows } = await db.query("SELECT * FROM gear WHERE category='armor' ORDER BY name");
  let count = 0;

  for (const row of rows) {
    const bs = row.base_stats ?? {};
    const item = {
      _id:    makeId(`armor:${row.name}`),
      name:   row.name,
      type:   "armor",
      img:    "icons/equipment/chest/breastplate-metal.webp",
      system: {
        ballistic:      num(bs.ballistic ?? bs.b ?? 0),
        impact:         num(bs.impact ?? bs.i ?? 0),
        concealability: num(bs.conceal ?? 0),
        cost:           num(bs.cost ?? row.cost ?? 0),
        availability:   row.availability ?? bs.availability ?? "",
        street_index:   num(bs.street_index ?? row.street_index ?? 1),
        legality:       row.legality ?? "",
        description:    row.description ?? "",
      },
      folder: null, flags: {}, _stats: { systemId: "shadowrun2e" },
    };
    writeItem(packDir, `${slugify(row.name)}.json`, item);
    count++;
  }
  console.log(`  Armor: ${count}`);
}

// ── GEAR (general equipment, excluding weapons/armor/vehicles/lifestyle) ──────

const SKIP_CATS = new Set(["weapon", "armor", "vehicle", "lifestyle"]);

async function extractGear(db) {
  const packDir = path.join(OUT, "sr2e-gear");
  ensureDir(packDir);

  const { rows } = await db.query(
    "SELECT * FROM gear WHERE category NOT IN ('weapon','armor','vehicle','lifestyle','cyberdeck') ORDER BY category, name"
  );
  let count = 0;

  for (const row of rows) {
    const bs = row.base_stats ?? {};
    const item = {
      _id:    makeId(`gear:${row.name}:${row.id}`),
      name:   row.name,
      type:   "gear",
      img:    "icons/containers/bags/pack-simple.webp",
      system: {
        category:       row.category ?? "misc",
        subcategory:    row.subcategory ?? "",
        rating:         num(bs.rating ?? 0),
        quantity:       1,
        concealability: num(bs.conceal ?? bs.concealability ?? 0),
        weight:         num(bs.weight ?? 0),
        cost:           num(bs.cost ?? row.cost ?? 0),
        availability:   row.availability ?? bs.availability ?? "",
        street_index:   num(bs.street_index ?? row.street_index ?? 1),
        legality:       row.legality ?? "",
        description:    row.description ?? "",
      },
      folder: null, flags: {}, _stats: { systemId: "shadowrun2e" },
    };
    writeItem(packDir, `${slugify(row.name)}-${row.id}.json`, item);
    count++;
  }
  console.log(`  Gear: ${count}`);
}

// ── CYBERDECKS ────────────────────────────────────────────────────────────────

async function extractCyberdecks(db) {
  const packDir = path.join(OUT, "sr2e-gear");
  ensureDir(packDir);

  const { rows } = await db.query("SELECT * FROM gear WHERE category='cyberdeck' ORDER BY name");
  let count = 0;

  for (const row of rows) {
    const bs = row.base_stats ?? {};
    const item = {
      _id:    makeId(`cyberdeck:${row.name}:${row.id}`),
      name:   row.name,
      type:   "gear",
      img:    "icons/equipment/chest/armor-simple-leather.webp",
      system: {
        category:     "cyberdeck",
        subcategory:  row.subcategory ?? "",
        rating:       num(bs.mpcp ?? bs.rating ?? 0),
        quantity:     1,
        concealability: num(bs.conceal ?? 0),
        weight:       num(bs.weight ?? 0),
        cost:         num(bs.cost ?? row.cost ?? 0),
        availability: row.availability ?? bs.availability ?? "",
        street_index: num(bs.street_index ?? row.street_index ?? 1),
        legality:     row.legality ?? "",
        description:  row.description ?? "",
      },
      folder: null, flags: {}, _stats: { systemId: "shadowrun2e" },
    };
    writeItem(packDir, `deck-${slugify(row.name)}-${row.id}.json`, item);
    count++;
  }
  console.log(`  Cyberdecks: ${count}`);
}

// ── CYBERWARE (from CSV) ───────────────────────────────────────────────────────

function extractCyberware() {
  const packDir = path.join(OUT, "sr2e-cyberware");
  ensureDir(packDir);

  const rows = parseCSV(CYBER_CSV);
  let count = 0;

  for (const row of rows) {
    const name        = row["Name"] ?? row["name"] ?? "";
    if (!name) continue;
    const baseEssence = num(row["Essence Cost"] ?? row["essence_cost"] ?? 0);
    const baseCost    = num(row["Cost"] ?? row["cost"] ?? 0);
    const modStr      = row["Modifiers"] ?? row["modifiers"] ?? "";
    const description = row["description"] ?? row["Description"] ?? "";
    const mods        = parseMods(modStr);

    for (const [gradeKey, grade] of Object.entries(GRADES)) {
      const essenceCost = Math.round(baseEssence * grade.mult * 100) / 100;
      const cost        = Math.round(baseCost * grade.costMult);
      const gradedName  = gradeKey === "standard" ? name : `${name} (${grade.label})`;

      const item = {
        _id:    makeId(`cyberware:${gradedName}`),
        name:   gradedName,
        type:   "cyberware",
        img:    "icons/equipment/head/helm-visor-technological.webp",
        system: {
          grade,
          essence_cost: essenceCost,
          installed:    false,
          category:     "bodyware",
          cost,
          availability: "",
          street_index: num(row["Index"] ?? row["street_index"] ?? 1),
          mods,
          description,
        },
        folder: null, flags: {}, _stats: { systemId: "shadowrun2e" },
      };

      writeItem(packDir, `${slugify(gradedName)}.json`, item);
      count++;
    }
  }
  console.log(`  Cyberware: ${count} (${count/4|0} base items × 4 grades)`);
}

// ── BIOWARE (from CSV) ────────────────────────────────────────────────────────

function extractBioware() {
  const packDir = path.join(OUT, "sr2e-bioware");
  ensureDir(packDir);

  const rows = parseCSV(BIO_CSV);
  let count = 0;

  for (const row of rows) {
    const name      = row["Name"] ?? row["name"] ?? "";
    if (!name) continue;
    const bi        = num(row["B.I."] ?? row["body_index"] ?? row["bi"] ?? 0);
    const baseCost  = num(row["Cost"] ?? row["cost"] ?? 0);
    const modStr    = row["MODIFIERS"] ?? row["Modifiers"] ?? row["modifiers"] ?? "";
    const desc      = row["description"] ?? row["Description"] ?? "";
    const mods      = parseMods(modStr);

    const item = {
      _id:    makeId(`bioware:${name}`),
      name,
      type:   "bioware",
      img:    "icons/magic/life/heart-glowing-green.webp",
      system: {
        body_index:   bi,
        installed:    false,
        category:     "enhancement",
        cost:         baseCost,
        availability: "",
        street_index: num(row["Index"] ?? row["street_index"] ?? 1),
        mods,
        description:  desc,
      },
      folder: null, flags: {}, _stats: { systemId: "shadowrun2e" },
    };

    writeItem(packDir, `${slugify(name)}.json`, item);
    count++;
  }
  console.log(`  Bioware: ${count}`);
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

const db = new Client(DB);
await db.connect();
console.log("Connected to database.\n");

console.log("Extracting from live DB:");
await extractWeapons(db);
await extractArmor(db);
await extractGear(db);
await extractCyberdecks(db);

console.log("\nExtracting from CSV files:");
extractCyberware();
extractBioware();

await db.end();
console.log("\nDone. Run:  npm run pack");

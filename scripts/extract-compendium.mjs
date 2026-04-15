/**
 * Shadowrun 2E — Compendium Extraction Script
 * Reads MCP SQL backup files and generates Foundry item JSON source files.
 *
 * Usage: node scripts/extract-compendium.mjs
 *
 * Source SQL files (read-only reference):
 *   C:\Users\Rick\Documents\Cline\MCP\shadowrun-gm\backups\backup_20251202_204229\
 */

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const SQL_DIR = "C:/Users/Rick/Documents/Cline/MCP/shadowrun-gm/backups/backup_20251202_204229";
const SRC_DIR = "./src/packs";

// ---------------------------------------------------------------------------
// Utility: parse a SQL VALUES block into an array of string columns.
// Handles single-quoted strings with escaped quotes, numbers, booleans, nulls.
// ---------------------------------------------------------------------------
function parseValues(valStr) {
  const cols = [];
  let i = 0;
  valStr = valStr.trim();
  // Strip surrounding parens
  if (valStr.startsWith("(")) valStr = valStr.slice(1);
  if (valStr.endsWith(")")) valStr = valStr.slice(0, -1);

  while (i < valStr.length) {
    // Skip whitespace/commas
    while (i < valStr.length && (valStr[i] === "," || valStr[i] === " ")) i++;
    if (i >= valStr.length) break;

    if (valStr[i] === "'") {
      // Quoted string — handle escaped ''
      let s = "";
      i++; // skip opening quote
      while (i < valStr.length) {
        if (valStr[i] === "'" && valStr[i + 1] === "'") {
          s += "'";
          i += 2;
        } else if (valStr[i] === "'") {
          i++; // closing quote
          break;
        } else {
          s += valStr[i++];
        }
      }
      cols.push(s);
    } else {
      // Unquoted token (number, boolean, null, uuid without quotes)
      let tok = "";
      while (i < valStr.length && valStr[i] !== ",") tok += valStr[i++];
      tok = tok.trim();
      if (tok === "NULL" || tok === "null") cols.push(null);
      else if (tok === "true") cols.push(true);
      else if (tok === "false") cols.push(false);
      else if (!isNaN(tok) && tok !== "") cols.push(Number(tok));
      else cols.push(tok);
    }
  }
  return cols;
}

// ---------------------------------------------------------------------------
// Extract INSERT rows from a SQL file.
// Returns array of arrays (each row = array of column values).
// Only handles single-row INSERT INTO table VALUES (...); format.
// ---------------------------------------------------------------------------
function extractRows(sqlText, tableName) {
  const rows = [];
  // Match INSERT INTO tableName (...) VALUES (...); — potentially multi-line values
  const re = new RegExp(`INSERT INTO ${tableName}[^V]*VALUES\\s*(\\([\\s\\S]*?\\));`, "g");
  let m;
  while ((m = re.exec(sqlText)) !== null) {
    try {
      rows.push(parseValues(m[1]));
    } catch (e) {
      // skip malformed row
    }
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Write a Foundry item JSON to src/packs/{pack}/{name}.json
// ---------------------------------------------------------------------------
function writeItem(pack, name, data) {
  const safe = name.replace(/[^a-zA-Z0-9\-_ ]/g, "").replace(/\s+/g, "-").toLowerCase().slice(0, 64);
  const file = path.join(SRC_DIR, pack, `${safe}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

// ---------------------------------------------------------------------------
// Duration normalisation: SQL uses "I","S","P" or full words
// ---------------------------------------------------------------------------
function normDuration(d) {
  if (!d) return "instant";
  const l = String(d).toLowerCase();
  if (l === "i" || l.startsWith("instant")) return "instant";
  if (l === "s" || l.startsWith("sustain")) return "sustained";
  if (l === "p" || l.startsWith("perm")) return "permanent";
  return "instant";
}

// ---------------------------------------------------------------------------
// Spell type normalisation: "P" → "physical", "M" → "mana"
// ---------------------------------------------------------------------------
function normSpellType(t) {
  if (!t) return "physical";
  return String(t).toUpperCase() === "M" ? "mana" : "physical";
}

// ---------------------------------------------------------------------------
// Category normalisation for spells
// ---------------------------------------------------------------------------
function normCategory(c) {
  if (!c) return "combat";
  const l = String(c).toLowerCase();
  if (l.includes("detect")) return "detection";
  if (l.includes("health")) return "health";
  if (l.includes("illus")) return "illusion";
  if (l.includes("manip")) return "manipulation";
  return "combat";
}

// ---------------------------------------------------------------------------
// Drain code normalisation: strip outer brackets, clean up
// ---------------------------------------------------------------------------
function normDrain(d) {
  if (!d) return "(F/2)M";
  return String(d).replace(/^\[/, "").replace(/\]$/, "").trim();
}

// ---------------------------------------------------------------------------
// SPELLS
// ---------------------------------------------------------------------------
function extractSpells() {
  const sqlPath = path.join(SQL_DIR, "spells.sql");
  if (!fs.existsSync(sqlPath)) { console.error("spells.sql not found"); return; }
  const sql = fs.readFileSync(sqlPath, "utf8");

  // Column order from schema:
  // id, name, category, type, target, duration, drain_code, description, source_book,
  // source_chunk_id, created_at, casting_tn, is_resistable, resistance_attribute,
  // drain_context_type, is_house_rule, house_rule_id, updated_at
  const rows = extractRows(sql, "spells");
  let count = 0;

  for (const row of rows) {
    const [id, name, category, type, target, duration, drain_code, description, source_book,
      , , casting_tn, is_resistable, resistance_attribute, , is_house_rule] = row;

    // Skip house rules
    if (is_house_rule === true || is_house_rule === "true") continue;
    if (!name) continue;

    const item = {
      _id:    id?.replace(/-/g, "").slice(0, 16) || randomUUID().replace(/-/g, "").slice(0, 16),
      name:   String(name),
      type:   "spell",
      img:    "icons/magic/symbols/rune-sigil-purple.webp",
      system: {
        category:    normCategory(category),
        type:        normSpellType(type),
        range:       "los",
        duration:    normDuration(duration),
        drain_code:  normDrain(drain_code),
        force:       1,
        description: description ? `<p>${String(description).replace(/\n/g, "</p><p>")}</p>` : "",
      },
      folder: null,
      flags:  {},
      _stats: { systemId: "shadowrun2e" },
    };

    writeItem("sr2e-spells", name, item);
    count++;
  }
  console.log(`Spells: ${count} written`);
}

// ---------------------------------------------------------------------------
// ADEPT POWERS
// ---------------------------------------------------------------------------
function extractAdeptPowers() {
  const sqlPath = path.join(SQL_DIR, "adept_powers.sql");
  if (!fs.existsSync(sqlPath)) { console.error("adept_powers.sql not found"); return; }
  const sql = fs.readFileSync(sqlPath, "utf8");

  // Column order: id, name, power_point_cost, description, is_leveled, ...
  const rows = extractRows(sql, "adept_powers");
  let count = 0;

  for (const row of rows) {
    const [id, name, power_point_cost, description, is_leveled] = row;
    if (!name) continue;

    const cost = parseFloat(power_point_cost) || 0.5;
    const item = {
      _id:    id?.replace(/-/g, "").slice(0, 16) || randomUUID().replace(/-/g, "").slice(0, 16),
      name:   String(name),
      type:   "adept_power",
      img:    "icons/magic/perception/hand-eye-open-yellow.webp",
      system: {
        cost:        cost,
        level:       1,
        active:      false,
        description: description ? `<p>${String(description).replace(/\n/g, "</p><p>")}</p>` : "",
      },
      folder: null,
      flags:  {},
      _stats: { systemId: "shadowrun2e" },
    };

    writeItem("sr2e-adept-powers", name, item);
    count++;
  }
  console.log(`Adept Powers: ${count} written`);
}

// ---------------------------------------------------------------------------
// QUALITIES
// ---------------------------------------------------------------------------
function extractQualities() {
  const sqlPath = path.join(SQL_DIR, "qualities.sql");
  if (!fs.existsSync(sqlPath)) { console.error("qualities.sql not found"); return; }
  const sql = fs.readFileSync(sqlPath, "utf8");

  // Column order: id, name, quality_type, cost, requirements, incompatible_with,
  //               game_effects, description, game_notes, source, page_reference, ...
  const rows = extractRows(sql, "qualities");
  let count = 0;

  for (const row of rows) {
    const [id, name, quality_type, cost, , , , description] = row;
    if (!name) continue;

    const item = {
      _id:    (id != null ? String(id) : randomUUID()).replace(/-/g, "").slice(0, 16),
      name:   String(name),
      type:   "quality",
      img:    quality_type === "edge"
        ? "icons/magic/symbols/star-gold-white.webp"
        : "icons/magic/symbols/rune-carved-bone.webp",
      system: {
        quality_type: quality_type === "flaw" ? "negative" : "positive",
        cost:         parseFloat(cost) || 0,
        description:  description ? `<p>${String(description).replace(/\n/g, "</p><p>")}</p>` : "",
      },
      folder: null,
      flags:  {},
      _stats: { systemId: "shadowrun2e" },
    };

    writeItem("sr2e-qualities", name, item);
    count++;
  }
  console.log(`Qualities: ${count} written`);
}

// ---------------------------------------------------------------------------
// GRENADES (hand-crafted from MCP combat_ops.py data)
// ---------------------------------------------------------------------------
function writeGrenades() {
  const grenades = [
    { name: "Fragmentation Grenade",    power: 10, falloff: 1, level: "S", damage_type: "physical", aerodynamic: false, cost: 50,  avail: "4/48 hrs" },
    { name: "Concussion Grenade",       power: 10, falloff: 1, level: "M", damage_type: "stun",     aerodynamic: false, cost: 50,  avail: "4/48 hrs" },
    { name: "Flashbang Grenade",        power: 12, falloff: 1, level: "M", damage_type: "stun",     aerodynamic: false, cost: 60,  avail: "5/48 hrs" },
    { name: "White Phosphorus Grenade", power: 14, falloff: 1, level: "S", damage_type: "physical", aerodynamic: false, cost: 100, avail: "8/14 days" },
    { name: "Incendiary Grenade",       power: 10, falloff: 1, level: "S", damage_type: "physical", aerodynamic: false, cost: 75,  avail: "6/72 hrs" },
    { name: "Smoke Grenade",            power: 0,  falloff: 0, level: "L", damage_type: "stun",     aerodynamic: false, cost: 30,  avail: "3/24 hrs" },
    { name: "Defensive HE Grenade",     power: 10, falloff: 2, level: "S", damage_type: "physical", aerodynamic: false, cost: 60,  avail: "5/48 hrs" },
    { name: "Aerodynamic Frag Grenade", power: 10, falloff: 1, level: "S", damage_type: "physical", aerodynamic: true,  cost: 70,  avail: "5/48 hrs" },
    { name: "IPE Offensive HE",         power: 15, falloff: 1, level: "D", damage_type: "physical", aerodynamic: false, cost: 150, avail: "10/14 days" },
    { name: "IPE Concussion",           power: 16, falloff: 1, level: "S", damage_type: "stun",     aerodynamic: false, cost: 150, avail: "10/14 days" },
  ];

  for (const g of grenades) {
    const item = {
      _id:    randomUUID().replace(/-/g, "").slice(0, 16),
      name:   g.name,
      type:   "weapon",
      img:    "icons/weapons/thrown/grenade-round-grey.webp",
      system: {
        category:     "grenade",
        skill:        "throwing_weapons",
        damage_power: g.power,
        damage_level: g.level,
        reach:        0,
        concealability: 6,
        ammo_type:    "regular",
        ammo_current: 1,
        ammo_max:     1,
        recoil_comp:  0,
        smartlink:    false,
        blast_falloff: g.falloff,
        aerodynamic:  g.aerodynamic,
        fire_modes:   { ss: true, sa: false, bf: false, fa: false },
        equipped:     false,
        description:  `<p>Power ${g.power}${g.damage_level}, falloff ${g.falloff} per meter. ${g.damage_type === "stun" ? "Stun damage." : "Physical damage."}</p>`,
        price:        g.cost,
        availability: g.avail,
        restriction:  "",
      },
      folder: null,
      flags:  {},
      _stats: { systemId: "shadowrun2e" },
    };
    writeItem("sr2e-grenades", g.name, item);
  }
  console.log(`Grenades: ${grenades.length} written`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
extractSpells();
extractAdeptPowers();
extractQualities();
writeGrenades();
console.log("Done. Run: npm run pack");

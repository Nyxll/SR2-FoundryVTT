/**
 * Writes SR2E core archetype NPCs to src/packs/sr2e-archetypes/
 * Data sourced from core-archtypes.ocr.txt
 */
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DEST = "./src/packs/sr2e-archetypes";
if (!fs.existsSync(DEST)) fs.mkdirSync(DEST, { recursive: true });

function id() { return randomUUID().replace(/-/g, "").slice(0, 16); }

function npc(name, attrs, skills, pools, cyberware, notes, archetype = "mundane") {
  const { body, quickness, strength, charisma, intelligence, willpower, essence = 6, magic = 0, reaction } = attrs;
  const skillMap = {};
  for (const [k, v] of Object.entries(skills)) skillMap[k] = { rating: v, specialization: "" };

  return {
    _id: id(),
    name,
    type: "npc",
    img: "icons/svg/mystery-man.svg",
    system: {
      attributes: {
        body:         { base: body,         mod: 0 },
        quickness:    { base: quickness,    mod: 0 },
        strength:     { base: strength,     mod: 0 },
        charisma:     { base: charisma,     mod: 0 },
        intelligence: { base: intelligence, mod: 0 },
        willpower:    { base: willpower,    mod: 0 },
        essence:      { value: essence },
        magic:        { base: magic,        mod: 0 },
        reaction:     { base: reaction,     mod: 0 },
      },
      skills: skillMap,
      pools: {
        combat: pools.combat ?? 0,
        magic:  pools.magic  ?? 0,
        hacking: pools.hacking ?? 0,
      },
      archetype,
      monitors: {
        physical: { value: 0, max: 10 },
        stun:     { value: 0, max: 10 },
      },
      notes: [
        cyberware.length ? `<p><strong>Cyberware:</strong> ${cyberware.join(", ")}</p>` : "",
        notes ? `<p>${notes}</p>` : "",
      ].filter(Boolean).join("\n"),
    },
    folder: null,
    flags: {},
    _stats: { systemId: "shadowrun2e" },
  };
}

const archetypes = [
  npc("Bodyguard",
    { body: 6, quickness: 6, strength: 5, charisma: 3, intelligence: 5, willpower: 5, essence: 0.2, reaction: 9 },
    { car: 6, firearms: 6, negotiation: 4, stealth: 2, unarmed_combat: 6 },
    { combat: 8 },
    ["Air Filtration 5", "Dermal Plating 3", "Skillwires 3", "Smartlink", "Wired Reflexes 2"],
    "Reaction 9 + 3D6 initiative. Body 6(9) with Dermal Plating."
  ),

  npc("Combat Mage",
    { body: 2, quickness: 4, strength: 2, charisma: 2, intelligence: 5, willpower: 5, essence: 5.8, magic: 5, reaction: 4 },
    { conjuring: 3, sorcery: 6, firearms: 3, magical_theory: 4, unarmed_combat: 2 },
    { combat: 7, magic: 6 },
    ["Cybereyes (Thermographic, Low-Light)"],
    "Mage archetype. Spells: Manaball 4, Mana Bolt 4, Power Bolt 3, Clairvoyance 3, Detect Enemies 2, Personal Combat Sense 5, Heal 3, Increase Reaction +2, Armor 3, Confusion 3.",
    "mage"
  ),

  npc("Decker",
    { body: 2, quickness: 4, strength: 3, charisma: 1, intelligence: 6, willpower: 4, essence: 5.5, reaction: 5 },
    { bike: 4, computer: 6, electronics: 6, firearms: 3, stealth: 2 },
    { combat: 7, hacking: 11 },
    ["Datajack", "Headware Memory 30 Mp"],
    "Hacking pool 11 (13 in Matrix). Fuchi Cyber-4 deck with Response Increase 1."
  ),

  npc("Detective",
    { body: 4, quickness: 4, strength: 3, charisma: 3, intelligence: 6, willpower: 4, essence: 6, reaction: 5 },
    { biotech: 2, car: 4, computer: 4, etiquette: 3, firearms: 6, negotiation: 6, stealth: 5, unarmed_combat: 6 },
    { combat: 7 },
    [],
    "No cyberware. 6 contacts. Ares Predator + Walther Palm Pistol."
  ),

  npc("Dwarf Mercenary",
    { body: 6, quickness: 3, strength: 5, charisma: 2, intelligence: 3, willpower: 4, essence: 5.5, reaction: 3 },
    { car: 4, firearms: 6, gunnery: 5, stealth: 4, throwing_weapons: 4, unarmed_combat: 5 },
    { combat: 4 },
    ["Smartlink"],
    "Dwarf: natural thermographic vision, +2 Body for disease resistance. FN-HAR Assault Rifle."
  ),

  npc("Elven Decker",
    { body: 2, quickness: 5, strength: 2, charisma: 5, intelligence: 5, willpower: 4, essence: 5.5, reaction: 5 },
    { bike: 3, computer: 5, electronics: 3, firearms: 3 },
    { combat: 7, hacking: 10 },
    ["Datajack", "Headware Memory 30 Mp"],
    "Elf: natural low-light eyes. Hacking pool 10 (12 in Matrix). Fuchi Cyber-4."
  ),

  npc("Former Company Man",
    { body: 4, quickness: 4, strength: 4, charisma: 2, intelligence: 3, willpower: 3, essence: 1.3, reaction: 8 },
    { car: 6, computer: 3, demolitions: 2, firearms: 6, stealth: 4, unarmed_combat: 6 },
    { combat: 5 },
    ["Datajack", "Muscle Replacement 1", "Smartgun Link", "Wired Reflexes 2"],
    "Reaction 8 + 3D6 initiative. Quickness 4(5), Strength 4(5) with Muscle Replacement."
  ),

  npc("Former Wage Mage",
    { body: 2, quickness: 3, strength: 1, charisma: 1, intelligence: 6, willpower: 4, essence: 6, magic: 6, reaction: 4 },
    { conjuring: 6, sorcery: 6, firearms: 3, magical_theory: 6, negotiation: 2 },
    { combat: 6, magic: 6 },
    [],
    "Mage archetype. No cyberware. Spell orientation: Fighter (Fireball 5, Mana Bolt 6, Powerball 6, Sleep 5), Healer, or Prowler.",
    "mage"
  ),

  npc("Gang Member",
    { body: 5, quickness: 6, strength: 5, charisma: 6, intelligence: 4, willpower: 4, essence: 5.7, reaction: 5 },
    { armed_combat: 4, bike: 3, etiquette: 4, firearms: 4, projectile_weapons: 3, stealth: 3, unarmed_combat: 3 },
    { combat: 7 },
    ["Hand Razors", "Cybereyes (Low-Light)"],
    "Can call on 2D6 gang members for backup. Streetline Special pistol."
  ),

  npc("Mercenary",
    { body: 5, quickness: 4, strength: 5, charisma: 3, intelligence: 4, willpower: 3, essence: 3.4, reaction: 6 },
    { armed_combat: 6, car: 4, demolitions: 3, firearms: 6, gunnery: 4, stealth: 3, throwing_weapons: 3, unarmed_combat: 6 },
    { combat: 5 },
    ["Cybereyes (Low-Light)", "Radio Receiver", "Wired Reflexes 1"],
    "Reaction 6 + 2D6 initiative. Ingram Valiant LMG + Ares Predator."
  ),

  npc("Rigger",
    { body: 5, quickness: 6, strength: 4, charisma: 4, intelligence: 6, willpower: 5, essence: 1.35, reaction: 10 },
    { bike: 4, car: 5, computer: 3, electronics: 3, firearms: 2, gunnery: 4 },
    { combat: 8 },
    ["Cybereyes (Low-Light, Flare Protection, Thermographic)", "Datajack", "Radio", "Smartlink", "Vehicle Control Rig 2"],
    "Reaction 10 + 3D6 when rigged. Control pool 10 rigged. Eurocar Westwind 2000 + surveillance drones."
  ),

  npc("Shaman",
    { body: 3, quickness: 3, strength: 3, charisma: 5, intelligence: 4, willpower: 6, essence: 6, magic: 6, reaction: 3 },
    { armed_combat: 3, conjuring: 6, sorcery: 5, magical_theory: 3, stealth: 3 },
    { combat: 6, magic: 5 },
    [],
    "Shaman archetype (wilderness totem). Spell orientation: Fighter (Mana Bolt 4, Powerball 6, Sleep 5), Deceiver, Healer, or Detector.",
    "shaman"
  ),

  npc("Street Mage",
    { body: 3, quickness: 3, strength: 2, charisma: 3, intelligence: 4, willpower: 5, essence: 6, magic: 6, reaction: 3 },
    { bike: 2, conjuring: 6, sorcery: 6, magical_theory: 5, stealth: 3, unarmed_combat: 2 },
    { combat: 6, magic: 6 },
    [],
    "Mage archetype (urban/hermetic). Spell orientation: Fighter, Deceiver, Healer, or Detector.",
    "mage"
  ),

  npc("Street Samurai",
    { body: 6, quickness: 4, strength: 6, charisma: 2, intelligence: 5, willpower: 5, essence: 0.1, reaction: 9 },
    { armed_combat: 3, bike: 2, etiquette: 4, firearms: 5, stealth: 4, unarmed_combat: 6 },
    { combat: 7 },
    ["Cybereyes (Low-Light)", "Dermal Plating 2", "Muscle Replacement 1", "Retractable Hand Razors", "Smartlink", "Wired Reflexes 2"],
    "Reaction 9 + 3D6 initiative. Body 6(8), Quickness 4(5), Strength 6(7) with cyber. Uzi III + Ares Predator."
  ),

  npc("Street Shaman",
    { body: 4, quickness: 3, strength: 2, charisma: 5, intelligence: 4, willpower: 6, essence: 6, magic: 6, reaction: 3 },
    { conjuring: 5, sorcery: 5, firearms: 3, magical_theory: 5, stealth: 3 },
    { combat: 6, magic: 5 },
    [],
    "Shaman archetype (urban totem). Spell orientation: Fighter, Deceiver, Healer, or Detector.",
    "shaman"
  ),

  npc("Tribesman",
    { body: 5, quickness: 5, strength: 5, charisma: 5, intelligence: 5, willpower: 5, essence: 6, reaction: 5 },
    { armed_combat: 5, biotech: 3, etiquette: 4, projectile_weapons: 6, stealth: 6 },
    { combat: 7 },
    [],
    "No cyberware. Can call on 2D6 tribe members for backup. Bow + 20 arrows. Excellent all-around attributes."
  ),
];

for (const actor of archetypes) {
  const safe = actor.name.replace(/[^a-zA-Z0-9\-_ ]/g, "").replace(/\s+/g, "-").toLowerCase().slice(0, 64);
  const file = path.join(DEST, `${safe}.json`);
  fs.writeFileSync(file, JSON.stringify(actor, null, 2), "utf8");
  console.log(`  → ${actor.name}`);
}
console.log(`Archetypes: ${archetypes.length} written`);

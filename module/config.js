/**
 * Shadowrun 2nd Edition — System Configuration
 * All game constants and lookup tables for SR2E rules.
 */

export const SR2E = {};

// ---------------------------------------------------------------------------
// Attributes
// ---------------------------------------------------------------------------

SR2E.ATTRIBUTES = ["body", "quickness", "strength", "charisma", "intelligence", "willpower"];

SR2E.SECONDARY_ATTRIBUTES = ["essence", "magic", "reaction"];

// Metatype attribute modifiers applied on top of base human ranges.
// Format: { base: [min, max], modifier: [min_mod, max_mod] }
SR2E.METATYPE_ATTRIBUTE_MODS = {
  human: {
    body:         { min: 1, max: 6 },
    quickness:    { min: 1, max: 6 },
    strength:     { min: 1, max: 6 },
    charisma:     { min: 1, max: 6 },
    intelligence: { min: 1, max: 6 },
    willpower:    { min: 1, max: 6 },
    essence:      { base: 6 },
    magic:        { base: 0 },
  },
  elf: {
    body:         { min: 1, max: 6 },
    quickness:    { min: 2, max: 7 },
    strength:     { min: 1, max: 6 },
    charisma:     { min: 3, max: 8 },
    intelligence: { min: 1, max: 6 },
    willpower:    { min: 1, max: 6 },
    essence:      { base: 6 },
    magic:        { base: 0 },
  },
  dwarf: {
    body:         { min: 3, max: 8 },
    quickness:    { min: 1, max: 5 },
    strength:     { min: 3, max: 8 },
    charisma:     { min: 1, max: 6 },
    intelligence: { min: 1, max: 6 },
    willpower:    { min: 2, max: 7 },
    essence:      { base: 6 },
    magic:        { base: 0 },
  },
  ork: {
    body:         { min: 4, max: 9 },
    quickness:    { min: 1, max: 6 },
    strength:     { min: 3, max: 8 },
    charisma:     { min: 1, max: 5 },
    intelligence: { min: 1, max: 5 },
    willpower:    { min: 1, max: 6 },
    essence:      { base: 6 },
    magic:        { base: 0 },
  },
  troll: {
    body:         { min: 5, max: 10 },
    quickness:    { min: 1, max: 5 },
    strength:     { min: 5, max: 10 },
    charisma:     { min: 1, max: 4 },
    intelligence: { min: 1, max: 5 },
    willpower:    { min: 1, max: 6 },
    essence:      { base: 6 },
    magic:        { base: 0 },
  },
};

// ---------------------------------------------------------------------------
// Skills — grouped by category
// ---------------------------------------------------------------------------

SR2E.SKILL_CATEGORIES = {
  combat: "SR2E.SkillCategories.combat",
  vehicle: "SR2E.SkillCategories.vehicle",
  technical: "SR2E.SkillCategories.technical",
  social: "SR2E.SkillCategories.social",
  knowledge: "SR2E.SkillCategories.knowledge",
  magic: "SR2E.SkillCategories.magic",
  outdoor: "SR2E.SkillCategories.outdoor",
  stealth: "SR2E.SkillCategories.stealth",
};

// Each skill: { label, category, linkedAttr }
// linkedAttr is the primary attribute used to form the default dice pool.
SR2E.SKILLS = {
  // Combat
  armed_combat:        { label: "SR2E.Skills.armed_combat",        category: "combat",    linkedAttr: "quickness" },
  unarmed_combat:      { label: "SR2E.Skills.unarmed_combat",      category: "combat",    linkedAttr: "quickness" },
  firearms:            { label: "SR2E.Skills.firearms",            category: "combat",    linkedAttr: "quickness" },
  heavy_weapons:       { label: "SR2E.Skills.heavy_weapons",       category: "combat",    linkedAttr: "quickness" },
  projectile_weapons:  { label: "SR2E.Skills.projectile_weapons",  category: "combat",    linkedAttr: "quickness" },
  throwing_weapons:    { label: "SR2E.Skills.throwing_weapons",    category: "combat",    linkedAttr: "quickness" },
  stealth:             { label: "SR2E.Skills.stealth",             category: "stealth",   linkedAttr: "quickness" },
  athletics:           { label: "SR2E.Skills.athletics",           category: "combat",    linkedAttr: "body" },

  // Vehicle
  bike:                { label: "SR2E.Skills.bike",                category: "vehicle",   linkedAttr: "reaction" },
  car:                 { label: "SR2E.Skills.car",                 category: "vehicle",   linkedAttr: "reaction" },
  hovercraft:          { label: "SR2E.Skills.hovercraft",          category: "vehicle",   linkedAttr: "reaction" },
  motorboat:           { label: "SR2E.Skills.motorboat",           category: "vehicle",   linkedAttr: "reaction" },
  sailboat:            { label: "SR2E.Skills.sailboat",            category: "vehicle",   linkedAttr: "reaction" },
  fixed_wing:          { label: "SR2E.Skills.fixed_wing",          category: "vehicle",   linkedAttr: "reaction" },
  rotary_wing:         { label: "SR2E.Skills.rotary_wing",         category: "vehicle",   linkedAttr: "reaction" },
  vectored_thrust:     { label: "SR2E.Skills.vectored_thrust",     category: "vehicle",   linkedAttr: "reaction" },

  // Technical
  computer:            { label: "SR2E.Skills.computer",            category: "technical", linkedAttr: "intelligence" },
  electronics:         { label: "SR2E.Skills.electronics",         category: "technical", linkedAttr: "intelligence" },
  demolitions:         { label: "SR2E.Skills.demolitions",         category: "technical", linkedAttr: "intelligence" },
  biotech:             { label: "SR2E.Skills.biotech",             category: "technical", linkedAttr: "intelligence" },
  first_aid:           { label: "SR2E.Skills.first_aid",           category: "technical", linkedAttr: "intelligence" },
  security_systems:    { label: "SR2E.Skills.security_systems",    category: "technical", linkedAttr: "intelligence" },
  forgery:             { label: "SR2E.Skills.forgery",             category: "technical", linkedAttr: "intelligence" },
  lockpicking:         { label: "SR2E.Skills.lockpicking",         category: "technical", linkedAttr: "intelligence" },

  // Social
  etiquette:           { label: "SR2E.Skills.etiquette",           category: "social",    linkedAttr: "charisma" },
  leadership:          { label: "SR2E.Skills.leadership",          category: "social",    linkedAttr: "charisma" },
  negotiations:        { label: "SR2E.Skills.negotiations",        category: "social",    linkedAttr: "charisma" },
  interrogation:       { label: "SR2E.Skills.interrogation",       category: "social",    linkedAttr: "charisma" },
  instruction:         { label: "SR2E.Skills.instruction",         category: "social",    linkedAttr: "charisma" },

  // Outdoor / Stealth
  wilderness_survival: { label: "SR2E.Skills.wilderness_survival", category: "outdoor",   linkedAttr: "intelligence" },
  tracking:            { label: "SR2E.Skills.tracking",            category: "outdoor",   linkedAttr: "intelligence" },
  navigation:          { label: "SR2E.Skills.navigation",          category: "outdoor",   linkedAttr: "intelligence" },
  perception:          { label: "SR2E.Skills.perception",          category: "outdoor",   linkedAttr: "intelligence" },
  disguise:            { label: "SR2E.Skills.disguise",            category: "stealth",   linkedAttr: "charisma" },
  escape_artist:       { label: "SR2E.Skills.escape_artist",       category: "stealth",   linkedAttr: "quickness" },
  palming:             { label: "SR2E.Skills.palming",             category: "stealth",   linkedAttr: "quickness" },
  pickpocket:          { label: "SR2E.Skills.pickpocket",          category: "stealth",   linkedAttr: "quickness" },

  // Magic
  sorcery:             { label: "SR2E.Skills.sorcery",             category: "magic",     linkedAttr: "magic" },
  conjuring:           { label: "SR2E.Skills.conjuring",           category: "magic",     linkedAttr: "magic" },
  enchanting:          { label: "SR2E.Skills.enchanting",          category: "magic",     linkedAttr: "magic" },
  centering:           { label: "SR2E.Skills.centering",           category: "magic",     linkedAttr: "willpower" },
  aura_reading:        { label: "SR2E.Skills.aura_reading",        category: "magic",     linkedAttr: "intelligence" },
  astral_combat:       { label: "SR2E.Skills.astral_combat",       category: "magic",     linkedAttr: "willpower" },
};

SR2E.COMBAT_SKILLS = ["armed_combat", "unarmed_combat", "firearms", "heavy_weapons",
  "projectile_weapons", "throwing_weapons", "astral_combat"];

SR2E.MAGIC_SKILLS = ["sorcery", "conjuring", "enchanting", "centering", "aura_reading", "astral_combat"];

// ---------------------------------------------------------------------------
// Archetypes
// ---------------------------------------------------------------------------

SR2E.ARCHETYPES = {
  mundane:           "SR2E.Archetypes.mundane",
  adept:             "SR2E.Archetypes.adept",
  physical_magician: "SR2E.Archetypes.physical_magician",
  mage:              "SR2E.Archetypes.mage",
  shaman:            "SR2E.Archetypes.shaman",
  decker:            "SR2E.Archetypes.decker",
  rigger:            "SR2E.Archetypes.rigger",
  street_samurai:    "SR2E.Archetypes.street_samurai",
};

SR2E.MAGIC_ARCHETYPES = ["adept", "physical_magician", "mage", "shaman"];
SR2E.DECKER_ARCHETYPES = ["decker", "rigger"];

// Physical magician: splits Magic attribute between adept power points and casting Magic Rating.
// Spell pool = Sorcery rating; Magic Pool max = casting side only.
SR2E.PHYSICAL_MAGICIAN_ARCHETYPES = ["physical_magician"];

// ---------------------------------------------------------------------------
// Metatypes
// ---------------------------------------------------------------------------

SR2E.METATYPES = {
  human: "SR2E.Metatypes.human",
  elf:   "SR2E.Metatypes.elf",
  dwarf: "SR2E.Metatypes.dwarf",
  ork:   "SR2E.Metatypes.ork",
  troll: "SR2E.Metatypes.troll",
};

// ---------------------------------------------------------------------------
// Condition Monitors
// ---------------------------------------------------------------------------

// SR2E condition monitors: flat 10 boxes each (physical and stun).
// No formula — Body and Willpower do NOT affect monitor size in SR2E 2nd Edition.
SR2E.MONITOR_SIZE = { physical: 10, stun: 10 };

// Damage level box thresholds — how many boxes each level represents on the monitor.
// Used for wound modifier calculation. (SR2E Core, Damage chapter)
SR2E.WOUND_BOXES = { L: 1, M: 3, S: 6, D: 10 };

// Natural metatype reach bonus for melee combat.
// Most metatypes = 0; Trolls get +1 (larger frame).
SR2E.METATYPE_REACH = {
  human: 0, elf: 0, dwarf: 0, ork: 0, troll: 1,
};

// Wound TN modifier per damage track (SR2E Core Rules — Damage and Healing):
//   0 boxes   = +0 (Uninjured)
//   1-2 boxes = +1 (Light)
//   3-5 boxes = +2 (Moderate)
//   6-9 boxes = +3 (Serious)
//   10+ boxes = +4 (Deadly / unconscious)
// Physical and Stun tracks each have their own penalty; they are CUMULATIVE.
// This value is ADDED to the Target Number, not subtracted from the pool.
SR2E.woundModifier = function(boxesFilled) {
  if (boxesFilled >= 10) return 4;  // Deadly
  if (boxesFilled >= 6)  return 3;  // Serious
  if (boxesFilled >= 3)  return 2;  // Moderate
  if (boxesFilled >= 1)  return 1;  // Light
  return 0;
};

// ---------------------------------------------------------------------------
// Dice & Target Numbers
// ---------------------------------------------------------------------------

SR2E.DEFAULT_TARGET_NUMBER = 4;

// SR2E dice pool: roll Nd6, count each die >= TN as a success.
// Rule of Six (non-initiative only): roll 6 → re-roll and ADD to 6 → check combined total vs TN.
// A 6 is NOT auto-success; the combined total must still meet or beat the TN.
// There are NO glitch mechanics in SR2E (those are SR4/5/6 rules).

// ---------------------------------------------------------------------------
// Damage Codes
// ---------------------------------------------------------------------------

// Weapon damage codes: Power Level + Damage Level (L/M/S/D)
SR2E.DAMAGE_LEVELS = ["L", "M", "S", "D"];

SR2E.DAMAGE_STAGING = {
  // Each net success from attacker stages damage up one level
  // Each net success from defender stages damage down one level
  order: ["L", "M", "S", "D"],
};

// ---------------------------------------------------------------------------
// Weapon Categories
// ---------------------------------------------------------------------------

SR2E.WEAPON_CATEGORIES = {
  pistol:       "SR2E.WeaponCategories.pistol",
  smg:          "SR2E.WeaponCategories.smg",
  rifle:        "SR2E.WeaponCategories.rifle",
  shotgun:      "SR2E.WeaponCategories.shotgun",
  heavy_weapon: "SR2E.WeaponCategories.heavy_weapon",
  melee:        "SR2E.WeaponCategories.melee",
  thrown:       "SR2E.WeaponCategories.thrown",
  bow:          "SR2E.WeaponCategories.bow",
  grenade:      "SR2E.WeaponCategories.grenade",
};

// Range bands per weapon category (in meters): [short, medium, long, extreme]
SR2E.RANGE_BANDS = {
  pistol:       [5,  20,  40,  60],
  smg:          [10, 40,  80,  150],
  rifle:        [50, 150, 350, 550],
  shotgun:      [10, 20,  40,  60],
  heavy_weapon: [40, 150, 400, 800],
  melee:        [1,  1,   1,   1],
  thrown:       [3,  10,  20,  35],
  bow:          [10, 30,  60,  120],
  grenade:      [5,  10,  15,  20],
};

// ---------------------------------------------------------------------------
// Spell Categories & Types
// ---------------------------------------------------------------------------

SR2E.SPELL_CATEGORIES = {
  combat:       "SR2E.SpellCategories.combat",
  detection:    "SR2E.SpellCategories.detection",
  health:       "SR2E.SpellCategories.health",
  illusion:     "SR2E.SpellCategories.illusion",
  manipulation: "SR2E.SpellCategories.manipulation",
};

SR2E.SPELL_TYPES = {
  physical: "SR2E.SpellTypes.physical",
  mana:     "SR2E.SpellTypes.mana",
};

SR2E.SPELL_RANGES = {
  touch:      "Touch",
  los:        "Line of Sight",
  los_area:   "LOS (Area)",
  self:       "Self",
};

SR2E.SPELL_DURATIONS = {
  instant:    "Instant",
  sustained:  "Sustained",
  permanent:  "Permanent",
};

// Drain codes (spell drain severity)
SR2E.DRAIN_CODES = ["(F/2-2)L", "(F/2-1)L", "(F/2)L", "(F/2)M", "(F/2+1)M",
  "(F/2)S", "(F/2+1)S", "(F/2)D"];

// ---------------------------------------------------------------------------
// Spirit Types
// ---------------------------------------------------------------------------

SR2E.SPIRIT_TYPES = {
  // Hermetic elementals
  fire:    "SR2E.SpiritTypes.fire",
  water:   "SR2E.SpiritTypes.water",
  earth:   "SR2E.SpiritTypes.earth",
  air:     "SR2E.SpiritTypes.air",
  // Shamanic totems' spirits
  city:    "SR2E.SpiritTypes.city",
  field:   "SR2E.SpiritTypes.field",
  forest:  "SR2E.SpiritTypes.forest",
  hearth:  "SR2E.SpiritTypes.hearth",
  lake:    "SR2E.SpiritTypes.lake",
  river:   "SR2E.SpiritTypes.river",
  prairie: "SR2E.SpiritTypes.prairie",
  storm:   "SR2E.SpiritTypes.storm",
  sea:     "SR2E.SpiritTypes.sea",
};

// ---------------------------------------------------------------------------
// Cyberware / Bioware
// ---------------------------------------------------------------------------

SR2E.CYBERWARE_GRADES = {
  standard:  { label: "Standard",  essenceMult: 1.0 },
  alphaware: { label: "Alphaware", essenceMult: 0.8 },
  betaware:  { label: "Betaware",  essenceMult: 0.6 },
  deltaware: { label: "Deltaware", essenceMult: 0.4 },
  used:      { label: "Used",      essenceMult: 1.25 },
};

SR2E.CYBERWARE_CATEGORIES = {
  headware:      "Headware",
  bodyware:      "Bodyware",
  cyberlimbs:    "Cyberlimbs",
  weaponry:      "Weaponry",
  sensory:       "Sensory",
  skillwires:    "Skillwires",
  communications:"Communications",
};

// ---------------------------------------------------------------------------
// Matrix (SR2E — much simpler than SR6)
// Decks have MPCP rating; programs have ratings.
// ---------------------------------------------------------------------------

SR2E.MATRIX_PROGRAM_TYPES = {
  attack:    "Attack",
  browse:    "Browse",
  decrypt:   "Decrypt",
  deception: "Deception",
  evaluate:  "Evaluate",
  hide:      "Hide",
  locate:    "Locate",
  read_write:"Read/Write",
  scanner:   "Scanner",
  spoof:     "Spoof",
  trace:     "Trace",
};

// ---------------------------------------------------------------------------
// Quality Categories
// ---------------------------------------------------------------------------

SR2E.QUALITY_TYPES = {
  positive: "Positive",
  negative: "Negative",
};

// ---------------------------------------------------------------------------
// Vehicle Attributes
// ---------------------------------------------------------------------------

SR2E.VEHICLE_ATTRIBUTES = [
  "handling", "acceleration", "speed", "body", "armor", "signature", "autopilot",
];

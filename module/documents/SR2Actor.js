import { SR2E } from "../config.js";

/**
 * Extended Actor document for Shadowrun 2nd Edition.
 * Handles all derived stat calculations.
 */
export default class SR2Actor extends Actor {

  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Called before Active Effects are applied.
    // Resolve base attribute values from their base field.
    const type = this.type;
    if (type === "character" || type === "npc" || type === "critter") {
      this._prepareBaseAttributes();
    }
  }

  /** @override */
  prepareDerivedData() {
    const type = this.type;
    switch (type) {
      case "character": return this._prepareCharacterData();
      case "npc":       return this._prepareNpcData();
      case "critter":   return this._prepareCritterData();
      case "spirit":    return this._prepareSpiritData();
      case "vehicle":   return this._prepareVehicleData();
    }
  }

  // ---------------------------------------------------------------------------
  // Shared helpers
  // ---------------------------------------------------------------------------

  _prepareBaseAttributes() {
    const attrs = this.system.attributes;
    for (const key of SR2E.ATTRIBUTES) {
      if (!attrs[key]) continue;
      attrs[key].value = (attrs[key].base ?? 1) + (attrs[key].mod ?? 0);
      attrs[key].value = Math.max(1, attrs[key].value);
    }
  }

  /**
   * Apply installed cyberware/bioware attribute bonuses to derived attribute values.
   * Called after base attributes are computed, before reaction/pools are derived.
   */
  _applyAugmentMods(sys, attrs) {
    const augments = this.items.filter(
      i => (i.type === "cyberware" || i.type === "bioware") && i.system.installed
    );
    for (const aug of augments) {
      const mods = aug.system.mods;
      if (!mods) continue;
      for (const key of SR2E.ATTRIBUTES) {
        if (mods[key]) attrs[key].value = (attrs[key].value ?? 1) + mods[key];
      }
      if (mods.reaction) {
        // For NPCs, reaction lives in attributes; for PCs it's at sys.reaction
        if (sys.attributes?.reaction) {
          sys.attributes.reaction.mod = (sys.attributes.reaction.mod ?? 0) + mods.reaction;
        } else if (sys.reaction) {
          sys.reaction.mod = (sys.reaction.mod ?? 0) + mods.reaction;
        }
      }
      if (mods.initiative_dice && sys.initiative) sys.initiative.dice = (sys.initiative.dice ?? 1) + mods.initiative_dice;
    }
  }

  /**
   * TN penalty for a single damage track (added to target number, not subtracted from pool).
   * Per SR2E Core Rules — Damage and Healing.
   */
  _getWoundModifier(filled) {
    return SR2E.woundModifier(filled);
  }

  /**
   * Total wound TN penalty: physical + stun track modifiers are CUMULATIVE.
   * Added to the target number on each roll.
   */
  _totalWoundModifier() {
    const sys = this.system;
    if (!sys.monitors) return 0;
    const phys = sys.monitors.physical;
    const stun = sys.monitors.stun;
    let mod = 0;
    if (phys) mod += this._getWoundModifier(phys.value);
    if (stun) mod += this._getWoundModifier(stun.value);
    return mod;
  }

  // ---------------------------------------------------------------------------
  // Character (PC)
  // ---------------------------------------------------------------------------

  _prepareCharacterData() {
    const sys = this.system;
    const attrs = sys.attributes;

    // Clamp attribute values to metatype ranges.
    // base is also floored to racial min (e.g. Troll Body min 5, Ork Body min 4).
    // This means switching metatype immediately enforces the racial floor on display.
    const metatypeMods = SR2E.METATYPE_ATTRIBUTE_MODS[sys.metatype] ?? SR2E.METATYPE_ATTRIBUTE_MODS.human;
    for (const key of SR2E.ATTRIBUTES) {
      if (!attrs[key] || !metatypeMods[key]) continue;
      const { min, max } = metatypeMods[key];
      attrs[key].base  = Math.max(min, attrs[key].base ?? 1);
      attrs[key].value = Math.max(min, Math.min(max, attrs[key].value));
    }

    // Essence: base 6, reduced by installed cyberware
    const cyberwareItems = this.items.filter(i => i.type === "cyberware" && i.system.installed);
    const totalEssenceLost = cyberwareItems.reduce((sum, i) => sum + (i.system.essence_cost ?? 0), 0);
    sys.essence.value = Math.max(0, (sys.essence.base ?? 6) - totalEssenceLost);

    // Apply installed cyberware/bioware attribute mods
    this._applyAugmentMods(sys, attrs);

    // Magic & power points — archetype-specific
    const arch = sys.archetype;
    if (arch === "mage" || arch === "shaman") {
      // Full spellcaster: all Magic = casting pool
      sys.magic.value = Math.max(0, (sys.magic.base ?? 0) + (sys.magic.mod ?? 0));
      sys.pools.spell = sys.skills?.sorcery?.rating ?? 0;
      sys.pools.magic = sys.magic.value;

    } else if (arch === "physical_magician") {
      // Split: casting points + power points; magic.casting = points on spellcasting side
      const castingMagic = Math.max(0, sys.magic.casting ?? 0);
      sys.magic.value = Math.max(0, castingMagic + (sys.magic.mod ?? 0));
      sys.pools.spell = sys.skills?.sorcery?.rating ?? 0;
      sys.pools.magic = sys.magic.value;
      // Power points total = remaining Magic (base − casting side)
      sys.power_points.total = Math.max(0, (sys.magic.base ?? 0) - castingMagic);
      // power_points.available is not overwritten — persisted from storage

    } else if (arch === "adept") {
      // Physical adept: no spellcasting; all Magic = power points
      sys.magic.value = Math.max(0, (sys.magic.base ?? 0) + (sys.magic.mod ?? 0));
      sys.pools.spell = 0;
      sys.pools.magic = 0;
      sys.power_points.total = sys.magic.value;
      // power_points.available is not overwritten — persisted from storage

    } else {
      sys.magic.value = 0;
    }

    // Reaction = (Quickness + Intelligence) / 2, rounded down + mods
    sys.reaction.value = Math.floor((attrs.quickness.value + attrs.intelligence.value) / 2)
      + (sys.reaction.mod ?? 0);
    sys.reaction.value = Math.max(1, sys.reaction.value);

    // Initiative base = Reaction (+ mods handled in roll)
    sys.initiative.base = sys.reaction.value + (sys.initiative.mod ?? 0);

    // Condition monitor sizes — SR2E: flat 10 boxes each (Core Rules, Damage chapter)
    sys.monitors.physical.max = 10;
    sys.monitors.stun.max     = 10;
    sys.monitors.overflow.max = attrs.body.value;

    // Clamp current damage to max
    sys.monitors.physical.value = Math.min(sys.monitors.physical.value, sys.monitors.physical.max);
    sys.monitors.stun.value     = Math.min(sys.monitors.stun.value, sys.monitors.stun.max);

    // Combat Pool = (Quickness + Intelligence + Willpower) / 2, round down (SR2E Core, p.39)
    sys.pools.combat = Math.floor(
      (attrs.quickness.value + attrs.intelligence.value + attrs.willpower.value) / 2
    );

    // Hacking pool (deckers only) = Computer skill + Intelligence
    if (SR2E.DECKER_ARCHETYPES.includes(arch)) {
      const computerSkill = sys.skills?.computer?.rating ?? 0;
      sys.pools.hacking = computerSkill + attrs.intelligence.value;
    }

    // Adept power points available = total - sum of purchased power costs
    if (arch === "adept" || arch === "physical_magician") {
      const purchasedCost = this.items
        .filter(i => i.type === "adept_power")
        .reduce((sum, i) => sum + (i.system.cost ?? 0), 0);
      sys.power_points.available = Math.max(0, sys.power_points.total - purchasedCost);
    }

    // Wound modifier stored for reference by rolls
    sys.woundModifier = this._totalWoundModifier();
  }

  // ---------------------------------------------------------------------------
  // NPC
  // ---------------------------------------------------------------------------

  _prepareNpcData() {
    const sys = this.system;
    const attrs = sys.attributes;

    // Resolve attribute values
    for (const key of SR2E.ATTRIBUTES) {
      if (!attrs[key]) continue;
      attrs[key].value = (attrs[key].base ?? 1) + (attrs[key].mod ?? 0);
      attrs[key].value = Math.max(1, attrs[key].value);
    }

    // Apply installed cyberware/bioware attribute mods
    this._applyAugmentMods(sys, attrs);

    // Reaction is inside attributes for NPCs
    const rxn = attrs.reaction;
    if (rxn) {
      rxn.value = Math.floor((attrs.quickness.value + attrs.intelligence.value) / 2)
        + (rxn.mod ?? 0);
      rxn.value = Math.max(1, rxn.value);
    }

    sys.monitors.physical.max = 10;
    sys.monitors.stun.max     = 10;
    sys.monitors.physical.value = Math.min(sys.monitors.physical.value, sys.monitors.physical.max);
    sys.monitors.stun.value     = Math.min(sys.monitors.stun.value, sys.monitors.stun.max);

    sys.woundModifier = this._totalWoundModifier();
  }

  // ---------------------------------------------------------------------------
  // Critter
  // ---------------------------------------------------------------------------

  _prepareCritterData() {
    const sys = this.system;
    const attrs = sys.attributes;

    for (const key of SR2E.ATTRIBUTES) {
      if (!attrs[key]) continue;
      attrs[key].value = (attrs[key].base ?? 1) + (attrs[key].mod ?? 0);
      attrs[key].value = Math.max(1, attrs[key].value);
    }

    sys.reaction.value = Math.floor((attrs.quickness.value + attrs.intelligence.value) / 2);
    sys.reaction.value = Math.max(1, sys.reaction.value);

    sys.initiative.base = sys.reaction.value;

    sys.monitors.physical.max = 10;
    sys.monitors.stun.max     = 10;
    sys.monitors.physical.value = Math.min(sys.monitors.physical.value, sys.monitors.physical.max);
    sys.monitors.stun.value     = Math.min(sys.monitors.stun.value, sys.monitors.stun.max);

    sys.woundModifier = this._totalWoundModifier();
  }

  // ---------------------------------------------------------------------------
  // Spirit — all attributes derived from Force
  // ---------------------------------------------------------------------------

  _prepareSpiritData() {
    const sys = this.system;
    const f = sys.force ?? 3;

    // SR2E spirit attributes by type (p.170 SR2E core)
    const spiritAttrs = this._getSpiritAttributes(sys.spirit_type, f);
    for (const [key, val] of Object.entries(spiritAttrs)) {
      if (sys.attributes[key] !== undefined) sys.attributes[key] = val;
    }

    // Spirits: flat 10 boxes each
    sys.monitors.physical.max = 10;
    sys.monitors.astral.max   = 10;
    sys.monitors.physical.value = Math.min(sys.monitors.physical.value, sys.monitors.physical.max);
    sys.monitors.astral.value   = Math.min(sys.monitors.astral.value, sys.monitors.astral.max);
  }

  /**
   * Returns base attribute values for a spirit type at a given Force.
   * SR2E Core, Chapter 8.
   */
  _getSpiritAttributes(type, f) {
    // Most spirits use Force for most attributes; differences noted per type
    const base = {
      body: f, quickness: f, strength: f, charisma: f,
      intelligence: f, willpower: f, reaction: f, magic: f, essence: f,
    };
    switch (type) {
      case "air":
        return { ...base, body: Math.max(1, f - 2), quickness: f + 4,
          strength: Math.max(1, f - 2), reaction: f + 4 };
      case "earth":
        return { ...base, body: f + 4, quickness: Math.max(1, f - 2),
          strength: f + 4, reaction: Math.max(1, f - 2) };
      case "fire":
        return { ...base, body: f, quickness: f + 2, strength: f,
          intelligence: f + 2, reaction: f + 2 };
      case "water":
        return { ...base, body: f, quickness: f, strength: f + 2,
          charisma: f + 2, reaction: f };
      default:
        // City, field, forest, etc. — use base Force for all
        return base;
    }
  }

  // ---------------------------------------------------------------------------
  // Vehicle
  // ---------------------------------------------------------------------------

  _prepareVehicleData() {
    const sys = this.system;
    // Vehicle physical monitor = Body * 2
    sys.monitors.physical.max   = sys.body * 2;
    sys.monitors.physical.value = Math.min(sys.monitors.physical.value, sys.monitors.physical.max);
  }

  // ---------------------------------------------------------------------------
  // Roll helpers (called from sheets)
  // ---------------------------------------------------------------------------

  /**
   * Build a roll descriptor for a skill roll.
   * @param {string} skillKey  — key from SR2E.SKILLS
   * @param {number} [bonusDice=0] — extra dice (specialization, etc.)
   * @returns {object} { pool, label, woundMod }
   */
  getSkillRollData(skillKey, bonusDice = 0) {
    const sys = this.system;
    const skillEntry = sys.skills?.[skillKey];
    const skillRating = skillEntry?.rating ?? 0;
    const woundMod = sys.woundModifier ?? 0;
    // Skills in ObjectField have no linked attribute; pool = rating + mods
    const pool = Math.max(0, skillRating + (skillEntry?.mod ?? 0) + bonusDice);
    const label = skillEntry?.label || skillKey;
    return { pool, skillRating, woundMod, label };
  }

  /**
   * Build a roll descriptor for a raw attribute roll.
   * @param {string} attrKey
   * @returns {object} { pool, label, woundMod }
   */
  getAttributeRollData(attrKey) {
    const val = this._getAttributeValue(attrKey);
    // woundMod is a TN modifier (added to targetNumber), not a pool reduction
    const woundMod = this.system.woundModifier ?? 0;
    return {
      pool: Math.max(0, val),
      label: game.i18n.localize(`SR2E.Attributes.${attrKey}`),
      woundMod,
    };
  }

  _getAttributeValue(key) {
    const sys = this.system;
    // reaction lives in sys.attributes for NPCs, at sys.reaction for PCs
    if (key === "reaction") return sys.attributes?.reaction?.value ?? sys.reaction?.value ?? 1;
    if (key === "magic")    return sys.magic?.value ?? 0;
    return sys.attributes?.[key]?.value ?? 1;
  }

  /**
   * Roll initiative: base (Reaction) + Nd6
   */
  async rollInitiative(options = {}) {
    const sys = this.system;
    const base = sys.initiative?.base ?? sys.attributes?.reaction?.value ?? sys.reaction?.value ?? 1;
    const dice = sys.initiative?.dice ?? 1;
    const formula = `${base} + ${dice}d6`;
    return this.rollFormula(formula, {
      label: game.i18n.localize("SR2E.Attributes.initiative"),
      ...options,
    });
  }
}

import { SR2E } from "../config.js";

/**
 * Item sheet for all SR2E item types.
 * Uses a single sheet class with per-type template switching.
 */
export default class SR2ItemSheet extends ItemSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:  ["shadowrun2e", "sheet", "item"],
      width:    460,
      height:   400,
    });
  }

  get template() {
    return `systems/shadowrun2e/templates/item/${this.item.type}-sheet.hbs`;
  }

  getData() {
    const context = super.getData();
    context.system  = this.item.toObject(false).system;
    context.config  = SR2E;
    context.itemType = this.item.type;

    // Build select options from config
    context.weaponCategoryOptions = this._toOptions(SR2E.WEAPON_CATEGORIES);
    context.spellCategoryOptions  = this._toOptions(SR2E.SPELL_CATEGORIES);
    context.spellTypeOptions      = this._toOptions(SR2E.SPELL_TYPES);
    context.spellRangeOptions     = Object.entries(SR2E.SPELL_RANGES)
      .map(([v, l]) => ({ value: v, label: l }));
    context.spellDurationOptions  = Object.entries(SR2E.SPELL_DURATIONS)
      .map(([v, l]) => ({ value: v, label: l }));
    context.cyberGradeOptions     = this._toOptions(
      Object.fromEntries(Object.entries(SR2E.CYBERWARE_GRADES).map(([k, v]) => [k, v.label]))
    );
    context.qualityTypeOptions    = this._toOptions(SR2E.QUALITY_TYPES);
    context.skillOptions          = Object.entries(SR2E.SKILLS)
      .map(([k, v]) => ({ value: k, label: game.i18n.localize(v.label) }))
      .sort((a, b) => a.label.localeCompare(b.label));
    context.damageLevelOptions    = SR2E.DAMAGE_LEVELS.map(l => ({ value: l, label: l }));

    return context;
  }

  _toOptions(obj) {
    return Object.entries(obj).map(([value, label]) => ({
      value,
      label: typeof label === "string" ? (label.startsWith("SR2E.") ? game.i18n.localize(label) : label) : label,
    }));
  }

  activateListeners(html) {
    super.activateListeners(html);
  }
}

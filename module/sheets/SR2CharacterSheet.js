import SR2RollDialog from "../dice/RollDialog.js";
import SR2Roll from "../dice/SR2Roll.js";
import { SR2E } from "../config.js";

/**
 * Actor sheet for Player Characters.
 */
export default class SR2CharacterSheet extends foundry.appv1.sheets.ActorSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["shadowrun2e", "sheet", "actor", "character"],
      template:  "systems/shadowrun2e/templates/actor/character-sheet.hbs",
      width:     750,
      height:    680,
      tabs: [{
        navSelector:     ".sheet-tabs",
        contentSelector: ".sheet-body",
        initial:         "attributes",
      }],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
    });
  }

  getData() {
    const context = super.getData();
    const actorData = this.actor.toObject(false);
    context.system     = actorData.system;
    context.flags      = actorData.flags;
    context.config     = SR2E;

    // Build grouped skill list for template
    context.skillGroups = this._buildSkillGroups(context.system.skills);

    // Separate items by type for tabs
    context.weapons    = this.actor.items.filter(i => i.type === "weapon");
    context.armors     = this.actor.items.filter(i => i.type === "armor");
    context.cyberware  = this.actor.items.filter(i => i.type === "cyberware");
    context.bioware    = this.actor.items.filter(i => i.type === "bioware");
    context.gear       = this.actor.items.filter(i => i.type === "gear");
    context.spells     = this.actor.items.filter(i => i.type === "spell");
    context.adeptPowers= this.actor.items.filter(i => i.type === "adept_power");
    context.qualities  = this.actor.items.filter(i => i.type === "quality");
    context.contacts   = this.actor.items.filter(i => i.type === "contact");

    // Flags for conditional template blocks
    context.isMagic    = SR2E.MAGIC_ARCHETYPES.includes(context.system.archetype);
    context.isDecker   = SR2E.DECKER_ARCHETYPES.includes(context.system.archetype);
    context.isAdept    = context.system.archetype === "adept";

    // Wound modifier display
    context.woundModifier = context.system.woundModifier ?? 0;

    // Monitor fill arrays for the monitor display
    context.physicalBoxes = this._buildMonitorBoxes(
      context.system.monitors.physical.value,
      context.system.monitors.physical.max
    );
    context.stunBoxes = this._buildMonitorBoxes(
      context.system.monitors.stun.value,
      context.system.monitors.stun.max
    );

    // Localised select options
    context.metatypeOptions   = this._toSelectOptions(SR2E.METATYPES);
    context.archetypeOptions  = this._toSelectOptions(SR2E.ARCHETYPES);

    return context;
  }

  _buildSkillGroups(skills) {
    const groups = {};
    for (const [key, def] of Object.entries(SR2E.SKILLS)) {
      const cat = def.category;
      if (!groups[cat]) groups[cat] = { label: SR2E.SKILL_CATEGORIES[cat], skills: [] };
      groups[cat].skills.push({
        key,
        label: game.i18n.localize(def.label),
        linkedAttr: def.linkedAttr,
        rating:         skills?.[key]?.rating ?? 0,
        specialization: skills?.[key]?.specialization ?? "",
        mod:            skills?.[key]?.mod ?? 0,
      });
    }
    return groups;
  }

  _buildMonitorBoxes(filled, max) {
    return Array.from({ length: max }, (_, i) => ({
      index: i + 1,
      filled: i < filled,
    }));
  }

  _toSelectOptions(obj) {
    return Object.entries(obj).map(([value, label]) => ({
      value,
      label: game.i18n.localize(label),
    }));
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;

    // Attribute rolls
    html.find(".attribute-roll").click(ev => {
      const attrKey = ev.currentTarget.dataset.attribute;
      this._onAttributeRoll(attrKey);
    });

    // Skill rolls
    html.find(".skill-roll").click(ev => {
      const skillKey = ev.currentTarget.dataset.skill;
      this._onSkillRoll(skillKey);
    });

    // Monitor box clicks — clicking box N fills up to N
    html.find(".monitor-box").click(ev => {
      const box      = ev.currentTarget;
      const monitor  = box.dataset.monitor;
      const index    = parseInt(box.dataset.index);
      this._onMonitorClick(monitor, index);
    });

    // Right-click monitor box to heal
    html.find(".monitor-box").contextmenu(ev => {
      ev.preventDefault();
      const box     = ev.currentTarget;
      const monitor = box.dataset.monitor;
      const index   = parseInt(box.dataset.index);
      this._onMonitorRightClick(monitor, index);
    });

    // Item create
    html.find(".item-create").click(ev => this._onItemCreate(ev));

    // Item edit
    html.find(".item-edit").click(ev => {
      const li   = ev.currentTarget.closest(".item");
      const item = this.actor.items.get(li.dataset.itemId);
      item.sheet.render(true);
    });

    // Item delete
    html.find(".item-delete").click(ev => {
      const li   = ev.currentTarget.closest(".item");
      const item = this.actor.items.get(li.dataset.itemId);
      item.delete();
    });

    // Weapon roll (attack)
    html.find(".weapon-roll").click(ev => {
      const li     = ev.currentTarget.closest(".item");
      const item   = this.actor.items.get(li.dataset.itemId);
      this._onWeaponRoll(item);
    });

    // Spell roll (cast)
    html.find(".spell-roll").click(ev => {
      const li   = ev.currentTarget.closest(".item");
      const item = this.actor.items.get(li.dataset.itemId);
      this._onSpellRoll(item);
    });

    // Adept power active toggle
    html.find(".adept-power-active").change(ev => {
      const itemId = ev.currentTarget.dataset.itemId;
      const item   = this.actor.items.get(itemId);
      item.update({ "system.active": ev.currentTarget.checked });
    });

    // Initiative roll
    html.find(".initiative-roll").click(() => this.actor.rollInitiative());

    // Combat pool display — clicking pool label rolls combat pool
    html.find(".pool-roll").click(ev => {
      const poolType = ev.currentTarget.dataset.pool;
      this._onPoolRoll(poolType);
    });
  }

  async _onAttributeRoll(attrKey) {
    const rollData = this.actor.getAttributeRollData(attrKey);
    const result = await SR2RollDialog.prompt({
      pool:   rollData.pool,
      label:  rollData.label,
      woundMod: rollData.woundMod,
    });
    if (result) await SR2Roll.toChat(result, this.actor);
  }

  async _onSkillRoll(skillKey) {
    const sys     = this.actor.system;
    const skill   = sys.skills?.[skillKey];
    const def     = SR2E.SKILLS[skillKey];
    if (!def) return;

    // Check for specialization — +2 dice when applicable
    const hasSpec  = !!skill?.specialization;
    const rollData = this.actor.getSkillRollData(skillKey, 0);

    const result = await SR2RollDialog.prompt({
      pool:   rollData.pool,
      label:  `${rollData.label}${hasSpec ? ` (${skill.specialization})` : ""}`,
      woundMod: rollData.woundMod,
    });
    if (result) await SR2Roll.toChat(result, this.actor);
  }

  async _onWeaponRoll(item) {
    const sys     = this.actor.system;
    const skill   = item.system.skill;
    const rollData = this.actor.getSkillRollData(skill);
    const result  = await SR2RollDialog.prompt({
      pool:   rollData?.pool ?? 0,
      label:  `${item.name} (${item.system.damage_code})`,
      woundMod: rollData?.woundMod ?? 0,
    });
    if (result) await SR2Roll.toChat(result, this.actor);
  }

  async _onSpellRoll(item) {
    const magic    = this.actor.system.magic?.value ?? 0;
    const sorcery  = this.actor.system.skills?.sorcery?.rating ?? 0;
    const woundMod = this.actor.system.woundModifier ?? 0;
    const pool     = Math.max(0, magic + sorcery + woundMod);

    const result = await SR2RollDialog.prompt({
      pool,
      label:  `Cast: ${item.name} (Drain: ${item.system.drain_code})`,
      woundMod,
    });
    if (result) await SR2Roll.toChat(result, this.actor);
  }

  async _onPoolRoll(poolType) {
    const sys   = this.actor.system;
    const pool  = sys.pools?.[poolType] ?? 0;
    const label = `${poolType.charAt(0).toUpperCase() + poolType.slice(1)} Pool`;
    const result = await SR2RollDialog.prompt({ pool, label });
    if (result) await SR2Roll.toChat(result, this.actor);
  }

  async _onMonitorClick(monitor, index) {
    const key   = `system.monitors.${monitor}.value`;
    const cur   = this.actor.system.monitors[monitor].value;
    // Clicking a filled box: heal to previous. Clicking unfilled: fill to that box.
    const newVal = (cur >= index) ? index - 1 : index;
    await this.actor.update({ [key]: Math.max(0, newVal) });
  }

  async _onMonitorRightClick(monitor, index) {
    // Right-click always heals down
    const key    = `system.monitors.${monitor}.value`;
    const newVal = Math.max(0, index - 1);
    await this.actor.update({ [key]: newVal });
  }

  async _onItemCreate(ev) {
    const type    = ev.currentTarget.dataset.type;
    const itemData = {
      name: game.i18n.format("DOCUMENT.New", { type: game.i18n.localize(`SR2E.ItemTypes.${type}`) }),
      type,
    };
    await Item.create(itemData, { parent: this.actor });
  }
}

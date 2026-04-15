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
      width:     780,
      height:    720,
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

    // Build categorised skill arrays from the ObjectField
    const skillsObj = context.system.skills ?? {};
    context.activeSkills    = this._skillArray(skillsObj, "active");
    context.knowledgeSkills = this._skillArray(skillsObj, "knowledge");
    context.languageSkills  = this._skillArray(skillsObj, "language");

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
    context.isAdept    = ["adept","physical_magician"].includes(context.system.archetype);
    context.isDecker   = SR2E.DECKER_ARCHETYPES.includes(context.system.archetype);
    context.isRigger   = context.system.archetype === "rigger";

    // Monitor fill arrays
    context.physicalBoxes = this._buildMonitorBoxes(
      context.system.monitors.physical.value,
      context.system.monitors.physical.max
    );
    context.stunBoxes = this._buildMonitorBoxes(
      context.system.monitors.stun.value,
      context.system.monitors.stun.max
    );

    return context;
  }

  /**
   * Convert the skills ObjectField to a sorted array for a given skill_type.
   */
  _skillArray(skillsObj, type) {
    return Object.entries(skillsObj)
      .filter(([, s]) => (s.skill_type ?? "active") === type)
      .map(([key, s]) => ({
        key,
        label:          s.label || key,
        rating:         s.rating ?? 0,
        specialization: s.specialization ?? "",
        mod:            s.mod ?? 0,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  _buildMonitorBoxes(filled, max) {
    return Array.from({ length: max }, (_, i) => ({
      index: i + 1,
      filled: i < filled,
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

    // Monitor box clicks
    html.find(".monitor-box").click(ev => {
      const box      = ev.currentTarget;
      const monitor  = box.dataset.monitor;
      const index    = parseInt(box.dataset.index);
      this._onMonitorClick(monitor, index);
    });
    html.find(".monitor-box").contextmenu(ev => {
      ev.preventDefault();
      const box     = ev.currentTarget;
      const monitor = box.dataset.monitor;
      const index   = parseInt(box.dataset.index);
      this._onMonitorRightClick(monitor, index);
    });

    // Add skill buttons
    html.find(".skill-add").click(ev => {
      const type = ev.currentTarget.dataset.type ?? "active";
      this._onSkillAdd(type);
    });

    // Delete skill buttons
    html.find(".skill-delete").click(ev => {
      const key = ev.currentTarget.dataset.skill;
      this._onSkillDelete(key);
    });

    // Item create/edit/delete
    html.find(".item-create").click(ev => this._onItemCreate(ev));
    html.find(".item-edit").click(ev => {
      const li   = ev.currentTarget.closest(".item");
      const item = this.actor.items.get(li.dataset.itemId);
      item.sheet.render(true);
    });
    html.find(".item-delete").click(ev => {
      const li   = ev.currentTarget.closest(".item");
      const item = this.actor.items.get(li.dataset.itemId);
      item.delete();
    });

    // Weapon roll
    html.find(".weapon-roll").click(ev => {
      const li   = ev.currentTarget.closest(".item");
      const item = this.actor.items.get(li.dataset.itemId);
      this._onWeaponRoll(item);
    });

    // Spell roll
    html.find(".spell-roll").click(ev => {
      const li   = ev.currentTarget.closest(".item");
      const item = this.actor.items.get(li.dataset.itemId);
      this._onSpellRoll(item);
    });

    // Pool roll
    html.find(".pool-roll").click(ev => {
      const poolType = ev.currentTarget.dataset.pool;
      this._onPoolRoll(poolType);
    });

    // Initiative roll
    html.find(".initiative-roll").click(() => this.actor.rollInitiative());
  }

  async _onAttributeRoll(attrKey) {
    const rollData = this.actor.getAttributeRollData(attrKey);
    const result = await SR2RollDialog.prompt({
      pool:     rollData.pool,
      label:    rollData.label,
      woundMod: rollData.woundMod,
    });
    if (result) await SR2Roll.toChat(result, this.actor);
  }

  async _onSkillRoll(skillKey) {
    const sys   = this.actor.system;
    const skill = sys.skills?.[skillKey];
    if (!skill) return;
    const rating   = skill.rating ?? 0;
    const woundMod = sys.woundModifier ?? 0;
    const pool     = Math.max(0, rating + (skill.mod ?? 0) + woundMod);
    const label    = `${skill.label || skillKey}${skill.specialization ? ` (${skill.specialization})` : ""}`;
    const result = await SR2RollDialog.prompt({ pool, label, woundMod });
    if (result) await SR2Roll.toChat(result, this.actor);
  }

  async _onSkillAdd(type) {
    const name = await Dialog.prompt({
      title: "New Skill",
      content: `<input type="text" name="skillName" placeholder="Skill name" style="width:100%" />`,
      callback: html => html.find("[name=skillName]").val().trim(),
    }).catch(() => null);
    if (!name) return;
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const skills = foundry.utils.deepClone(this.actor.system.skills ?? {});
    if (skills[key]) return; // already exists
    skills[key] = { label: name, rating: 0, specialization: "", mod: 0, skill_type: type };
    await this.actor.update({ "system.skills": skills });
  }

  async _onSkillDelete(key) {
    const skills = foundry.utils.deepClone(this.actor.system.skills ?? {});
    delete skills[key];
    await this.actor.update({ "system.skills": skills });
  }

  async _onWeaponRoll(item) {
    const sys      = this.actor.system;
    const woundMod = sys.woundModifier ?? 0;
    const pool     = sys.pools?.combat ?? 0;
    const result   = await SR2RollDialog.prompt({
      pool:     Math.max(0, pool + woundMod),
      label:    `${item.name} (${item.system.damage_code})`,
      woundMod,
    });
    if (result) await SR2Roll.toChat(result, this.actor);
  }

  async _onSpellRoll(item) {
    const sys      = this.actor.system;
    const magic    = sys.magic?.value ?? 0;
    const sorcery  = sys.skills?.sorcery?.rating ?? 0;
    const woundMod = sys.woundModifier ?? 0;
    const pool     = Math.max(0, magic + sorcery + woundMod);
    const result   = await SR2RollDialog.prompt({
      pool,
      label:    `Cast: ${item.name} (Drain: ${item.system.drain_code})`,
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
    const cur    = this.actor.system.monitors[monitor].value;
    const newVal = (cur >= index) ? index - 1 : index;
    await this.actor.update({ [`system.monitors.${monitor}.value`]: Math.max(0, newVal) });
  }

  async _onMonitorRightClick(monitor, index) {
    await this.actor.update({ [`system.monitors.${monitor}.value`]: Math.max(0, index - 1) });
  }

  async _onItemCreate(ev) {
    const type = ev.currentTarget.dataset.type;
    const itemData = {
      name: game.i18n.format("DOCUMENT.New", { type: game.i18n.localize(`SR2E.ItemTypes.${type}`) }),
      type,
    };
    await Item.create(itemData, { parent: this.actor });
  }
}

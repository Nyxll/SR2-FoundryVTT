import SR2RollDialog from "../dice/RollDialog.js";
import SR2Roll from "../dice/SR2Roll.js";
import { SR2E } from "../config.js";

/**
 * Compact actor sheet for NPCs.
 */
export default class SR2NPCSheet extends foundry.appv1.sheets.ActorSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:  ["shadowrun2e", "sheet", "actor", "npc"],
      template: "systems/shadowrun2e/templates/actor/npc-sheet.hbs",
      width:    480,
      height:   520,
      tabs: [{
        navSelector:     ".sheet-tabs",
        contentSelector: ".sheet-body",
        initial:         "stats",
      }],
    });
  }

  getData() {
    const context = super.getData();
    context.system  = this.actor.toObject(false).system;
    context.config  = SR2E;

    context.physicalBoxes = this._buildMonitorBoxes(
      context.system.monitors.physical.value,
      context.system.monitors.physical.max
    );
    context.stunBoxes = this._buildMonitorBoxes(
      context.system.monitors.stun.value,
      context.system.monitors.stun.max
    );

    context.weapons = this.actor.items.filter(i => i.type === "weapon");

    return context;
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

    html.find(".monitor-box").click(ev => {
      const box     = ev.currentTarget;
      const monitor = box.dataset.monitor;
      const index   = parseInt(box.dataset.index);
      const cur     = this.actor.system.monitors[monitor].value;
      const newVal  = (cur >= index) ? index - 1 : index;
      this.actor.update({ [`system.monitors.${monitor}.value`]: Math.max(0, newVal) });
    });

    html.find(".pool-roll").click(ev => {
      const pool  = parseInt(ev.currentTarget.dataset.pool) || 0;
      const label = ev.currentTarget.dataset.label || "Roll";
      SR2RollDialog.prompt({ pool, label }).then(result => {
        if (result) SR2Roll.toChat(result, this.actor);
      });
    });

    html.find(".weapon-roll").click(ev => {
      const li   = ev.currentTarget.closest(".item");
      const item = this.actor.items.get(li.dataset.itemId);
      const pool = this.actor.system.pools?.combat ?? 0;
      SR2RollDialog.prompt({
        pool,
        label: `${item.name} (${item.system.damage_code})`,
      }).then(result => {
        if (result) SR2Roll.toChat(result, this.actor);
      });
    });

    html.find(".item-create").click(ev => {
      const type = ev.currentTarget.dataset.type;
      Item.create({ name: `New ${type}`, type }, { parent: this.actor });
    });
    html.find(".item-edit").click(ev => {
      const li = ev.currentTarget.closest(".item");
      this.actor.items.get(li.dataset.itemId).sheet.render(true);
    });
    html.find(".item-delete").click(ev => {
      const li = ev.currentTarget.closest(".item");
      this.actor.items.get(li.dataset.itemId).delete();
    });

    // Natural weapons (embedded array)
    html.find(".nat-weapon-add").click(() => {
      const weapons = foundry.utils.deepClone(this.actor.system.natural_weapons ?? []);
      weapons.push({ name: "Claws", damage_power: 4, damage_level: "M", reach: 0 });
      this.actor.update({ "system.natural_weapons": weapons });
    });
    html.find(".nat-weapon-delete").click(ev => {
      const idx = parseInt(ev.currentTarget.dataset.index);
      const weapons = foundry.utils.deepClone(this.actor.system.natural_weapons ?? []);
      weapons.splice(idx, 1);
      this.actor.update({ "system.natural_weapons": weapons });
    });

    // Special powers (embedded array)
    html.find(".special-power-add").click(() => {
      const powers = foundry.utils.deepClone(this.actor.system.special_powers ?? []);
      powers.push({ name: "", description: "" });
      this.actor.update({ "system.special_powers": powers });
    });
    html.find(".special-power-delete").click(ev => {
      const idx = parseInt(ev.currentTarget.dataset.index);
      const powers = foundry.utils.deepClone(this.actor.system.special_powers ?? []);
      powers.splice(idx, 1);
      this.actor.update({ "system.special_powers": powers });
    });
  }
}

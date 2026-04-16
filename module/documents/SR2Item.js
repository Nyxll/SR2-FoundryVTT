import { SR2E } from "../config.js";

/**
 * Extended Item document for Shadowrun 2nd Edition.
 */
export default class SR2Item extends Item {

  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareDerivedData() {
    if (this.type === "weapon")    this._prepareWeaponData();
    if (this.type === "cyberware") this._prepareCyberwareData();
    if (this.type === "bioware")   this._prepareBiowwareData();
  }

  _prepareWeaponData() {
    const sys = this.system;
    sys.damage_code = `${sys.damage_power ?? 0}${sys.damage_level ?? "M"}`;
  }

  _prepareCyberwareData() {
    const sys = this.system;
    const grade = SR2E.CYBERWARE_GRADES[sys.grade] ?? SR2E.CYBERWARE_GRADES.standard;
    sys.effectiveEssence = Math.round((sys.essence_cost ?? 0) * grade.essenceMult * 100) / 100;
  }

  _prepareBiowwareData() {
    const sys = this.system;
    const mult = sys.cultured ? SR2E.BIOWARE_CULTURED_MULT : 1;
    sys.effectiveBodyIndex = Math.round((sys.body_index ?? 0) * mult * 100) / 100;
  }

  /**
   * Returns chat data for this item suitable for display in a chat message.
   */
  getChatData() {
    const sys = this.system;
    const type = this.type;
    let description = sys.description ?? "";
    let details = [];

    if (type === "weapon") {
      details = [
        { label: "Damage", value: sys.damage_code },
        { label: "Reach", value: sys.reach },
        { label: "Conceal", value: sys.concealability },
      ];
    } else if (type === "spell") {
      details = [
        { label: "Category", value: sys.category },
        { label: "Type", value: sys.type },
        { label: "Range", value: sys.range },
        { label: "Duration", value: sys.duration },
        { label: "Drain", value: sys.drain_code },
      ];
    } else if (type === "armor") {
      details = [
        { label: "Ballistic", value: sys.ballistic },
        { label: "Impact", value: sys.impact },
        { label: "Conceal", value: sys.concealability },
      ];
    } else if (type === "cyberware") {
      details = [
        { label: "Grade", value: sys.grade },
        { label: "Essence", value: sys.effectiveEssence ?? sys.essence_cost },
      ];
    }

    return { description, details, type, name: this.name };
  }
}

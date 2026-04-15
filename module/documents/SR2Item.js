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
    if (this.type === "weapon") this._prepareWeaponData();
  }

  _prepareWeaponData() {
    const sys = this.system;
    // Build a display-friendly damage code string, e.g. "9M"
    sys.damage_code = `${sys.damage_power ?? 0}${sys.damage_level ?? "M"}`;
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
        { label: "Essence", value: sys.essence_cost },
      ];
    }

    return { description, details, type, name: this.name };
  }
}

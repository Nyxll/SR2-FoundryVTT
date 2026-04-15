import SR2Roll from "./SR2Roll.js";

/**
 * Pre-roll dialog for SR2E dice pools.
 * Lets player adjust pool size, target number, and toggle opposed roll.
 */
export default class SR2RollDialog extends Application {

  constructor(rollOptions, resolve, options = {}) {
    super(options);
    this.rollOptions = rollOptions;
    this.resolve     = resolve;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id:       "sr2e-roll-dialog",
      title:    game.i18n.localize("SR2E.Roll.pool"),
      template: "systems/shadowrun2e/templates/dialog/roll-dialog.hbs",
      classes:  ["shadowrun2e", "dialog", "roll-dialog"],
      width:    360,
      height:   "auto",
    });
  }

  getData() {
    const { pool, targetNumber, label, woundMod } = this.rollOptions;
    return {
      pool,
      targetNumber: targetNumber ?? game.settings.get("shadowrun2e", "defaultTargetNumber"),
      label:        label ?? "",
      woundMod:     woundMod ?? 0,
      ruleOfSix:    true,  // Rule of Six is a core SR2E rule, always on
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".roll-btn").click(ev => this._onRoll(ev, html));
    html.find(".cancel-btn").click(() => {
      this.resolve(null);
      this.close();
    });
  }

  async _onRoll(ev, html) {
    ev.preventDefault();
    const pool         = parseInt(html.find("[name='pool']").val()) || 0;
    const targetNumber = parseInt(html.find("[name='targetNumber']").val()) || 4;
    const ruleOfSix    = html.find("[name='ruleOfSix']").is(":checked");
    const label        = this.rollOptions.label ?? "";

    const result = await SR2Roll.rollPool(pool, targetNumber, { ruleOfSix, label });
    this.resolve(result);
    this.close();
  }

  /**
   * Factory — opens the dialog and returns a Promise resolving to roll results.
   * @param {object} rollOptions — { pool, targetNumber, label, woundMod }
   * @returns {Promise<object|null>}
   */
  static prompt(rollOptions) {
    return new Promise(resolve => {
      const dialog = new SR2RollDialog(rollOptions, resolve);
      dialog.render(true);
    });
  }
}

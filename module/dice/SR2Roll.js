/**
 * SR2Roll — Shadowrun 2nd Edition dice pool resolution.
 *
 * SR2E Core Rules — Dice (SR2E Core Book, p.39-40):
 *   - Roll a pool of d6s against a Target Number (TN).
 *   - Each die that meets or beats the TN counts as one success.
 *   - The default TN is 4.
 *
 * Rule of Six (SR2E p.40 — non-initiative rolls only):
 *   - When a die shows 6, re-roll it and ADD the new result to 6.
 *   - The combined total is then checked against the TN.
 *   - If the addition is also 6, keep adding (roll again).
 *   - A 6 is NOT automatically a success — the combined total must meet the TN.
 *   - Example: TN 8, roll 6 → re-roll 3 → total 9 → SUCCESS (9 >= 8)
 *   - Example: TN 8, roll 6 → re-roll 1 → total 7 → FAILURE (7 < 8)
 *
 * There are NO glitch or critical glitch mechanics in SR2E.
 * Those are SR4/5/6 rules and do not belong here.
 */
export default class SR2Roll extends Roll {

  /**
   * Roll a dice pool against a target number and return the result.
   *
   * @param {number}  pool         — Number of d6s to roll
   * @param {number}  targetNumber — Target number (default 4; SR2E standard)
   * @param {object}  [options]
   * @param {boolean} [options.ruleOfSix=true]  — Apply Rule of Six (SR2E default: ON)
   * @param {string}  [options.label]            — Display label for chat
   * @returns {Promise<object>} roll result data
   */
  static async rollPool(pool, targetNumber = 4, options = {}) {
    const ruleOfSix = options.ruleOfSix ?? true;

    if (pool <= 0) {
      return {
        pool: 0,
        targetNumber,
        results: [],
        successes: 0,
        label: options.label ?? "",
        roll: null,
      };
    }

    const formula = `${pool}d6`;
    const roll = new Roll(formula);
    await roll.evaluate();

    const rawResults = roll.dice[0].results.map(r => r.result);

    // Apply Rule of Six: each 6 is a success and re-rolls for more successes.
    // The extra successes are tracked separately and added to the total.
    let successes = 0;
    const displayResults = [];  // what to show in chat (one entry per original die)

    for (const initialRoll of rawResults) {
      if (ruleOfSix && initialRoll === 6) {
        // Rule of Six: roll 6 → re-roll and ADD to running total → check vs TN.
        // Keep re-rolling while the latest die was also 6.
        // The combined total must meet or beat the TN — 6 alone is NOT auto-success.
        let total = 6;
        let lastRoll = 6;
        while (lastRoll === 6) {
          const reroll = new Roll("1d6");
          await reroll.evaluate();
          lastRoll = reroll.dice[0].results[0].result;
          total += lastRoll;
        }
        const success = total >= targetNumber;
        if (success) successes++;
        displayResults.push({ value: initialRoll, total, success, exploded: true });
      } else {
        const success = initialRoll >= targetNumber;
        if (success) successes++;
        displayResults.push({ value: initialRoll, success });
      }
    }

    return {
      pool,
      targetNumber,
      results: displayResults,
      rawResults,
      successes,
      label: options.label ?? "",
      roll,
    };
  }

  /**
   * Sends the result of a pool roll to chat.
   */
  static async toChat(rollData, actor = null) {
    const content = await renderTemplate(
      "systems/shadowrun2e/templates/chat/roll-result.hbs",
      { ...rollData, actor }
    );

    const messageData = {
      speaker: actor ? ChatMessage.getSpeaker({ actor }) : ChatMessage.getSpeaker(),
      rolls:   rollData.roll ? [rollData.roll] : [],
      content,
      type:    CONST.CHAT_MESSAGE_STYLES.OTHER,
      flags:   { shadowrun2e: { rollData } },
    };

    return ChatMessage.create(messageData);
  }
}

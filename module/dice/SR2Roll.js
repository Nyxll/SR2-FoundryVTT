/**
 * SR2Roll — Shadowrun 2nd Edition dice pool resolution.
 *
 * SR2E Core Rules (p.39-40):
 *   - Roll a pool of d6s against a Target Number (TN).
 *   - Each die that meets or beats the TN counts as one success.
 *   - The default TN is 4. GMs may raise or lower it for difficulty.
 *   - Rule of Six: a result of 6 is always a success AND the die is
 *     re-rolled — if the re-roll also meets the TN, that counts as an
 *     additional success. Keep re-rolling 6s until the die fails the TN.
 *     (SR2E Core, p.40 — "The Rule of Six")
 *   - There are NO glitch or critical glitch mechanics in SR2E.
 *     Those are SR4/5/6 rules and do not exist here.
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

    for (const die of rawResults) {
      if (die >= targetNumber) {
        // Normal success
        successes++;
        displayResults.push({ value: die, success: true });
      } else if (die === 6 && ruleOfSix) {
        // 6 is always a success; re-roll for bonus successes
        successes++;
        let bonusSuccesses = 0;
        let rerollVal = die;
        while (rerollVal === 6) {
          const reroll = new Roll("1d6");
          await reroll.evaluate();
          rerollVal = reroll.dice[0].results[0].result;
          if (rerollVal >= targetNumber) bonusSuccesses++;
        }
        successes += bonusSuccesses;
        displayResults.push({ value: die, success: true, bonus: bonusSuccesses });
      } else {
        displayResults.push({ value: die, success: false });
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

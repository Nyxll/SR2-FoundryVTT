/**
 * SR2Roll — Shadowrun 2nd Edition dice pool resolution.
 *
 * Mechanics:
 *   - Roll a pool of d6s.
 *   - Each die >= target number (default 4) counts as a success.
 *   - If more 1s than successes are rolled, it's a Glitch.
 *   - If ALL dice are 1s (or pool is 0), it's a Critical Glitch.
 *   - Rule of Six: Any die showing 6 may be re-rolled and added to original
 *     result (optional, enabled by setting).
 */
export default class SR2Roll extends Roll {

  /**
   * @param {number} pool         — Number of dice to roll
   * @param {number} targetNumber — Target number for successes (default 4)
   * @param {object} [options]    — Additional options
   * @param {boolean} [options.ruleOfSix=false] — Apply Rule of Six
   * @param {string}  [options.label]           — Display label
   */
  static async rollPool(pool, targetNumber = 4, options = {}) {
    if (pool <= 0) {
      // Zero pool = automatic Critical Glitch
      return {
        pool: 0,
        targetNumber,
        results: [],
        successes: 0,
        ones: 0,
        glitch: false,
        criticalGlitch: true,
        label: options.label ?? "",
        roll: null,
      };
    }

    const formula = `${pool}d6`;
    const roll = new Roll(formula);
    await roll.evaluate();

    const rawResults = roll.dice[0].results.map(r => r.result);
    let results = [...rawResults];

    // Rule of Six: for each 6, roll again and add to that die's result
    if (options.ruleOfSix) {
      results = await SR2Roll._applyRuleOfSix(results);
    }

    const successes = results.filter(r => r >= targetNumber).length;
    const ones      = rawResults.filter(r => r === 1).length;

    const glitch         = ones > successes && ones > 0;
    const criticalGlitch = rawResults.every(r => r === 1);

    return {
      pool,
      targetNumber,
      results,
      rawResults,
      successes,
      ones,
      glitch,
      criticalGlitch,
      label: options.label ?? "",
      roll,
    };
  }

  /**
   * Rule of Six: any die showing 6 gets re-rolled; add the new result to 6.
   * Recurses if the new result is also a 6.
   */
  static async _applyRuleOfSix(results) {
    const final = [];
    for (const r of results) {
      if (r === 6) {
        let total = 6;
        let next = 6;
        while (next === 6) {
          const reroll = new Roll("1d6");
          await reroll.evaluate();
          next = reroll.dice[0].results[0].result;
          total += next;
        }
        final.push(total);
      } else {
        final.push(r);
      }
    }
    return final;
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

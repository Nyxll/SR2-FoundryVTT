export default class SpellData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      category:     new fields.StringField({ initial: "combat",
        choices: ["combat","detection","health","illusion","manipulation"] }),
      type:         new fields.StringField({ initial: "physical", choices: ["physical","mana"] }),
      range:        new fields.StringField({ initial: "los",
        choices: ["touch","los","los_area","self"] }),
      duration:     new fields.StringField({ initial: "instant",
        choices: ["instant","sustained","permanent"] }),
      drain_code:   new fields.StringField({ initial: "(F/2)M" }),
      force:        new fields.NumberField({ required: true, integer: true, min: 1, initial: 1 }),
      description:  new fields.HTMLField({ initial: "" }),
    };
  }
}

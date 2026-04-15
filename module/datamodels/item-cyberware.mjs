export default class CyberwareData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      category:     new fields.StringField({ initial: "bodyware" }),
      grade:        new fields.StringField({ initial: "standard",
        choices: ["standard","alphaware","betaware","deltaware","used"] }),
      essence_cost: new fields.NumberField({ required: true, min: 0, initial: 0.5 }),
      installed:    new fields.BooleanField({ initial: true }),
      // Stat modifications this cyberware provides
      mods: new fields.ObjectField({ initial: {} }),
      description:  new fields.HTMLField({ initial: "" }),
      price:        new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      availability: new fields.StringField({ initial: "" }),
    };
  }
}

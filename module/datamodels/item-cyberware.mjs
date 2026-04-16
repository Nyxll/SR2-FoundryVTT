export default class CyberwareData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      category:     new fields.StringField({ initial: "bodyware" }),
      grade:        new fields.StringField({ initial: "standard",
        choices: ["standard","alphaware","betaware","deltaware","used"] }),
      // Base essence cost at standard grade; effective cost = essence_cost × grade multiplier
      essence_cost: new fields.NumberField({ required: true, min: 0, initial: 0.5 }),
      installed:    new fields.BooleanField({ initial: true }),
      // Attribute bonuses this cyberware provides (applied automatically when installed)
      mods: new fields.SchemaField({
        body:            new fields.NumberField({ required: true, integer: true, initial: 0 }),
        quickness:       new fields.NumberField({ required: true, integer: true, initial: 0 }),
        strength:        new fields.NumberField({ required: true, integer: true, initial: 0 }),
        charisma:        new fields.NumberField({ required: true, integer: true, initial: 0 }),
        intelligence:    new fields.NumberField({ required: true, integer: true, initial: 0 }),
        willpower:       new fields.NumberField({ required: true, integer: true, initial: 0 }),
        reaction:        new fields.NumberField({ required: true, integer: true, initial: 0 }),
        initiative_dice: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      }),
      description:  new fields.HTMLField({ initial: "" }),
      cost: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      availability: new fields.StringField({ initial: "" }),
    };
  }
}

export default class BiowaveData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      category:     new fields.StringField({ initial: "bioware" }),
      // Bioware uses body index instead of essence; cultured = ×0.9 multiplier
      body_index:   new fields.NumberField({ required: true, min: 0, initial: 0.5 }),
      cultured:     new fields.BooleanField({ initial: false }),
      installed:    new fields.BooleanField({ initial: true }),
      // Attribute bonuses this bioware provides (applied automatically when installed)
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

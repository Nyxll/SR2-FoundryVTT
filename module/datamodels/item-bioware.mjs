export default class BiowaveData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      category:     new fields.StringField({ initial: "bioware" }),
      // Bioware uses body index instead of essence
      body_index:   new fields.NumberField({ required: true, min: 0, initial: 0.5 }),
      installed:    new fields.BooleanField({ initial: true }),
      mods:         new fields.ObjectField({ initial: {} }),
      description:  new fields.HTMLField({ initial: "" }),
      price:        new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      availability: new fields.StringField({ initial: "" }),
    };
  }
}

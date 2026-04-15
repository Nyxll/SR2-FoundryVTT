export default class ArmorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ballistic:    new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      impact:       new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      concealability: new fields.NumberField({ required: true, integer: true, min: 0, initial: 4 }),
      equipped:     new fields.BooleanField({ initial: true }),
      description:  new fields.HTMLField({ initial: "" }),
      price:        new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      availability: new fields.StringField({ initial: "" }),
    };
  }
}

export default class GearData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      quantity:     new fields.NumberField({ required: true, integer: true, min: 0, initial: 1 }),
      description:  new fields.HTMLField({ initial: "" }),
      price:        new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      availability: new fields.StringField({ initial: "" }),
      rating:       new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    };
  }
}

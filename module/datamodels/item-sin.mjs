export default class SinData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      quality:      new fields.NumberField({ required: true, integer: true, min: 1, max: 6, initial: 1 }),
      identity:     new fields.StringField({ initial: "" }),
      description:  new fields.HTMLField({ initial: "" }),
    };
  }
}

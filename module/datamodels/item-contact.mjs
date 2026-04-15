export default class ContactData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      archetype:    new fields.StringField({ initial: "" }),
      loyalty:      new fields.NumberField({ required: true, integer: true, min: 1, max: 6, initial: 1 }),
      connection:   new fields.NumberField({ required: true, integer: true, min: 1, max: 6, initial: 1 }),
      description:  new fields.HTMLField({ initial: "" }),
    };
  }
}

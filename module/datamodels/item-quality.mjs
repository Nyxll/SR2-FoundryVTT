export default class QualityData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      type:         new fields.StringField({ initial: "positive", choices: ["positive","negative"] }),
      karma_cost:   new fields.NumberField({ required: true, integer: true, initial: 5 }),
      description:  new fields.HTMLField({ initial: "" }),
    };
  }
}

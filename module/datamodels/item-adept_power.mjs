export default class AdeptPowerData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      cost:    new fields.NumberField({ required: true, min: 0, initial: 0.5 }),
      level:   new fields.NumberField({ required: true, integer: true, min: 0, initial: 1 }),
      // active: toggled for activatable powers (Combat Sense, Astral Perception, etc.)
      active:  new fields.BooleanField({ initial: false }),
      description: new fields.HTMLField({ initial: "" }),
    };
  }
}

/**
 * DataModel for Spirit actors — Force-based, elemental/shamanic.
 * All attributes are derived from Force in SR2E.
 */
export default class SpiritData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    const monitorField = (initialMax) => new fields.SchemaField({
      value: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      max:   new fields.NumberField({ required: true, integer: true, min: 1, initial: initialMax }),
    });

    return {
      // Force drives everything for spirits
      force: new fields.NumberField({ required: true, integer: true, min: 1, max: 12, initial: 3 }),

      // Derived from Force — calculated in SR2Actor.prepareDerivedData()
      attributes: new fields.SchemaField({
        body:         new fields.NumberField({ required: true, integer: true, initial: 3 }),
        quickness:    new fields.NumberField({ required: true, integer: true, initial: 3 }),
        strength:     new fields.NumberField({ required: true, integer: true, initial: 3 }),
        charisma:     new fields.NumberField({ required: true, integer: true, initial: 3 }),
        intelligence: new fields.NumberField({ required: true, integer: true, initial: 3 }),
        willpower:    new fields.NumberField({ required: true, integer: true, initial: 3 }),
        reaction:     new fields.NumberField({ required: true, integer: true, initial: 3 }),
        magic:        new fields.NumberField({ required: true, integer: true, initial: 3 }),
        essence:      new fields.NumberField({ required: true, integer: true, initial: 3 }),
      }),

      monitors: new fields.SchemaField({
        physical: monitorField(10),
        astral:   monitorField(10),
      }),

      spirit_type: new fields.StringField({ initial: "fire",
        choices: ["fire","water","earth","air","city","field","forest","hearth","lake","river","prairie","storm","sea"] }),

      // Who conjured/controls this spirit
      conjurer:         new fields.StringField({ initial: "" }),
      services_owed:    new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      materialized:     new fields.BooleanField({ initial: true }),

      notes: new fields.HTMLField({ initial: "" }),
    };
  }
}

/**
 * DataModel for Critter actors (animals, paracritters).
 */
export default class CritterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    const attrField = () => new fields.SchemaField({
      base:  new fields.NumberField({ required: true, integer: true, min: 0, initial: 1 }),
      mod:   new fields.NumberField({ required: true, integer: true, initial: 0 }),
      value: new fields.NumberField({ required: true, integer: true, initial: 1 }),
    });

    const monitorField = (initialMax) => new fields.SchemaField({
      value: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      max:   new fields.NumberField({ required: true, integer: true, min: 1, initial: initialMax }),
    });

    return {
      attributes: new fields.SchemaField({
        body:         attrField(),
        quickness:    attrField(),
        strength:     attrField(),
        charisma:     attrField(),
        intelligence: attrField(),
        willpower:    attrField(),
      }),

      essence: new fields.SchemaField({
        value: new fields.NumberField({ required: true, min: 0, max: 6, initial: 6 }),
      }),
      reaction: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, min: 1, initial: 1 }),
      }),

      monitors: new fields.SchemaField({
        physical: monitorField(10),
        stun:     monitorField(10),
      }),

      initiative: new fields.SchemaField({
        base: new fields.NumberField({ required: true, integer: true, initial: 1 }),
        dice: new fields.NumberField({ required: true, integer: true, min: 1, max: 4, initial: 1 }),
      }),

      combat_pool: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),

      critter_type: new fields.StringField({ initial: "" }),
      magical:      new fields.BooleanField({ initial: false }),
      notes:        new fields.HTMLField({ initial: "" }),

      // Natural weapons embedded on the critter (claws, bite, tail, etc.)
      natural_weapons: new fields.ArrayField(
        new fields.SchemaField({
          name:         new fields.StringField({ required: true, initial: "Claws" }),
          damage_power: new fields.NumberField({ required: true, integer: true, min: 0, initial: 4 }),
          damage_level: new fields.StringField({ initial: "M", choices: ["L","M","S","D"] }),
          reach:        new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        })
      ),

      // Special critter abilities (Regeneration, Venom, Fear, Concealment, etc.)
      special_powers: new fields.ArrayField(
        new fields.SchemaField({
          name:        new fields.StringField({ required: true, initial: "" }),
          description: new fields.StringField({ initial: "" }),
        })
      ),
    };
  }
}

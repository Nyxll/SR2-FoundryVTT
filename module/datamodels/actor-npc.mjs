/**
 * DataModel for NPC actors — streamlined for GM use.
 * Attributes follow the same { base, mod, value } pattern as PC actors.
 * Skills stored as { rating, specialization } map (same as PC actors).
 * Pools: { combat, magic, hacking } for direct dice pool assignment.
 */
export default class NpcData extends foundry.abstract.TypeDataModel {
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
        reaction:     new fields.SchemaField({
          base: new fields.NumberField({ required: true, integer: true, min: 0, initial: 1 }),
          mod:  new fields.NumberField({ required: true, integer: true, initial: 0 }),
        }),
      }),

      essence: new fields.SchemaField({
        value: new fields.NumberField({ required: true, min: 0, max: 6, initial: 6 }),
      }),

      // Skills stored as a free-form object: { skill_key: { rating: N, specialization: "" } }
      skills: new fields.ObjectField({ initial: () => ({}) }),

      // Direct dice pool assignments for GMs
      pools: new fields.SchemaField({
        combat:  new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        magic:   new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        hacking: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      }),

      monitors: new fields.SchemaField({
        physical: monitorField(10),
        stun:     monitorField(10),
      }),

      metatype:  new fields.StringField({ initial: "human" }),
      archetype: new fields.StringField({ initial: "mundane" }),
      notes:     new fields.HTMLField({ initial: "" }),
    };
  }
}

/**
 * DataModel for NPC actors — streamlined for GM use.
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
      }),

      essence: new fields.SchemaField({
        value: new fields.NumberField({ required: true, min: 0, max: 6, initial: 6 }),
      }),
      reaction: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, min: 1, initial: 1 }),
        mod:   new fields.NumberField({ required: true, integer: true, initial: 0 }),
      }),

      monitors: new fields.SchemaField({
        physical: monitorField(10),
        stun:     monitorField(10),
      }),

      // Simplified skill pools for NPCs — GMs assign dice pools directly
      combat_pool:  new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      defense_pool: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      hacking_pool: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),

      initiative: new fields.SchemaField({
        base: new fields.NumberField({ required: true, integer: true, initial: 1 }),
        dice: new fields.NumberField({ required: true, integer: true, min: 1, max: 4, initial: 1 }),
      }),

      // Weapon damage code shorthand
      damage:    new fields.StringField({ initial: "9M" }),
      reach:     new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),

      metatype:  new fields.StringField({ initial: "human" }),
      archetype: new fields.StringField({ initial: "mundane" }),
      notes:     new fields.HTMLField({ initial: "" }),
    };
  }
}

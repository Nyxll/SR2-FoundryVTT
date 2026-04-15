/**
 * DataModel for Player Character (character) actors.
 *
 * Skills are stored as an ObjectField to support arbitrary skill names
 * (Gunnery, Monowhip, Whips, Knowledge skills, Language skills, etc.)
 * Each skill entry: { rating, specialization, mod, skill_type }
 * skill_type: "active" | "knowledge" | "language"
 */
export default class CharacterData extends foundry.abstract.TypeDataModel {
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
      // ---------- Core Attributes ----------
      attributes: new fields.SchemaField({
        body:         attrField(),
        quickness:    attrField(),
        strength:     attrField(),
        charisma:     attrField(),
        intelligence: attrField(),
        willpower:    attrField(),
      }),

      // ---------- Derived / Secondary ----------
      essence: new fields.SchemaField({
        value: new fields.NumberField({ required: true, min: 0, max: 6, initial: 6 }),
        base:  new fields.NumberField({ required: true, min: 0, max: 6, initial: 6 }),
      }),
      magic: new fields.SchemaField({
        value:   new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        base:    new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        mod:     new fields.NumberField({ required: true, integer: true, initial: 0 }),
        // Physical magicians only: points allocated to spellcasting side.
        // Remaining (base - casting) = power points for adept powers.
        casting: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      }),
      reaction: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, min: 1, initial: 1 }),
        mod:   new fields.NumberField({ required: true, integer: true, initial: 0 }),
      }),

      // ---------- Initiative ----------
      initiative: new fields.SchemaField({
        base:  new fields.NumberField({ required: true, integer: true, initial: 1 }),
        dice:  new fields.NumberField({ required: true, integer: true, min: 1, max: 4, initial: 1 }),
        mod:   new fields.NumberField({ required: true, integer: true, initial: 0 }),
      }),

      // ---------- Condition Monitors ----------
      monitors: new fields.SchemaField({
        physical: monitorField(10),
        stun:     monitorField(10),
        overflow: monitorField(3),
      }),

      // ---------- Skills ----------
      // Open-ended object: key = camelCase skill name, value = skill entry
      // Allows any skill (Gunnery, Monowhip, Whips, French, Military Theory, etc.)
      skills: new fields.ObjectField({ initial: {} }),

      // ---------- Identity & Character Info ----------
      metatype:    new fields.StringField({ initial: "human", choices: ["human","elf","dwarf","ork","troll"] }),
      archetype:   new fields.StringField({ initial: "mundane",
        choices: ["mundane","adept","physical_magician","mage","shaman","decker","rigger","street_samurai"] }),
      street_name: new fields.StringField({ initial: "" }),
      gender:      new fields.StringField({ initial: "" }),
      age:         new fields.StringField({ initial: "" }),
      height:      new fields.StringField({ initial: "" }),
      weight:      new fields.StringField({ initial: "" }),
      hair:        new fields.StringField({ initial: "" }),
      eyes:        new fields.StringField({ initial: "" }),
      skin:        new fields.StringField({ initial: "" }),
      reputation:  new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      notoriety:   new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),

      // ---------- Resources ----------
      nuyen:     new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      lifestyle: new fields.StringField({ initial: "" }),
      karma: new fields.SchemaField({
        total:   new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        spent:   new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        current: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        pool:    new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      }),

      // ---------- Bioware Body Index ----------
      // Bioware uses Body Index (max = Body rating) rather than Essence
      body_index: new fields.SchemaField({
        used: new fields.NumberField({ required: true, min: 0, initial: 0 }),
        max:  new fields.NumberField({ required: true, min: 0, initial: 9 }),
      }),

      // ---------- Dice Pools ----------
      pools: new fields.SchemaField({
        combat:   new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        spell:    new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        magic:    new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        control:  new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        hacking:  new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        task:     new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      }),

      // ---------- Adept Power Points ----------
      // Used by adept and physical_magician archetypes.
      power_points: new fields.SchemaField({
        total:     new fields.NumberField({ required: true, min: 0, initial: 0 }),
        available: new fields.NumberField({ required: true, min: 0, initial: 0 }),
      }),

      // ---------- Magic ----------
      // For awakened archetypes (mage, shaman, physical_magician)
      initiate_level:  new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      metamagics:      new fields.StringField({ initial: "" }),
      magical_group:   new fields.StringField({ initial: "" }),
      tradition:       new fields.StringField({ initial: "" }),

      // ---------- Biography ----------
      biography: new fields.HTMLField({ initial: "" }),
      notes:     new fields.HTMLField({ initial: "" }),
    };
  }
}

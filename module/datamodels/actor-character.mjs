/**
 * DataModel for Player Character (character) actors.
 */
export default class CharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    const attrField = () => new fields.SchemaField({
      base:  new fields.NumberField({ required: true, integer: true, min: 1, initial: 1 }),
      mod:   new fields.NumberField({ required: true, integer: true, initial: 0 }),
      value: new fields.NumberField({ required: true, integer: true, initial: 1 }),
    });

    const skillField = () => new fields.SchemaField({
      rating:         new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      specialization: new fields.StringField({ initial: "" }),
      mod:            new fields.NumberField({ required: true, integer: true, initial: 0 }),
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
        value: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        base:  new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
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
      skills: new fields.SchemaField(
        Object.fromEntries(
          [
            "armed_combat","unarmed_combat","firearms","heavy_weapons","projectile_weapons",
            "throwing_weapons","stealth","athletics",
            "bike","car","hovercraft","motorboat","sailboat","fixed_wing","rotary_wing","vectored_thrust",
            "computer","electronics","demolitions","biotech","first_aid","security_systems","forgery","lockpicking",
            "etiquette","leadership","negotiations","interrogation","instruction",
            "wilderness_survival","tracking","navigation","perception","disguise","escape_artist","palming","pickpocket",
            "sorcery","conjuring","enchanting","centering","aura_reading","astral_combat",
          ].map(key => [key, skillField()])
        )
      ),

      // ---------- Identity & Character Info ----------
      metatype:  new fields.StringField({ initial: "human", choices: ["human","elf","dwarf","ork","troll"] }),
      archetype: new fields.StringField({ initial: "mundane",
        choices: ["mundane","adept","mage","shaman","decker","rigger","street_samurai"] }),
      gender:    new fields.StringField({ initial: "" }),
      age:       new fields.StringField({ initial: "" }),
      height:    new fields.StringField({ initial: "" }),
      weight:    new fields.StringField({ initial: "" }),
      reputation: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      notoriety:  new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),

      // ---------- Resources ----------
      nuyen:  new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      karma:  new fields.SchemaField({
        total: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        spent: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        current: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      }),

      // ---------- Combat Pools ----------
      pools: new fields.SchemaField({
        combat:     new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        spell:      new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        control:    new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        hacking:    new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      }),

      // ---------- Biography ----------
      biography: new fields.HTMLField({ initial: "" }),
      notes:     new fields.HTMLField({ initial: "" }),
    };
  }
}

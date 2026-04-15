export default class WeaponData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      category:      new fields.StringField({ initial: "pistol" }),
      skill:         new fields.StringField({ initial: "firearms" }),
      damage_power:  new fields.NumberField({ required: true, integer: true, min: 0, initial: 9 }),
      damage_level:  new fields.StringField({ initial: "M", choices: ["L","M","S","D"] }),
      reach:         new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      concealability: new fields.NumberField({ required: true, integer: true, min: 0, initial: 4 }),
      ammo_type:     new fields.StringField({ initial: "regular" }),
      ammo_current:  new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      ammo_max:      new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      recoil_comp:   new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      smartlink:     new fields.BooleanField({ initial: false }),
      fire_modes:    new fields.SchemaField({
        ss:  new fields.BooleanField({ initial: false }),
        sa:  new fields.BooleanField({ initial: true }),
        bf:  new fields.BooleanField({ initial: false }),
        fa:  new fields.BooleanField({ initial: false }),
      }),
      equipped:      new fields.BooleanField({ initial: true }),
      description:   new fields.HTMLField({ initial: "" }),
      price:         new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      availability:  new fields.StringField({ initial: "" }),
      restriction:   new fields.StringField({ initial: "" }),
    };
  }
}

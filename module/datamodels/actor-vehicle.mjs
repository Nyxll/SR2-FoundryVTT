/**
 * DataModel for Vehicle actors.
 */
export default class VehicleData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    const monitorField = (initialMax) => new fields.SchemaField({
      value: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      max:   new fields.NumberField({ required: true, integer: true, min: 1, initial: initialMax }),
    });

    return {
      // Vehicle attributes
      handling:     new fields.NumberField({ required: true, integer: true, min: 0, initial: 3 }),
      acceleration: new fields.NumberField({ required: true, integer: true, min: 0, initial: 3 }),
      speed:        new fields.NumberField({ required: true, integer: true, min: 0, initial: 60 }),
      body:         new fields.NumberField({ required: true, integer: true, min: 0, initial: 3 }),
      armor:        new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      signature:    new fields.NumberField({ required: true, integer: true, min: 0, initial: 3 }),
      autopilot:    new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      sensor:       new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),

      monitors: new fields.SchemaField({
        physical: monitorField(10),
      }),

      vehicle_type: new fields.StringField({ initial: "car",
        choices: ["car","bike","truck","van","rotary_wing","fixed_wing","boat","sub","hovercraft","drone"] }),

      pilot:   new fields.StringField({ initial: "" }),  // actor ID of pilot/owner
      notes:   new fields.HTMLField({ initial: "" }),
    };
  }
}

/**
 * Shadowrun 2nd Edition — Foundry VTT System
 * Entry point: registered as the esmodule in system.json
 */

import { SR2E } from "./config.js";
import * as datamodels from "./datamodels/_module.mjs";
import * as documents  from "./documents/_module.mjs";
import SR2CharacterSheet from "./sheets/SR2CharacterSheet.js";
import SR2NPCSheet       from "./sheets/SR2NPCSheet.js";
import SR2ItemSheet      from "./sheets/SR2ItemSheet.js";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once("init", function () {
  console.log("SR2E | Initializing Shadowrun 2nd Edition System");
  console.log("SR2E | datamodels loaded:", Object.keys(datamodels));
  console.log("SR2E | documents loaded:", Object.keys(documents));

  // Expose config on game object for macro / module access
  game.sr2e = { config: SR2E };
  CONFIG.SR2E = SR2E;

  // Register custom document classes
  CONFIG.Actor.documentClass = documents.SR2Actor;
  CONFIG.Item.documentClass  = documents.SR2Item;

  // Register DataModels for each actor type (use Object.assign, don't replace)
  Object.assign(CONFIG.Actor.dataModels, {
    character: datamodels.CharacterData,
    npc:       datamodels.NpcData,
    critter:   datamodels.CritterData,
    spirit:    datamodels.SpiritData,
    vehicle:   datamodels.VehicleData,
  });

  // Register DataModels for each item type
  Object.assign(CONFIG.Item.dataModels, {
    weapon:      datamodels.WeaponData,
    armor:       datamodels.ArmorData,
    cyberware:   datamodels.CyberwareData,
    bioware:     datamodels.BiowaveData,
    gear:        datamodels.GearData,
    spell:       datamodels.SpellData,
    adept_power: datamodels.AdeptPowerData,
    quality:     datamodels.QualityData,
    contact:     datamodels.ContactData,
    sin:         datamodels.SinData,
  });

  console.log("SR2E | Actor dataModels registered:", Object.keys(CONFIG.Actor.dataModels));

  // Register actor sheets (v14 namespaced APIs)
  const Actors = foundry.documents.collections.Actors;
  const Items  = foundry.documents.collections.Items;
  const ActorSheet = foundry.appv1.sheets.ActorSheet;
  const ItemSheet  = foundry.appv1.sheets.ItemSheet;

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("shadowrun2e", SR2CharacterSheet, {
    types: ["character"],
    makeDefault: true,
    label: "Character Sheet",
  });
  Actors.registerSheet("shadowrun2e", SR2NPCSheet, {
    types: ["npc", "critter", "spirit", "vehicle"],
    makeDefault: true,
    label: "NPC Sheet",
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("shadowrun2e", SR2ItemSheet, {
    makeDefault: true,
    label: "Item Sheet",
  });

  console.log("SR2E | Sheets registered");

  // Register system settings
  _registerSettings();

  // Register Handlebars helpers
  _registerHandlebarsHelpers();

  console.log("SR2E | Init complete");

  // Preload templates
  return _preloadTemplates();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", function () {
  console.log("SR2E | System ready");
  console.log("SR2E | game.documentTypes.Actor:", game.documentTypes?.Actor);
  console.log("SR2E | CONFIG.Actor.typeLabels:", CONFIG.Actor.typeLabels);
  console.log("SR2E | TYPES.Actor.character localized:", game.i18n.localize("TYPES.Actor.character"));
});

/* -------------------------------------------- */
/*  Settings                                    */
/* -------------------------------------------- */

function _registerSettings() {
  game.settings.register("shadowrun2e", "defaultTargetNumber", {
    name: game.i18n.localize("SR2E.Settings.targetNumber.label"),
    hint: game.i18n.localize("SR2E.Settings.targetNumber.hint"),
    scope:   "world",
    config:  true,
    type:    Number,
    default: 4,
    range:   { min: 2, max: 9, step: 1 },
  });

  game.settings.register("shadowrun2e", "woundModifiers", {
    name: game.i18n.localize("SR2E.Settings.woundModifiers.label"),
    hint: game.i18n.localize("SR2E.Settings.woundModifiers.hint"),
    scope:   "world",
    config:  true,
    type:    Boolean,
    default: true,
  });
}

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

function _registerHandlebarsHelpers() {
  // Concatenate strings
  Handlebars.registerHelper("concat", (...args) => args.slice(0, -1).join(""));

  // Greater-than-or-equal comparison (for dice highlighting)
  Handlebars.registerHelper("gte", (a, b) => a >= b);

  // Equality check
  Handlebars.registerHelper("eq", (a, b) => a === b);

  // Select options from array of {value, label} objects
  Handlebars.registerHelper("selectOptions", function (options, opts) {
    const selected = opts.hash.selected ?? "";
    const valueAttr = opts.hash.valueAttr ?? "value";
    const labelAttr = opts.hash.labelAttr ?? "label";
    return options.map(o => {
      const isSelected = String(o[valueAttr]) === String(selected) ? ' selected="selected"' : "";
      return `<option value="${o[valueAttr]}"${isSelected}>${o[labelAttr]}</option>`;
    }).join("\n");
  });
}

/* -------------------------------------------- */
/*  Template Preloading                         */
/* -------------------------------------------- */

async function _preloadTemplates() {
  const templatePaths = [
    // Actor sheets
    "systems/shadowrun2e/templates/actor/character-sheet.hbs",
    "systems/shadowrun2e/templates/actor/npc-sheet.hbs",
    // Item sheets
    "systems/shadowrun2e/templates/item/weapon-sheet.hbs",
    "systems/shadowrun2e/templates/item/armor-sheet.hbs",
    "systems/shadowrun2e/templates/item/cyberware-sheet.hbs",
    "systems/shadowrun2e/templates/item/bioware-sheet.hbs",
    "systems/shadowrun2e/templates/item/gear-sheet.hbs",
    "systems/shadowrun2e/templates/item/spell-sheet.hbs",
    "systems/shadowrun2e/templates/item/adept_power-sheet.hbs",
    "systems/shadowrun2e/templates/item/quality-sheet.hbs",
    "systems/shadowrun2e/templates/item/contact-sheet.hbs",
    "systems/shadowrun2e/templates/item/sin-sheet.hbs",
    // Dialog & chat
    "systems/shadowrun2e/templates/dialog/roll-dialog.hbs",
    "systems/shadowrun2e/templates/chat/roll-result.hbs",
  ];
  return foundry.applications.handlebars.loadTemplates(templatePaths);
}

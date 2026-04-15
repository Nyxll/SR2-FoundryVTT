# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Shadowrun 2nd Edition** game system for Foundry VTT v13. This is a ground-up implementation — no legacy SR5/SR6 code. Built with Foundry's modern DataModel API (no template.json).

The SR6 reference implementation lives in `projectsfoundary/` (a sibling subdirectory). It is **read-only reference** — do not modify it.

## Commands

```bash
# No build step — JS is loaded directly by Foundry as ES modules.

# Install dev tools (only needed for pack management)
npm install

# Compile source JSON packs (src/packs/) → binary packs/ for Foundry
npm run pack

# Extract binary packs back to editable JSON
npm run unpack
```

To test: symlink or copy this directory to `{Foundry userData}/Data/systems/shadowrun2e/`, then create a world in Foundry using the "Shadowrun 2nd Edition" system. Hot reload is enabled for CSS, templates, and lang files.

There are no automated tests — testing is done live in Foundry.

To enable Foundry debug mode, open browser console and set `CONFIG.debug.hooks = true`.

## Architecture

Entry point: `module/shadowrun2e.js` — registers everything via `Hooks.once("init")`.

```
module/
  shadowrun2e.js          ← Init: registers classes, sheets, settings, Handlebars helpers
  config.js               ← SR2E constants: attributes, skills, metatypes, ranges, etc.
  datamodels/             ← Foundry DataModel subclasses (schema definitions)
    actor-character.mjs   ← PC schema (attributes, skills, monitors, pools, karma)
    actor-npc.mjs         ← NPC schema (simplified, GM-facing)
    actor-critter.mjs
    actor-spirit.mjs      ← Force-based; attributes derived in SR2Actor
    actor-vehicle.mjs
    item-*.mjs            ← Per item type schemas
    _module.mjs           ← Re-exports all
  documents/
    SR2Actor.js           ← prepareDerivedData(): reaction, monitors, pools, wound modifier
    SR2Item.js            ← prepareDerivedData(): damage_code string assembly
    _module.mjs
  dice/
    SR2Roll.js            ← rollPool(pool, tn): counts d6 >= TN as successes, glitch detection
    RollDialog.js         ← SR2RollDialog.prompt({pool, label}): pre-roll dialog → Promise
  sheets/
    SR2CharacterSheet.js  ← PC sheet; getData builds skill groups, monitor boxes, item lists
    SR2NPCSheet.js        ← Compact NPC sheet
    SR2ItemSheet.js       ← Single class for all item types; template switches per type

templates/
  actor/character-sheet.hbs   ← Tabbed: Attributes, Skills, Combat, Gear, Magic, Matrix, Background
  actor/npc-sheet.hbs         ← Compact: Stats, Weapons, Notes
  item/{type}-sheet.hbs       ← One template per item type
  dialog/roll-dialog.hbs      ← Pool + TN + Rule of Six input
  chat/roll-result.hbs        ← Coloured dice display with glitch warning

styles/shadowrun2e.css  ← All styles (dark header, red accent, monitor boxes, dice results)
lang/en.json            ← All translatable strings under SR2E.*
```

## SR2E Key Rules Implemented

- **Attributes**: Body, Quickness, Strength, Charisma, Intelligence, Willpower (+ Essence, Magic, Reaction derived)
- **Dice pools**: Attribute + Skill rating. Roll Nd6, count ≥ target number (default 4) as successes.
- **Glitch**: more 1s than successes → Glitch. All 1s → Critical Glitch. Rule of Six optional.
- **Reaction**: (Quickness + Intelligence) / 2 rounded down + mods
- **Combat Pool**: (Quickness + Intelligence + Willpower) / 2 rounded down
- **Monitors**: Physical = 10 + ⌈Body/2⌉; Stun = 10 + ⌈Willpower/2⌉
- **Essence**: base 6, reduced by sum of installed cyberware `essence_cost`; Magic capped by floor(Essence)
- **Wound modifier**: 0 (Light), −1 (Moderate), −2 (Serious), −3 (Deadly) — applied automatically to pool

## Adding Features

- **New actor type**: add DataModel in `datamodels/`, export from `_module.mjs`, register in `shadowrun2e.js` under `CONFIG.Actor.dataModels`, create sheet template, register sheet.
- **New item type**: same pattern under `CONFIG.Item.dataModels` and `templates/item/`.
- **New skill**: add to `SR2E.SKILLS` in `config.js` and `CharacterData.defineSchema()` in `datamodels/actor-character.mjs`.
- **New constant/lookup**: add to `config.js`, use in templates via `{{config.CONSTANT_NAME}}`.

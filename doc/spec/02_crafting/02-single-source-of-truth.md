# 02 — Single source of truth

Centralize profession/room/skill-prefix domain mapping so every layer imports the same values.

**Depends on:** [01-boundaries-goals](./01-boundaries-goals.md)  
**Used by:** [03](./03-guaranteed-skill-state.md), [05](./05-bl-ui-responsibility-split.md), [07](./07-migration-isolation.md)

---

## Problem

Current code duplicates:

- `PROFESSION_IDS` arrays in multiple files.
- Profession-to-room mapping in selectors only.
- SkillId-prefix-to-profession mapping in migration only.

This makes extension fragile and introduces drift.

---

## Plan

1. Add one domain module under `src/game/domain/` (name TBD in implementation) that exports:
   - canonical profession ids list
   - profession to room id map
   - skill id prefix map (for migration and validation use)
2. Replace local arrays/maps in:
   - task simulation
   - action handlers
   - offline simulation
   - storage normalization
   - room selectors
   - migration
3. Add tiny helper APIs in the same module:
   - iterate professions safely
   - resolve profession from room id
   - resolve profession from skill id prefix

---

## Acceptance

- No local `PROFESSION_IDS` arrays remain in runtime code.
- Mapping changes are made in one place only.
- New profession onboarding checklist reduces to domain module + library data + visuals.

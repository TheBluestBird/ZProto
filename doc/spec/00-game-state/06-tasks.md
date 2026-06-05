# 06 — Task execution

Queue processing, timed completion, skill XP.

**Depends on:** [02-library](./02-library.md), [03-actions](./03-actions.md), [05-engine](./05-engine.md)  
**Used by:** [07-selectors](./07-selectors.md), [09-persistence](./09-persistence.md)

---

## Files

```
src/game/tasks/simulation.ts
src/game/professions/applySkill.ts
src/game/actions/reduce.ts
src/game/actions/handlers/
```

---

## Lifecycle

1. `Plan` → append to queue
2. `StartQueue` (or auto-start when idle) → set `currentTask = { skillId, startedAt: now }` from queue head
3. Each `Tick`:
   - `elapsed = now - currentTask.startedAt`
   - if `elapsed < skill.durationSeconds * 1000` → update `lastTickAt` only
   - else → **complete** one execution (see below)
4. **Complete:** grant XP → decrement head `count` → remove if 0 → start next or set `currentTask = null`

---

## Completion effects

| Effect | Now | Later |
|--------|-----|-------|
| Add `experienceGained` to skill progress | ✓ | |
| Skill level-up | ✓ simple threshold | |
| Consume ingredients | | inventory |
| Add products | | inventory |

First skill learned in a profession → room becomes `full` ([07-selectors](./07-selectors.md)). Room rules may grow more complex later.

---

## Resolved

1. **Queue empty after complete** — stop (`currentTask = null`).
2. **Auto-start on `Plan`** — yes, when idle.

## Deferred

- Consume ingredients / add products — when inventory exists.

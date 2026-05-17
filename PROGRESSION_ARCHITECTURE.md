# H4CKXEL Command Center Architecture

The homepage is now a client-side progression shell layered on top of the existing Jekyll knowledge base.

## Structure

```text
data/
  missions.json        # Mission catalog and requirements
  ranks.json           # Rank ladder
  skills.json          # Skill graph, unlocks, milestones
  xp_config.json       # XP curve, activities, achievements, project progress, GitHub config

assets/js/command-center/
  config-loader.js     # Loads JSON config files
  storage.js           # Persistence adapter boundary
  progression-engine.js
  mission-engine.js
  skills-engine.js
  github.js
  ui.js
  main.js              # Wiring and browser events

css/dashboard/
  tokens.css
  base.css
  layout.css
  components.css
  effects.css
```

## Persistence Model

The live tracker currently persists through `localStorage` under the key configured in `xp_config.json`.
The `storage.js` adapter isolates persistence so a future backend migration can replace only that module with:

- authenticated API calls,
- a hosted database,
- synced user profiles,
- or GitHub-backed JSON storage.

The dashboard also supports JSON export/import today, which keeps the state portable even before a backend exists.

## Extension Points

- Add or rebalance XP events in `data/xp_config.json`.
- Add rank titles in `data/ranks.json`.
- Add missions or alter requirements in `data/missions.json`.
- Extend the skill graph in `data/skills.json`.
- Replace `github.js` with richer telemetry if contribution graphs or multi-repo analytics become desirable.
- Hook custom audio into `window.H4CKXEL_SOUND_HOOK(eventName, payload)`.

## Design Rule

The dashboard is intentionally data-driven:

- configuration lives in JSON,
- logic lives in engines,
- rendering lives in `ui.js`,
- orchestration lives in `main.js`.

That separation keeps the site cinematic without letting the codebase become theatrical spaghetti.

# Legacy Command Center Notes

The previous homepage experimented with a client-side progression dashboard.
That interface is no longer loaded by `index.html`.

The current homepage follows a quieter direction: **Minimal Terminal Editorial**.

## Current rule

- `index.html` renders a static editorial home.
- `css/main.css` owns the home styles directly.
- No dashboard JavaScript is referenced by the homepage.
- Existing Jekyll collections remain intact.

## Legacy files

The old progression modules under `assets/js/command-center/` and JSON files under `data/`
are kept in the repository for now instead of being deleted blindly.
They can be removed later if the site no longer needs any personal tracking experiment.

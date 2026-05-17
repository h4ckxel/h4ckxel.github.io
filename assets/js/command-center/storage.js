/**
 * The progression layer talks to this module instead of localStorage directly.
 * If this terminal ever graduates into an authenticated backend, this is the seam
 * to replace with an API adapter without rewriting the rendering or XP logic.
 */
export function createDefaultState() {
  return {
    version: 1,
    totalXp: 0,
    history: [],
    claimedArticles: [],
    claimedMissions: {},
    hardcoreMode: false,
    skillXp: {},
    skillNotes: {},
    skillMilestones: {},
    achievementsUnlocked: []
  };
}

export function loadState(storageKey) {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return createDefaultState();
    }

    return {
      ...createDefaultState(),
      ...JSON.parse(raw)
    };
  } catch (error) {
    console.warn("Unable to parse persisted progression state.", error);
    return createDefaultState();
  }
}

export function saveState(storageKey, state) {
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

export function exportState(state, fileName = "h4ckxel-progression-state.json") {
  const payload = JSON.stringify({
    exportedAt: new Date().toISOString(),
    schemaVersion: state.version,
    state
  }, null, 2);

  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function importState(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const candidate = parsed.state ?? parsed;

  return {
    ...createDefaultState(),
    ...candidate
  };
}

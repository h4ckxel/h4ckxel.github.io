import { clamp, round, toDateKey, startOfDay, daysBetween } from "./utils.js";

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function xpRequiredForLevel(level, curve) {
  return Math.round(curve.baseXp * (curve.growth ** Math.max(level - 1, 0)));
}

export function getLevelState(totalXp, curve) {
  let level = 1;
  let remainingXp = totalXp;

  while (level < curve.maxLevel) {
    const requirement = xpRequiredForLevel(level, curve);
    if (remainingXp < requirement) {
      break;
    }

    remainingXp -= requirement;
    level += 1;
  }

  const xpForNextLevel = level >= curve.maxLevel
    ? 0
    : xpRequiredForLevel(level, curve);

  return {
    level,
    xpIntoLevel: level >= curve.maxLevel ? 0 : remainingXp,
    xpForNextLevel,
    progress: level >= curve.maxLevel
      ? 100
      : clamp((remainingXp / xpForNextLevel) * 100, 0, 100)
  };
}

export function getRankState(level, ranks) {
  const ordered = [...ranks].sort((a, b) => a.level - b.level);
  const current = ordered.reduce((best, rank) => (
    rank.level <= level ? rank : best
  ), ordered[0]);
  const next = ordered.find((rank) => rank.level > level) ?? null;

  return { current, next };
}

export function grantActivity(state, activityType, quantity, note, config, metadata = {}) {
  const activity = config.activityTypes[activityType];
  if (!activity) {
    throw new Error(`Unknown activity type: ${activityType}`);
  }

  const safeQuantity = Math.max(Number(quantity) || 1, 0.5);
  const xp = Math.round(activity.xpPerUnit * safeQuantity);
  const entry = {
    id: createId(),
    type: activityType,
    quantity: safeQuantity,
    xp,
    note: note || activity.label,
    createdAt: metadata.createdAt ?? new Date().toISOString(),
    sourceType: metadata.sourceType ?? "manual",
    sourceId: metadata.sourceId ?? null
  };

  const skillXp = { ...state.skillXp };
  Object.entries(activity.skillXp ?? {}).forEach(([skillId, amount]) => {
    skillXp[skillId] = round((skillXp[skillId] ?? 0) + (amount * safeQuantity), 2);
  });

  return {
    ...state,
    totalXp: state.totalXp + xp,
    history: [entry, ...state.history],
    skillXp
  };
}

export function addRewardEntry(state, { type, xp, note, sourceType, sourceId }) {
  return {
    ...state,
    totalXp: state.totalXp + xp,
    history: [
      {
        id: createId(),
        type,
        quantity: 1,
        xp,
        note,
        createdAt: new Date().toISOString(),
        sourceType,
        sourceId
      },
      ...state.history
    ]
  };
}

export function calculateStreak(history, now = new Date()) {
  const activeDays = new Set(
    history
      .filter((entry) => entry.type !== "mission-claim")
      .map((entry) => toDateKey(new Date(entry.createdAt)))
  );

  let streak = 0;
  const cursor = startOfDay(now);

  while (activeDays.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function buildHeatmap(history, dayCount = 84, now = new Date()) {
  const cells = [];
  const totals = history
    .filter((entry) => entry.type !== "mission-claim")
    .reduce((map, entry) => {
      const key = toDateKey(new Date(entry.createdAt));
      map[key] = (map[key] ?? 0) + entry.xp;
      return map;
    }, {});

  for (let offset = dayCount - 1; offset >= 0; offset -= 1) {
    const date = startOfDay(now);
    date.setDate(date.getDate() - offset);
    const key = toDateKey(date);
    const xp = totals[key] ?? 0;
    let level = 0;
    if (xp > 0) level = 1;
    if (xp >= 50) level = 2;
    if (xp >= 120) level = 3;
    if (xp >= 220) level = 4;
    cells.push({ key, xp, level, daysAgo: daysBetween(date, now) });
  }

  return cells;
}

export function evaluateAchievements(state, config, levelState, streak) {
  const unlocked = new Set(state.achievementsUnlocked);
  const activityCount = state.history.filter((entry) => entry.type !== "mission-claim").length;
  const newlyUnlocked = [];

  config.achievements.forEach((achievement) => {
    if (unlocked.has(achievement.id)) {
      return;
    }

    const matched = (
      (achievement.kind === "activity-count" && activityCount >= achievement.threshold) ||
      (achievement.kind === "streak" && streak >= achievement.threshold) ||
      (achievement.kind === "level" && levelState.level >= achievement.threshold)
    );

    if (matched) {
      unlocked.add(achievement.id);
      newlyUnlocked.push(achievement);
    }
  });

  return {
    state: {
      ...state,
      achievementsUnlocked: [...unlocked]
    },
    newlyUnlocked
  };
}

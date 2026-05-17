import { getIsoWeekKey, seededSelection, startOfDay, startOfWeek, toDateKey } from "./utils.js";
import { addRewardEntry } from "./progression-engine.js";

function getCycleStart(group, now) {
  if (group === "daily" || group === "hardcore") {
    return startOfDay(now);
  }

  return startOfWeek(now);
}

function getCycleKey(group, now) {
  if (group === "daily" || group === "hardcore") {
    return toDateKey(now);
  }

  return getIsoWeekKey(now);
}

export function getMissionBoard(missions, state, now = new Date()) {
  const daily = seededSelection(missions.daily, 3, toDateKey(now))
    .map((mission) => ({ ...mission, group: "daily" }));
  const weekly = seededSelection(missions.weekly, 2, getIsoWeekKey(now))
    .map((mission) => ({ ...mission, group: "weekly" }));
  const sideQuest = seededSelection(missions.sideQuests, 1, `${getIsoWeekKey(now)}-side`)
    .map((mission) => ({ ...mission, group: "side" }));
  const hardcore = state.hardcoreMode
    ? seededSelection(missions.hardcore, 1, `${toDateKey(now)}-hardcore`)
      .map((mission) => ({ ...mission, group: "hardcore" }))
    : [];

  return [...daily, ...weekly, ...sideQuest, ...hardcore];
}

export function getMissionKey(mission, now = new Date()) {
  return `${mission.group}:${getCycleKey(mission.group, now)}:${mission.id}`;
}

export function getMissionProgress(mission, state, now = new Date()) {
  const cycleStart = getCycleStart(mission.group, now);
  const relevantHistory = state.history.filter((entry) => (
    new Date(entry.createdAt) >= cycleStart
  ));

  const requirements = mission.requirements.map((requirement) => {
    const total = relevantHistory
      .filter((entry) => entry.type === requirement.type)
      .reduce((sum, entry) => sum + (entry.quantity ?? 1), 0);

    return {
      ...requirement,
      current: total,
      complete: total >= requirement.quantity
    };
  });

  const current = requirements.reduce((sum, requirement) => sum + Math.min(requirement.current, requirement.quantity), 0);
  const target = requirements.reduce((sum, requirement) => sum + requirement.quantity, 0);

  return {
    requirements,
    current,
    target,
    progress: target === 0 ? 100 : Math.min((current / target) * 100, 100),
    complete: requirements.every((requirement) => requirement.complete)
  };
}

export function canClaimMission(mission, state, now = new Date()) {
  const key = getMissionKey(mission, now);
  return !state.claimedMissions[key] && getMissionProgress(mission, state, now).complete;
}

export function claimMission(mission, state, config, now = new Date()) {
  const key = getMissionKey(mission, now);
  if (!canClaimMission(mission, state, now)) {
    return state;
  }

  const multiplier = mission.group === "hardcore" ? config.hardcoreMultiplier : 1;
  const rewardXp = Math.round(mission.xp * multiplier);
  const rewarded = addRewardEntry(state, {
    type: "mission-claim",
    xp: rewardXp,
    note: mission.title,
    sourceType: "mission",
    sourceId: key
  });

  return {
    ...rewarded,
    claimedMissions: {
      ...rewarded.claimedMissions,
      [key]: new Date().toISOString()
    }
  };
}

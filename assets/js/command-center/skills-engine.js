export function getSkillState(skill, state, playerLevel, allSkills) {
  const dependenciesUnlocked = skill.dependencies.every((dependencyId) => {
    const dependency = allSkills.find((candidate) => candidate.id === dependencyId);
    return dependency ? getSkillState(dependency, state, playerLevel, allSkills).unlocked : false;
  });
  const unlocked = playerLevel >= skill.unlockLevel && dependenciesUnlocked;
  const xp = state.skillXp[skill.id] ?? 0;
  const level = unlocked ? Math.max(1, Math.floor(xp / 100) + 1) : 0;
  const progress = unlocked ? xp % 100 : 0;

  return {
    ...skill,
    description: skill.notes,
    unlocked,
    xp,
    level,
    progress,
    notes: state.skillNotes[skill.id] ?? "",
    completedMilestones: state.skillMilestones[skill.id] ?? []
  };
}

export function getAllSkillStates(skills, state, playerLevel) {
  return skills.map((skill) => getSkillState(skill, state, playerLevel, skills));
}

export function updateSkillNote(state, skillId, note) {
  return {
    ...state,
    skillNotes: {
      ...state.skillNotes,
      [skillId]: note
    }
  };
}

export function toggleMilestone(state, skillId, milestone) {
  const current = new Set(state.skillMilestones[skillId] ?? []);
  if (current.has(milestone)) {
    current.delete(milestone);
  } else {
    current.add(milestone);
  }

  return {
    ...state,
    skillMilestones: {
      ...state.skillMilestones,
      [skillId]: [...current]
    }
  };
}

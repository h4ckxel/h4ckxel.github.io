import { loadConfig } from "./config-loader.js";
import {
  createDefaultState,
  exportState,
  importState,
  loadState,
  saveState
} from "./storage.js";
import {
  calculateStreak,
  evaluateAchievements,
  getLevelState,
  grantActivity
} from "./progression-engine.js";
import {
  claimMission,
  getMissionBoard,
  getMissionKey
} from "./mission-engine.js";
import {
  getAllSkillStates,
  toggleMilestone,
  updateSkillNote
} from "./skills-engine.js";
import { loadGitHubTelemetry } from "./github.js";
import {
  drawSkillLinks,
  markClaimedArticles,
  populateActivityTypes,
  renderDiagnostics,
  renderGitHubError,
  renderGitHubTelemetry,
  renderHeatmap,
  renderHistory,
  renderMissions,
  renderProgression,
  renderProjectProgress,
  renderQuickActions,
  renderRadar,
  renderSkillDetail,
  renderSkillTree,
  renderTerminalFeed,
  showToast
} from "./ui.js";

let config;
let state;
let selectedSkillId = "linux";
let heartbeatIndex = 0;

function inferArticleActivity(article) {
  const tags = new Set(article.tags ?? []);
  if (tags.has("pe") || tags.has("exploit")) {
    return "reverse-engineering-log";
  }
  if (tags.has("linux")) {
    return "note";
  }
  return "writeup";
}

function persist() {
  saveState(config.xp.storageKey, state);
}

function refresh(now = new Date()) {
  const { levelState } = renderProgression(state, config.xp, config.ranks.ranks);
  const streak = calculateStreak(state.history, now);
  const missions = getMissionBoard(config.missions, state, now);
  const skillStates = getAllSkillStates(config.skills.skills, state, levelState.level);
  const selectedSkill = skillStates.find((skill) => skill.id === selectedSkillId) ?? skillStates[0];

  selectedSkillId = selectedSkill.id;
  document.getElementById("hardcore-toggle").checked = state.hardcoreMode;
  renderMissions(missions, state, now);
  renderDiagnostics(state, streak);
  renderTerminalFeed(state);
  renderHistory(state);
  renderHeatmap(state);
  renderSkillTree(skillStates, selectedSkillId);
  renderSkillDetail(selectedSkill);
  renderRadar(skillStates);
  renderProjectProgress(config.xp.projectProgress ?? []);
  markClaimedArticles(state);

  requestAnimationFrame(() => drawSkillLinks(skillStates));
}

function awardAchievements() {
  const levelState = getLevelState(state.totalXp, config.xp.curve);
  const streak = calculateStreak(state.history);
  const result = evaluateAchievements(state, config.xp, levelState, streak);
  state = result.state;

  result.newlyUnlocked.forEach((achievement) => {
    showToast("Achievement unlocked", `${achievement.title} // ${achievement.description}`);
    window.dispatchEvent(new CustomEvent("h4ckxel:achievement-unlocked", {
      detail: achievement
    }));
    window.H4CKXEL_SOUND_HOOK?.("achievement", achievement);
  });
}

function logActivity(type, quantity = 1, note = "") {
  state = grantActivity(state, type, quantity, note, config.xp);
  awardAchievements();
  persist();
  refresh();
}

function bindEvents() {
  document.getElementById("activity-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const type = document.getElementById("activity-type").value;
    const quantity = document.getElementById("activity-quantity").value;
    const note = document.getElementById("activity-note").value.trim();
    logActivity(type, quantity, note);
    event.currentTarget.reset();
    document.getElementById("activity-quantity").value = 1;
  });

  document.getElementById("quick-actions").addEventListener("click", (event) => {
    const button = event.target.closest("[data-quick-activity]");
    if (!button) {
      return;
    }

    logActivity(button.dataset.quickActivity, 1);
  });

  document.getElementById("mission-stack").addEventListener("click", (event) => {
    const button = event.target.closest("[data-claim-mission]");
    if (!button) {
      return;
    }

    const missions = getMissionBoard(config.missions, state);
    const mission = missions.find((candidate) => (
      getMissionKey(candidate) === button.dataset.claimMission
    ));
    if (!mission) {
      return;
    }

    state = claimMission(mission, state, config.xp);
    awardAchievements();
    persist();
    refresh();
    showToast("Mission complete", `${mission.title} secured.`);
    window.H4CKXEL_SOUND_HOOK?.("mission", mission);
  });

  document.getElementById("hardcore-toggle").addEventListener("change", (event) => {
    state = {
      ...state,
      hardcoreMode: event.target.checked
    };
    persist();
    refresh();
    showToast("Mission mode updated", event.target.checked ? "Hardcore objectives armed." : "Standard mission profile restored.");
  });

  document.getElementById("skill-tree").addEventListener("click", (event) => {
    const button = event.target.closest("[data-skill-id]");
    if (!button) {
      return;
    }

    selectedSkillId = button.dataset.skillId;
    refresh();
  });

  document.getElementById("skill-detail").addEventListener("change", (event) => {
    if (event.target.matches("[data-milestone]")) {
      state = toggleMilestone(state, selectedSkillId, event.target.dataset.milestone);
      persist();
      refresh();
    }
  });

  document.getElementById("skill-detail").addEventListener("input", (event) => {
    if (event.target.matches("[data-skill-note]")) {
      state = updateSkillNote(state, event.target.dataset.skillNote, event.target.value);
      persist();
    }
  });

  document.querySelectorAll("[data-claim-article]").forEach((button) => {
    button.addEventListener("click", () => {
      const article = window.H4CKXEL_CONTENT.posts.find((post) => post.url === button.dataset.claimArticle);
      const alreadyClaimed = state.claimedArticles.includes(article?.url)
        || state.history.some((entry) => entry.sourceType === "article" && entry.sourceId === article?.url);
      if (!article || alreadyClaimed) {
        return;
      }

      const type = inferArticleActivity(article);
      state = grantActivity(state, type, 1, `Journal entry: ${article.title}`, config.xp, {
        sourceType: "article",
        sourceId: article.url
      });
      state = {
        ...state,
        claimedArticles: [...state.claimedArticles, article.url]
      };
      awardAchievements();
      persist();
      refresh();
      showToast("Journal archived", `${article.title} added to progression history.`);
      window.H4CKXEL_SOUND_HOOK?.("article", article);
    });
  });

  document.getElementById("export-state").addEventListener("click", () => {
    exportState(state);
  });

  document.getElementById("import-state").addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (!file) {
      return;
    }

    try {
      state = await importState(file);
      awardAchievements();
      persist();
      refresh();
      showToast("State imported", "JSON progression payload accepted.");
    } catch (error) {
      console.error(error);
      showToast("Import failed", "The selected JSON file could not be parsed.");
    }
  });

  window.addEventListener("resize", () => {
    const levelState = getLevelState(state.totalXp, config.xp.curve);
    drawSkillLinks(getAllSkillStates(config.skills.skills, state, levelState.level));
  });
}

function runBootSequence() {
  const lines = [
    "mounting progression engine...",
    "loading academy graph...",
    "syncing mission board...",
    "arming local persistence...",
    "system online."
  ];
  const root = document.getElementById("boot-log");
  const overlay = document.getElementById("boot-sequence");

  lines.forEach((line, index) => {
    window.setTimeout(() => {
      const paragraph = document.createElement("p");
      paragraph.textContent = `> ${line}`;
      root.append(paragraph);
    }, index * 180);
  });

  window.setTimeout(() => overlay.classList.add("offline"), (lines.length * 180) + 260);
}

function startTelemetryLoop() {
  const lines = [
    "telemetry heartbeat nominal.",
    "mission scheduler listening.",
    "local persistence checkpoint clean.",
    "academy graph integrity verified.",
    "github uplink polling window open."
  ];

  window.setInterval(() => {
    const feed = document.getElementById("terminal-feed");
    if (!feed) {
      return;
    }

    const paragraph = document.createElement("p");
    paragraph.dataset.synthetic = "true";
    paragraph.textContent = `> ${lines[heartbeatIndex % lines.length]}`;
    heartbeatIndex += 1;
    feed.prepend(paragraph);

    feed.querySelectorAll("[data-synthetic='true']").forEach((node, index) => {
      if (index >= 2) {
        node.remove();
      }
    });
  }, 5200);
}

async function initialize() {
  try {
    config = await loadConfig(window.H4CKXEL_CONFIG_PATHS);
    state = loadState(config.xp.storageKey) ?? createDefaultState();
    document.getElementById("hardcore-toggle").checked = state.hardcoreMode;

    populateActivityTypes(config.xp.activityTypes);
    renderQuickActions(config.xp.activityTypes);
    bindEvents();
    awardAchievements();
    persist();
    refresh();
    runBootSequence();
    startTelemetryLoop();

    loadGitHubTelemetry(config.xp.github)
      .then(renderGitHubTelemetry)
      .catch(renderGitHubError);
  } catch (error) {
    console.error(error);
    document.getElementById("boot-sequence")?.classList.add("offline");
    renderGitHubError();
    showToast("Initialization fault", "One or more dashboard modules failed to load.");
  }
}

initialize();

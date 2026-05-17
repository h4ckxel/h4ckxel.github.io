import { buildHeatmap, getLevelState, getRankState } from "./progression-engine.js";
import { getMissionKey, getMissionProgress, canClaimMission } from "./mission-engine.js";
import { formatCompactNumber, formatDateTime } from "./utils.js";

function byId(id) {
  return document.getElementById(id);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderProgression(state, config, ranks) {
  const levelState = getLevelState(state.totalXp, config.curve);
  const rankState = getRankState(levelState.level, ranks);
  const nextRankText = rankState.next
    ? `Next rank @ LVL ${rankState.next.level}`
    : "Max rank unlocked";

  byId("level-value").textContent = levelState.level;
  byId("rank-value").textContent = rankState.current.title;
  byId("next-level-value").textContent = levelState.xpForNextLevel
    ? `${levelState.xpForNextLevel} XP`
    : "MAX";
  byId("xp-current").textContent = `${levelState.xpIntoLevel} XP`;
  byId("xp-required").textContent = levelState.xpForNextLevel
    ? `${levelState.xpForNextLevel} XP required`
    : "Progression cap reached";
  byId("hero-level").textContent = levelState.level;
  byId("hero-rank").textContent = rankState.current.title;
  byId("hero-total-xp").textContent = formatCompactNumber(state.totalXp);
  byId("rank-next-unlock").textContent = nextRankText;

  const bar = byId("xp-bar");
  const track = bar.parentElement;
  bar.style.width = `${levelState.progress}%`;
  track.setAttribute("aria-valuenow", Math.round(levelState.progress));
  track.classList.remove("flash");
  requestAnimationFrame(() => track.classList.add("flash"));

  return { levelState, rankState };
}

export function populateActivityTypes(activityTypes) {
  const select = byId("activity-type");
  select.innerHTML = "";

  Object.entries(activityTypes).forEach(([id, activity]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = `${activity.label} (+${activity.xpPerUnit} XP / ${activity.unit})`;
    select.append(option);
  });
}

export function renderQuickActions(activityTypes) {
  const root = byId("quick-actions");
  root.innerHTML = "";

  Object.entries(activityTypes)
    .slice(0, 5)
    .forEach(([id, activity]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "button button-secondary";
      button.dataset.quickActivity = id;
      button.textContent = `+ ${activity.label}`;
      root.append(button);
    });
}

export function renderMissions(missions, state, now = new Date()) {
  const root = byId("mission-stack");
  root.innerHTML = "";

  missions.forEach((mission) => {
    const progress = getMissionProgress(mission, state, now);
    const missionKey = getMissionKey(mission, now);
    const claimed = Boolean(state.claimedMissions[missionKey]);
    const rewardLabel = mission.group === "hardcore"
      ? `+${mission.xp} XP × HC`
      : `+${mission.xp} XP`;
    const buttonText = claimed
      ? "Claimed"
      : progress.complete
        ? "Claim XP"
        : "In progress";

    const article = document.createElement("article");
    article.className = "mission-card";
    article.innerHTML = `
      <div class="mission-meta">
        <span>${mission.group}</span>
        <span>${rewardLabel}</span>
      </div>
      <h3>${mission.title}</h3>
      <div class="mission-progress"><span style="width:${progress.progress}%"></span></div>
      <footer>
        <span>${progress.current}/${progress.target}</span>
        <button
          type="button"
          class="button button-secondary"
          data-claim-mission="${missionKey}"
          ${claimed || !canClaimMission(mission, state, now) ? "disabled" : ""}
        >
          ${buttonText}
        </button>
      </footer>
    `;
    root.append(article);
  });
}

export function renderDiagnostics(state, streak) {
  const diagnostics = [
    ["Persistence driver", "localStorage"],
    ["Progression log", `${state.history.length} events`],
    ["Unlocked achievements", `${state.achievementsUnlocked.length}`],
    ["Current streak", `${streak} days`]
  ];

  byId("diagnostic-list").innerHTML = diagnostics.map(([label, value]) => `
    <div class="diagnostic-item">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");

  byId("hero-streak").textContent = `${streak} day${streak === 1 ? "" : "s"}`;
}

export function renderTerminalFeed(state) {
  const root = byId("terminal-feed");
  const recent = state.history.slice(0, 5);
  root.innerHTML = recent.length
    ? recent.map((entry) => `
      <p>&gt; ${formatDateTime(entry.createdAt)} :: ${escapeHtml(entry.note)} [+${entry.xp} XP]</p>
    `).join("")
    : `
      <p>&gt; No progression events recorded.</p>
      <p>&gt; Awaiting first operator action.</p>
    `;
}

export function renderHistory(state) {
  const root = byId("history-list");
  const entries = state.history.slice(0, 8);
  root.innerHTML = entries.length
    ? entries.map((entry) => `
      <li>
        <strong>${escapeHtml(entry.note)}</strong>
        <small>${formatDateTime(entry.createdAt)} // +${entry.xp} XP // ${entry.type}</small>
      </li>
    `).join("")
    : `
      <li>
        <strong>No actions logged yet.</strong>
        <small>Your progression history will accumulate here.</small>
      </li>
    `;
}

export function renderHeatmap(state) {
  const root = byId("heatmap");
  const cells = buildHeatmap(state.history);
  const activeDays = cells.filter((cell) => cell.level > 0).length;
  root.innerHTML = cells.map((cell) => `
    <span
      class="heatmap-cell"
      data-level="${cell.level}"
      title="${cell.key}: ${cell.xp} XP"
    ></span>
  `).join("");
  byId("heatmap-summary").textContent = `${activeDays} active days`;
}

export function renderSkillTree(skillStates, selectedSkillId) {
  const tree = byId("skill-tree");
  const summary = byId("skill-summary");
  tree.innerHTML = "";

  skillStates.forEach((skill) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `skill-node ${skill.unlocked ? "unlocked" : "locked"}`;
    button.dataset.skillId = skill.id;
    button.dataset.tier = skill.tier;
    button.innerHTML = `
      <strong>${skill.label}</strong>
      <span>${skill.unlocked ? `LVL ${skill.level} // ${skill.progress}%` : `LOCKED @ LVL ${skill.unlockLevel}`}</span>
    `;
    if (skill.id === selectedSkillId) {
      button.setAttribute("aria-current", "true");
    }
    tree.append(button);
  });

  const unlockedCount = skillStates.filter((skill) => skill.unlocked).length;
  summary.textContent = `${unlockedCount}/${skillStates.length} nodes unlocked`;
}

export function renderSkillDetail(skill) {
  const root = byId("skill-detail");
  if (!skill) {
    root.innerHTML = "<p>Select a skill node to inspect the path.</p>";
    return;
  }

  root.innerHTML = `
    <p class="eyebrow">${skill.unlocked ? "Unlocked node" : "Locked node"}</p>
    <h3>${escapeHtml(skill.label)}</h3>
    <p>${escapeHtml(skill.description)}</p>
    <p><strong>Level:</strong> ${skill.level} ${skill.unlocked ? `// ${skill.progress}/100 skill XP` : `// unlocks at LVL ${skill.unlockLevel}`}</p>
    <h4>Milestones</h4>
    <ul class="milestone-list">
      ${skill.milestones.map((milestone) => `
        <li>
          <input
            type="checkbox"
            data-milestone="${milestone}"
            ${skill.completedMilestones.includes(milestone) ? "checked" : ""}
            ${skill.unlocked ? "" : "disabled"}
          >
          <span>${milestone}</span>
        </li>
      `).join("")}
    </ul>
    <label>
      Field notes
      <textarea
        id="skill-note-input"
        data-skill-note="${skill.id}"
        placeholder="Capture techniques, references, or next steps."
        ${skill.unlocked ? "" : "disabled"}
      >${escapeHtml(skill.notes)}</textarea>
    </label>
  `;
}

export function renderRadar(skillStates) {
  const root = byId("radar-chart");
  const visible = skillStates.slice(0, 8);
  const center = 140;
  const radius = 110;
  const rings = [0.25, 0.5, 0.75, 1];
  const maxLevel = Math.max(...visible.map((skill) => Math.max(skill.level, 1)), 4);

  const pointsForScale = (scale) => visible.map((skill, index) => {
    const angle = ((Math.PI * 2) / visible.length) * index - (Math.PI / 2);
    return [
      center + (Math.cos(angle) * radius * scale),
      center + (Math.sin(angle) * radius * scale)
    ];
  });

  const polygon = pointsForScale(1)
    .map((point) => point.join(","))
    .join(" ");

  const dataPolygon = visible.map((skill, index) => {
    const angle = ((Math.PI * 2) / visible.length) * index - (Math.PI / 2);
    const scale = Math.min(skill.level / maxLevel, 1);
    return [
      center + (Math.cos(angle) * radius * scale),
      center + (Math.sin(angle) * radius * scale)
    ].join(",");
  }).join(" ");

  root.innerHTML = `
    <svg viewBox="0 0 280 280" role="img" aria-label="Skill radar chart">
      ${rings.map((ring) => `
        <polygon
          points="${pointsForScale(ring).map((point) => point.join(",")).join(" ")}"
          fill="none"
          stroke="rgba(109,255,213,0.12)"
        />
      `).join("")}
      ${visible.map((skill, index) => {
        const angle = ((Math.PI * 2) / visible.length) * index - (Math.PI / 2);
        const x = center + (Math.cos(angle) * radius);
        const y = center + (Math.sin(angle) * radius);
        return `
          <line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="rgba(109,255,213,0.14)" />
          <text
            x="${center + (Math.cos(angle) * (radius + 18))}"
            y="${center + (Math.sin(angle) * (radius + 18))}"
            fill="rgba(231,255,247,0.8)"
            font-size="10"
            text-anchor="middle"
          >${skill.label}</text>
        `;
      }).join("")}
      <polygon points="${polygon}" fill="none" stroke="rgba(109,255,213,0.18)" />
      <polygon points="${dataPolygon}" fill="rgba(109,255,213,0.18)" stroke="rgba(109,255,213,0.86)" />
    </svg>
  `;
}

export function drawSkillLinks(skillStates) {
  const svg = byId("skill-links");
  const tree = byId("skill-tree");
  const treeRect = tree.getBoundingClientRect();
  svg.innerHTML = "";

  skillStates.forEach((skill) => {
    const child = tree.querySelector(`[data-skill-id="${skill.id}"]`);
    if (!child) {
      return;
    }

    skill.dependencies.forEach((dependencyId) => {
      const parent = tree.querySelector(`[data-skill-id="${dependencyId}"]`);
      if (!parent) {
        return;
      }

      const parentRect = parent.getBoundingClientRect();
      const childRect = child.getBoundingClientRect();
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", parentRect.left - treeRect.left + (parentRect.width / 2));
      line.setAttribute("y1", parentRect.top - treeRect.top + parentRect.height);
      line.setAttribute("x2", childRect.left - treeRect.left + (childRect.width / 2));
      line.setAttribute("y2", childRect.top - treeRect.top);
      line.setAttribute("stroke", "rgba(109,255,213,0.22)");
      line.setAttribute("stroke-width", "1.5");
      svg.append(line);
    });
  });
}

export function renderGitHubTelemetry(payload) {
  const summary = byId("repo-summary");
  const list = byId("commit-list");

  summary.textContent = `${payload.repository.stargazers_count}★ // ${payload.repository.forks_count} forks`;
  list.innerHTML = payload.commits.map((commit) => `
    <article class="commit-item">
      <a href="${commit.url}" target="_blank" rel="noopener noreferrer">${commit.message}</a>
      <small>${formatDateTime(commit.date)} // ${commit.author}</small>
    </article>
  `).join("");
}

export function renderGitHubError() {
  byId("repo-summary").textContent = "uplink degraded";
  byId("commit-list").innerHTML = `
    <article class="commit-item">
      <strong>GitHub telemetry unavailable.</strong>
      <small>The dashboard remains fully functional offline.</small>
    </article>
  `;
}

export function renderProjectProgress(projects) {
  const root = byId("project-list");
  root.innerHTML = projects.map((project) => `
    <article class="project-item">
      <header>
        <strong>${escapeHtml(project.name)}</strong>
        <span>${escapeHtml(project.status)}</span>
      </header>
      <p>${escapeHtml(project.focus)}</p>
      <div class="project-progress"><span style="width:${project.progress}%"></span></div>
      <footer>
        <span>${project.progress}% complete</span>
        <span>tracked in JSON</span>
      </footer>
    </article>
  `).join("");
}

export function markClaimedArticles(state) {
  document.querySelectorAll("[data-claim-article]").forEach((button) => {
    const claimed = state.claimedArticles.includes(button.dataset.claimArticle)
      || state.history.some((entry) => (
        entry.sourceType === "article" && entry.sourceId === button.dataset.claimArticle
      ));
    button.disabled = claimed;
    button.textContent = claimed ? "Claimed" : "Claim XP";
  });
}

export function showToast(title, message) {
  const root = byId("toast-stack");
  const toast = document.createElement("article");
  toast.className = "toast";
  toast.innerHTML = `
    <strong>${title}</strong>
    <span>${message}</span>
  `;
  root.append(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 3800);
}

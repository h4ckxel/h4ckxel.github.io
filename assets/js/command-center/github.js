export async function loadGitHubTelemetry({ owner, repo }) {
  const [commitsResponse, repoResponse] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`),
    fetch(`https://api.github.com/repos/${owner}/${repo}`)
  ]);

  if (!commitsResponse.ok || !repoResponse.ok) {
    throw new Error("GitHub telemetry unavailable");
  }

  const [commits, repository] = await Promise.all([
    commitsResponse.json(),
    repoResponse.json()
  ]);

  return {
    repository,
    commits: commits.map((commit) => ({
      sha: commit.sha,
      url: commit.html_url,
      message: commit.commit.message,
      author: commit.commit.author.name,
      date: commit.commit.author.date
    }))
  };
}

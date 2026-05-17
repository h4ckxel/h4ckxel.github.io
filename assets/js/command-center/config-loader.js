export async function loadConfig(paths) {
  const entries = await Promise.all(
    Object.entries(paths).map(async ([key, path]) => {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Unable to load ${key} config from ${path}`);
      }
      return [key, await response.json()];
    })
  );

  return Object.fromEntries(entries);
}

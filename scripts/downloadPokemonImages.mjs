// Downloads every Pokemon image referenced by the app into public/pokemon so the
// SSG output serves them same-origin (no runtime CDN fetch). Three sets are pulled:
//   - pixel : low-res sprite, used everywhere      -> public/pokemon/pixel/{id}.png
//   - basic : HD "detail" art, used on the list     -> public/pokemon/basic/{paddedId}.png
//   - full  : HD "full" art, used on the details    -> public/pokemon/full/{paddedId}.png
//
// The URLs/padding here MUST stay in sync with createImageUrl() in
// utils/pokemonFormatter/pokemonFormatter.ts and the constants in
// constants/FetchPokemons.ts.
//
// Idempotent: already-downloaded files are skipped, so prebuild/predev hooks are
// cheap after the first full run. Usage: `node scripts/downloadPokemonImages.mjs [maxId]`.

import { mkdir, writeFile, access } from "node:fs/promises";
import { join } from "node:path";

const MAX_POKEMON_ID_ALLOWED = 1025;
const CONCURRENCY = 16;

const maxId = Number(process.argv[2]) || MAX_POKEMON_ID_ALLOWED;
const OUT_DIR = join(process.cwd(), "public", "pokemon");

const pad = (id) => String(id).padStart(3, "0");

const SOURCES = [
  {
    dir: "pixel",
    url: (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    file: (id) => `${id}.png`,
  },
  {
    dir: "basic",
    url: (id) => `https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${pad(id)}.png`,
    file: (id) => `${pad(id)}.png`,
  },
  {
    dir: "full",
    url: (id) => `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pad(id)}.png`,
    file: (id) => `${pad(id)}.png`,
  },
];

const exists = (path) =>
  access(path)
    .then(() => true)
    .catch(() => false);

// Build the full work list (one entry per file we need on disk).
const buildTasks = () => {
  const tasks = [];
  for (let id = 1; id <= maxId; id++) {
    for (const source of SOURCES) {
      tasks.push({
        url: source.url(id),
        path: join(OUT_DIR, source.dir, source.file(id)),
        label: `${source.dir}/${source.file(id)}`,
      });
    }
  }
  return tasks;
};

const downloadOne = async (task, stats) => {
  if (await exists(task.path)) {
    stats.skipped++;
    return;
  }

  try {
    const response = await fetch(task.url);
    if (!response.ok) {
      stats.missing++;
      stats.missingLabels.push(task.label);
      return;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(task.path, buffer);
    stats.downloaded++;
  } catch (error) {
    stats.failed++;
    stats.failedLabels.push(`${task.label} (${error.message})`);
  }
};

// Simple fixed-size worker pool over the task list.
const runPool = async (tasks, stats) => {
  let cursor = 0;
  const worker = async () => {
    while (cursor < tasks.length) {
      const index = cursor++;
      await downloadOne(tasks[index], stats);
      const done = stats.skipped + stats.downloaded + stats.missing + stats.failed;
      if (done % 250 === 0) {
        process.stdout.write(`  ...${done}/${tasks.length}\n`);
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
};

const main = async () => {
  await Promise.all(SOURCES.map((source) => mkdir(join(OUT_DIR, source.dir), { recursive: true })));

  const tasks = buildTasks();
  const stats = { downloaded: 0, skipped: 0, missing: 0, failed: 0, missingLabels: [], failedLabels: [] };

  console.log(`Downloading Pokemon images (ids 1-${maxId}, ${tasks.length} files) into public/pokemon ...`);
  await runPool(tasks, stats);

  console.log(
    `Done. downloaded=${stats.downloaded} skipped=${stats.skipped} missing=${stats.missing} failed=${stats.failed}`
  );
  if (stats.missing) {
    console.warn(`Missing (HTTP not-ok, likely no art for that form): ${stats.missingLabels.slice(0, 20).join(", ")}${stats.missingLabels.length > 20 ? " ..." : ""}`);
  }
  if (stats.failed) {
    // Network/IO errors are worth failing the build over, since they leave gaps.
    console.error(`Failed downloads: ${stats.failedLabels.slice(0, 20).join(", ")}`);
    process.exit(1);
  }
};

main();

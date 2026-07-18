import { describe, it, expect } from "vitest";
import {
  createSnapshotStore,
  createRequest,
  resolveSpeciesCount,
  resolveMode,
  slimForSnapshot,
} from "./request";
import { POKE_API_URL } from "../../constants/FetchPokemons";

const okResponse = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body } as unknown as Response);

describe("createSnapshotStore", () => {
  it("records a URL response and replays it", () => {
    const store = createSnapshotStore();
    store.record("https://pokeapi.co/api/v2/pokemon/1", { id: 1, name: "bulbasaur" });

    expect(store.replay("https://pokeapi.co/api/v2/pokemon/1")).toEqual({
      id: 1,
      name: "bulbasaur",
    });
  });

  it("throws a helpful error when replaying an unrecorded URL", () => {
    const store = createSnapshotStore();

    expect(() => store.replay("https://pokeapi.co/api/v2/pokemon/9999")).toThrow(
      /no snapshot entry.*pokemon\/9999/i
    );
  });

  it("seeds from an initial snapshot so a promoted snapshot replays", () => {
    const store = createSnapshotStore({
      "https://pokeapi.co/api/v2/pokemon-species?limit=1": { count: 1025 },
    });

    expect(store.replay("https://pokeapi.co/api/v2/pokemon-species?limit=1")).toEqual({
      count: 1025,
    });
  });

  it("serializes identically regardless of record order (stable content hash)", () => {
    const a = createSnapshotStore();
    a.record("https://pokeapi.co/api/v2/pokemon/2", { id: 2 });
    a.record("https://pokeapi.co/api/v2/pokemon/1", { id: 1 });

    const b = createSnapshotStore();
    b.record("https://pokeapi.co/api/v2/pokemon/1", { id: 1 });
    b.record("https://pokeapi.co/api/v2/pokemon/2", { id: 2 });

    // Concurrency means URLs are recorded in nondeterministic completion order;
    // serialize() must be canonical so an unchanged dataset hashes the same.
    expect(a.serialize()).toBe(b.serialize());
  });
});

describe("createRequest", () => {
  it("replay mode returns the snapshot value without touching the network", async () => {
    const store = createSnapshotStore({ "u://species": { count: 1025 } });
    let fetchCalls = 0;
    const request = createRequest({
      mode: "replay",
      store,
      fetchImpl: (async () => {
        fetchCalls++;
        return okResponse({});
      }) as unknown as typeof fetch,
    });

    expect(await request("u://species")).toEqual({ count: 1025 });
    expect(fetchCalls).toBe(0);
  });

  it("record mode fetches live and captures the response into the store", async () => {
    const store = createSnapshotStore();
    const request = createRequest({
      mode: "record",
      store,
      fetchImpl: (async (url: string) =>
        okResponse({ url, id: 7 })) as unknown as typeof fetch,
    });

    const result = await request("u://pokemon/7");

    expect(result).toEqual({ url: "u://pokemon/7", id: 7 });
    expect(store.replay("u://pokemon/7")).toEqual({ url: "u://pokemon/7", id: 7 });
  });

  it("record mode applies the transform before storing and returns the slimmed value", async () => {
    const store = createSnapshotStore();
    const request = createRequest({
      mode: "record",
      store,
      fetchImpl: (async () =>
        okResponse({ id: 1, stats: [{}], moves: [1, 2, 3] })) as unknown as typeof fetch,
      transform: (_url: string, json: any) => {
        const { moves, ...rest } = json;
        return rest;
      },
    });

    const result = await request("u://pokemon/1");

    expect(result).toEqual({ id: 1, stats: [{}] });
    expect(store.replay("u://pokemon/1")).toEqual({ id: 1, stats: [{}] });
  });

  it("record mode fetches each URL only once (dedups the overlapping crawls)", async () => {
    const store = createSnapshotStore();
    let fetchCalls = 0;
    const request = createRequest({
      mode: "record",
      store,
      fetchImpl: (async (url: string) => {
        fetchCalls++;
        return okResponse({ url });
      }) as unknown as typeof fetch,
    });

    await request("u://pokemon/1");
    await request("u://pokemon/1");
    await request("u://pokemon/1");

    expect(fetchCalls).toBe(1);
    expect(store.replay("u://pokemon/1")).toEqual({ url: "u://pokemon/1" });
  });

  it("retries transient failures then succeeds", async () => {
    let attempts = 0;
    const request = createRequest({
      mode: "live",
      retries: 5,
      backoffMs: () => 0,
      fetchImpl: (async () => {
        attempts++;
        if (attempts < 3) throw new Error("ECONNREFUSED");
        return okResponse({ ok: true });
      }) as unknown as typeof fetch,
    });

    expect(await request("u://flaky")).toEqual({ ok: true });
    expect(attempts).toBe(3);
  });

  it("throws after exhausting retries", async () => {
    const request = createRequest({
      mode: "live",
      retries: 3,
      backoffMs: () => 0,
      fetchImpl: (async () =>
        ({ ok: false, status: 500 } as unknown as Response)) as unknown as typeof fetch,
    });

    await expect(request("u://broken")).rejects.toThrow(/500/);
  });
});

describe("resolveSpeciesCount", () => {
  it("reads the live national-dex size from the species count endpoint", async () => {
    const seen: string[] = [];
    const request = async (url: string) => {
      seen.push(url);
      return { count: 1030, results: [{ name: "bulbasaur" }] };
    };

    const count = await resolveSpeciesCount(request);

    expect(count).toBe(1030);
    // Must hit pokemon-species (distinct pokemon), NOT /pokemon (which counts forms).
    expect(seen).toEqual([`${POKE_API_URL}pokemon-species?limit=1`]);
  });
});

describe("slimForSnapshot", () => {
  it("drops unused heavy fields from /pokemon/ detail responses", () => {
    const out = slimForSnapshot("https://pokeapi.co/api/v2/pokemon/1", {
      id: 1,
      name: "bulbasaur",
      stats: [{ base_stat: 45 }],
      types: [{ type: { name: "grass" } }],
      moves: new Array(200).fill({ move: {} }),
      game_indices: [{ game_index: 1 }],
    });

    expect(out).toEqual({
      id: 1,
      name: "bulbasaur",
      stats: [{ base_stat: 45 }],
      types: [{ type: { name: "grass" } }],
    });
  });

  it("leaves species responses untouched (only /pokemon/ is slimmed)", () => {
    const species = { id: 1, flavor_text_entries: [{ flavor_text: "x" }] };
    expect(
      slimForSnapshot("https://pokeapi.co/api/v2/pokemon-species/1", species)
    ).toEqual(species);
  });

  it("does not mutate its input", () => {
    const input = { id: 1, moves: [1, 2] };
    slimForSnapshot("https://pokeapi.co/api/v2/pokemon/1", input);
    expect(input.moves).toEqual([1, 2]);
  });
});

describe("resolveMode", () => {
  it("defaults to live when POKEDEX_SNAPSHOT is unset (dev)", () => {
    expect(resolveMode({})).toBe("live");
  });

  it("selects record and replay from POKEDEX_SNAPSHOT", () => {
    expect(resolveMode({ POKEDEX_SNAPSHOT: "record" })).toBe("record");
    expect(resolveMode({ POKEDEX_SNAPSHOT: "replay" })).toBe("replay");
  });

  it("treats an unknown value as live rather than guessing", () => {
    expect(resolveMode({ POKEDEX_SNAPSHOT: "wat" })).toBe("live");
  });
});

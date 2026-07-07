import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cleanWikitext,
  extractDesc,
  collectFlavorStubs,
} from "./fillFrFromPokepedia.mjs";
import { STUB_PREFIX } from "./scaffoldFrStubs.mjs";

test("cleanWikitext strips links, templates, bold and tags", () => {
  assert.equal(cleanWikitext("[[Pikachu|cette souris]]"), "cette souris");
  assert.equal(cleanWikitext("[[Kanto]]"), "Kanto");
  assert.equal(cleanWikitext("garde {{Jeu|RB}} sa"), "garde sa");
  assert.equal(cleanWikitext("'''très''' fort"), "très fort");
  assert.equal(cleanWikitext("un<ref>note</ref> mot"), "un mot");
  assert.equal(cleanWikitext("ligne un<br>ligne deux"), "ligne un ligne deux");
  assert.equal(cleanWikitext("gras<b>x</b>"), "grasx");
  assert.equal(cleanWikitext("a&nbsp;b &amp; c"), "a b & c");
});

const DESC_PLAIN = `
== Autre ==
blah
== Descriptions du Pokédex ==
;{{Jeu|EC}}
:Ce Pokémon [[électrique|électrise]] tout ce qu'il touche avec ferveur.
;{{Jeu|SL}}
:Une autre description ici présente pour tester.
== Section suivante ==
autre chose
`;

const DESC_LINKED = `
== Descriptions du [[Pokédex]] ==
;{{Jeu|EC}}
:Il paralyse ses ennemis avec des '''décharges''' d'une puissance redoutable.
== Talents ==
`;

test("extractDesc returns first description (plain 'Descriptions du Pokédex')", () => {
  assert.equal(
    extractDesc(DESC_PLAIN),
    "Ce Pokémon électrise tout ce qu'il touche avec ferveur.",
  );
});

test("extractDesc returns first description (linked 'Descriptions du [[Pokédex]]')", () => {
  assert.equal(
    extractDesc(DESC_LINKED),
    "Il paralyse ses ennemis avec des décharges d'une puissance redoutable.",
  );
});

test("extractDesc returns null when the section is absent", () => {
  assert.equal(extractDesc("== Talents ==\n;{{Jeu|EC}}\n:rien ici du tout"), null);
});

test("extractDesc returns null when description is too short", () => {
  assert.equal(
    extractDesc("== Descriptions du Pokédex ==\n;{{Jeu|EC}}\n:Court."),
    null,
  );
});

test("collectFlavorStubs finds only __STUB__ flavorText values with stripped englishRef", () => {
  const overrides = {
    names: { "1": { name: "not a stub" } },
    flavorText: {
      "899": { text: `${STUB_PREFIX}A wild entry appears.` },
      "900": { text: "Déjà traduit, pas un stub." },
      "901": { text: `${STUB_PREFIX}Another English reference.` },
    },
    abilities: { foo: { name: `${STUB_PREFIX}Should be ignored` } },
  };
  assert.deepEqual(collectFlavorStubs(overrides), [
    { id: "899", englishRef: "A wild entry appears." },
    { id: "901", englishRef: "Another English reference." },
  ]);
});

test("collectFlavorStubs returns [] when there is no flavorText section", () => {
  assert.deepEqual(collectFlavorStubs({ names: {} }), []);
});

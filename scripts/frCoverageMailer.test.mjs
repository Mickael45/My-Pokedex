import { test } from "node:test";
import assert from "node:assert/strict";
import { mailConfigFromEnv, composeCoverageMail } from "./frCoverageMailer.mjs";

test("mailConfigFromEnv returns config when all three vars are present", () => {
  const env = {
    FR_COVERAGE_MAIL_TO: "owner@example.com",
    FR_COVERAGE_MAIL_FROM: "sender@gmail.com",
    FR_COVERAGE_MAIL_TOKEN: "app-password",
  };
  assert.deepEqual(mailConfigFromEnv(env), {
    to: "owner@example.com",
    from: "sender@gmail.com",
    token: "app-password",
  });
});

test("mailConfigFromEnv returns null when any var is missing", () => {
  assert.equal(mailConfigFromEnv({}), null);
  assert.equal(
    mailConfigFromEnv({
      FR_COVERAGE_MAIL_FROM: "sender@gmail.com",
      FR_COVERAGE_MAIL_TOKEN: "app-password",
    }),
    null
  );
  assert.equal(
    mailConfigFromEnv({
      FR_COVERAGE_MAIL_TO: "owner@example.com",
      FR_COVERAGE_MAIL_TOKEN: "app-password",
    }),
    null
  );
  assert.equal(
    mailConfigFromEnv({
      FR_COVERAGE_MAIL_TO: "owner@example.com",
      FR_COVERAGE_MAIL_FROM: "sender@gmail.com",
    }),
    null
  );
});

test("mailConfigFromEnv returns null when any var is empty", () => {
  assert.equal(
    mailConfigFromEnv({
      FR_COVERAGE_MAIL_TO: "",
      FR_COVERAGE_MAIL_FROM: "sender@gmail.com",
      FR_COVERAGE_MAIL_TOKEN: "app-password",
    }),
    null
  );
});

test("composeCoverageMail sets subject with the gap count and from/to", () => {
  const gaps = [
    { entityType: "flavorText", id: "899", field: "text", englishRef: "A wild entry." },
    { entityType: "abilities", id: "mycelium-might", field: "name", englishRef: "Mycelium Might" },
  ];
  const mail = composeCoverageMail(gaps, { from: "sender@gmail.com", to: "owner@example.com" });
  assert.equal(mail.from, "sender@gmail.com");
  assert.equal(mail.to, "owner@example.com");
  assert.match(mail.subject, /2/);
  assert.match(mail.subject, /French/);
});

test("composeCoverageMail groups gaps by entityType with EN references", () => {
  const gaps = [
    { entityType: "flavorText", id: "899", field: "text", englishRef: "A wild entry." },
    { entityType: "flavorText", id: "900", field: "text", englishRef: "Another entry." },
    { entityType: "abilities", id: "mycelium-might", field: "name", englishRef: "Mycelium Might" },
  ];
  const mail = composeCoverageMail(gaps, { from: "sender@gmail.com", to: "owner@example.com" });
  assert.match(mail.text, /flavorText \(2\):/);
  assert.match(mail.text, /abilities \(1\):/);
  assert.match(mail.text, /899\.text {2}← EN: A wild entry\./);
  assert.match(mail.text, /mycelium-might\.name {2}← EN: Mycelium Might/);
  assert.match(mail.text, /locales\/fr-overrides\.json/);
});

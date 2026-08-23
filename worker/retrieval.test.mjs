import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildEvidenceIndex, evidenceContext, retrieveEvidence } from "./retrieval.js";

const knowledge = await readFile(new URL("../llms.txt", import.meta.url), "utf8");
const workerSource = await readFile(new URL("./portfolio-chat.js", import.meta.url), "utf8");

test("pins the bundled knowledge digest", () => {
  const expected = workerSource.match(/KNOWLEDGE_DIGEST = "sha256:([a-f0-9]{64})"/)?.[1];
  const actual = createHash("sha256").update(knowledge).digest("hex");
  assert.equal(expected, actual);
});

test("builds named evidence chunks with public sources", () => {
  const chunks = buildEvidenceIndex(knowledge);
  assert.ok(chunks.length >= 10);
  assert.ok(chunks.every((chunk) => chunk.id && chunk.content && chunk.sources.length));
});

const cases = [
  ["What did Haoming do at Micron?", "career-history"],
  ["Tell me about Job Hunter SG", "selected-live-products-job-hunter-sg"],
  ["How does Trader Koo keep its paper trading auditable?", "selected-live-products-trader-koo"],
  ["Where did Haoming study?", "education"],
  ["How does this portfolio guide work?", "portfolio-guide"],
  ["How can I contact Haoming?", "contact"],
  ["What is Haoming's current role?", "professional-positioning"],
  ["Does Haoming still work at AI Singapore?", "career-history"],
  ["where is Haoming working at now", "professional-positioning"],
];

for (const [question, expected] of cases) {
  test(`retrieves ${expected} for ${question}`, () => {
    const results = retrieveEvidence(question, knowledge);
    assert.ok(results.some(({ id }) => id === expected), results.map(({ id }) => id).join(", "));
  });
}

test("returns no evidence for an unsupported personal question", () => {
  assert.deepEqual(retrieveEvidence("What is Haoming's favorite dinosaur?", knowledge), []);
});

test("renders bounded evidence blocks", () => {
  const context = evidenceContext(retrieveEvidence("Tell me about Job Hunter SG", knowledge), 3000);
  assert.match(context, /\[EVIDENCE/);
  assert.ok(context.length <= 3000);
});

test("keeps product citations attached to the matching product", () => {
  const [result] = retrieveEvidence("What does Japan in Seasons expose to AI assistants?", knowledge);
  assert.equal(result.id, "selected-live-products-japan-in-seasons");
  assert.equal(result.sources[0], "https://seasons.kooexperience.com");
  assert.ok(!result.sources.includes("https://job.kooexperience.com"));
});

test("drops weak lexical matches from focused questions", () => {
  const results = retrieveEvidence("Where did Haoming study?", knowledge);
  assert.deepEqual(results.map(({ id }) => id), ["education"]);
});

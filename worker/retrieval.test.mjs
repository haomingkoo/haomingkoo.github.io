import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildEvidenceIndex, evidenceContext, retrieveEvidence } from "./retrieval.js";

const knowledge = await readFile(new URL("../llms.txt", import.meta.url), "utf8");

test("builds named evidence chunks with public sources", () => {
  const chunks = buildEvidenceIndex(knowledge);
  assert.ok(chunks.length >= 10);
  assert.ok(chunks.every((chunk) => chunk.id && chunk.content && chunk.sources.length));
});

const cases = [
  ["What did Haoming do at Micron?", "career-history"],
  ["Tell me about Job Hunter SG", "selected-live-products-job-hunter-sg"],
  ["Where did Haoming study?", "education"],
  ["How does this portfolio guide work?", "portfolio-guide"],
  ["How can I contact Haoming?", "contact"],
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

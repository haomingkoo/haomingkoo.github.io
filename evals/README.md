# Portfolio guide evaluations

The guide has two separate quality gates:

- `npm test` checks retrieval and corpus-version invariants without calling a model.
- `npm run eval` sends the Promptfoo suite to the deployed Worker and checks answer grounding, refusal boundaries, source URLs, and latency.

Production results are private. Save them under `.private/evals/` with the deployed
Worker version, Git SHA, knowledge digest, prompt version, model ID, timestamp,
and per-case result. Never store questions, answers, visitor history, secrets, or
IP addresses in public logs.

Run the deterministic checks before deployment, deploy the Worker, then run the
production suite against that exact release.

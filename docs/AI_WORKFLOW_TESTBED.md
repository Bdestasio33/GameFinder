# AI Workflow Testbed

GameFinder is designed to evaluate AI coding tool claims against a realistic codebase.

## Why this repo is useful

| Dimension | What it exercises |
|-----------|-------------------|
| Domain modeling | Video game metadata, enums, taxonomy, suggestions |
| RBAC | Guest through admin with shared permission helpers |
| Moderation workflow | Pending → approved/rejected suggestion queues |
| Multi-client | Web admin surface + mobile read-only client |
| Shared packages | Types, validation, and permissions reused across apps |
| Seed data | Deterministic reset for reproducible comparisons |
| Tests | Permission unit tests + API integration coverage |

The goal is not to crown a single AI tool winner. It is to learn which workflow fits which kind of problem.

## Evaluation criteria

- Setup success
- Time to usable output
- Correctness
- Test coverage
- Bugs introduced
- Human intervention required
- Context sensitivity
- Maintainability
- Cost

See [EXPERIMENT_TEMPLATE.md](./EXPERIMENT_TEMPLATE.md) for logging experiments.

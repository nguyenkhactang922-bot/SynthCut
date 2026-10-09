# CHATCODE GLOBAL MULTI-PROJECT EXECUTION LAW

Version: 1.0
Date: 2026-09-14
Scope: Global operating law for ChatGPT Web + ChatCode/Chatcode12 across repositories.

## 1. Roles

### ChatGPT Web = MAIN CODING AGENT

ChatGPT Web is responsible for:
- reading and understanding the repository and project state
- architecture/design decisions
- deciding what must change and why
- writing/fixing/reviewing code through ChatCode
- requesting real tests/builds/smokes/runtime checks
- evaluating evidence
- updating project state
- driving Git/PR/review/merge when available
- automatically selecting the next dependency-satisfied task.

### ChatCode / Chatcode12 = LOCAL EXECUTION BRIDGE

ChatCode is responsible for executing authorized local operations such as:
- read/write project files
- run commands, tests, builds and smoke tests
- inspect runtime state
- run Git operations
- return real evidence to ChatGPT Web.

ChatCode output is evidence, not a substitute for architectural judgment or review.

## 2. Mandatory bootstrap order

At the beginning of work in any repository:

1. confirm workspace path / project identity
2. inspect Git root, branch, HEAD and status
3. read this global law
4. read repository `AGENTS.md`
5. read frozen design/ADR/spec documents referenced by `AGENTS.md`
6. read `CURRENT_HANDOFF.md`
7. read `PROJECT_STATE.md`
8. read `tasks/TASK_QUEUE.md`
9. resume `NEXT_EXACT_ACTION`
10. never restart an already completed task from scratch unless evidence requires reopening it.

Repository-specific rules may add constraints but must not silently weaken this global law.

## 3. Execution lifecycle

Normal lifecycle:

`CLAIM â†’ ANALYZE â†’ PLAN â†’ CODE â†’ TEST/BUILD â†’ EVIDENCE â†’ VERIFY â†’ REVIEW â†’ COMMIT â†’ UPDATE STATE â†’ NEXT TASK`

Short form:

`CLAIM â†’ CODE â†’ TEST â†’ VERIFY â†’ COMMIT â†’ NEXT`

A task is not DONE merely because code was written.

## 4. Continuous task rule

After a task passes acceptance:
- update evidence/state/handoff/queue
- select the next dependency-satisfied task automatically
- continue without asking for routine confirmation.

Stop only when:
- the requested scope is complete
- a real blocker requires information/authority that cannot be derived or safely executed
- a safety rule forbids the next action.

Do not stop after analysis if an authorized implementation/test step is available.

## 5. Design-first rule for complex work

For reverse engineering, cloning, migrations, major architecture changes or market-readiness work:

`DISCOVER â†’ INDEPENDENT REVIEW â†’ NORMALIZE â†’ FREEZE DESIGN â†’ DEPENDENCY GRAPH â†’ TASK QUEUE â†’ IMPLEMENT`

Do not begin ad-hoc feature coding before the design/contract is frozen when the project requires a reconstruction plan.

A frozen design may be changed only when contradictory evidence is recorded first.

## 6. Source-of-truth rule

Prefer evidence in this order:

1. live observable behavior
2. original/shipped artifacts
3. source/deployed bundles/runtime logs
4. current implementation
5. generated manifests/tests
6. historical notes/audits as hints only.

Historical reports are snapshots. Re-check current source before treating an old gap report as current truth.

## 7. 100% / parity claim law

Never claim 100%, full parity, production-ready or market-ready solely from:
- same file count
- same route count
- same function/component/channel names
- UI similarity
- source resemblance
- compile success
- build success alone.

A full parity claim requires applicable static contract evidence **and runtime evidence**.

Parity dimensions include:
- reachability
- inputs/defaults/validation
- outputs
- DB/file/network/provider side effects
- persistence/restart
- error/retry/cancel behavior
- queue/concurrency/timing where observable
- IPC/API contracts
- packaged desktop behavior
- external-service compatibility.

## 8. Difference classification law

Before fixing a mismatch, classify it as one of:

- `LEGACY_GAP` â€” working legacy behavior missing/changed in new app
- `LEGACY_DEAD_SURFACE` â€” legacy declaration/code exists but is unreachable/dead
- `LEGACY_BROKEN_BUT_REACHABLE` â€” legacy UI exposes behavior that is itself broken
- `PARITY_PLUS_COMPATIBILITY` â€” external service changed, requiring an adapter to preserve user behavior
- `PARITY_PLUS_BUGFIX` â€” intentional fix beyond exact legacy behavior
- `EXTRA_NEW` â€” new-only feature; must not inflate legacy-parity percentage.

Never blindly implement a dead legacy symbol just because it exists in preload/routes/source.

## 9. Evidence law

Every completed task must leave sufficient evidence, where applicable:
- changed file paths/ranges or diff
- generated manifest/report
- test results
- build results
- smoke/runtime results
- persisted-data/restart result
- package result
- independent/self review result
- updated task/state/handoff.

Never promote `STATIC_PASS` to `RUNTIME_PASS` without execution evidence.

If a command/write/action is blocked, record the blocker explicitly and do not claim it ran.

## 10. State files

Every managed repository should maintain:
- `AGENTS.md`
- `CURRENT_HANDOFF.md`
- `PROJECT_STATE.md`
- `tasks/TASK_QUEUE.md`

For substantial design work, also maintain appropriate files under:
- `docs/design/`
- `docs/adr/`
- `research/` or `tasks/evidence/` when evidence artifacts are needed.

`CURRENT_HANDOFF.md` must tell the next agent exactly what was completed and what the next action is.

`PROJECT_STATE.md` must reflect real current readiness, not aspiration.

`tasks/TASK_QUEUE.md` is the executable dependency-aware work plan.

## 11. Dependency law

Do not skip prerequisite tasks merely because a later task looks easy.

A task may execute only when:
- dependencies are satisfied
- required evidence/fixtures exist
- it does not violate a frozen architecture decision.

Independent lanes may run in parallel only when their file/runtime scopes do not create unsafe overlap. All lanes must converge through shared verification/evidence before final release.

## 12. Legacy/oracle safety law

For reverse-engineering/clone projects:
- treat the original packaged app/source oracle as read-only unless explicitly authorized otherwise
- never mutate original user data for testing
- copy fixtures/userData/DBs before migrations or destructive experiments
- prefer additive migration and backups
- refuse destructive overwrite when data occupancy is uncertain.

## 13. External-service compatibility law

When a third-party service changes domains, routes, auth/cookies, API behavior or UI:
- do not apply a global string replacement without contract evidence
- separate browser/navigation host, cookie/session domain, API origin, referer/origin, and provider behavior
- introduce a compatibility adapter when necessary
- prove each compatibility dimension with runtime evidence.

## 14. Testing/release law

Use the narrowest useful checks during implementation, then expand to risk-based verification.

Final release/readiness gate should include applicable:
- lint/typecheck
- unit/integration tests
- server smoke
- runtime/E2E critical workflows
- error/retry/cancel paths
- persistence/restart/data migration
- package/build
- packaged Electron/desktop smoke
- required assets/binaries/resources
- final gap registry closure.

A market-ready/clone-complete verdict requires all blocking P0/P1 tasks closed or explicitly waived by the project rules.

## 15. Git discipline

Where Git is available:
- inspect status before mutation
- keep task-scoped changes reviewable
- review diff before commit
- prefer one clean commit per accepted task/lane
- do not mix unrelated work
- do not claim merge/main verification unless it actually occurred.

## 16. No false execution claims

Never say a file was written, command ran, test passed, build succeeded, commit was created, PR merged or runtime verified unless tool evidence confirms it.

If only analysis was possible, say analysis only.

## 17. Repository-specific law

`AGENTS.md` contains repository-specific rules only.

The repository may define additional design, security, compatibility, acceptance and release constraints. Those rules are mandatory in addition to this global law.

## 18. Completion definition

A project/task is complete only when its acceptance criteria are met and evidence/state files are updated.

When a task is complete:

`VERIFY â†’ REVIEW â†’ COMMIT (if applicable) â†’ UPDATE STATE â†’ ADVANCE QUEUE â†’ NEXT TASK`

Do not leave `NEXT_EXACT_ACTION` pointing at a task already marked DONE.

## 19. Canonical 8-phase product delivery lifecycle

For complex product/project work, the mandatory lifecycle is:

1. `DISCOVER`: Raw Idea -> Problem Discovery -> Discovery Research -> I/O Hypotheses.
2. `DEFINE`: Brief -> Scope -> Constraints -> Acceptance Criteria.
3. `RESEARCH`: Solution Research -> Repo/Tool/Framework Search -> License/Security Audit -> Candidate Comparison.
4. `DESIGN`: ADR -> System Design -> Independent Audit -> Spike/POC -> Freeze.
5. `PLAN IMPLEMENTATION`: Dependency Graph -> Task Decomposition -> Traceability -> Task Queue.
6. `BUILD & VERIFY`: Claim -> Code -> Test -> Evidence -> Verify -> Commit -> PR -> Review -> Merge -> MAIN VERIFIED.
7. `RELEASE & OPERATE`: Package -> Release -> Deploy -> Monitor -> Incident Handling.
8. `LEARN`: Final Traceability Audit -> Feedback -> New Requirement/Bug/Improvement -> return to DISCOVER/DEFINE.

No later phase is authorized until every prerequisite sub-gate is explicitly evidenced. If an earlier gap is discovered after later work exists, retain the later work as historical evidence but roll authorization back to the earliest incomplete phase. Do not rerun valid evidence solely because the lifecycle was normalized; rerun only when scope, requirements, code, environment, or contradictory evidence makes it stale.

Spike/POC code belongs to DESIGN and is disposable evidence. It is not production implementation and may never be silently promoted. Production code requires DESIGN/FREEZE plus PLAN IMPLEMENTATION PASS.
## 20. Canonical Stage Execution Contract

Every named phase **and every named substage** in the canonical lifecycle must resolve the following ten fields before that substage may be marked PASS/DONE:

1. `Input` — exact information/artifacts/state consumed.
2. `Entry Gate` — prerequisites that must already be true.
3. `Work` — bounded actions/analysis performed in this substage.
4. `Output` — concrete result handed to the next substage.
5. `Exit Gate` — measurable conditions required to leave this substage.
6. `Artifact` — durable file/object/state record produced or updated.
7. `Evidence` — source/runtime/test/research proof supporting the result.
8. `Owner/Authority` — who may decide, approve, execute, or override the result.
9. `Risks/Open Questions` — unresolved uncertainty, assumptions, blockers, or accepted risk.
10. `Loopback` — exact earlier substage/phase to reopen if the exit gate fails or contradictory evidence appears.

A phase label such as `DONE`, `PASS`, `FROZEN`, or `MAIN VERIFIED` is invalid if any required substage lacks this execution contract or its required evidence. When governance normalization discovers a missing contract field, authorization rolls back to the earliest affected phase/substage, but previously valid substantive evidence is retained and must not be blindly rerun.

Project lifecycle documents may express the ten fields as sections, tables, or linked records, but all ten meanings must be explicit and traceable. Production implementation remains prohibited until DESIGN is FROZEN and every PLAN IMPLEMENTATION substage satisfies this contract.

<!-- CANONICAL_RESUME_CONTAINMENT:BEGIN -->
# CANONICAL RESUME, STATE RECOVERY & STRICT PROJECT CONTAINMENT LAW

This canonical section is additive. It does not delete, shorten, or weaken any earlier global or repository-specific rule. If an older rule is more restrictive, the more restrictive rule still applies.

## PART 1 â€” SOURCE OF TRUTH & CANONICAL RESUME

### Execution source of truth

For resuming execution, use this priority order:

1. canonical `PROJECT_ROOT`
2. Git repository state
3. `CURRENT_HANDOFF.md`
4. `PROJECT_STATE.md`
5. `tasks/TASK_QUEUE.md`
6. active process/PID
7. latest logs
8. artifacts / exit codes
9. conversation context

Conversation history is supplemental context only. It is not the execution source of truth.

Never restart work merely because:
- chat context was truncated;
- the browser refreshed;
- `Resume stream unavailable` occurred;
- the current model no longer has the complete chat history.

### Canonical resume triggers

The following are equivalent resume triggers:
- `Tiáº¿p tá»¥c dá»± Ã¡n`
- `Tiáº¿p tá»¥c dá»± Ã¡n theo luáº­t tá»•ng`
- `Tiáº¿p tá»¥c theo luáº­t tá»•ng`
- `Ok tiáº¿p tá»¥c`
- `Continue project`

On a resume trigger, do not ask for the project/task again when repository truth can determine it.

Run resume preflight first:
- verify canonical `PROJECT_ROOT`;
- verify `git rev-parse --show-toplevel`;
- current branch;
- HEAD;
- `git status`;
- read `AGENTS.md`;
- read this global law;
- read `CURRENT_HANDOFF.md`;
- read `PROJECT_STATE.md`;
- read `tasks/TASK_QUEUE.md`;
- inspect active process/PID;
- inspect latest log;
- inspect relevant artifacts;
- inspect exit code when available.

Then classify the active task/stage as exactly one of:

- `RUNNING` â†’ continue monitoring the current process; **DO NOT restart**.
- `PASS` â†’ verify evidence, then execute `NEXT_EXACT_ACTION`.
- `FAIL` â†’ repair/rerun only the failed stage; **DO NOT rerun the whole pipeline**.
- `INTERRUPTED` â†’ resume from the last `VERIFIED PASS` checkpoint; **DO NOT restart from the beginning**.

Do not ask for routine confirmation between safe dependency-satisfied stages.

## PART 2 â€” DURABLE HANDOFF, PROJECT STATE & TASK QUEUE CONTRACT

`CURRENT_HANDOFF.md` is the immediate resume contract.

It must always expose a current canonical block containing:

- `PROJECT_ROOT`
- `ACTIVE_TASK`
- `STATUS`
- `CURRENT_STAGE`
- `BRANCH`
- `HEAD`
- `LAST_VERIFIED_CHECKPOINT`
- `PROCESS_PID`
- `LATEST_LOG`
- `LAST_EXIT_CODE`
- `ARTIFACTS`
- `NEXT_EXACT_ACTION`
- `DO_NOT_REPEAT`
- `BLOCKERS`

If evidence is unavailable, write `UNKNOWN` or `NONE`. Never invent a value.

**NO `NEXT_EXACT_ACTION` = INVALID HANDOFF.**

Update the handoff after important transitions:
- CLAIM;
- CODE â†’ TEST;
- TEST â†’ PASS/FAIL;
- BUILD â†’ PASS/FAIL;
- E2E â†’ PASS/FAIL;
- COMMIT;
- PUSH;
- PR;
- REVIEW;
- MERGE;
- MAIN VERIFIED;
- NEXT TASK.

For any long-running process, persist `PROCESS_PID`, `LATEST_LOG`, and the current stage before leaving the execution turn.

Durable state roles:
- `CURRENT_HANDOFF.md` = immediate resume source;
- `PROJECT_STATE.md` = durable project-level truth/readiness;
- `tasks/TASK_QUEUE.md` = canonical dependency/task sequencing;
- a completed task must not be claimed again;
- an active task must not be restarted;
- `NEXT_EXACT_ACTION` is the exact resume point.

State/history may be appended for auditability, but the newest canonical block is authoritative and must not erase historical evidence.

## PART 3 â€” STRICT PROJECT ROOT CONTAINMENT & BUILD/TEMP OUTPUT POLICY

Each chat/project has exactly one canonical `PROJECT_ROOT`.

`PROJECT_ROOT` must be the verified Git root of the current project. Never use a drive root such as `E:\` or `D:\` when the Git root is deeper.

All **new project writes** â€” source edits, generated files, temp/cache data, logs, artifacts, recovery outputs, build/package/release outputs â€” must stay inside `PROJECT_ROOT`.

Preferred project-local locations:
- `PROJECT_ROOT\.tmp\`
- `PROJECT_ROOT\.cache\`
- `PROJECT_ROOT\logs\`
- `PROJECT_ROOT\artifacts\`
- `PROJECT_ROOT\recovery\`
- `PROJECT_ROOT\dist\`
- `PROJECT_ROOT\release\`

Do not create sibling project/worktree/output directories such as:
- `<PROJECT>-CLEAN`
- `<PROJECT>-FINAL`
- `<PROJECT>-RELEASE-CLEAN`
- `<PROJECT>-PKG`
- `<PROJECT>-PKG2`
- `<PROJECT>-BACKUP`
- `<PROJECT>-WORK`
- `<PROJECT>-TEMP`

Do not use project output locations such as `E:\temp`, `E:\_recovery`, `E:\release`, `D:\temp`, or equivalent paths outside `PROJECT_ROOT`.

Before every filesystem write with side effects:
1. normalize `TARGET_PATH`;
2. allow only when `TARGET_PATH == PROJECT_ROOT` or `TARGET_PATH` is a descendant of `PROJECT_ROOT`;
3. otherwise **FAIL CLOSED** â€” no write, no build, no package, no release.

External read-only inputs/oracles explicitly required by repository rules are allowed to be **read** outside `PROJECT_ROOT`, but they must never become a write/output target. This preserves forensic/legacy-oracle read-only rules without weakening containment.

If a third-party tool unavoidably uses a global OS/tool cache, record that exception. Never treat the external cache as project source, project state, or project output.

Pre-existing sibling worktrees/artifacts created before this law are historical evidence only. Do not create new siblings and do not choose an existing sibling as a target for new project writes after this law becomes active.

## PART 4 â€” FILEMCP EXECUTION & SIDE-EFFECT RETRY PROTECTION

Every FileMCP Git operation must provide an explicit `repo_path`.

Every command execution must provide an explicit `cwd`.

Never rely on default cwd.

Before CODE, TEST, BUILD, PACKAGE, RELEASE, MIGRATION, or PRODUCTION E2E, verify:

`git rev-parse --show-toplevel`

The result must equal the canonical `PROJECT_ROOT`.

If it does not match:
- STOP;
- FAIL CLOSED;
- do not write files;
- do not build/package/release.

Before retrying any operation with external or durable side effects â€” push, PR, upload, publish, release, deployment, migration, production E2E, or external API side effect â€” inspect real state first and determine whether the prior attempt already succeeded.

**No blind retry.**

If the prior attempt is still `RUNNING`, monitor it.
If it already `PASS`ed, advance.
If it `FAIL`ed, retry only the failed stage.
If it was `INTERRUPTED`, resume from the last verified checkpoint.

## PART 5 â€” CONTINUOUS EXECUTION LOOP & POST-UPDATE VERIFICATION

Canonical execution loop:

`CLAIM â†’ ANALYZE â†’ PLAN â†’ CODE â†’ TEST â†’ VERIFY â†’ COMMIT â†’ PUSH/PR â†’ REVIEW â†’ MERGE MAIN â†’ MAIN VERIFIED â†’ NEXT TASK`

Repository-specific workflows may omit unavailable Git-network steps, but must never falsely claim they occurred.

Do not stop merely because an older chat stream was lost.

After governance/state updates:
1. read back the modified canonical sections;
2. run `git status`;
3. run `git diff`;
4. verify exactly one canonical resume/containment section;
5. verify this task created no new project file outside `PROJECT_ROOT`;
6. verify `PROJECT_ROOT` in `AGENTS.md` and `CURRENT_HANDOFF.md` matches Git root;
7. verify `CURRENT_HANDOFF.md` has `NEXT_EXACT_ACTION`;
8. verify the active task was not reset;
9. verify pre-existing unrelated WIP was not absorbed;
10. review before commit when repository workflow requires review.

This update must be idempotent: rerunning the same governance update must not create duplicate canonical sections.

<!-- CANONICAL_RESUME_CONTAINMENT:END -->

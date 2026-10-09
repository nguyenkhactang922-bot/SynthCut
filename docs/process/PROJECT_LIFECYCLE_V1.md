# SynthCut / Tang AI Video Editor — Canonical 8-Phase Execution Specification

Status: CANONICAL PROCESS — 10-FIELD SUBSTAGE CONTRACT
Date: 2026-10-07
Authority: `docs/CHATCODE_GLOBAL_MULTI_PROJECT_EXECUTION_LAW.md`

This process is mandatory. Every named substage below must explicitly resolve all ten fields:
`Input + Entry Gate + Work + Output + Exit Gate + Artifact + Evidence + Owner/Authority + Risks/Open Questions + Loopback`.

A historical artifact may satisfy a field, but a later phase is not authorized until every prerequisite substage has a complete contract and evidence. Valid historical evidence is retained when governance is normalized; it is rerun only when changed scope, requirements, code, environment, or contradictory evidence makes it stale.

---

# 1. DISCOVER

## 1.1 Raw Idea
- **Input:** product-owner intent, problem intuition, desired user outcome, known environment.
- **Entry Gate:** project identity/root is known; no solution is treated as frozen.
- **Work:** capture the idea in problem/outcome language without prematurely selecting architecture.
- **Output:** concise raw-idea statement and initial target workflow.
- **Exit Gate:** intent, target user, and desired outcome are understandable without hidden assumptions.
- **Artifact:** `docs/discovery/PRODUCT_DISCOVERY_V1.md`.
- **Evidence:** product-owner statements plus existing repo/product context where relevant.
- **Owner/Authority:** product owner owns intent; ChatGPT Web normalizes it without changing meaning.
- **Risks/Open Questions:** ambiguous goal, conflicting priorities, unstated commercial/platform assumptions.
- **Loopback:** remain in Raw Idea until ambiguity affecting downstream choices is explicit.

## 1.2 Problem Discovery
- **Input:** approved raw idea, current workflow, pain points, existing product behavior.
- **Entry Gate:** Raw Idea exit gate PASS.
- **Work:** identify user pains, failure modes, constraints, jobs-to-be-done, and why current behavior is insufficient.
- **Output:** problem statements separated from proposed solutions.
- **Exit Gate:** each important pain is observable/testable and tied to the target workflow.
- **Artifact:** `docs/discovery/PRODUCT_DISCOVERY_V1.md` problem section.
- **Evidence:** repo behavior, user workflow, runtime observations, current limitations.
- **Owner/Authority:** ChatGPT Web analyzes; product owner resolves intent conflicts.
- **Risks/Open Questions:** solution bias, symptoms mistaken for root causes, missing user workflow steps.
- **Loopback:** Raw Idea if the core goal changes; otherwise repeat Problem Discovery only for unresolved pains.

## 1.3 Discovery Research
- **Input:** problem statements and current product/repo context.
- **Entry Gate:** Problem Discovery PASS.
- **Work:** inspect existing behavior and external patterns enough to understand the problem space, not yet to select a final implementation.
- **Output:** evidence-backed observations, analogous patterns, unknowns, and candidate hypotheses.
- **Exit Gate:** enough evidence exists to form testable I/O hypotheses without inventing missing behavior.
- **Artifact:** `docs/discovery/PRODUCT_DISCOVERY_V1.md` research section.
- **Evidence:** current repo/source/runtime plus cited external references when used.
- **Owner/Authority:** ChatGPT Web; FileMCP is execution/read bridge for local evidence.
- **Risks/Open Questions:** stale repo assumptions, incomplete market/reference scan, confusing marketing claims with implementation evidence.
- **Loopback:** Problem Discovery if research changes the problem definition.

## 1.4 I/O Hypotheses
- **Input:** raw idea, problems, discovery research.
- **Entry Gate:** Discovery Research PASS.
- **Work:** define expected inputs, derived/intermediate state, outputs, failure outputs, and evidence outputs.
- **Output:** testable I/O hypotheses for the product/workflow.
- **Exit Gate:** major workflow inputs/outputs and uncertainty are explicit enough to define scope/acceptance.
- **Artifact:** `docs/discovery/PRODUCT_DISCOVERY_V1.md` I/O section.
- **Evidence:** discovery findings and current system contracts.
- **Owner/Authority:** ChatGPT Web; product owner approves materially changed product intent.
- **Risks/Open Questions:** missing edge inputs, hidden external dependencies, outputs not objectively verifiable.
- **Loopback:** Discovery Research for missing evidence; Problem Discovery if I/O exposes a different problem.

**DISCOVER phase exit:** all four substages PASS and discovery artifact is traceable.

---

# 2. DEFINE

## 2.1 Brief
- **Input:** complete DISCOVER output.
- **Entry Gate:** DISCOVER PASS.
- **Work:** state product goal, target workflow, primary user, value, product boundaries, and initial success definition.
- **Output:** canonical product brief.
- **Exit Gate:** brief is specific enough to constrain later research/design and contains no unresolved contradiction with discovery.
- **Artifact:** `docs/brief/TANG_AI_VIDEO_EDITOR_BRIEF_V1.md`.
- **Evidence:** discovery artifact and product-owner decisions.
- **Owner/Authority:** product owner owns product direction; ChatGPT Web drafts/normalizes.
- **Risks/Open Questions:** aspirational wording without measurable behavior; accidental solution lock.
- **Loopback:** DISCOVER if the brief changes the fundamental problem or target user.

## 2.2 Scope
- **Input:** brief and discovery hypotheses.
- **Entry Gate:** Brief PASS.
- **Work:** separate in-scope, out-of-scope, v1, deferred, optional, and reopening triggers.
- **Output:** explicit scope boundary.
- **Exit Gate:** every major requested capability is classified; deferred work cannot silently become required.
- **Artifact:** `docs/define/PRODUCT_DEFINITION_V1.md`.
- **Evidence:** brief/discovery plus repo capability baseline.
- **Owner/Authority:** product owner approves scope tradeoffs; ChatGPT Web records them.
- **Risks/Open Questions:** scope creep, hidden redistribution/commercial requirements, optional capability treated as blocker.
- **Loopback:** Brief if the product promise changes; DISCOVER for new problem classes.

## 2.3 Constraints
- **Input:** brief, scope, environment, license/platform/privacy facts.
- **Entry Gate:** Scope PASS.
- **Work:** enumerate product, platform, data, AI, license, security, performance, operational, process, and project-root constraints.
- **Output:** explicit constraint register.
- **Exit Gate:** constraints affecting solution selection are measurable or have a named decision owner/reopening trigger.
- **Artifact:** `docs/define/PRODUCT_DEFINITION_V1.md` constraints section.
- **Evidence:** environment, repo licenses/dependencies, user requirements, global law.
- **Owner/Authority:** ChatGPT Web; product owner decides tradeoffs; legal/license facts cannot be waived by convenience.
- **Risks/Open Questions:** unstated machine limits, license incompatibility, privacy assumptions, impossible performance targets.
- **Loopback:** Scope/Brief when a constraint invalidates the intended product boundary.

## 2.4 Acceptance Criteria
- **Input:** brief, scope, constraints, discovery hypotheses.
- **Entry Gate:** Constraints PASS.
- **Work:** define measurable product and architecture/process acceptance criteria with IDs and pre-freeze thresholds/reopening rules.
- **Output:** canonical AC set traceable to discovery.
- **Exit Gate:** every required behavior has an objective verification path; subjective or unprovable gates are explicitly classified.
- **Artifact:** brief AC list + `docs/define/PRODUCT_DEFINITION_V1.md` trace.
- **Evidence:** discovery/definition facts and product-owner decisions.
- **Owner/Authority:** product owner has authority to change product AC explicitly; ChatGPT Web validates consistency and records amendments.
- **Risks/Open Questions:** arbitrary thresholds, circular self-certification, acceptance impossible to test.
- **Loopback:** Constraints/Scope if AC exposes infeasibility; DISCOVER if the desired outcome changes.

**DEFINE phase exit:** Brief + Scope + Constraints + Acceptance Criteria PASS. Any later AC amendment must explicitly reopen this substage and then reconcile ADR/design; valid prior evidence is retained.

---

# 3. RESEARCH

## 3.1 Solution Research
- **Input:** frozen-for-research definition and ACs.
- **Entry Gate:** DEFINE PASS FOR RESEARCH.
- **Work:** identify solution classes and current repo strengths/gaps against requirements before choosing components.
- **Output:** solution landscape and base-repo capability audit.
- **Exit Gate:** candidate solution classes cover the important requirements/risks and existing strengths are not discarded without evidence.
- **Artifact:** `docs/research/SYNTHCUT_BASE_REPO_AUDIT_V1.md`, `docs/research/RESEARCH_EVIDENCE_V1.md`.
- **Evidence:** concrete source files, tests, runtime observations, upstream docs.
- **Owner/Authority:** ChatGPT Web; FileMCP gathers local evidence.
- **Risks/Open Questions:** confirmation bias toward the base repo, outdated upstream assumptions.
- **Loopback:** DEFINE if research proves requirements infeasible or mutually inconsistent.

## 3.2 Repo / Tool / Framework Search
- **Input:** solution landscape, required capabilities, constraints.
- **Entry Gate:** Solution Research PASS enough to define search criteria.
- **Work:** find candidate repos/tools/frameworks and identify specific modules/patterns that may outperform current weak areas.
- **Output:** candidate inventory with relevance and concrete reusable/reference areas.
- **Exit Gate:** meaningful candidates are identified for every high-risk/weak area or absence is recorded.
- **Artifact:** `docs/research/REPO_TECH_COMPARISON_V1.md`.
- **Evidence:** repo source/docs/tests/commits/releases as applicable.
- **Owner/Authority:** ChatGPT Web.
- **Risks/Open Questions:** copying incompatible code, shallow feature-list comparison, missing stronger candidates.
- **Loopback:** Solution Research if candidate evidence reveals a different solution class.

## 3.3 License / Security Audit
- **Input:** base repo and candidate inventory.
- **Entry Gate:** candidate identities and relevant dependencies are known.
- **Work:** classify licenses/provenance, dependency/security exposure, redistribution constraints, and safe reference-vs-copy boundaries.
- **Output:** license/security decision register and remediation/reopening triggers.
- **Exit Gate:** no unclassified critical licensing/security issue blocks design; risky reuse is explicitly prohibited or constrained.
- **Artifact:** research audit sections plus security evidence such as `docs/evidence/spikes/TVE-SPIKE-DEPSEC-001.md` when needed.
- **Evidence:** LICENSE/NOTICE/package manifests/audit output/dependency chains.
- **Owner/Authority:** ChatGPT Web; product owner may narrow scope but cannot falsify obligations.
- **Risks/Open Questions:** commercial scope later changes, transitive dependency changes, noncommercial source copied into incompatible modules.
- **Loopback:** Repo Search for replacement candidate; DEFINE Scope if licensing forces product-boundary change.

## 3.4 Candidate Comparison
- **Input:** solution research, candidate inventory, license/security findings, ACs.
- **Entry Gate:** prior RESEARCH substages have sufficient evidence.
- **Work:** compare candidates by requirement fit, architecture fit, Windows/local fit, long-form scale, AI/human coexistence, reuse cost, license/security, evidence strength.
- **Output:** chosen base plus explicit keep/replace/adapt/reference decisions for strong/weak areas.
- **Exit Gate:** selection is evidence-backed and each borrowed pattern has a rationale/provenance boundary.
- **Artifact:** `docs/research/REPO_TECH_COMPARISON_V1.md`, `docs/research/RESEARCH_RECONCILIATION_V1.md`.
- **Evidence:** prior research artifacts and concrete candidate evidence.
- **Owner/Authority:** ChatGPT Web; product owner approves product-level tradeoffs if necessary.
- **Risks/Open Questions:** composite architecture complexity, accidental rewrite of already-strong base capabilities.
- **Loopback:** Repo Search/License Audit when a candidate is rejected or new evidence appears; DEFINE for requirement changes.

**RESEARCH phase exit:** all four substages PASS FOR DESIGN and selected base/pattern boundaries are explicit.

---

# 4. DESIGN

## 4.1 ADR
- **Input:** DEFINE ACs + RESEARCH comparison/reconciliation.
- **Entry Gate:** RESEARCH PASS FOR DESIGN.
- **Work:** record architecture choices, rejected alternatives, boundaries, invariants, reopening triggers, and evidence linkage.
- **Output:** accepted design decisions, not yet frozen.
- **Exit Gate:** every material technology/boundary decision has rationale and no unresolved contradiction with ACs/license/security.
- **Artifact:** `docs/adr/ADR-001_BASE_ARCHITECTURE.md` + amendments.
- **Evidence:** research files, source/runtime evidence, later POC amendments.
- **Owner/Authority:** ChatGPT Web architecture authority; product owner owns explicit requirement changes.
- **Risks/Open Questions:** decisions based on assumptions requiring POC, hidden second source of truth, provider/license coupling.
- **Loopback:** RESEARCH for missing comparative evidence; DEFINE for changed AC/scope.

## 4.2 System Design
- **Input:** accepted ADR, requirements, base architecture, candidate strengths.
- **Entry Gate:** ADR accepted for design.
- **Work:** define components, data/state authority, flows, APIs/concepts, failure handling, persistence, jobs, QA, security, long-form behavior, and AC mapping.
- **Output:** one living coherent system design.
- **Exit Gate:** every AC has a design mechanism or explicit unresolved spike item; no competing spec owns the same truth.
- **Artifact:** `docs/design/TANG_AI_VIDEO_EDITOR_DESIGN.md`.
- **Evidence:** ADR/research/current implementation.
- **Owner/Authority:** ChatGPT Web.
- **Risks/Open Questions:** over-design, missing operational failure paths, design divergence from current repo.
- **Loopback:** ADR for architectural choice changes; DEFINE if requirement semantics change.

## 4.3 Independent Audit
- **Input:** ADR + living design + AC trace.
- **Entry Gate:** System Design internally coherent enough to challenge.
- **Work:** independently test assumptions, trace gaps, scope/license/security/runtime risks, premature coding, missing gates, and stop conditions.
- **Output:** findings, severity, remediation, spike list, stop/pass verdict.
- **Exit Gate:** all blocking findings are resolved, accepted with authority, or converted into measurable POC gates.
- **Artifact:** `docs/audit/DESIGN_AUDIT_*.md`, lifecycle/freeze readiness audits.
- **Evidence:** direct readback of design/repo/state plus source/runtime facts.
- **Owner/Authority:** ChatGPT Web performs independent review separate from initial design pass; product owner decides explicit requirement tradeoffs.
- **Risks/Open Questions:** self-confirmation, audit loops without stop criteria, checklist-only review without evidence.
- **Loopback:** System Design/ADR/DEFINE according to earliest affected decision.

## 4.4 Spike / POC
- **Input:** audit-defined unresolved technical risks and fixed pre-spike thresholds.
- **Entry Gate:** hypothesis, fixture, metrics, PASS/FAIL criteria, containment, and disposable status are fixed before execution.
- **Work:** run the smallest bounded experiment needed to test the unresolved risk; do not silently modify production implementation.
- **Output:** measured technical result and architecture implication.
- **Exit Gate:** hypothesis PASS/FAIL is supported by durable evidence; invalid protocols are explicitly invalidated; no production promotion occurs.
- **Artifact:** `docs/evidence/spikes/` plus `.spike-temp/` disposable artifacts.
- **Evidence:** actual command/process/result markers, logs, media probes, metrics, diffs.
- **Owner/Authority:** ChatGPT Web defines/evaluates; FileMCP executes; product owner only changes requirements explicitly.
- **Risks/Open Questions:** cherry-picked thresholds, stale fixture, POC code leaking into production, rerunning already-valid expensive evidence.
- **Loopback:** audit/design for failed hypothesis; DEFINE/ADR when acceptance criteria intentionally change; rerun only failed/stale stage.

## 4.5 Freeze
- **Input:** reconciled ADR + living design + all required POC evidence + final ACs + risk register.
- **Entry Gate:** every DESIGN blocker closed; every changed AC reconciled; independent freeze-readiness audit PASS; production source still locked.
- **Work:** final readback for contradictions; mark architecture and ACs FROZEN; list frozen documents, accepted risks, reopening rules.
- **Output:** immutable-for-implementation design baseline and freeze record.
- **Exit Gate:** zero unresolved blocking design questions; all ACs measurable; all implementation boundaries traceable; freeze record signed by process authority.
- **Artifact:** freeze record under `docs/audit/` or `docs/design/`, plus status updates in brief/definition/ADR/living design.
- **Evidence:** complete DESIGN artifact chain and final freeze audit.
- **Owner/Authority:** ChatGPT Web freezes architecture/process; product owner owns requirement changes that would reopen DEFINE.
- **Risks/Open Questions:** false freeze with hidden gaps; later contradictory evidence.
- **Loopback:** earliest affected DEFINE/RESEARCH/DESIGN substage when frozen assumptions change; never silently patch frozen design.

**DESIGN phase exit:** `TVE-FRZ-001 PASS`, architecture + AC FROZEN. Production code remains locked until PLAN IMPLEMENTATION also PASSes.

---

# 5. PLAN IMPLEMENTATION

## 5.1 Dependency Graph
- **Input:** frozen architecture/ACs, current repo module boundaries, implementation constraints.
- **Entry Gate:** DESIGN/FREEZE PASS.
- **Work:** identify implementation nodes, prerequisites, shared foundations, independent lanes, integration gates, and prohibited cycles.
- **Output:** executable dependency DAG.
- **Exit Gate:** every implementation task can identify prerequisites and no hidden dependency remains untracked.
- **Artifact:** `docs/plan/DEPENDENCY_GRAPH_V1.md`.
- **Evidence:** frozen design mappings + current source/module locations.
- **Owner/Authority:** ChatGPT Web.
- **Risks/Open Questions:** circular dependency, unsafe parallel lanes, foundation tasks omitted.
- **Loopback:** Freeze/System Design if DAG exposes impossible architecture; source audit if module location is uncertain.

## 5.2 Task Decomposition
- **Input:** dependency graph + frozen ACs/design.
- **Entry Gate:** Dependency Graph PASS.
- **Work:** split work into reviewable task-sized units with scope, files/modules, dependencies, acceptance, tests, evidence, non-goals.
- **Output:** implementation task catalog.
- **Exit Gate:** tasks are small enough to verify independently and collectively cover all frozen requirements without overlap ambiguity.
- **Artifact:** `docs/plan/TASK_DECOMPOSITION_V1.md`.
- **Evidence:** dependency graph, design/AC mapping, source locators.
- **Owner/Authority:** ChatGPT Web.
- **Risks/Open Questions:** oversized tasks, duplicate ownership, hidden migration/integration work.
- **Loopback:** Dependency Graph for prerequisite changes; Freeze if decomposition reveals design gap.

## 5.3 Traceability
- **Input:** frozen ACs + task catalog + test/evidence strategy.
- **Entry Gate:** Task Decomposition PASS.
- **Work:** map each frozen requirement to design decision, implementation task(s), tests, runtime evidence, and final verification.
- **Output:** requirement→task→test→evidence matrix with no blocking orphan.
- **Exit Gate:** every frozen requirement has complete forward trace and every production task has a requirement/risk rationale.
- **Artifact:** `docs/plan/TRACEABILITY_PLAN_V1.md`.
- **Evidence:** freeze record, design, task catalog, test inventory.
- **Owner/Authority:** ChatGPT Web.
- **Risks/Open Questions:** orphan AC, untested task, evidence type weaker than claim.
- **Loopback:** Task Decomposition for missing work; Freeze/DEFINE for unimplementable or ambiguous AC.

## 5.4 Task Queue
- **Input:** dependency graph, task catalog, traceability plan.
- **Entry Gate:** Traceability PASS.
- **Work:** order dependency-ready production tasks; define CLAIM rules, parallelism constraints, completion/evidence requirements, next-task selection.
- **Output:** executable production queue with first eligible task.
- **Exit Gate:** queue has no task whose prerequisites are unsatisfied; every queued task has acceptance/tests/evidence and explicit status.
- **Artifact:** `tasks/TASK_QUEUE.md` production section.
- **Evidence:** all Phase 5 planning artifacts and source-of-truth state.
- **Owner/Authority:** ChatGPT Web; FileMCP executes only claimed tasks.
- **Risks/Open Questions:** premature claim, conflicting file scopes, missing integration gate.
- **Loopback:** Traceability/Task Decomposition/Dependency Graph according to issue discovered.

**PLAN IMPLEMENTATION phase exit:** all four substages PASS. Only now may `IMPLEMENTATION_ALLOWED=true` and Phase 6 Claim begin.

---

# 6. BUILD & VERIFY

## 6.1 Claim
- **Input:** first/next dependency-ready queue task.
- **Entry Gate:** Phase 5 PASS; task dependencies satisfied; no active duplicate process/task; project root/Git state verified.
- **Work:** claim exactly one task/lane and record scope/current state.
- **Output:** active task with bounded ownership.
- **Exit Gate:** state/handoff identify one current task and exact implementation scope.
- **Artifact:** `CURRENT_HANDOFF.md`, `PROJECT_STATE.md`, `tasks/TASK_QUEUE.md`.
- **Evidence:** Git/status/state readback.
- **Owner/Authority:** ChatGPT Web claims; FileMCP executes.
- **Risks/Open Questions:** duplicate claim, stale state, unrelated WIP overlap.
- **Loopback:** Task Queue if dependencies/state invalidate claim.

## 6.2 Code
- **Input:** claimed task, frozen design, task acceptance, current source.
- **Entry Gate:** Claim PASS; `IMPLEMENTATION_ALLOWED=true`; Git root verified; no frozen-design violation.
- **Work:** implement only task-scoped production changes, preserving unrelated WIP.
- **Output:** reviewable source/config/data changes.
- **Exit Gate:** implementation is complete enough for declared tests; no unrelated scope absorbed.
- **Artifact:** production source diff.
- **Evidence:** changed-file diff and code readback.
- **Owner/Authority:** ChatGPT Web decides/writes through FileMCP.
- **Risks/Open Questions:** scope creep, POC copied without promotion review, architecture drift.
- **Loopback:** Analyze/Plan within claimed task; DESIGN if frozen architecture must change.

## 6.3 Test
- **Input:** task implementation and acceptance/test plan.
- **Entry Gate:** Code stage ready; exact cwd/root verified.
- **Work:** run narrow tests first, then required integration/runtime/error/retry/cancel/persistence checks.
- **Output:** real test results and logs/artifacts.
- **Exit Gate:** all task-required tests PASS or task classified FAIL with exact failed stage.
- **Artifact:** test logs/reports/artifacts.
- **Evidence:** command, exit code, runtime result markers.
- **Owner/Authority:** FileMCP executes; ChatGPT Web evaluates.
- **Risks/Open Questions:** flaky tests, mocked evidence weaker than claim, rerunning broader pipeline unnecessarily.
- **Loopback:** Code only for failed test cause; do not rerun prior PASS stages blindly.

## 6.4 Evidence
- **Input:** source diff + test/runtime results.
- **Entry Gate:** required tests executed or blocker explicitly recorded.
- **Work:** assemble durable evidence linking changed behavior to acceptance.
- **Output:** task evidence bundle/report.
- **Exit Gate:** another agent can independently verify what changed, what ran, and the result.
- **Artifact:** `docs/evidence/` or task evidence file plus logs/artifacts.
- **Evidence:** diff/tests/runtime itself.
- **Owner/Authority:** ChatGPT Web curates; FileMCP supplies raw evidence.
- **Risks/Open Questions:** incomplete provenance, claiming runtime from static checks.
- **Loopback:** Test/Code for missing evidence.

## 6.5 Verify
- **Input:** implementation + evidence bundle + frozen AC trace.
- **Entry Gate:** Evidence stage complete.
- **Work:** independently read back diff/results, check acceptance, regressions, state, project-root containment, and no false claims.
- **Output:** PASS/FAIL verification verdict.
- **Exit Gate:** all task acceptance met with evidence; otherwise exact failure is identified.
- **Artifact:** verification section in evidence/state.
- **Evidence:** independent readback/test/result comparison.
- **Owner/Authority:** ChatGPT Web verification authority.
- **Risks/Open Questions:** self-review blind spot, hidden regression, stale evidence.
- **Loopback:** Code/Test for failed item; DESIGN only for frozen-design contradiction.

## 6.6 Commit
- **Input:** verified task diff/evidence.
- **Entry Gate:** Verify PASS; Git identity/auth valid; diff reviewed; no unrelated WIP staged.
- **Work:** create task-scoped commit when repository workflow requires Git commit.
- **Output:** commit hash.
- **Exit Gate:** commit exists and contains only accepted task scope.
- **Artifact:** Git commit.
- **Evidence:** `git show/status/log`.
- **Owner/Authority:** FileMCP executes under valid user Git identity; ChatGPT Web never invents identity.
- **Risks/Open Questions:** missing identity, accidental unrelated staging, duplicate commit after stream loss.
- **Loopback:** Verify/staging repair; blocker if identity/authority unavailable.

## 6.7 PR
- **Input:** verified commit/branch.
- **Entry Gate:** commit exists; remote/network/auth/workflow supports PR.
- **Work:** push if needed and create/update PR exactly once after side-effect state check.
- **Output:** PR reference or explicit N/A/blocker.
- **Exit Gate:** PR exists with correct scope/evidence, or workflow explicitly does not require it.
- **Artifact:** remote PR.
- **Evidence:** remote state/PR URL/status.
- **Owner/Authority:** authenticated Git hosting user/workspace.
- **Risks/Open Questions:** duplicate PR/push, stale branch, unavailable remote.
- **Loopback:** Commit/Verify for changes; side-effect guard before retry.

## 6.8 Review
- **Input:** PR/commit + evidence + frozen trace.
- **Entry Gate:** reviewable changes exist.
- **Work:** inspect correctness, architecture compliance, tests, security/license, error paths, regressions.
- **Output:** approve or actionable findings.
- **Exit Gate:** no unresolved blocking review finding.
- **Artifact:** PR review or durable local review report.
- **Evidence:** review comments/findings plus rerun evidence if changed.
- **Owner/Authority:** reviewer/ChatGPT independent review lane as repository permits.
- **Risks/Open Questions:** rubber-stamp review, changes after review without re-verification.
- **Loopback:** Code/Test/Evidence/Verify for findings.

## 6.9 Merge
- **Input:** approved reviewed branch/PR.
- **Entry Gate:** Review PASS; merge authority available; side-effect state checked.
- **Work:** merge using repository-approved strategy exactly once.
- **Output:** merged main state/commit.
- **Exit Gate:** merge is observable on target branch; no unresolved conflict.
- **Artifact:** Git merge/remote main.
- **Evidence:** branch/log/remote merge status.
- **Owner/Authority:** authenticated repository merge authority.
- **Risks/Open Questions:** duplicate merge, wrong target, conflict resolution changing behavior.
- **Loopback:** Review/Code if merge conflict requires substantive change.

## 6.10 MAIN VERIFIED
- **Input:** merged main plus task/final required tests.
- **Entry Gate:** Merge complete or equivalent direct-main workflow verified.
- **Work:** verify required behavior on merged main, not only feature branch.
- **Output:** MAIN VERIFIED verdict and updated state/queue.
- **Exit Gate:** merged main passes all task-required verification; trace/evidence updated; next task selected.
- **Artifact:** state/evidence + main verification logs.
- **Evidence:** main HEAD, tests/runtime/artifacts.
- **Owner/Authority:** ChatGPT Web verifies; FileMCP executes checks.
- **Risks/Open Questions:** feature-branch evidence assumed valid after merge, unmerged local WIP.
- **Loopback:** exact failed stage/task only; next queue task after PASS.

---

# 7. RELEASE & OPERATE

## 7.1 Package
- **Input:** MAIN VERIFIED implementation and release requirements.
- **Entry Gate:** all release-blocking implementation tasks MAIN VERIFIED.
- **Work:** build distributable/package with required assets/binaries/config.
- **Output:** package artifact.
- **Exit Gate:** package build PASS and artifact integrity/contents verified.
- **Artifact:** project-local `dist/`/`release/` artifact.
- **Evidence:** build log, hashes/manifest, packaged smoke prerequisites.
- **Owner/Authority:** FileMCP executes; ChatGPT Web verifies.
- **Risks/Open Questions:** missing resources, environment-dependent packaging, outputs outside project root.
- **Loopback:** Build & Verify task responsible for failure.

## 7.2 Release
- **Input:** verified package and release scope/version.
- **Entry Gate:** Package PASS; release authority and destination known; side-effect guard checked.
- **Work:** create local/remote release according to scope.
- **Output:** release artifact/reference.
- **Exit Gate:** release exists once, matches verified package/version, and rollback/notes are available where applicable.
- **Artifact:** release record/package.
- **Evidence:** release state/manifest.
- **Owner/Authority:** product/repository release authority.
- **Risks/Open Questions:** duplicate release, wrong version, unsigned/notarization expectations.
- **Loopback:** Package or Build & Verify depending failure.

## 7.3 Deploy
- **Input:** released artifact and target environment, if deployment applies.
- **Entry Gate:** Release PASS; target credentials/authority available; deployment explicitly in scope.
- **Work:** deploy once with state check and rollback plan.
- **Output:** deployed instance/state or explicit N/A for local desktop-only scope.
- **Exit Gate:** deployment health/identity/version verified.
- **Artifact:** deployment record.
- **Evidence:** target state/runtime health.
- **Owner/Authority:** authenticated deployment owner.
- **Risks/Open Questions:** side effects, config drift, credential dependency.
- **Loopback:** Release/Package/Build according to failure.

## 7.4 Monitor
- **Input:** running released/deployed product and operational signals.
- **Entry Gate:** release/deploy active or local operational scope defined.
- **Work:** observe health, failures, resource use, critical workflow regressions, user feedback signals.
- **Output:** operational status and actionable anomalies.
- **Exit Gate:** monitoring requirements for current scope are active/verified or explicitly N/A.
- **Artifact:** logs/monitoring report.
- **Evidence:** real operational signals.
- **Owner/Authority:** operator/product owner; ChatGPT may analyze connected evidence.
- **Risks/Open Questions:** blind spots, privacy/logging excess, unavailable telemetry.
- **Loopback:** Incident Handling for anomaly; LEARN for non-urgent improvement.

## 7.5 Incident Handling
- **Input:** detected incident/regression/failure.
- **Entry Gate:** issue is reproducible/observable enough to classify or containment is urgently required.
- **Work:** contain, preserve evidence, diagnose, repair through correct lifecycle depth, verify recovery.
- **Output:** restored safe state plus incident record/root cause/follow-up.
- **Exit Gate:** impact contained; recovery verified; required follow-up tasks created.
- **Artifact:** incident/evidence/state records.
- **Evidence:** logs/runtime/reproduction/fix verification.
- **Owner/Authority:** operator + ChatGPT/process authority; destructive actions require proper user authority.
- **Risks/Open Questions:** evidence loss, blind retry, emergency fix bypassing frozen requirements.
- **Loopback:** BUILD & VERIFY for implementation defect; DEFINE/DESIGN for requirement/architecture defect; DISCOVER for newly understood problem.

---

# 8. LEARN

## 8.1 Final Traceability Audit
- **Input:** frozen requirements, design, implementation tasks, main verification, release evidence.
- **Entry Gate:** requested implementation/release scope reached completion candidate.
- **Work:** map every frozen requirement to design, implementation, test, evidence, main/release status; identify orphan/gap.
- **Output:** final traceability verdict and gap registry.
- **Exit Gate:** every blocking requirement is PASS or explicitly reopened/waived by authorized product change; no unsupported completion claim.
- **Artifact:** final traceability audit.
- **Evidence:** complete lifecycle artifact chain.
- **Owner/Authority:** ChatGPT Web independent final audit; product owner authorizes scope/requirement waivers explicitly.
- **Risks/Open Questions:** false 100% claim, skipped runtime evidence, stale trace.
- **Loopback:** earliest lifecycle substage owning each discovered gap.

## 8.2 Feedback
- **Input:** final audit, product-owner/user feedback, operational evidence.
- **Entry Gate:** feedback source and affected behavior are identifiable.
- **Work:** classify feedback as defect, requirement change, usability issue, performance concern, or optional improvement.
- **Output:** normalized feedback items with priority/evidence.
- **Exit Gate:** each meaningful item has a disposition: close, backlog, incident, or lifecycle loopback.
- **Artifact:** feedback/backlog/state record.
- **Evidence:** user reports, metrics, runtime artifacts, reproduction.
- **Owner/Authority:** product owner sets priority; ChatGPT Web classifies/triages.
- **Risks/Open Questions:** anecdote treated as universal requirement, missing reproduction.
- **Loopback:** Incident Handling for active defect; New Requirement/Bug/Improvement for planned change.

## 8.3 New Requirement / Bug / Improvement
- **Input:** classified feedback or newly discovered opportunity/defect.
- **Entry Gate:** item has enough evidence/intent to determine lifecycle depth.
- **Work:** choose earliest affected phase: DISCOVER for new problem, DEFINE for requirement/scope/AC change, RESEARCH/DESIGN for solution/architecture change, BUILD for implementation-only defect under frozen design.
- **Output:** explicit loopback task with preserved prior evidence and stale-evidence list.
- **Exit Gate:** new work enters the correct phase without silently patching frozen truth.
- **Artifact:** updated state/queue/discovery-definition artifact as appropriate.
- **Evidence:** feedback/incident/audit source.
- **Owner/Authority:** product owner for product changes; ChatGPT Web for technical classification.
- **Risks/Open Questions:** unnecessary full restart, stale evidence reused after material change, frozen design silently mutated.
- **Loopback:** selected earliest affected phase/substage; retain all unaffected PASS evidence.

---

# Anti-skip / evidence retention law

- A later-phase artifact may exist historically without authorizing that phase.
- If an earlier prerequisite or required contract field is incomplete, authorization rolls back to the earliest affected substage.
- Valid later evidence is retained and is not rerun merely because governance was normalized.
- Re-run only when changed scope/requirements/code/environment or contradictory evidence makes that evidence stale.
- Spike/POC code is DESIGN evidence only and may not be silently promoted.

# Production-code lock

`IMPLEMENTATION_ALLOWED=false` until:
1. DISCOVER PASS;
2. DEFINE PASS;
3. RESEARCH PASS;
4. DESIGN is explicitly FROZEN;
5. all four PLAN IMPLEMENTATION substages PASS with dependency/task/test/evidence traceability.

Only then may BUILD & VERIFY / Claim authorize production source mutation.

# SecureStart: Implementation Plan

Build plan for the capstone, 22 to 25 November 2026. Final submission: Wednesday 25 November, 15:30 SAST.
Related: [BUSINESS.md](./BUSINESS.md), [docs/PRD.md](./docs/PRD.md), [docs/designs/](./docs/designs/)

---

## 1. Approach

- **Stack:** React, TypeScript, Vite and Tailwind CSS on the front end. Supabase for hosted Postgres, auth and row-level security (RLS). Vitest and Testing Library for tests. GitHub Actions for CI. Deployed to a free host with a live link.
- **Why no separate server:** RLS enforces permissions in the database, which meets the "permission rules enforced on the backend" requirement and removes a whole deployment from a three-day build. Logic that must be trusted (finding generation) lives in a database function or is validated by RLS and tests.
- **Test-driven:** for each phase, write the failing test first, then the code. The scoring, priority and finding-generation rules are pure functions with unit tests. RLS policies are covered by database tests using two seeded firms.
- **Vertical slices:** each phase ends with something working end to end, not a layer that only works once everything else exists.

## 2. Working agreement

- Every task is a GitHub Issue with a clear acceptance checklist, taken from the PRD.
- One branch per issue: `feat/<issue-number>-short-name`, `fix/...`, `docs/...`, `chore/...`.
- Small commits using conventional messages (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
- Every change goes through a pull request that links its issue (`Closes #n`). CI must be green before merge. Merge with squash or merge commit, then delete the branch.
- Nothing is pushed straight to `main` after the first commit.
- Definition of done for any issue: acceptance criteria met, tests written and passing, responsive on mobile and desktop, no console errors, docs updated if behaviour changed.

## 3. Labels and milestones

- **Labels:** `phase-0` to `phase-7`, `must`, `should`, `bug`, `docs`, `test`.
- **Milestones:** `Mon check-in`, `Tue 10:00`, `Tue 15:30`, `Wed 10:00`, `Final submission`.

## 4. Schedule against the check-ins

| When | Must be true |
|---|---|
| Mon 23 Nov, 10:00 | Public repo, BUSINESS.md, README pitch, docs/PRD.md, Stitch designs in docs/designs/ with the link in the README |
| Mon 23 Nov, 15:30 | This plan merged, issues created, frontend started through PRs (Phase 0 done, Phase 2 started) |
| Tue 24 Nov, 10:00 | Backend started: hosted database, migrations, login and roles, CI running (Phases 0 and 1 done) |
| Tue 24 Nov, 15:30 | Deployed to a live link with login, database and first Must features working; portfolio repo created and first version deployed (Phases 2 and 3 done, Phase 4 started) |
| Wed 25 Nov, 10:00 | All Must features working on the live link, tests passing, README almost complete, portfolio content added (Phases 4 to 6 done) |
| Wed 25 Nov, 15:30 | Final submission posted (Phase 7 done). Work after this time does not count. |

## 5. Phases and issues

### Phase 0: Foundation and CI (Monday)

Goal: a clean project where every pull request is checked automatically.

- [ ] Scaffold Vite, React, TypeScript, Tailwind; set up folder structure (`src/features`, `src/lib`, `src/components`, `supabase/migrations`, `supabase/tests`)
- [ ] ESLint, Prettier and strict TypeScript config
- [ ] Vitest and Testing Library with one passing smoke test
- [ ] GitHub Actions workflow: install, lint, typecheck, test, build on every pull request
- [ ] Pull request template and issue templates; `.env.example`; branch protection on `main` requiring CI

Done when: a pull request shows four green checks.

### Phase 1: Database, auth and roles (Monday night to Tuesday morning)

Goal: secure data layer before any feature UI depends on it.

- [ ] Create the Supabase project; commit migrations for all tables in PRD section 7, with enums and constraints
- [ ] **Tests first:** database tests for the permission rules in PRD section 8 using two seeded firms (cross-firm read and write denied, owner cannot edit assignee or due date, submitted assessment cannot be edited, unauthenticated reads nothing)
- [ ] Enable RLS on every table and write policies until the tests pass
- [ ] Profile creation on sign up (role chosen at sign up) and the function to add an administrator to a firm by email
- [ ] Seed migration: about 30 real questions across the categories, with guidance, POPIA reference, severity and weight
- [ ] Add the database tests to CI

Done when: the permission tests pass and a user from firm A cannot read firm B in any table.

### Phase 2: App shell, auth UI and routing (Monday afternoon to Tuesday)

Goal: people can sign up, log in and land on the right screen for their role.

- [ ] **Tests first:** route guard tests (logged out redirected, owner blocked from administrator screens)
- [ ] Supabase client, auth context and protected routes
- [ ] Sign up, log in, log out screens matching the Stitch designs
- [ ] Firm setup screen for first-time owners
- [ ] Responsive layout shell: navigation, firm switcher for administrators
- [ ] First deploy to the live host with environment variables set

Done when: both roles can sign up and log in on the live link.

### Phase 3: Firm membership (Tuesday)

Goal: owners can bring their IT administrator into the firm.

- [ ] **Tests first:** adding an administrator by email works, unknown email gives a clear message, a non-owner cannot add members
- [ ] Firm settings screen listing members
- [ ] Add administrator by email

Done when: an administrator added by an owner sees that firm and nothing else.

### Phase 4: Assessment engine (Tuesday to Wednesday morning)

Goal: a firm can complete and submit an assessment and get a score and findings.

- [ ] **Tests first:** `calculateScore` (all yes, all no, partly, not applicable excluded, weights, zero applicable weight)
- [ ] **Tests first:** `derivePriority` (severity mapping, partly lowers one level, floor at Low)
- [ ] **Tests first:** `generateFindings` (creates findings for No and Partly; no duplicates; auto-resolves when answer becomes Yes; reopens when it worsens)
- [ ] Implement the three functions, then the database function that performs submit atomically
- [ ] Assessment UI: category stepper, saved drafts, resume, submit validation (all questions answered)
- [ ] Result screen with score, the visible formula and the generated findings

Done when: submitting on the live link produces the right score and findings, and the unit tests pass in CI.

### Phase 5: Findings and remediation (Wednesday morning)

Goal: administrators can work through the risks and owners can follow progress.

- [ ] **Tests first:** status transitions record an event with actor and time; owner limited to status and notes; overdue logic
- [ ] Findings list with filters (status, priority) and sort by due date; overdue marker
- [ ] Finding detail: assignee, due date, notes, status, history
- [ ] Owner can mark Resolved or Accepted risk

Done when: a full cycle works on the live link: assess, find, assign, fix, resolve.

### Phase 6: Dashboard (Wednesday morning)

Goal: a clear picture of risk at a glance, with numbers that always match the data.

- [ ] **Tests first:** dashboard calculations (progress percentage, top five by priority, overdue count, score change)
- [ ] Owner dashboard: score, change, findings by priority, progress, top risks, overdue, trend chart
- [ ] Administrator home: firm list with latest score and open high-priority count
- [ ] Empty state for firms with no submitted assessment

Done when: dashboard values match a manual count on the seeded demo firm.

### Phase 7: Polish, documentation and submission (Wednesday)

Goal: it looks and behaves like a real product, and everything the brief asks for is in the repo.

- [ ] Responsive pass on mobile and desktop against the Stitch designs; accessibility pass (keyboard, focus, contrast, labels)
- [ ] Demo data: two realistic firms with assessments in different states, plus test logins for both roles listed in the README
- [ ] README complete: live link, Stitch link, test logins, screenshots, stack, architecture, run and test instructions, known issues, links to BUSINESS.md, PRD and this plan
- [ ] Run through every Must feature on the live link as each role
- [ ] Record the Loom (maximum 5 minutes): about 2 minutes investor pitch, about 3 minutes live demo
- [ ] Post the final submission in the channel before 15:30 using the required format

## 6. Portfolio (runs in parallel)

Separate public repo with its own README.

- [ ] Tuesday: create the repo, scaffold the site, deploy a first version (required at the Tue 15:30 check-in)
- [ ] Wednesday morning: add about me, capstone first then team project and best individual builds (each with screenshot, problem, role, stack, live link and GitHub link), skills, contact with a CV download
- [ ] Check for broken links, mobile layout and loading speed

## 7. Cut list if time runs short

Drop in this order, never touching the four Must features:
1. Trend chart (show the latest score and change only)
2. Administrator firm comparison list on the home screen
3. Finding history display (keep recording events)
4. Seed questions from about 30 down to about 20, covering every category

## 8. Risks

| Risk | Response |
|---|---|
| RLS rules leak data between firms | Permission tests are written before the policies and run in CI |
| Deploy problems discovered late | First deploy happens in Phase 2, on Tuesday, not on the last day |
| Falling behind on Tuesday | Apply the cut list immediately and protect the full cycle of assess, find, assign, resolve |
| Loom left to the last minute | Record at 13:00 on Wednesday after the walkthrough, leaving time to re-record |

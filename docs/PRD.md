
# SecureStart: Product Requirements Document

Version 1.0, capstone build (22 to 25 November 2026)
Owner: Malebo Nkuna
Related: [BUSINESS.md](../BUSINESS.md), [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md), [designs](./designs/)

---

## 1. Summary

SecureStart is a web app that helps small South African professional firms (accounting, law, medical and dental practices) find their cybersecurity and POPIA gaps, turn each gap into a tracked fix, and show how their security is improving over time.

**It is:** a guided assessment, a risk register and a remediation tracker.
**It is not:** a vulnerability scanner, an automated penetration test, or legal advice. This is stated in the app.

## 2. Goals and success measures

| Goal | Measure |
|---|---|
| A firm understands where it stands in under 20 minutes | A first assessment can be completed and scored in one sitting |
| Gaps become actions, not a report that gets filed away | Every "no" or "partly" answer produces a tracked finding |
| Fixes actually happen | Share of high-priority findings resolved within 30 days |
| Security visibly improves | Score change between first and latest assessment |

Non-goals for this build: automated scanning, payments and billing, email notifications, a mobile native app, multi-language support.

## 3. Users and roles

| Role | Who | Core need |
|---|---|---|
| **Business owner** | Owner or practice manager of one firm | A plain-language view of risk and progress |
| **Security administrator** | IT consultant or managed-service provider supporting one or more firms | Run assessments, manage and prioritise findings, and see all their client firms |

A user has exactly one role. An owner belongs to one firm. An administrator can be added to many firms.

## 4. Scope (MoSCoW)

**Must (day one):**
1. Authentication and two roles with backend-enforced permissions
2. Guided assessment with transparent scoring
3. Findings and remediation tracking (generated from assessment answers)
4. Risk dashboard

**Should (only if time allows):** CSV or printable report export, finding comments, assessment history comparison view.

**Could:** email invitations, due-date reminders.

**Won't (this build):** billing, notifications, system scanning, native mobile app.

## 5. Features and acceptance criteria

### 5.1 Authentication and roles

**User stories**
- As a new owner, I can sign up, choose the owner role, and create my firm so that I can start an assessment.
- As an administrator, I can sign up and be added to a client firm by its owner so that I can work on its findings.
- As any user, I can log in, log out and only ever see data from firms I belong to.

**Acceptance criteria**
- Sign up, log in and log out work with email and password.
- On first login an owner must create a firm (name, industry, size band) before reaching the dashboard.
- An owner can add an administrator to their firm by entering the email of an existing administrator account. If no such account exists, the app says so.
- Routes are protected: logged-out users are redirected to log in; owners cannot open administrator-only screens.
- Permissions are enforced by database row-level security, not only by hiding buttons (see section 8).

### 5.2 Guided assessment

**User stories**
- As an owner or administrator, I can complete an assessment one category at a time and save my progress so that I do not lose work.
- As a user, I can see how my score is calculated so that I trust it.

**Acceptance criteria**
- Questions are grouped into categories (for example access control, data protection, backups, email and browser protection, incident response, staff awareness, supplier management). Each question has plain-language guidance and, where relevant, a POPIA reference.
- Each question accepts Yes, Partly, No or Not applicable.
- Progress is saved as a draft and can be resumed.
- Submitting requires every question to be answered. Submitting locks the assessment and calculates the score.
- Score formula (shown in the app): each answer counts Yes = 1, Partly = 0.5, No = 0, multiplied by the question's weight. Not applicable questions are excluded. Score = earned weight divided by applicable weight, as a percentage.
- Question content is real and based on CIS Controls v8, Implementation Group 1, with POPIA references. There are no placeholder questions.

### 5.3 Findings and remediation tracking

**User stories**
- As an administrator, I can see every gap found in an assessment as a prioritised finding so that I know what to fix first.
- As an administrator, I can assign a finding, set a due date and change its status.
- As an owner, I can follow progress and mark a finding as resolved or as an accepted risk.

**Acceptance criteria**
- Submitting an assessment creates one finding for each question answered "No" or "Partly".
- Priority comes from the question's severity (Critical, High, Medium, Low). A "Partly" answer lowers the priority by one level, and the lowest level stays Low.
- One finding exists per firm and question. On a later assessment: a finding whose answer is now "Yes" is resolved automatically; a resolved finding whose answer worsens is reopened; open findings are not duplicated.
- Statuses: Open, In progress, Resolved, Accepted risk. Each status change records who changed it and when.
- Administrators can edit all finding fields (assignee, due date, notes, status). Owners can view all findings and change only status and notes.
- Findings list can be filtered by status and priority and sorted by due date.
- Overdue findings (past due date and not resolved or accepted) are clearly marked.

### 5.4 Risk dashboard

**User stories**
- As an owner, I can see my security score and what needs attention without reading a report.
- As an administrator, I can switch between client firms and compare their scores.

**Acceptance criteria**
- Dashboard shows: latest score, change since previous assessment, open findings by priority, remediation progress (resolved divided by total), top five open risks, and overdue count.
- A trend chart shows the score of each submitted assessment over time.
- With no submitted assessment, the dashboard shows an empty state that links to starting one.
- Administrators see a firm switcher and a list of their firms with latest score and open high-priority count.
- Numbers on the dashboard always match the underlying findings and assessments.

## 6. Key screens

Used as the brief for the Stitch designs. Each screen is designed for mobile and desktop.

1. Landing page with the pitch and a call to action
2. Sign up and log in
3. Firm setup (first login for owners)
4. Dashboard (owner view)
5. Administrator home with firm list and switcher
6. Assessment: category stepper with progress, one question card at a time on mobile
7. Assessment result: score, score explanation, generated findings
8. Findings list with filters
9. Finding detail with status, assignee, due date, notes and history
10. Firm settings with members

## 7. Data model

```
profiles          id (= auth user id), full_name, role ('owner' | 'administrator'), created_at
organizations     id, name, industry, size_band, created_by, created_at
org_members       org_id, user_id, member_role ('owner' | 'administrator')   PK (org_id, user_id)
questions         id, category, text, guidance, popia_ref, severity ('critical'|'high'|'medium'|'low'), weight, sort_order
assessments       id, org_id, started_by, status ('draft' | 'submitted'), score, submitted_at, created_at
answers           assessment_id, question_id, response ('yes'|'partly'|'no'|'na')   PK (assessment_id, question_id)
findings          id, org_id, question_id, first_assessment_id, priority, status, assignee_id, due_date, notes, resolved_at, created_at, updated_at   UNIQUE (org_id, question_id)
finding_events    id, finding_id, actor_id, from_status, to_status, note, created_at
```

## 8. Permission rules (enforced with row-level security)

| Table | Owner of the firm | Administrator in the firm | Anyone else |
|---|---|---|---|
| organizations | read and update own firm | read firms they belong to | no access |
| org_members | read own firm; add administrators | read firms they belong to | no access |
| questions | read | read | no access (read-only for all signed-in users, writable only by migrations) |
| assessments and answers | create, read, edit own drafts, submit | create, read, edit drafts, submit | no access |
| findings | read all; update status and notes only | read, create, update all fields | no access |
| finding_events | read | read, create | no access |

Rules to test explicitly: a user from firm A cannot read or write any row of firm B; an owner cannot change a finding's assignee or due date; a submitted assessment cannot be edited; an unauthenticated request reads nothing.

## 8.1 Security requirements

- Row-level security enabled on every table, with deny-by-default.
- No secrets in the repository. Environment variables only, with a committed `.env.example`.
- Input validation on all forms and database constraints on enums and ranges.
- Passwords handled by the auth provider; minimum length enforced.
- Dependency and secret scanning enabled on the repository.

## 9. Non-functional requirements

- Responsive from 360 px wide mobile to desktop, matching the Stitch designs.
- Accessible: keyboard navigable, visible focus, colour contrast of at least WCAG AA, labels on every input.
- Fast: pages usable on a mid-range phone on a typical South African mobile connection.
- Tested: scoring, priority and finding-generation logic covered by unit tests; permission rules covered by database tests.
- Quality gate: lint, typecheck, tests and build pass on every pull request.

## 10. Risks and open questions

| Risk | Mitigation |
|---|---|
| Question content takes too long to write | Start with about 30 well-chosen questions across the categories, seeded by migration |
| Row-level security bugs leak data between firms | Write the permission tests before the policies, and test with two seeded firms |
| Scope too large for three days | Hold to the four Must features; drop Should items first |
| Scoring is seen as a black box | Show the formula and each question's weight in the app |

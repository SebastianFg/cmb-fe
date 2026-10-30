# Commits and Branches Conventions

## Scope

These conventions define how to name branches, write commits, and prepare changes for review in GitLab.

The goal is to keep history readable, changes reviewable, and branches easy to understand.

---

## Core Principles

- Every commit must be self-contained
- Every commit should build and make sense on its own
- Keep commits small and focused
- Keep branches scoped to a single purpose
- Prefer readable history over noisy history
- Use imperative mood
- Keep descriptions concise

---

## Commits

### Format

```bash
<type>: <description>
```
## Examples

```bash
  feat: add retry strategy for failed requests
  fix: prevent empty verification code submission
  refactor: extract patient case form schema
  docs: update setup instructions
```
## Optional GitLab Issue Reference

When the work is linked to a GitLab issue, add the reference in the commit body or Merge Request.

```bash
  feat: add retry strategy for failed requests

  refs #45
```
## Notes

- GitLab issue references are optional
- Keep commit titles clean and scannable

## Commit Rules

- Use lowercase for type and description
- Do not end the subject with a period
- Use imperative mood (add, fix, remove, update)
- Keep subject under 72 characters
- Use single-line commits by default
- Add body only when necessary
- Avoid meaningless commits (wip, tmp, fix typo)
- Amend commits instead of stacking bad commits

## Commit Types

| Type       | Description                                   |
| ---------- | --------------------------------------------- |
| `feat`     | New feature or functionality                  |
| `fix`      | Bug fix                                       |
| `refactor` | Internal improvement without behavior changes |
| `docs`     | Documentation changes                         |
| `test`     | Add or update tests                           |
| `style`    | Formatting only, no logic change              |
| `perf`     | Performance improvements                      |
| `build`    | Build system or dependencies                  |
| `ci`       | CI/CD changes                                 |
| `chore`    | Maintenance tasks                             |

## Commit Message Philosophy

A good commit should complete this sentence:

> If applied, this commit will...

Examples:
```bash
feat: add user seeder
fix: resolve token counting for empty strings
style: format treatment plan form
refactor: simplify follow-up date mapping
```
## Breaking Changes

When a change introduces a breaking change, it must be clearly documented.

### Rules

- Do NOT use symbols like !
- Keep the commit message clean and readable
- Explain breaking changes in the commit body or Merge Request
- Always include what changed, why, and how to migrate
### Format

```bash
<type>: <description>

BREAKING CHANGE:
- what changed
- why it changed
- how to migrate
Example
feat: replace session-based auth with jwt

BREAKING CHANGE:
- login now returns accessToken and refreshToken
- session-based authentication was removed
- clients must send Authorization Bearer token
```
### When to Use

Only for real breaking changes such as:

- API contract changes
- request/response structure changes
- authentication flow changes
- shared configuration changes
### Recommendation

Also document breaking changes in the Merge Request:

- impact summary
- migration steps
- affected modules or endpoints

## Branches

### Format

```bash
<type>/<short-description>
Examples
feat/add-user-seeder
fix/token-counting-empty
refactor/extract-auth-middleware
docs/update-installation-guide
```

### Optional Issue in Branch Name

```bash
<type>/#<issue-number>-<short-description>
```

### Examples

```bash
feat/#45-add-user-seeder
fix/#312-token-counting-empty
refactor/#78-extract-auth-middleware
```

### Branch Rules

- Use lowercase only
- Use kebab-case
- Keep description short (2–5 words)
- Use imperative phrasing when possible
- One branch = one purpose
- Do not mix unrelated changes

### Before Pushing

Check:

- code builds
- types are correct
- no dead code
- imports are clean
- commit message is clear
- branch name is meaningful
- no unrelated files included

### Merge Request Readiness

A branch is ready when:

- scope is clear
- diff is focused
- commits are readable
- follows project conventions
- no obvious issues remain

### Avoid

- large branches with mixed concerns
- vague commit messages
- wip commits in shared history
- formatting noise mixed with logic changes
- hidden breaking changes

## Final Rule

Commits and branches must make intent obvious, keep history clean, and make GitLab reviews easier.

# React & Coding Conventions

## Scope

These conventions define how to build and maintain React code in this repository.

---

## Role

Act as a senior software engineer producing safe, maintainable, production-ready code with minimal disruption.

Think like a:

- Senior Front-End Engineer
- Full-Stack collaborator
- UI/UX-minded engineer
- TypeScript-first architect
- Refactoring specialist

---

## Core Principles

Always prioritize:

1. Correctness
2. Readability
3. Type safety
4. Reusability
5. Consistency
6. Minimal diffs
7. UX & Accessibility
8. Performance
9. Developer Experience

- Use **arrow functions by default**

---

## Default Stack

- React 19
- TypeScript (strict)
- Vite
- Tailwind CSS
- React Hook Form
- Zod
- TanStack Query
- date-fns
- lucide-icons

---

## Working Rules

- Inspect existing code before changing anything
- Reuse patterns before creating new ones
- Keep changes minimal and focused
- Avoid large refactors unless required
- Do not break APIs
- Preserve backward compatibility
- Follow existing architecture over idealized architecture

---

## Naming Conventions

### Files & Folders

- kebab-case

### Components

- PascalCase

### Hooks

- camelCase starting with `use`

### Variables & Functions

- camelCase

### Types

- PascalCase

---

## React Principles

- Small, focused components
- Prefer composition
- Avoid unnecessary re-renders
- Avoid unnecessary `useEffect`
- Prefer derived state

---

## Hooks

- Extract reusable logic
- Keep APIs simple
- Avoid multi-responsibility hooks

---

## State Management

- Prefer local state
- Avoid duplicating server state
- Keep state minimal

---

## Forms

- React Hook Form + Zod
- Keep schema and payload aligned

---

## Data Fetching

- Use TanStack Query
- Stable query keys
- Avoid duplicating server state

---

## UI & Styling

- Tailwind only
- No additional UI libraries
- Avoid inline styles

---

## TypeScript Rules

- No `any`
- Prefer `type` over `interface`
- Avoid unsafe casts

---

## Code Organization

- Colocate by feature
- Keep files cohesive

---

## Refactoring

- Preserve behavior
- Small steps
- Avoid over-engineering

---

## Debugging

- Fix root cause
- Verify types, state, and schema

---

## Output Rules

- Ready-to-commit code
- No dead code
- Clean imports

---

## Final Rule

Every change must feel like it was made by a senior engineer focused on maintainability, correctness, and real-world constraints.

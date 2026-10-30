# Coding Conventions

Applied during development and code review. Each criterion is evaluated independently.

These conventions are aligned with the repository standards for React, TypeScript, Tailwind CSS, React Hook Form, Zod, TanStack Query, and feature-based organization.

---

## 1. Code Quality

- **Naming** — variables, functions, components, hooks, types, and files must be self-explanatory and use domain language
- **Complexity** — prefer simple control flow, early returns, and guard clauses over deep nesting
- **Dead code** — no commented-out code, unused imports, unused variables, unreachable branches, or debug logs
- **KISS** — implement the simplest solution that solves the current requirement without over-engineering
- **Single responsibility** — each component, hook, helper, and function should have one clear responsibility
- **Minimal diffs** — changes should stay scoped to the requested task and avoid unrelated rewrites

---

## 2. React Design

- **Small components** — components should be focused, readable, and easy to scan
- **Composition** — prefer composition over complex component logic
- **Hooks extraction** — extract reusable logic into hooks when it improves clarity or reuse
- **Derived state** — prefer derived state over duplicated state
- **Effects** — avoid `useEffect` unless it is truly necessary
- **Render stability** — avoid unnecessary re-renders caused by unstable props, derived values, or duplicated state
- **Local patterns** — follow existing component, form, and query patterns before introducing a new approach

---

## 3. Type Safety

- **No `any`** — do not use `any`
- **No unsafe casts** — avoid `as any`, broad casts, or type workarounds that hide real problems
- **Explicit exports** — prefer explicit types on exported functions, hooks, and public utilities
- **Types over interfaces** — use `type` over `interface`
- **Discriminated unions** — prefer discriminated unions when they improve safety and readability
- **Simple generics** — keep generics small and understandable
- **Null safety** — guard against nullable and optional values intentionally
- **No optional abuse** — do not make fields optional unless the domain truly requires it

---

## 4. Forms & Validation

- **React Hook Form + Zod** — forms must follow the established RHF + Zod pattern
- **Schema alignment** — schema, default values, UI fields, and payload must stay aligned
- **FormProvider** — use `FormProvider` when form state must be shared with nested components
- **useFormContext** — use `useFormContext` in nested form components when appropriate
- **Validation UX** — validation must be clear, user-friendly, and consistent
- **No mixed paradigms** — do not mix incompatible form patterns in the same form
- **Reusable fields** — reuse existing field patterns before creating new abstractions
- **Readable schemas** — keep Zod schemas readable and use domain-oriented naming such as `planSchema`

---

## 5. Data Fetching & Server State

- **TanStack Query patterns** — follow the existing query and mutation patterns used in the codebase
- **Stable query keys** — query keys must be stable and predictable
- **Server state** — do not duplicate server state in local component state without a strong reason
- **Invalidation** — invalidate or update queries correctly after mutations
- **Async safety** — no unhandled promises, missing `await`, or race-prone flows
- **Boundaries** — keep server communication concerns separated from UI rendering concerns

---

## 6. Styling & UI

- **Tailwind only** — use Tailwind CSS only
- **No extra UI libraries** — do not introduce Chakra UI, MUI, or other UI libraries
- **No inline styles** — avoid inline styles unless there is a real technical reason
- **Clean classNames** — keep classNames readable, ordered, and consistent with local patterns
- **Reusable UI patterns** — reuse existing spacing, layout, form, card, and button patterns before inventing new ones
- **Responsive by default** — all UI must be responsive by default
- **Mobile-first** — design and review with mobile-first behavior in mind
- **UI states** — include loading, empty, and error states when relevant
- **No overdesign** — match the existing design language and avoid unnecessary visual complexity

---

## 7. Accessibility & UX

- **Semantic HTML** — use semantic HTML whenever possible
- **Labels** — interactive elements and form fields must have proper labels
- **Keyboard support** — interactive flows must remain usable with keyboard navigation
- **No fake interactions** — avoid clickable non-interactive elements without proper semantics
- **Consistency** — UX should feel clean, predictable, and aligned with existing flows
- **User feedback** — important user actions and validation states should be visible and understandable

---

## 8. Naming & Organization

- **Files and folders** — use kebab-case
- **Components** — component names use PascalCase, files use kebab-case
- **Hooks** — hook names use camelCase starting with `use`, files use kebab-case
- **Variables and functions** — use camelCase
- **Types** — use PascalCase
- **Constants** — use `UPPER_SNAKE_CASE` for global constants and camelCase for local constants
- **Schemas** — use camelCase plus `Schema`
- **Feature colocation** — colocate files by feature when possible
- **Cohesive files** — keep files cohesive and avoid generic helper dumping grounds
- **Avoid vague names** — avoid names like `data`, `helper`, `temp`, or other low-signal naming

---

## 9. Dates & Domain Values

- **date-fns only** — use `date-fns` only for date manipulation and formatting
- **No mixed date libraries** — do not introduce multiple date libraries
- **No manual formatting** — avoid manual date formatting if an existing utility or standard pattern exists
- **Options pattern** — for selects and options, keep values in English and labels in the UI language
- **Alignment** — keep schema, UI, and API representations aligned

---

## 10. Architecture & Maintainability

- **Feature-based organization** — prefer feature-based architecture
- **Reusable components** — extract reusable pieces when it improves clarity and reuse
- **Behavior preservation** — refactors must preserve behavior
- **Small refactors** — refactor in small, safe steps
- **No unrelated rewrites** — do not rewrite unrelated code during a focused task
- **Backward compatibility** — do not break existing APIs or contracts without intention and documentation
- **Existing architecture first** — prefer the local architecture over an idealized redesign

---

## 11. Risk & Safety

- **Breaking changes** — changes to shared types, exported APIs, reusable hooks, or common UI contracts must be intentional and documented
- **Edge cases** — handle nullish values, empty arrays, empty strings, loading states, and error states
- **Error handling** — catch errors at boundaries and keep internal logic predictable
- **Security** — do not hardcode secrets or trust unsafe input
- **Impact review** — consider impact on forms, API integration, routing, layout, and shared components before merging
- **Root cause** — fix the root cause, not just the visible symptom

---

## 12. Output Rules

- **Ready to commit** — code should be ready to commit
- **No dead code** — remove unused code before finishing
- **No unnecessary comments** — do not add comments that explain obvious code
- **Clean imports** — keep imports clean and relevant
- **Brief explanation when useful** — explain decisions briefly when they are not obvious

---

## 13. Avoid

- `any`
- unsafe casts
- large monolithic components
- unnecessary dependencies
- unrelated rewrites
- mixed styling systems
- bypassing validation
- duplicating server state locally without reason
- using `useEffect` as a default solution
- abstractions with no real reuse value

---

## Final Rule

Every change must feel like it was made by a senior engineer focused on maintainability, correctness, UI quality, and real-world constraints.

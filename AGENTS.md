# Agent Instructions & Project Standards

Welcome. This file outlines how you should operate within this codebase to ensure consistency and high-quality output.

**Always verify implemented changes by running `bun run typecheck`, `bun run lint`, and `bun run format` before concluding the task. Explicitly add this as a final step to your tasks/plans.**

**TypeScript**
Avoid using `interface`. Use `type` for all object and component definitions to maintain consistency across the codebase.
Avoid `as any` wherever possible.

**Vue**
Use the Vue 3.5+ `useTemplateRef('refName')` composable for DOM element access.

**Events**
All socket events must be defined and typed in `shared/events.ts`.
Use `socket.emitWithAck` for request-response flows.
Check the `res.success` flag in response objects and handle `false` values by reverting optimistic updates or showing toasts.

**Snapping**
Respect the `altKeyPressed` state from `@/state.ts` to allow users to bypass quantization when it makes sense to do so.

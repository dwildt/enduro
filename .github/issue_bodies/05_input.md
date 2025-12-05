Title: Input abstraction (desktop & mobile)

Specs: specs/game-spec.md

Summary:
Create input.js to unify keyboard, mouse and touch (PointerEvent) into high-level actions (moveLeft/moveRight/brake/pause). Include tap zones and swipe mapping.

Acceptance criteria:
- Unit tests map pointer/keyboard events to expected actions.
- Manual touch checks work on mobile.
- Lint passes.

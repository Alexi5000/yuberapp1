# `client/src/components/ui/`

UI component library used across the client. This includes both custom components and Radix-based primitives.

## Notes

- `button.tsx` is the shared button implementation and exports `buttonVariants(...)` for components that need class generation.
- Components are written to work with strict TypeScript settings (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).

# `client/src/components/ui/`

UI primitives and design-system components.

## What lives here

- Buttons, inputs, modals, menus, overlays, form primitives.
- Radix UI-based components and utility wrappers.

## Conventions

- Keep primitives small and reusable.
- Prefer composition over one-off variants.



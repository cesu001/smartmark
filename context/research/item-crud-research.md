# Item CRUD Architecture

## Output

`docs/item-crud-architecture.md`

## Research

Document CRUD system for this project:

- Mutations (create, update, delete) in one action file
- Data fetching in lib/db (called directly from server components)
- APIs

## Include

- File structure (actions for mutations, lib/db for queries, routes, components)
- How note, collection, tag routing works
- Where type-specific logic lives (components, not actions)
- Component responsibilities

## Sources

- @context/project-overview.md
- @prisma/schema.prisma

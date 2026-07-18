# Note Drawer Spec

## Overview

This is a component that shows below the tab when a note opens at @dashboad/workbench/page.tsx. There's read mode as default when open a note, and a toggle can switch to edit mode. It shows infomation about note at top section, and text at below. Text will show rendered markdown.

## Requirements

- Use context7 mcp to check docs of tiptap.
- In read mode, it shows rendered markdown.
- In edit mode, it will show rendered markdown directly when user type markdown format text.
- Build component with shadcn.
- Build POST API for submit.
- Use delete API that already exists.
- Detect if note is a new one, or already exists to determine submit button showing add or save.
- Collection is required to be chosen, and there's only one.

> **No longer required (2026-07-17).** A note saved without a collection stays uncategorized (`collectionId = null`). This spec's "required" rule was implemented by auto-assigning a "Draft" collection in `updateNote`; that fallback was removed once every other layer (schema, Zod, UI copy, read mode, `createNote`) already treated collections as optional.
- Tags can be chosen in no limit.

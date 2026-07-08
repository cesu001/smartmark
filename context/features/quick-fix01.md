# Quick Fix 01

## Overview

Some UI and function quick fix.

## Requirements

- Remove add button in pinned note page
- Add handler for add button in all note page. It should open a new note in workbench.
- Remove add button in each collection and tag page.
- In collection and tag page, make user can add them to favorite by clicking folder and tag icon. Style change for before-after is like one in note drawer.
- Change tag icon in sidebar to the one in tag page.
- Change icon for pinned note in quick access. I want the "pin" one.
- Comment out element for setting in sidebar. Not gonna to show it now.

## Follow-up Requirements (added during implementation)

- Make the sidebar collection and tag favorite icon use the same active style as the collection/tag page (`text-primary/30` + `fill-current`), replacing the old green treatment.
- The sidebar favorite icon should update right after toggling favorite on the collection/tag page.
- The Favorites count in Quick Access should include favorite collections and tags, not just favorite notes (match the favorites page).
- A note opened from the all-notes "add" card should open in edit mode (same as the workbench "+" button).
- Fix: note-card borders were clipped on the top row of the collection/tag/all-notes/pinned grids (the `overflow-y-auto` container clipped the card ring).

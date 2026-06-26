# Sidebar Hover Menu Spec

## Overview

There are collections and tags displaying at sidebar. Add feature that shows notes in a menu for each collections or tag when user's cursor hover on it.

## Requirements

- Menu expands from left to right align the sidebar border with height and opacity change transition.
- Menu for every collection and tag shows the same width. Height is depend on content.
- Truncate note's title if need.
- When clicking note's title, direct user to workbench and open tab and drawer if user is not at workbench. If user already in workbench and click a note, open new tab and drawer for it.
- Use Shadcn UI to implement, check context7 mcp if you need.

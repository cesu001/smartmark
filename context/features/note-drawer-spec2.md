# Note Drawer Spec 2

## Overview

Build function for closing tab in @src/app/dashboard/workbench/page.tsx, add plus icon on tab bar for opening new note drawer. Add create date and update time dipsplay for drawer.

## Requirements

- Plus icon always be next to opened tab. If no opened tab, it will be next to back-to-dashboard button. Once clicking plus icon, the icon will dispear. It shows again after note creating or cancelling. Once new note finished, add note id to url, make it be opened.
- Closing tab function will remove note id at url, and close the note(tab and drawer for it).
- Date can't be modified by users, only set date when first time creating note and set update date after editing.

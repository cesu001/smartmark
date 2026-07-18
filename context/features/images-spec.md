# Images Spec

## Overview

Add image upload using Cloudflare R2 storage. Make user can upload their avatar in profile page.

## Requirements

- Create upload API route for R2
- Stick to lib/db/items.ts for prisma/db functions
- Create a image upload button in profile page
- Delete files from R2 when items are deleted
- Show upload progress indicator

## File Constraints

| Type   | Max Size | Extensions                                |
| ------ | -------- | ----------------------------------------- |
| Images | 5 MB     | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`  |

> **`.svg` was removed on 2026-07-18** (originally listed here and implemented).
> SVGs can embed `<script>`/`on*` handlers that execute when the uploaded file is
> opened as a top-level document via its public R2 URL, and `validateAvatarFile`
> trusts only the client-supplied extension and mime type. Do not re-add without
> sanitizing file contents server-side before `uploadToR2`.

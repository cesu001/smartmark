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

| Type   | Max Size | Extensions                                       |
| ------ | -------- | ------------------------------------------------ |
| Images | 5 MB     | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg` |

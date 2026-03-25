# Seed Data Specification

## Overview

Create a seed script (`prisma/seed.ts`) to populate the database with sample data for development and demos.

## Requirements

### User

- **Email:** demo@smartmark.io
- **Name:** Demo User
- **Password:** 12345678 (hash with bcryptjs, 12 rounds)
- **isPro:** false
- **emailVerified:** current date

### Collections & Notes

| Collection | isFavorite |
| :--- | :--- |
| Web Development | true |
| Machine Learning | false |
| Design Systems | true |
| Meeting Notes | false |
| Testing | false |

### Tags

| Tag | isAiGenerated |
| :--- | :--- |
| React | false |
| TypeScript | false |
| API Design | false |
| Database | false |
| Authentication | false |
| Performance | false |
| Testing | false |
| CSS | false |

### Notes

| Title | Collection | Tags | isPinned | isFavorite |
| :--- | :--- | :--- | :--- | :--- |
| React Server Components Guide | Web Development | React, TypeScript | true | false |
| PostgreSQL Performance Tips | Web Development | Database, Performance | true | false |
| Weekly Team Standup Notes | Meeting Notes | — | false | false |
| Neural Network Fundamentals | Machine Learning | API Design | false | false |
| Design Token System | Design Systems | CSS | false | true |
| Authentication Best Practices | Web Development | Authentication | false | false |
| Component Testing with Vitest | Testing | Testing, React | false | false |
| Transformer Architecture Notes | Machine Learning | — | false | false |

### Implementation Notes

- Script uses `upsert` throughout — safe to re-run without duplicating data
- Collections and Tags are looked up by `userId + name` before upsert (no compound unique on schema)
- Neon adapter pattern matches `scripts/test-db.ts`
- Run with: `npx prisma db seed`
- Requires `bcryptjs` + `@types/bcryptjs` installed

Generate a history entry for today's work and commit it.

## Steps

1. Run `git diff HEAD` and `git status` to understand what changed in this session.
2. Run `git log --oneline -5` to see recent commit messages for context.
3. Read `context/current-feature.md` to see the existing history entries and their format.
4. Write a concise single-line history entry (past tense, starts with a capital letter) summarizing what was implemented or changed today. Match the style of existing entries — e.g. "Implemented X. Created Y component. Added Z route."
5. Append the new entry to the `## History` section in `context/current-feature.md` using today's date in `YYYY-MM-DD` format. Format: `- **YYYY-MM-DD** — <summary>`
6. Stage `context/current-feature.md` and any other modified files that are part of this feature work.
7. Show the user the proposed commit message and ask for approval before committing.
8. Once approved, commit with a conventional commit message (e.g. `feat:`, `fix:`, `chore:`). Do NOT include Co-Authored-By or any Claude attribution in the commit message.

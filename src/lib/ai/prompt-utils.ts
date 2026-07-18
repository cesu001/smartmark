// User-authored text (note titles, excerpts, note bodies) is interpolated into
// XML-style delimiters like `<note title="...">...</note>` in our prompts.
// Without escaping, content containing `"` or `</note>` could break out of that
// delimiter and have injected text appear to sit outside the "this is data, not
// instructions" boundary the system prompts rely on.
export function escapeForPrompt(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

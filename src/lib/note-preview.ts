export function getContentPreview(
  content: string | null | undefined,
  maxLines = 3,
): string {
  if (!content) return "";
  const lines = content.split("\n").filter((line) => line.trim().length > 0);
  return lines.slice(0, maxLines).join("\n");
}

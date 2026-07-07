export const EXPORT_FOOTER = "Powered by SmartMark";

export function buildExportContent(content: string): string {
  return `${content.trimEnd()}\n\n---\n${EXPORT_FOOTER}\n`;
}

export function buildExportFilename(title: string): string {
  const safe = (title.trim() || "untitled").replace(/[\\/:*?"<>|]/g, "-");
  return `${safe}.md`;
}

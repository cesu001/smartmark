const ALLOWED_IMPORT_EXTENSIONS = [".md", ".txt"];
const MAX_IMPORT_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface ImportFileValidation {
  valid: boolean;
  error?: string;
}

function getFileExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx === -1 ? "" : filename.slice(idx).toLowerCase();
}

export function validateImportFile(file: { name: string; size: number }): ImportFileValidation {
  const ext = getFileExtension(file.name);
  if (!ALLOWED_IMPORT_EXTENSIONS.includes(ext)) {
    return { valid: false, error: "Only .md and .txt files can be imported." };
  }
  if (file.size > MAX_IMPORT_FILE_SIZE) {
    return { valid: false, error: "File is too large (max 5MB)." };
  }
  return { valid: true };
}

export function deriveTitleFromFilename(filename: string): string {
  const idx = filename.lastIndexOf(".");
  const base = idx === -1 ? filename : filename.slice(0, idx);
  return base.trim() || "Untitled Note";
}

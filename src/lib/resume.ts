import { existsSync } from "node:fs";
import path from "node:path";

export const RESUME_PDF_FILENAME = "resume.pdf";
export const RESUME_PDF_HREF = `/${RESUME_PDF_FILENAME}`;

export function resumePdfFilePath(cwd = process.cwd()): string {
  return path.join(cwd, "public", RESUME_PDF_FILENAME);
}

export function hasResumePdf(cwd = process.cwd()): boolean {
  return existsSync(resumePdfFilePath(cwd));
}

import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { hasResumePdf, RESUME_PDF_HREF, resumePdfFilePath } from "./resume";

assert.equal(RESUME_PDF_HREF, "/resume.pdf");
assert.equal(resumePdfFilePath("/repo"), path.join("/repo", "public", "resume.pdf"));

const missingRoot = mkdtempSync(path.join(tmpdir(), "codesoul-resume-"));
assert.equal(hasResumePdf(missingRoot), false);

const presentRoot = mkdtempSync(path.join(tmpdir(), "codesoul-resume-"));
mkdirSync(path.join(presentRoot, "public"));
writeFileSync(path.join(presentRoot, "public", "resume.pdf"), "%PDF-1.4");
assert.equal(hasResumePdf(presentRoot), true);

rmSync(missingRoot, { recursive: true, force: true });
rmSync(presentRoot, { recursive: true, force: true });

console.log("resume.test.ts ok");

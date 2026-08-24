import type { Metadata } from "next";
import { ResumeViewer } from "@/components/ResumeViewer";
import { Shell } from "@/components/Shell";
import { site } from "@/content/site";
import { hasResumePdf, RESUME_PDF_FILENAME, RESUME_PDF_HREF } from "@/lib/resume";

export const metadata: Metadata = {
  title: site.resume.title,
  description: site.resume.subtitle,
};

export default function ResumePage() {
  const available = hasResumePdf();

  return (
    <Shell>
      <header className="page-header">
        <h1>{site.resume.title}</h1>
        <p className="codesoul-subtitle-lg">{site.resume.subtitle}</p>
      </header>
      {available ? (
        <>
          <p className="resume-actions">
            <a href={RESUME_PDF_HREF} download={RESUME_PDF_FILENAME}>
              {site.resume.download}
            </a>
          </p>
          <ResumeViewer src={RESUME_PDF_HREF} />
        </>
      ) : (
        <article className="glass-card stack">
          <p className="codesoul-subtitle-md">{site.resume.missing}</p>
          <p className="codesoul-subtitle-sm">
            <code>{site.resume.fileHint}</code>
          </p>
        </article>
      )}
    </Shell>
  );
}

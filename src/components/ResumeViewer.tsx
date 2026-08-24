"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { site } from "@/content/site";

const workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

export function ResumeViewer({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    let loadingTask: PDFDocumentLoadingTask | null = null;

    async function load() {
      const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
      GlobalWorkerOptions.workerSrc = workerSrc;
      loadingTask = getDocument({ url: src });
      try {
        const pdf = await loadingTask.promise;
        if (cancelled) {
          await loadingTask.destroy();
          return;
        }
        pdfRef.current = pdf;
        setPageCount(pdf.numPages);
        setStatus("ready");
      } catch {
        await loadingTask.destroy();
        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
      void loadingTask?.destroy();
      pdfRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    if (status !== "ready" || pageCount === 0) {
      return;
    }

    const container = containerRef.current;
    const pdf = pdfRef.current;
    if (!container || !pdf) {
      return;
    }

    let cancelled = false;
    let frame = 0;
    let lastWidth = 0;
    const tasks: RenderTask[] = [];

    const draw = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        void (async () => {
          const width = container.clientWidth;
          if (width === 0 || width === lastWidth || cancelled) {
            return;
          }
          lastWidth = width;
          const dpr = window.devicePixelRatio || 1;

          for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
            const canvas = canvasRefs.current[pageNumber - 1];
            if (!canvas) {
              continue;
            }
            const page = await pdf.getPage(pageNumber);
            if (cancelled) {
              return;
            }
            const unscaled = page.getViewport({ scale: 1 });
            const scale = width / unscaled.width;
            const viewport = page.getViewport({ scale: scale * dpr });
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const context = canvas.getContext("2d");
            if (!context) {
              continue;
            }
            const renderTask = page.render({
              canvas,
              canvasContext: context,
              viewport,
            });
            tasks.push(renderTask);
            try {
              await renderTask.promise;
            } catch {
              // Cancelled renders throw; a later pass will draw again.
            }
          }
        })();
      });
    };

    const observer = new ResizeObserver(draw);
    observer.observe(container);
    draw();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      tasks.forEach((task) => task.cancel());
    };
  }, [status, pageCount]);

  return (
    <div className="resume-viewer" ref={containerRef} aria-busy={status === "loading"}>
      {status === "loading" ? <p className="codesoul-subtitle-md">{site.resume.loading}</p> : null}
      {status === "error" ? <p className="codesoul-subtitle-md">{site.resume.error}</p> : null}
      {status === "ready"
        ? Array.from({ length: pageCount }, (_, index) => (
            <div className="resume-page" key={index}>
              <canvas
                aria-label={`${site.resume.title}第 ${index + 1} 页`}
                ref={(node) => {
                  canvasRefs.current[index] = node;
                }}
              />
            </div>
          ))
        : null}
    </div>
  );
}

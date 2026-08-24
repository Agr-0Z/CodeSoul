"use client";

export function SkillDownloadButton({ filename, raw }: { filename: string; raw: string }) {
  function download() {
    const blob = new Blob([raw], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      className="skill-download codesoul-subtitle-sm"
      onClick={(event) => {
        event.stopPropagation();
        download();
      }}
    >
      下载源文件
    </button>
  );
}

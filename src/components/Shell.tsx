import { Nav } from "./Nav";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="aurora" aria-hidden="true" />
      <div className="shell">
        <div className="shell-inner">
          <Nav />
          <main>{children}</main>
        </div>
      </div>
    </>
  );
}

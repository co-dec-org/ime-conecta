import type { ReactNode } from "react";

type LayoutProps = {
  header: ReactNode;
  rail: ReactNode;
  footer: ReactNode;
  children: ReactNode;
};

export default function Layout({ header, rail, footer, children }: LayoutProps) {
  return (
    <div className="app-shell">
      {header}
      <div className="layout-grid">
        {rail}
        <main className="main-content">{children}</main>
      </div>
      {footer}
    </div>
  );
}

import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "IME Hub",
  description: "Gestión operativa privada de proyectos gremiales IME Chile A.G.",
  robots: {
    index: false,
    follow: false
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

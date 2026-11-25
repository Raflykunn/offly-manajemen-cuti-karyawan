"use client";

import "./globals.css";
import TampilanKesalahanServer from "@/components/tata-letak/TampilanKesalahanServer";

export default function KesalahanGlobal({ error, reset }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TampilanKesalahanServer error={error} reset={reset} />
      </body>
    </html>
  );
}

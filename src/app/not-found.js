import Link from "next/link";
import { ArrowLeft, CalendarOff, Home, LayoutDashboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

export const metadata = {
  title: "404 — Halaman Tidak Ditemukan | Offly",
  description: "Halaman yang Anda cari tidak ditemukan atau telah dipindahkan.",
};

export default function HalamanTidakDitemukan() {
  return (
    <main className="relative flex min-h-screen flex-1 flex-col items-center justify-center overflow-hidden bg-background px-4 py-16 text-foreground">
      {/* Latar dekoratif halus */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,oklch(0.7686_0.1647_70.0804_/_0.12),transparent_55%)]"
      />

      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-accent text-accent-foreground">
          <CalendarOff className="size-7" />
        </div>

        <Badge variant="secondary" className="mb-4 font-mono text-xs tracking-wider">
          GALAT 404
        </Badge>

        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Halaman Tidak Ditemukan
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Maaf, halaman yang Anda tuju tidak tersedia, sudah dipindahkan, atau
          alamat URL yang dimasukkan kurang tepat.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/dasbor"
            className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
          >
            <LayoutDashboard className="size-4" />
            Ke Dasbor
          </Link>

          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full sm:w-auto"
            )}
          >
            <Home className="size-4" />
            Kembali ke Beranda
          </Link>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Offly — Sistem Manajemen Cuti Karyawan
          </Link>
        </div>
      </div>
    </main>
  );
}

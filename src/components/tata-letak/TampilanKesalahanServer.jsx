"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, Home, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TampilanKesalahanServer({ error, reset }) {
  return (
    <main className="flex min-h-dvh flex-1 flex-col items-center justify-center bg-background px-4 py-16 text-foreground">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-xs sm:p-10">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10 text-destructive">
          <AlertTriangle className="size-7" aria-hidden="true" />
        </div>

        <Badge variant="secondary" className="mb-4 font-mono text-xs tracking-wider">
          KODE 500
        </Badge>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Terjadi Kesalahan Server
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Maaf, sistem sedang mengalami kendala saat memproses permintaan Anda. Silakan muat ulang halaman atau kembali ke beranda.
        </p>

        {error?.digest && (
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            Kode referensi: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {typeof reset === "function" && (
            <Button
              type="button"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => reset()}
            >
              <RotateCcw className="size-4 mr-1.5" aria-hidden="true" />
              Coba Lagi
            </Button>
          )}

          <Button
            nativeButton={false}
            render={<Link href="/" />}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Home className="size-4 mr-1.5" aria-hidden="true" />
            Kembali ke Beranda
          </Button>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <Link
            href="/dasbor"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Offly | Sistem Manajemen Cuti Karyawan
          </Link>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { ArrowLeft, FileSearch, Home, LayoutDashboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TampilanTidakDitemukan({
  kode = "404",
  judul = "Halaman Tidak Ditemukan",
  pesan = "Halaman yang Anda tuju tidak tersedia, sudah dipindahkan, atau alamat URL yang dimasukkan kurang tepat.",
  tautanUtama = "/dasbor",
  labelUtama = "Ke Dasbor",
  tautanSekunder = "/",
  labelSekunder = "Kembali ke Beranda",
  dalamDasbor = false,
}) {
  const IkonUtama = dalamDasbor ? ArrowLeft : LayoutDashboard;

  return (
    <main
      className={
        dalamDasbor
          ? "flex flex-1 items-center justify-center py-12 px-4"
          : "flex min-h-dvh flex-1 flex-col items-center justify-center bg-background px-4 py-16 text-foreground"
      }
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-xs sm:p-10">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-accent text-accent-foreground">
          <FileSearch className="size-7" aria-hidden="true" />
        </div>

        <Badge variant="secondary" className="mb-4 font-mono text-xs tracking-wider">
          KODE {kode}
        </Badge>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {judul}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {pesan}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            nativeButton={false}
            render={<Link href={tautanUtama} />}
            size="lg"
            className="w-full sm:w-auto"
          >
            <IkonUtama className="size-4 mr-1.5" aria-hidden="true" />
            {labelUtama}
          </Button>

          <Button
            nativeButton={false}
            render={<Link href={tautanSekunder} />}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Home className="size-4 mr-1.5" aria-hidden="true" />
            {labelSekunder}
          </Button>
        </div>

        {!dalamDasbor && (
          <div className="mt-6 border-t border-border pt-5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Offly | Sistem Manajemen Cuti Karyawan
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

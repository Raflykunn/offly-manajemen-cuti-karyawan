"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, CalendarDays, Clock } from "lucide-react";
import { formatAngkaKuota, labelPeranPengguna } from "@/lib/kalkulasi-cuti";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import BilahSisiNavigasi from "./BilahSisiNavigasi";
import LoncengNotifikasi from "./LoncengNotifikasi";
import TombolTema from "./TombolTema";

function ambilInisialNama(nama) {
  if (!nama) return "OF";
  return nama
    .split(" ")
    .slice(0, 2)
    .map((bagian) => bagian[0]?.toUpperCase() || "")
    .join("");
}

function JamNavbar() {
  const [waktuTeks, aturWaktuTeks] = useState("");

  useEffect(() => {
    const pemformat = new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const perbarui = () => aturWaktuTeks(pemformat.format(new Date()));
    perbarui();
    const pengatur = setInterval(perbarui, 1000);
    return () => clearInterval(pengatur);
  }, []);

  if (!waktuTeks) return null;

  return (
    <span
      aria-label="Waktu saat ini"
      className="hidden md:inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2.5 h-8 text-xs font-mono tabular-nums text-muted-foreground"
    >
      <Clock className="size-3.5 text-primary" aria-hidden="true" />
      {waktuTeks}
    </span>
  );
}

export default function KerangkaDasbor({
  pengguna,
  notifikasi,
  jumlahBelumDibaca,
  children,
}) {
  const [menuSelulerTerbuka, aturMenuSelulerTerbuka] = useState(false);

  const tampilkanKuotaHeader =
    pengguna?.peran === "karyawan" || pengguna?.peran === "ketua_divisi";

  return (
    <div className="min-h-screen w-full flex bg-muted/25">
      <aside className="hidden lg:block w-64 shrink-0 border-r border-sidebar-border bg-sidebar sticky top-0 h-screen">
        <BilahSisiNavigasi pengguna={pengguna} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-14 border-b bg-background/95 backdrop-blur-xs px-4 md:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Sheet
              open={menuSelulerTerbuka}
              onOpenChange={aturMenuSelulerTerbuka}
            >
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="lg:hidden shrink-0"
                    aria-label="Buka menu navigasi"
                  />
                }
              >
                <Menu className="size-4" />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <BilahSisiNavigasi
                  pengguna={pengguna}
                  saatPilihMenu={() => aturMenuSelulerTerbuka(false)}
                />
              </SheetContent>
            </Sheet>

            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                Halo, {pengguna?.nama_lengkap}
              </p>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Peran Aktif: {labelPeranPengguna(pengguna?.peran)}
                {pengguna?.nama_divisi ? ` • Divisi ${pengguna.nama_divisi}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {tampilkanKuotaHeader && (
              <Badge
                variant="outline"
                className="hidden sm:inline-flex items-center gap-1.5 bg-accent/60 text-accent-foreground border-primary/30 px-2.5 py-1 h-7"
              >
                <CalendarDays className="size-3.5 text-primary" />
                <span className="text-xs font-medium">
                  Sisa Kuota: {formatAngkaKuota(pengguna?.sisa_kuota_cuti)} Hari
                </span>
              </Badge>
            )}

            <JamNavbar />

            <LoncengNotifikasi
              notifikasi={notifikasi}
              jumlahBelumDibaca={jumlahBelumDibaca}
            />

            <TombolTema />

            <Link
              href="/profil"
              className="flex items-center gap-2 rounded-full hover:opacity-85 transition-opacity"
              title="Buka Profil Saya"
            >
              <Avatar className="size-8 border">
                {pengguna?.foto_profil && (
                  <AvatarImage
                    src={pengguna.foto_profil}
                    alt={pengguna.nama_lengkap}
                  />
                )}
                <AvatarFallback className="bg-primary/15 text-accent-foreground text-xs font-semibold">
                  {ambilInisialNama(pengguna?.nama_lengkap)}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

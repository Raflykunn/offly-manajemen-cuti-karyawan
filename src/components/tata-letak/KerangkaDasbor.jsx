"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck2, CalendarDays, Clock, Menu } from "lucide-react";
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
    const formatTanggal = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const formatJam = new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const perbarui = () => {
      const sekarang = new Date();
      aturWaktuTeks(
        `${formatTanggal.format(sekarang)} • ${formatJam.format(sekarang).replaceAll(".", ":")}`
      );
    };
    perbarui();
    const pengatur = setInterval(perbarui, 30000);
    return () => clearInterval(pengatur);
  }, []);

  if (!waktuTeks) return null;

  return (
    <span
      aria-label="Waktu saat ini"
      className="hidden xl:inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2.5 h-8 text-xs font-mono tabular-nums text-muted-foreground whitespace-nowrap"
    >
      <Clock className="size-3.5 text-primary shrink-0" aria-hidden="true" />
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
    <div className="min-h-screen w-full flex flex-col bg-muted/25">
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-xs focus:font-semibold focus:text-primary-foreground shadow-md"
      >
        Lewati ke konten utama
      </a>

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
                  className="lg:hidden shrink-0 size-11 sm:size-9"
                  aria-label="Buka menu navigasi"
                />
              }
            >
              <Menu className="size-4" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <BilahSisiNavigasi
                pengguna={pengguna}
                saatPilihMenu={() => aturMenuSelulerTerbuka(false)}
              />
            </SheetContent>
          </Sheet>

          <div className="flex items-center shrink-0 lg:w-[calc(16rem-1.5rem)] lg:h-14 lg:border-r lg:border-sidebar-border lg:pr-4">
            <Link
              href="/dasbor"
              className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <CalendarCheck2 className="size-4" aria-hidden="true" />
              </span>
              <span className="font-bold tracking-tight text-base text-foreground">
                Offly
              </span>
            </Link>
          </div>

          <span
            className="hidden sm:block lg:hidden h-5 w-px bg-border shrink-0"
            aria-hidden="true"
          />

          <div className="min-w-0 hidden sm:block">
            <p className="text-sm font-semibold truncate">
              Halo, {pengguna?.nama_lengkap}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
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

      <div className="flex-1 flex min-w-0">
        <aside className="hidden lg:block w-64 shrink-0 border-r border-sidebar-border bg-sidebar sticky top-14 h-[calc(100vh-3.5rem)]">
          <BilahSisiNavigasi pengguna={pengguna} tampilkanLogo={false} />
        </aside>

        <main
          id="konten-utama"
          tabIndex={-1}
          className="flex-1 min-w-0 p-4 md:p-6 max-w-7xl w-full mx-auto outline-none"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

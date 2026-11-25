"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarCheck2,
  CalendarCog,
  CalendarPlus,
  CheckSquare,
  ClipboardCheck,
  History,
  LayoutDashboard,
  ListChecks,
  LogOut,
  UserCircle,
  Users,
} from "lucide-react";
import { keluarAkun } from "@/actions/autentikasi-aksi";
import { labelPeranPengguna } from "@/lib/kalkulasi-cuti";
import { gabungKelas } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import DialogKonfirmasi from "./DialogKonfirmasi";

function dapatkanDaftarMenu(peran) {
  const menuDasar = [
    { label: "Dasbor", href: "/dasbor", ikon: LayoutDashboard },
  ];

  if (peran === "admin") {
    return [
      ...menuDasar,
      { label: "Manajemen Pengguna", href: "/manajemen-pengguna", ikon: Users },
      { label: "Manajemen Divisi", href: "/manajemen-divisi", ikon: Building2 },
      { label: "Manajemen Jenis Cuti", href: "/manajemen-jenis-cuti", ikon: ListChecks },
      { label: "Kalender & Kapasitas", href: "/pengaturan-kalender", ikon: CalendarCog },
      { label: "Riwayat Cuti", href: "/riwayat-cuti", ikon: History },
      { label: "Profil Saya", href: "/profil", ikon: UserCircle },
    ];
  }

  if (peran === "ketua_divisi") {
    return [
      ...menuDasar,
      { label: "Verifikasi Cuti", href: "/verifikasi-divisi", ikon: CheckSquare },
      { label: "Ajukan Cuti", href: "/pengajuan-cuti", ikon: CalendarPlus },
      { label: "Riwayat Cuti", href: "/riwayat-cuti", ikon: History },
      { label: "Profil Saya", href: "/profil", ikon: UserCircle },
    ];
  }

  if (peran === "hrd") {
    return [
      ...menuDasar,
      { label: "Persetujuan Akhir", href: "/persetujuan-hrd", ikon: ClipboardCheck },
      { label: "Kalender & Kapasitas", href: "/pengaturan-kalender", ikon: CalendarCog },
      { label: "Riwayat Cuti", href: "/riwayat-cuti", ikon: History },
      { label: "Profil Saya", href: "/profil", ikon: UserCircle },
    ];
  }

  return [
    ...menuDasar,
    { label: "Ajukan Cuti", href: "/pengajuan-cuti", ikon: CalendarPlus },
    { label: "Riwayat Cuti", href: "/riwayat-cuti", ikon: History },
    { label: "Profil Saya", href: "/profil", ikon: UserCircle },
  ];
}

export default function BilahSisiNavigasi({
  pengguna,
  saatPilihMenu,
  tampilkanLogo = true,
}) {
  const lokasi = usePathname();
  const daftarMenu = dapatkanDaftarMenu(pengguna?.peran);
  const [konfirmasiKeluar, aturKonfirmasiKeluar] = useState(false);
  const [sedangKeluar, mulaiTransisiKeluar] = useTransition();

  function tanganiKonfirmasiKeluar() {
    mulaiTransisiKeluar(async () => {
      await keluarAkun();
    });
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {tampilkanLogo && (
        <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
          <div className="size-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs shrink-0">
            <CalendarCheck2 className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold tracking-tight truncate">Offly</p>
            {pengguna?.nama_lengkap && (
              <p className="text-[11px] text-muted-foreground truncate">
                {pengguna.nama_lengkap} • {labelPeranPengguna(pengguna?.peran)}
              </p>
            )}
          </div>
        </div>
      )}

      <nav
        aria-label="Navigasi utama"
        className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
      >
        {daftarMenu.map((item) => {
          const Ikon = item.ikon;
          const aktif =
            lokasi === item.href ||
            (item.href !== "/dasbor" && lokasi.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={saatPilihMenu}
              aria-current={aktif ? "page" : undefined}
              className={gabungKelas(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                aktif
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Ikon className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="p-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => aturKonfirmasiKeluar(true)}
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="size-4 mr-2" aria-hidden="true" />
          Keluar Akun
        </Button>
      </div>

      <DialogKonfirmasi
        terbuka={konfirmasiKeluar}
        saatUbahTerbuka={aturKonfirmasiKeluar}
        judul="Keluar dari Offly?"
        deskripsi="Sesi Anda akan diakhiri dan Anda perlu masuk kembali untuk mengakses dasbor."
        labelKonfirmasi="Ya, Keluar"
        sedangMemproses={sedangKeluar}
        saatKonfirmasi={tanganiKonfirmasiKeluar}
      />
    </div>
  );
}

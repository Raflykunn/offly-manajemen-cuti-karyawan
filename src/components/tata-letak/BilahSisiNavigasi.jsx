"use client";

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
import { gabungKelas } from "@/lib/utils";
import { labelPeranPengguna } from "@/lib/kalkulasi-cuti";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function dapatkanDaftarMenu(peran) {
  const menuDasar = [
    { label: "Dasbor", href: "/dasbor", ikon: LayoutDashboard },
  ];

  if (peran === "admin") {
    return [
      ...menuDasar,
      { label: "Manajemen Pengguna", href: "/manajemen-pengguna", ikon: Users },
      { label: "Manajemen Divisi", href: "/manajemen-divisi", ikon: Building2 },
      { label: "Jenis Cuti Dinamis", href: "/manajemen-jenis-cuti", ikon: ListChecks },
      { label: "Kalender & Kapasitas", href: "/pengaturan-kalender", ikon: CalendarCog },
      { label: "Riwayat Cuti", href: "/riwayat-cuti", ikon: History },
      { label: "Profil Saya", href: "/profil", ikon: UserCircle },
    ];
  }

  if (peran === "ketua_divisi") {
    return [
      ...menuDasar,
      { label: "Verifikasi Divisi", href: "/verifikasi-divisi", ikon: CheckSquare },
      { label: "Ajukan Cuti", href: "/pengajuan-cuti", ikon: CalendarPlus },
      { label: "Riwayat Cuti", href: "/riwayat-cuti", ikon: History },
      { label: "Profil & Kuota", href: "/profil", ikon: UserCircle },
    ];
  }

  if (peran === "hrd") {
    return [
      ...menuDasar,
      { label: "Persetujuan Final", href: "/persetujuan-hrd", ikon: ClipboardCheck },
      { label: "Kalender & Kapasitas", href: "/pengaturan-kalender", ikon: CalendarCog },
      { label: "Riwayat Cuti", href: "/riwayat-cuti", ikon: History },
      { label: "Profil Saya", href: "/profil", ikon: UserCircle },
    ];
  }

  return [
    ...menuDasar,
    { label: "Ajukan Cuti", href: "/pengajuan-cuti", ikon: CalendarPlus },
    { label: "Riwayat & Surat Cuti", href: "/riwayat-cuti", ikon: History },
    { label: "Profil & Kuota", href: "/profil", ikon: UserCircle },
  ];
}

export default function BilahSisiNavigasi({ pengguna, saatPilihMenu }) {
  const lokasi = usePathname();
  const daftarMenu = dapatkanDaftarMenu(pengguna?.peran);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="size-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
          <CalendarCheck2 className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold tracking-tight truncate">Offly</p>
          <p className="text-[11px] text-muted-foreground truncate">
            Manajemen Cuti Karyawan
          </p>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-sidebar-border bg-sidebar-accent/40">
        <p className="text-xs font-semibold truncate">{pengguna?.nama_lengkap}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/15 text-accent-foreground">
            {labelPeranPengguna(pengguna?.peran)}
          </Badge>
          {pengguna?.nama_divisi && (
            <span className="text-[11px] text-muted-foreground truncate">
              {pengguna.nama_divisi}
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
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
              className={gabungKelas(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                aktif
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Ikon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="p-3">
        <form action={keluarAkun}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="size-4 mr-2" />
            Keluar Akun
          </Button>
        </form>
      </div>
    </div>
  );
}

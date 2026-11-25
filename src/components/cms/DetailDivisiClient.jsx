"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Check,
  Search,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  keluarkanAnggotaDivisi,
  tambahAnggotaDivisi,
} from "@/actions/divisi-aksi";
import {
  formatAngkaKuota,
  formatTanggalIndo,
  labelPeranPengguna,
} from "@/lib/kalkulasi-cuti";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DialogKonfirmasi from "@/components/tata-letak/DialogKonfirmasi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DetailDivisiClient({
  divisi,
  anggota,
  kandidatAnggota,
}) {
  const router = useRouter();
  const [sedangMemproses, mulaiTransisi] = useTransition();
  const [kandidatDipilih, aturKandidatDipilih] = useState("");
  const [kataCari, aturKataCari] = useState("");
  const [dropdownTerbuka, aturDropdownTerbuka] = useState(false);
  const pembungkusCariRef = useRef(null);
  const [pesanBanner, aturPesanBanner] = useState(null);
  const [anggotaDikeluarkan, aturAnggotaDikeluarkan] = useState(null);

  useEffect(() => {
    function tanganiKlikLuar(e) {
      if (
        pembungkusCariRef.current &&
        !pembungkusCariRef.current.contains(e.target)
      ) {
        aturDropdownTerbuka(false);
      }
    }
    document.addEventListener("pointerdown", tanganiKlikLuar);
    return () => document.removeEventListener("pointerdown", tanganiKlikLuar);
  }, []);

  const petaKandidat = useMemo(() => {
    const peta = new Map();
    for (const k of kandidatAnggota) {
      peta.set(
        String(k.id),
        k.nama_divisi_saat_ini
          ? `${k.nama_lengkap} (Pindah dari ${k.nama_divisi_saat_ini})`
          : k.nama_lengkap
      );
    }
    return peta;
  }, [kandidatAnggota]);

  const { hasilKandidat, totalCocok } = useMemo(() => {
    const kueri = kataCari.trim().toLowerCase();
    const cocok = kueri
      ? kandidatAnggota.filter(
          (k) =>
            k.nama_lengkap.toLowerCase().includes(kueri) ||
            (k.email && k.email.toLowerCase().includes(kueri)) ||
            (k.nama_divisi_saat_ini &&
              k.nama_divisi_saat_ini.toLowerCase().includes(kueri))
        )
      : kandidatAnggota;
    return {
      hasilKandidat: cocok.slice(0, 10),
      totalCocok: cocok.length,
    };
  }, [kandidatAnggota, kataCari]);

  function pilihKandidat(kandidat) {
    const idStr = String(kandidat.id);
    aturKandidatDipilih(idStr);
    aturKataCari(petaKandidat.get(idStr) || kandidat.nama_lengkap);
    aturDropdownTerbuka(false);
  }

  function tanganiTambahAnggota() {
    if (!kandidatDipilih) return;
    mulaiTransisi(async () => {
      const hasil = await tambahAnggotaDivisi(divisi.id, kandidatDipilih);
      aturPesanBanner(hasil);
      if (hasil.sukses) {
        aturKandidatDipilih("");
        aturKataCari("");
        aturDropdownTerbuka(false);
        router.refresh();
      }
    });
  }

  function tanganiKeluarkanAnggota() {
    if (!anggotaDikeluarkan) return;
    mulaiTransisi(async () => {
      const hasil = await keluarkanAnggotaDivisi(divisi.id, anggotaDikeluarkan.id);
      aturPesanBanner(hasil);
      aturAnggotaDikeluarkan(null);
      if (hasil.sukses) {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            nativeButton={false}
            render={<Link href="/manajemen-divisi" />}
            variant="outline"
            size="icon"
            aria-label="Kembali ke Manajemen Divisi"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              Divisi {divisi.nama_divisi}
            </h1>
            <p className="text-sm text-muted-foreground">
              {divisi.deskripsi || "Manajemen anggota dan informasi divisi."}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Dibentuk: {formatTanggalIndo(divisi.tanggal_dibentuk)}
        </Badge>
      </div>

      {pesanBanner && (
        <Alert
          variant={pesanBanner.sukses ? "default" : "destructive"}
          className={
            pesanBanner.sukses
              ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-100"
              : ""
          }
        >
          <AlertDescription>{pesanBanner.pesan}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ketua Divisi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base font-semibold">
              {divisi.nama_ketua_divisi || "Belum ditetapkan"}
            </p>
            <p className="text-sm text-muted-foreground break-all">
              {divisi.email_ketua || "-"}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Anggota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{anggota.length} Orang</p>
            <p className="text-sm text-muted-foreground">
              Termasuk Ketua Divisi &amp; Karyawan
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-6 overflow-visible">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tambah Anggota ke Divisi
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div ref={pembungkusCariRef} className="relative flex-1 min-w-0">
              <Search
                className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <Input
                type="text"
                role="combobox"
                aria-expanded={dropdownTerbuka}
                aria-controls="daftar-kandidat-divisi"
                aria-label="Cari dan pilih karyawan untuk ditambahkan ke divisi"
                placeholder={
                  kandidatAnggota.length === 0
                    ? "Tidak ada kandidat"
                    : "Cari nama atau divisi asal..."
                }
                disabled={kandidatAnggota.length === 0}
                value={kataCari}
                onFocus={() => aturDropdownTerbuka(true)}
                onChange={(e) => {
                  aturKataCari(e.target.value);
                  aturKandidatDipilih("");
                  aturDropdownTerbuka(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    aturDropdownTerbuka(false);
                  }
                }}
                className="pl-9 pr-9 h-10 md:h-9"
              />
              {(kataCari || kandidatDipilih) && (
                <button
                  type="button"
                  onClick={() => {
                    aturKataCari("");
                    aturKandidatDipilih("");
                    aturDropdownTerbuka(true);
                  }}
                  aria-label="Hapus pencarian karyawan"
                  className="absolute right-2 top-1/2 -translate-y-1/2 size-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              )}

              {dropdownTerbuka && kandidatAnggota.length > 0 && (
                <div
                  id="daftar-kandidat-divisi"
                  role="listbox"
                  className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-64 overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-md"
                >
                  {hasilKandidat.length === 0 ? (
                    <p className="px-3 py-2.5 text-sm text-muted-foreground">
                      Tidak ada karyawan yang cocok.
                    </p>
                  ) : (
                    <>
                      {hasilKandidat.map((k) => {
                        const terpilih = String(k.id) === kandidatDipilih;
                        return (
                          <button
                            key={k.id}
                            type="button"
                            role="option"
                            aria-selected={terpilih}
                            onClick={() => pilihKandidat(k)}
                            className={`w-full flex items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                              terpilih
                                ? "bg-accent text-accent-foreground font-semibold"
                                : "text-foreground hover:bg-muted"
                            }`}
                          >
                            <span className="min-w-0 truncate">
                              {petaKandidat.get(String(k.id))}
                            </span>
                            {terpilih && (
                              <Check
                                className="size-4 text-primary shrink-0"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        );
                      })}
                      {totalCocok > 10 && (
                        <p className="px-3 py-1.5 text-sm text-muted-foreground border-t border-border mt-1">
                          Menampilkan 10 dari {totalCocok} karyawan. Ketik lebih spesifik.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            <Button
              size="sm"
              type="button"
              className="shrink-0 h-10 md:h-9 px-3.5"
              onClick={tanganiTambahAnggota}
              disabled={sedangMemproses || !kandidatDipilih}
            >
              <UserPlus className="size-4 mr-1.5" />
              Tambah
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="size-4 text-primary" />
            Daftar Anggota Divisi
          </CardTitle>
          <CardDescription>
            Mengeluarkan anggota hanya melepas relasi divisi tanpa menghapus akun karyawan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {anggota.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Belum ada anggota di divisi ini.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama &amp; Email</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead>Sisa Kuota</TableHead>
                  <TableHead>Status Aktif</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {anggota.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium text-base">{item.nama_lengkap}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.peran === "ketua_divisi" ? "default" : "secondary"
                        }
                      >
                        {labelPeranPengguna(item.peran)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatAngkaKuota(item.sisa_kuota_cuti)} Hari
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          item.status_aktif
                            ? "bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700"
                            : "bg-muted text-foreground border-border"
                        }
                      >
                        {item.status_aktif ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.id !== divisi.ketua_divisi_id && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={sedangMemproses}
                          onClick={() => aturAnggotaDikeluarkan(item)}
                        >
                          <UserMinus className="size-3.5 mr-1 text-destructive" />
                          Keluarkan
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DialogKonfirmasi
        terbuka={Boolean(anggotaDikeluarkan)}
        saatUbahTerbuka={(terbuka) => !terbuka && aturAnggotaDikeluarkan(null)}
        judul="Keluarkan Anggota dari Divisi?"
        deskripsi={`${anggotaDikeluarkan?.nama_lengkap} akan dilepas dari divisi ${divisi.nama_divisi} tanpa menghapus akunnya.`}
        labelKonfirmasi="Keluarkan Anggota"
        sedangMemproses={sedangMemproses}
        saatKonfirmasi={tanganiKeluarkanAnggota}
      />
    </div>
  );
}

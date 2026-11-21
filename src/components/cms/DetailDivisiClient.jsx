"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  UserMinus,
  UserPlus,
  Users,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [kandidatDipilih, aturKandidatDipilih] = useState(
    kandidatAnggota[0] ? String(kandidatAnggota[0].id) : ""
  );
  const [pesanBanner, aturPesanBanner] = useState(null);
  const [anggotaDikeluarkan, aturAnggotaDikeluarkan] = useState(null);

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

  function tanganiTambahAnggota() {
    if (!kandidatDipilih) return;
    mulaiTransisi(async () => {
      const hasil = await tambahAnggotaDivisi(divisi.id, kandidatDipilih);
      aturPesanBanner(hasil);
      if (hasil.sukses) {
        aturKandidatDipilih("");
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
        <Badge variant="outline" className="text-xs px-3 py-1">
          Dibentuk: {formatTanggalIndo(divisi.tanggal_dibentuk)}
        </Badge>
      </div>

      {pesanBanner && (
        <Alert
          variant={pesanBanner.sukses ? "default" : "destructive"}
          className={
            pesanBanner.sukses
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : ""
          }
        >
          <AlertDescription>{pesanBanner.pesan}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Ketua Divisi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base font-semibold">
              {divisi.nama_ketua_divisi || "Belum ditetapkan"}
            </p>
            <p className="text-xs text-muted-foreground">
              {divisi.email_ketua || "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Anggota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{anggota.length} Orang</p>
            <p className="text-xs text-muted-foreground">
              Termasuk Ketua Divisi &amp; Karyawan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Tambah Anggota ke Divisi
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Select
              value={kandidatDipilih}
              onValueChange={aturKandidatDipilih}
              disabled={kandidatAnggota.length === 0}
            >
              <SelectTrigger className="flex-1">
                <SelectValue>
                  {(v) =>
                    petaKandidat.get(v) ||
                    (kandidatAnggota.length === 0
                      ? "Tidak ada kandidat"
                      : "Pilih Karyawan")
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {kandidatAnggota.map((k) => (
                  <SelectItem key={k.id} value={String(k.id)}>
                    {petaKandidat.get(String(k.id))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={tanganiTambahAnggota}
              disabled={sedangMemproses || !kandidatDipilih}
            >
              <UserPlus className="size-4 mr-1" />
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
                      <div className="font-medium">{item.nama_lengkap}</div>
                      <div className="text-xs text-muted-foreground">
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
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-zinc-100 text-zinc-700"
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

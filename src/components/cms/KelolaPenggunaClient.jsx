"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
} from "lucide-react";
import {
  hapusDataPengguna,
  tambahPenggunaBaru,
  ubahDataPengguna,
} from "@/actions/pengguna-aksi";
import {
  formatAngkaKuota,
  formatTanggalIndo,
  labelPeranPengguna,
} from "@/lib/kalkulasi-cuti";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function KelolaPenggunaClient({
  daftarPenggunaAwal,
  daftarDivisi,
  adminId,
}) {
  const router = useRouter();
  const [sedangMemproses, mulaiTransisi] = useTransition();

  const [cari, aturCari] = useState("");
  const [filterPeran, aturFilterPeran] = useState("semua");
  const [filterDivisi, aturFilterDivisi] = useState("semua");
  const [filterStatus, aturFilterStatus] = useState("semua");
  const [filterMasaKerja, aturFilterMasaKerja] = useState("semua");
  const [urutkan, aturUrutkan] = useState("nama_asc");

  const [pesanBanner, aturPesanBanner] = useState(null);
  const [modalTambahTerbuka, aturModalTambahTerbuka] = useState(false);
  const [penggunaDiedit, aturPenggunaDiedit] = useState(null);
  const [penggunaDihapus, aturPenggunaDihapus] = useState(null);

  const [peranForm, aturPeranForm] = useState("karyawan");
  const [divisiForm, aturDivisiForm] = useState("kosong");
  const [statusForm, aturStatusForm] = useState("true");

  const petaDivisi = useMemo(() => {
    const peta = new Map();
    for (const d of daftarDivisi) {
      peta.set(String(d.id), d.nama_divisi);
    }
    return peta;
  }, [daftarDivisi]);

  const daftarTersaring = useMemo(() => {
    const kueri = cari.trim().toLowerCase();
    const hasil = daftarPenggunaAwal.filter((u) => {
      if (kueri) {
        const cocok =
          u.nama_lengkap.toLowerCase().includes(kueri) ||
          u.email.toLowerCase().includes(kueri) ||
          u.username.toLowerCase().includes(kueri);
        if (!cocok) return false;
      }
      if (filterPeran !== "semua" && u.peran !== filterPeran) return false;
      if (filterDivisi === "tanpa_divisi" && u.divisi_id !== null) return false;
      if (
        filterDivisi !== "semua" &&
        filterDivisi !== "tanpa_divisi" &&
        String(u.divisi_id) !== filterDivisi
      ) {
        return false;
      }
      if (filterStatus === "aktif" && !u.status_aktif) return false;
      if (filterStatus === "nonaktif" && u.status_aktif) return false;
      if (
        filterMasaKerja === "kurang_1_tahun" &&
        Number(u.total_bulan_kerja) >= 12
      ) {
        return false;
      }
      if (
        filterMasaKerja === "lebih_1_tahun" &&
        Number(u.total_bulan_kerja) < 12
      ) {
        return false;
      }
      return true;
    });

    return [...hasil].sort((a, b) => {
      if (urutkan === "nama_desc") {
        return b.nama_lengkap.localeCompare(a.nama_lengkap);
      }
      if (urutkan === "gabung_baru") {
        return b.tanggal_bergabung.localeCompare(a.tanggal_bergabung);
      }
      if (urutkan === "gabung_lama") {
        return a.tanggal_bergabung.localeCompare(b.tanggal_bergabung);
      }
      if (urutkan === "divisi_asc") {
        return (a.nama_divisi || "ZZZ").localeCompare(b.nama_divisi || "ZZZ");
      }
      return a.nama_lengkap.localeCompare(b.nama_lengkap);
    });
  }, [
    daftarPenggunaAwal,
    cari,
    filterPeran,
    filterDivisi,
    filterStatus,
    filterMasaKerja,
    urutkan,
  ]);

  function bukaModalTambah() {
    aturPeranForm("karyawan");
    aturDivisiForm("kosong");
    aturPesanBanner(null);
    aturModalTambahTerbuka(true);
  }

  function bukaModalEdit(pengguna) {
    aturPeranForm(pengguna.peran);
    aturDivisiForm(pengguna.divisi_id ? String(pengguna.divisi_id) : "kosong");
    aturStatusForm(pengguna.status_aktif ? "true" : "false");
    aturPesanBanner(null);
    aturPenggunaDiedit(pengguna);
  }

  function tanganiSimpanTambah(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    mulaiTransisi(async () => {
      const hasil = await tambahPenggunaBaru(formData);
      aturPesanBanner(hasil);
      if (hasil.sukses) {
        aturModalTambahTerbuka(false);
        router.refresh();
      }
    });
  }

  function tanganiSimpanEdit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    mulaiTransisi(async () => {
      const hasil = await ubahDataPengguna(formData);
      aturPesanBanner(hasil);
      if (hasil.sukses) {
        aturPenggunaDiedit(null);
        router.refresh();
      }
    });
  }

  function tanganiKonfirmasiHapus() {
    if (!penggunaDihapus) return;
    mulaiTransisi(async () => {
      const hasil = await hapusDataPengguna(penggunaDihapus.id);
      aturPesanBanner(hasil);
      aturPenggunaDihapus(null);
      if (hasil.sukses) {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Manajemen Pengguna
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola akun Admin, Karyawan, Ketua Divisi, dan HRD beserta kuota cutinya.
          </p>
        </div>
        <Button onClick={bukaModalTambah} size="sm">
          <UserPlus className="size-4 mr-1.5" />
          Tambah Pengguna
        </Button>
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

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filter &amp; Pencarian</CardTitle>
          <CardDescription>
            Menampilkan {daftarTersaring.length} dari {daftarPenggunaAwal.length} pengguna terdaftar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2 relative">
              <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Cari nama, email, username..."
                value={cari}
                onChange={(e) => aturCari(e.target.value)}
                className="pl-9 h-8"
              />
            </div>

            <Select value={filterPeran} onValueChange={aturFilterPeran}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v) =>
                    v === "semua" ? "Semua Peran" : labelPeranPengguna(v)
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Peran</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="hrd">HRD</SelectItem>
                <SelectItem value="ketua_divisi">Ketua Divisi</SelectItem>
                <SelectItem value="karyawan">Karyawan</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDivisi} onValueChange={aturFilterDivisi}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v) => {
                    if (v === "semua") return "Semua Divisi";
                    if (v === "tanpa_divisi") return "Tanpa Divisi";
                    return petaDivisi.get(v) || "Divisi";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Divisi</SelectItem>
                <SelectItem value="tanpa_divisi">Tanpa Divisi</SelectItem>
                {daftarDivisi.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.nama_divisi}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={aturFilterStatus}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v) =>
                    v === "semua"
                      ? "Semua Status"
                      : v === "aktif"
                        ? "Aktif"
                        : "Nonaktif"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Status</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Nonaktif</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterMasaKerja} onValueChange={aturFilterMasaKerja}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v) => {
                    if (v === "kurang_1_tahun") return "Masa Kerja < 1 Thn";
                    if (v === "lebih_1_tahun") return "Masa Kerja ≥ 1 Thn";
                    return "Semua Masa Kerja";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Masa Kerja</SelectItem>
                <SelectItem value="kurang_1_tahun">Masa Kerja &lt; 1 Thn</SelectItem>
                <SelectItem value="lebih_1_tahun">Masa Kerja &ge; 1 Thn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-xs text-muted-foreground">Urutkan berdasarkan:</span>
            <Select value={urutkan} onValueChange={aturUrutkan}>
              <SelectTrigger className="w-56">
                <SelectValue>
                  {(v) => {
                    const label = {
                      nama_asc: "Nama (A–Z)",
                      nama_desc: "Nama (Z–A)",
                      gabung_baru: "Tanggal Bergabung (Terbaru)",
                      gabung_lama: "Tanggal Bergabung (Terlama)",
                      divisi_asc: "Divisi (A–Z)",
                    };
                    return label[v] || "Nama (A–Z)";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nama_asc">Nama (A–Z)</SelectItem>
                <SelectItem value="nama_desc">Nama (Z–A)</SelectItem>
                <SelectItem value="gabung_baru">Tanggal Bergabung (Terbaru)</SelectItem>
                <SelectItem value="gabung_lama">Tanggal Bergabung (Terlama)</SelectItem>
                <SelectItem value="divisi_asc">Divisi (A–Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengguna</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Divisi</TableHead>
                <TableHead>Bergabung</TableHead>
                <TableHead>Sisa Kuota</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {daftarTersaring.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Tidak ada pengguna yang cocok dengan filter saat ini.
                  </TableCell>
                </TableRow>
              ) : (
                daftarTersaring.map((u) => {
                  const bisaDihapus =
                    ["karyawan", "ketua_divisi"].includes(u.peran) &&
                    u.id !== adminId;
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="font-medium">{u.nama_lengkap}</div>
                        <div className="text-xs text-muted-foreground">
                          @{u.username} • {u.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {labelPeranPengguna(u.peran)}
                        </Badge>
                      </TableCell>
                      <TableCell>{u.nama_divisi || "-"}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {formatTanggalIndo(u.tanggal_bergabung)}
                        </div>
                        {Number(u.total_bulan_kerja) < 12 && (
                          <span className="text-[11px] text-amber-700 font-medium">
                            &lt; 1 Tahun
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatAngkaKuota(u.sisa_kuota_cuti)} /{" "}
                        {formatAngkaKuota(u.kuota_cuti_awal)} Hari
                      </TableCell>
                      <TableCell>
                        {u.status_aktif ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            <UserCheck className="size-3 mr-1" />
                            Aktif
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-zinc-100 text-zinc-700"
                          >
                            <UserX className="size-3 mr-1" />
                            Nonaktif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          size="icon-sm"
                          variant="outline"
                          onClick={() => bukaModalEdit(u)}
                          aria-label="Edit pengguna"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        {bisaDihapus && (
                          <Button
                            size="icon-sm"
                            variant="destructive"
                            onClick={() => aturPenggunaDihapus(u)}
                            aria-label="Hapus pengguna"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={modalTambahTerbuka}
        onOpenChange={aturModalTambahTerbuka}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
            <DialogDescription>
              Lengkapi seluruh kolom untuk mendaftarkan akun pengguna ke sistem Offly.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={tanganiSimpanTambah} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tambah_nama">Nama Lengkap</Label>
                <Input id="tambah_nama" name="nama_lengkap" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tambah_username">Username</Label>
                <Input id="tambah_username" name="username" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tambah_email">Email</Label>
                <Input id="tambah_email" name="email" type="email" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tambah_sandi">Kata Sandi</Label>
                <Input
                  id="tambah_sandi"
                  name="kata_sandi"
                  type="password"
                  minLength={6}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Peran</Label>
                <Select
                  name="peran"
                  value={peranForm}
                  onValueChange={aturPeranForm}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>{(v) => labelPeranPengguna(v)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="karyawan">Karyawan</SelectItem>
                    <SelectItem value="ketua_divisi">Ketua Divisi</SelectItem>
                    <SelectItem value="hrd">HRD</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Divisi (Opsional)</Label>
                <Select
                  name="divisi_id"
                  value={divisiForm}
                  onValueChange={aturDivisiForm}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(v) =>
                        v === "kosong"
                          ? "Belum Ada Divisi"
                          : petaDivisi.get(v) || "Pilih Divisi"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kosong">Belum Ada Divisi</SelectItem>
                    {daftarDivisi.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.nama_divisi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tambah_kuota">Kuota Cuti Awal (Hari)</Label>
                <Input
                  id="tambah_kuota"
                  name="kuota_cuti_awal"
                  type="number"
                  step="0.5"
                  defaultValue="12"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tambah_gabung">Tanggal Bergabung</Label>
                <Input
                  id="tambah_gabung"
                  name="tanggal_bergabung"
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  required
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => aturModalTambahTerbuka(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={sedangMemproses}>
                <Plus className="size-4 mr-1" />
                {sedangMemproses ? "Menyimpan..." : "Simpan Pengguna"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(penggunaDiedit)}
        onOpenChange={(terbuka) => !terbuka && aturPenggunaDiedit(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Data Pengguna</DialogTitle>
            <DialogDescription>
              Perbarui data akun, peran, status aktif, atau kuota cuti pengguna.
            </DialogDescription>
          </DialogHeader>
          {penggunaDiedit && (
            <form onSubmit={tanganiSimpanEdit} className="space-y-3">
              <input type="hidden" name="id" value={penggunaDiedit.id} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit_nama">Nama Lengkap</Label>
                  <Input
                    id="edit_nama"
                    name="nama_lengkap"
                    defaultValue={penggunaDiedit.nama_lengkap}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit_username">Username</Label>
                  <Input
                    id="edit_username"
                    name="username"
                    defaultValue={penggunaDiedit.username}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit_email">Email</Label>
                  <Input
                    id="edit_email"
                    name="email"
                    type="email"
                    defaultValue={penggunaDiedit.email}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit_sandi">Kata Sandi Baru (Opsional)</Label>
                  <Input
                    id="edit_sandi"
                    name="kata_sandi"
                    type="password"
                    placeholder="Biarkan kosong jika tetap"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Peran</Label>
                  <Select
                    name="peran"
                    value={peranForm}
                    onValueChange={aturPeranForm}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>{(v) => labelPeranPengguna(v)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="karyawan">Karyawan</SelectItem>
                      <SelectItem value="ketua_divisi">Ketua Divisi</SelectItem>
                      <SelectItem value="hrd">HRD</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Divisi</Label>
                  <Select
                    name="divisi_id"
                    value={divisiForm}
                    onValueChange={aturDivisiForm}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(v) =>
                          v === "kosong"
                            ? "Tanpa Divisi"
                            : petaDivisi.get(v) || "Pilih Divisi"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kosong">Tanpa Divisi</SelectItem>
                      {daftarDivisi.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.nama_divisi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status Akun</Label>
                  <Select
                    name="status_aktif"
                    value={statusForm}
                    onValueChange={aturStatusForm}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(v) => (v === "true" ? "Aktif" : "Nonaktif")}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Aktif</SelectItem>
                      <SelectItem value="false">Nonaktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit_kuota_awal">Kuota Awal</Label>
                  <Input
                    id="edit_kuota_awal"
                    name="kuota_cuti_awal"
                    type="number"
                    step="0.5"
                    defaultValue={penggunaDiedit.kuota_cuti_awal}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit_sisa_kuota">Sisa Kuota</Label>
                  <Input
                    id="edit_sisa_kuota"
                    name="sisa_kuota_cuti"
                    type="number"
                    step="0.5"
                    defaultValue={penggunaDiedit.sisa_kuota_cuti}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit_gabung">Tgl Bergabung</Label>
                  <Input
                    id="edit_gabung"
                    name="tanggal_bergabung"
                    type="date"
                    defaultValue={penggunaDiedit.tanggal_bergabung}
                    required
                  />
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => aturPenggunaDiedit(null)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={sedangMemproses}>
                  {sedangMemproses ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(penggunaDihapus)}
        onOpenChange={(terbuka) => !terbuka && aturPenggunaDihapus(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Pengguna</DialogTitle>
            <DialogDescription>
              Anda yakin ingin menghapus akun{" "}
              <span className="font-semibold text-foreground">
                {penggunaDihapus?.nama_lengkap}
              </span>
              ? Seluruh riwayat pengajuan cuti milik akun tersebut akan ikut terhapus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => aturPenggunaDihapus(null)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={tanganiKonfirmasiHapus}
              disabled={sedangMemproses}
            >
              {sedangMemproses ? "Menghapus..." : "Hapus Pengguna"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

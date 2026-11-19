"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import {
  buatDivisiBaru,
  hapusDivisiDenganKonfirmasi,
  ubahDataDivisi,
} from "@/actions/divisi-aksi";
import { formatTanggalIndo } from "@/lib/kalkulasi-cuti";
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
import { Textarea } from "@/components/ui/textarea";

export default function KelolaDivisiClient({
  daftarDivisiAwal,
  kandidatKetuaTersedia,
  semuaKetua,
}) {
  const router = useRouter();
  const [sedangMemproses, mulaiTransisi] = useTransition();

  const [cari, aturCari] = useState("");
  const [filterKetua, aturFilterKetua] = useState("semua");
  const [filterAnggota, aturFilterAnggota] = useState("semua");
  const [urutkan, aturUrutkan] = useState("nama_asc");

  const [pesanBanner, aturPesanBanner] = useState(null);
  const [modalTambahTerbuka, aturModalTambahTerbuka] = useState(false);
  const [divisiDiedit, aturDivisiDiedit] = useState(null);
  const [ketuaForm, aturKetuaForm] = useState("");

  const [divisiDihapus, aturDivisiDihapus] = useState(null);
  const [tahapHapus, aturTahapHapus] = useState(1);
  const [teksKonfirmasiHapus, aturTeksKonfirmasiHapus] = useState("");

  const petaKetua = useMemo(() => {
    const peta = new Map();
    for (const k of semuaKetua) {
      peta.set(String(k.id), k.nama_lengkap);
    }
    return peta;
  }, [semuaKetua]);

  const daftarTersaring = useMemo(() => {
    const kueri = cari.trim().toLowerCase();
    const hasil = daftarDivisiAwal.filter((d) => {
      if (kueri) {
        const cocok =
          d.nama_divisi.toLowerCase().includes(kueri) ||
          (d.nama_ketua_divisi || "").toLowerCase().includes(kueri);
        if (!cocok) return false;
      }
      if (filterKetua !== "semua" && String(d.ketua_divisi_id) !== filterKetua) {
        return false;
      }
      if (filterAnggota === "kosong" && d.jumlah_anggota !== 0) return false;
      if (
        filterAnggota === "kecil" &&
        (d.jumlah_anggota < 1 || d.jumlah_anggota > 5)
      ) {
        return false;
      }
      if (filterAnggota === "besar" && d.jumlah_anggota <= 5) return false;
      return true;
    });

    return [...hasil].sort((a, b) => {
      if (urutkan === "nama_desc") {
        return b.nama_divisi.localeCompare(a.nama_divisi);
      }
      if (urutkan === "anggota_banyak") {
        return b.jumlah_anggota - a.jumlah_anggota;
      }
      if (urutkan === "anggota_sedikit") {
        return a.jumlah_anggota - b.jumlah_anggota;
      }
      if (urutkan === "tgl_baru") {
        return b.tanggal_dibentuk.localeCompare(a.tanggal_dibentuk);
      }
      if (urutkan === "tgl_lama") {
        return a.tanggal_dibentuk.localeCompare(b.tanggal_dibentuk);
      }
      return a.nama_divisi.localeCompare(b.nama_divisi);
    });
  }, [daftarDivisiAwal, cari, filterKetua, filterAnggota, urutkan]);

  function bukaModalTambah() {
    aturKetuaForm(
      kandidatKetuaTersedia[0] ? String(kandidatKetuaTersedia[0].id) : ""
    );
    aturPesanBanner(null);
    aturModalTambahTerbuka(true);
  }

  function bukaModalEdit(divisi) {
    aturKetuaForm(divisi.ketua_divisi_id ? String(divisi.ketua_divisi_id) : "");
    aturPesanBanner(null);
    aturDivisiDiedit(divisi);
  }

  function bukaModalHapus(divisi) {
    aturDivisiDihapus(divisi);
    aturTahapHapus(1);
    aturTeksKonfirmasiHapus("");
  }

  function tanganiBuatDivisi(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    mulaiTransisi(async () => {
      const hasil = await buatDivisiBaru(formData);
      aturPesanBanner(hasil);
      if (hasil.sukses) {
        aturModalTambahTerbuka(false);
        router.refresh();
      }
    });
  }

  function tanganiEditDivisi(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    mulaiTransisi(async () => {
      const hasil = await ubahDataDivisi(formData);
      aturPesanBanner(hasil);
      if (hasil.sukses) {
        aturDivisiDiedit(null);
        router.refresh();
      }
    });
  }

  function tanganiEksekusiHapus() {
    if (!divisiDihapus) return;
    mulaiTransisi(async () => {
      const hasil = await hapusDivisiDenganKonfirmasi(
        divisiDihapus.id,
        teksKonfirmasiHapus
      );
      aturPesanBanner(hasil);
      if (hasil.sukses) {
        aturDivisiDihapus(null);
        router.refresh();
      }
    });
  }

  const pilihanKetuaUntukEdit = useMemo(() => {
    if (!divisiDiedit) return kandidatKetuaTersedia;
    const daftar = [...kandidatKetuaTersedia];
    if (
      divisiDiedit.ketua_divisi_id &&
      !daftar.some((k) => k.id === divisiDiedit.ketua_divisi_id)
    ) {
      daftar.unshift({
        id: divisiDiedit.ketua_divisi_id,
        nama_lengkap: `${divisiDiedit.nama_ketua_divisi} (Ketua Saat Ini)`,
      });
    }
    return daftar;
  }, [divisiDiedit, kandidatKetuaTersedia]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Divisi</h1>
          <p className="text-sm text-muted-foreground">
            Atur struktur divisi, penetapan Ketua Divisi tanpa rangkap jabatan, dan keanggotaan tim.
          </p>
        </div>
        <Button onClick={bukaModalTambah} size="sm">
          <Plus className="size-4 mr-1.5" />
          Buat Divisi Baru
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
          <CardTitle className="text-base">Daftar Divisi Perusahaan</CardTitle>
          <CardDescription>
            Menampilkan {daftarTersaring.length} dari {daftarDivisiAwal.length} divisi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Cari nama divisi atau ketua..."
                value={cari}
                onChange={(e) => aturCari(e.target.value)}
                className="pl-9 h-8"
              />
            </div>

            <Select value={filterKetua} onValueChange={aturFilterKetua}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v) =>
                    v === "semua"
                      ? "Semua Ketua Divisi"
                      : petaKetua.get(v) || "Ketua Divisi"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Ketua Divisi</SelectItem>
                {semuaKetua.map((k) => (
                  <SelectItem key={k.id} value={String(k.id)}>
                    {k.nama_lengkap}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterAnggota} onValueChange={aturFilterAnggota}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v) => {
                    if (v === "kosong") return "0 Anggota";
                    if (v === "kecil") return "1 – 5 Anggota";
                    if (v === "besar") return "> 5 Anggota";
                    return "Semua Jumlah Anggota";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Jumlah Anggota</SelectItem>
                <SelectItem value="kosong">0 Anggota</SelectItem>
                <SelectItem value="kecil">1 – 5 Anggota</SelectItem>
                <SelectItem value="besar">&gt; 5 Anggota</SelectItem>
              </SelectContent>
            </Select>

            <Select value={urutkan} onValueChange={aturUrutkan}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v) => {
                    const label = {
                      nama_asc: "Nama Divisi (A–Z)",
                      nama_desc: "Nama Divisi (Z–A)",
                      anggota_banyak: "Anggota Terbanyak",
                      anggota_sedikit: "Anggota Tersedikit",
                      tgl_baru: "Dibentuk Terbaru",
                      tgl_lama: "Dibentuk Terlama",
                    };
                    return label[v] || "Nama Divisi (A–Z)";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nama_asc">Nama Divisi (A–Z)</SelectItem>
                <SelectItem value="nama_desc">Nama Divisi (Z–A)</SelectItem>
                <SelectItem value="anggota_banyak">Anggota Terbanyak</SelectItem>
                <SelectItem value="anggota_sedikit">Anggota Tersedikit</SelectItem>
                <SelectItem value="tgl_baru">Dibentuk Terbaru</SelectItem>
                <SelectItem value="tgl_lama">Dibentuk Terlama</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Divisi</TableHead>
                <TableHead>Ketua Divisi</TableHead>
                <TableHead>Anggota</TableHead>
                <TableHead>Batas Cuti</TableHead>
                <TableHead>Tanggal Dibentuk</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {daftarTersaring.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Tidak ada divisi yang cocok dengan kriteria pencarian.
                  </TableCell>
                </TableRow>
              ) : (
                daftarTersaring.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div className="font-semibold flex items-center gap-2">
                        <Building2 className="size-4 text-primary shrink-0" />
                        {d.nama_divisi}
                      </div>
                      {d.deskripsi && (
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                          {d.deskripsi}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {d.nama_ketua_divisi || (
                        <span className="text-xs text-muted-foreground">
                          Belum ditetapkan
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1">
                        <Users className="size-3" />
                        {d.jumlah_anggota} Orang
                      </Badge>
                    </TableCell>
                    <TableCell>Maks {d.batas_kapasitas_persen}%</TableCell>
                    <TableCell>{formatTanggalIndo(d.tanggal_dibentuk)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        render={<Link href={`/manajemen-divisi/${d.id}`} />}
                      >
                        <Eye className="size-3.5 mr-1" />
                        Detail &amp; Anggota
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={() => bukaModalEdit(d)}
                        aria-label="Edit divisi"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="destructive"
                        onClick={() => bukaModalHapus(d)}
                        aria-label="Hapus divisi"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={modalTambahTerbuka}
        onOpenChange={aturModalTambahTerbuka}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Divisi Baru</DialogTitle>
            <DialogDescription>
              Ketua Divisi wajib dipilih dari pengguna berperan Ketua Divisi yang belum memimpin divisi lain.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={tanganiBuatDivisi} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="buat_nama_divisi">Nama Divisi</Label>
              <Input id="buat_nama_divisi" name="nama_divisi" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="buat_deskripsi">Deskripsi Divisi (Opsional)</Label>
              <Textarea id="buat_deskripsi" name="deskripsi" rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Ketua Divisi (Belum Terikat)</Label>
              {kandidatKetuaTersedia.length === 0 ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    Tidak ada Ketua Divisi yang tersedia. Tambah pengguna baru dengan peran Ketua Divisi terlebih dahulu.
                  </AlertDescription>
                </Alert>
              ) : (
                <Select
                  name="ketua_divisi_id"
                  value={ketuaForm}
                  onValueChange={aturKetuaForm}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(v) => petaKetua.get(v) || "Pilih Ketua Divisi"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {kandidatKetuaTersedia.map((k) => (
                      <SelectItem key={k.id} value={String(k.id)}>
                        {k.nama_lengkap}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="buat_kapasitas">
                Batas Maksimal Cuti Bersamaan (%)
              </Label>
              <Input
                id="buat_kapasitas"
                name="batas_kapasitas_persen"
                type="number"
                min={5}
                max={100}
                defaultValue={30}
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => aturModalTambahTerbuka(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={sedangMemproses || kandidatKetuaTersedia.length === 0}
              >
                {sedangMemproses ? "Menyimpan..." : "Buat Divisi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(divisiDiedit)}
        onOpenChange={(terbuka) => !terbuka && aturDivisiDiedit(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Divisi</DialogTitle>
            <DialogDescription>
              Nama divisi harus unik dan Ketua Divisi tidak boleh merangkap divisi lain.
            </DialogDescription>
          </DialogHeader>
          {divisiDiedit && (
            <form onSubmit={tanganiEditDivisi} className="space-y-3">
              <input type="hidden" name="id" value={divisiDiedit.id} />
              <div className="space-y-1.5">
                <Label htmlFor="edit_nama_divisi">Nama Divisi</Label>
                <Input
                  id="edit_nama_divisi"
                  name="nama_divisi"
                  defaultValue={divisiDiedit.nama_divisi}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit_deskripsi">Deskripsi</Label>
                <Textarea
                  id="edit_deskripsi"
                  name="deskripsi"
                  rows={3}
                  defaultValue={divisiDiedit.deskripsi || ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Ketua Divisi</Label>
                <Select
                  name="ketua_divisi_id"
                  value={ketuaForm}
                  onValueChange={aturKetuaForm}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(v) => petaKetua.get(v) || "Pilih Ketua Divisi"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {pilihanKetuaUntukEdit.map((k) => (
                      <SelectItem key={k.id} value={String(k.id)}>
                        {k.nama_lengkap}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit_kapasitas">
                  Batas Maksimal Cuti Bersamaan (%)
                </Label>
                <Input
                  id="edit_kapasitas"
                  name="batas_kapasitas_persen"
                  type="number"
                  min={5}
                  max={100}
                  defaultValue={divisiDiedit.batas_kapasitas_persen}
                  required
                />
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => aturDivisiDiedit(null)}
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
        open={Boolean(divisiDihapus)}
        onOpenChange={(terbuka) => !terbuka && aturDivisiDihapus(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              Hapus Divisi (Konfirmasi Tahap {tahapHapus} dari 2)
            </DialogTitle>
            <DialogDescription>
              {tahapHapus === 1
                ? `Menghapus divisi "${divisiDihapus?.nama_divisi}" akan melepaskan seluruh anggota (${divisiDihapus?.jumlah_anggota} orang) dari atribut divisi ini. Akun pengguna tetap ada di sistem.`
                : `Konfirmasi kedua wajib dilakukan: ketik nama divisi "${divisiDihapus?.nama_divisi}" untuk menyetujui penghapusan permanen.`}
            </DialogDescription>
          </DialogHeader>

          {tahapHapus === 2 && (
            <div className="space-y-2 py-1">
              <Label htmlFor="konfirmasi_hapus_divisi">
                Ketik ulang:{" "}
                <span className="font-mono font-bold text-foreground">
                  {divisiDihapus?.nama_divisi}
                </span>
              </Label>
              <Input
                id="konfirmasi_hapus_divisi"
                value={teksKonfirmasiHapus}
                onChange={(e) => aturTeksKonfirmasiHapus(e.target.value)}
                placeholder={divisiDihapus?.nama_divisi}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => aturDivisiDihapus(null)}
            >
              Batal
            </Button>
            {tahapHapus === 1 ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => aturTahapHapus(2)}
              >
                Lanjutkan ke Konfirmasi ke-2
              </Button>
            ) : (
              <Button
                type="button"
                variant="destructive"
                disabled={
                  sedangMemproses ||
                  teksKonfirmasiHapus.trim().toLowerCase() !==
                    divisiDihapus?.nama_divisi.trim().toLowerCase()
                }
                onClick={tanganiEksekusiHapus}
              >
                {sedangMemproses ? "Menghapus..." : "Ya, Hapus Divisi Permanen"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

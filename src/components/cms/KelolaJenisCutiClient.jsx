"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ListChecks, Pencil, Plus, Trash2 } from "lucide-react";
import {
  hapusJenisCuti,
  tambahJenisCutiBaru,
  ubahJenisCuti,
} from "@/actions/konfigurasi-aksi";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import DialogKonfirmasi from "@/components/tata-letak/DialogKonfirmasi";

function formatLabelBatasHari(batas) {
  const angka = Number(batas);
  if (angka > 0) return `Minimal H-${angka}`;
  if (angka < 0) return `H-0 s.d. H+${Math.abs(angka)} susulan`;
  return "Minimal H-0";
}

export default function KelolaJenisCutiClient({ daftarJenisCuti }) {
  const router = useRouter();
  const [sedangProses, mulaiTransisi] = useTransition();
  const [pesanBanner, aturPesanBanner] = useState(null);

  const [modalTambah, aturModalTambah] = useState(false);
  const [jenisDiedit, aturJenisDiedit] = useState(null);
  const [jenisDihapus, aturJenisDihapus] = useState(null);

  const [wajibLampiran, aturWajibLampiran] = useState(false);
  const [potongKuota, aturPotongKuota] = useState(false);
  const [statusAktif, aturStatusAktif] = useState(true);

  function bukaTambah() {
    aturWajibLampiran(false);
    aturPotongKuota(false);
    aturStatusAktif(true);
    aturPesanBanner(null);
    aturModalTambah(true);
  }

  function bukaEdit(item) {
    aturWajibLampiran(Boolean(item.wajib_lampiran));
    aturPotongKuota(Boolean(item.potong_kuota_tahunan));
    aturStatusAktif(Boolean(item.status_aktif));
    aturPesanBanner(null);
    aturJenisDiedit(item);
  }

  function tanganiTambah(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    mulaiTransisi(async () => {
      const hasil = await tambahJenisCutiBaru(formData);
      aturPesanBanner(hasil);
      if (hasil.sukses) {
        aturModalTambah(false);
        router.refresh();
      }
    });
  }

  function tanganiUbah(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    mulaiTransisi(async () => {
      const hasil = await ubahJenisCuti(formData);
      aturPesanBanner(hasil);
      if (hasil.sukses) {
        aturJenisDiedit(null);
        router.refresh();
      }
    });
  }

  function tanganiHapus() {
    if (!jenisDihapus) return;
    mulaiTransisi(async () => {
      const hasil = await hapusJenisCuti(jenisDihapus.id);
      aturPesanBanner(hasil);
      aturJenisDihapus(null);
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
            Manajemen Jenis Cuti Dinamis
          </h1>
          <p className="text-sm text-muted-foreground">
            Konfigurasi aturan jenis cuti langsung dari database tanpa hardcode.
          </p>
        </div>
        <Button onClick={bukaTambah} size="sm">
          <Plus className="size-4 mr-1.5" />
          Tambah Jenis Cuti
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
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ListChecks className="size-4 text-primary" />
            Daftar Jenis Cuti Terkonfigurasi
          </CardTitle>
          <CardDescription>
            Setiap jenis cuti mengatur batas hari pengajuan, syarat surat dokter/lampiran, dan pemotongan kuota tahunan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode &amp; Nama</TableHead>
                <TableHead>Kuota Maks</TableHead>
                <TableHead>Batas Pengajuan</TableHead>
                <TableHead>Syarat Lampiran</TableHead>
                <TableHead>Potong Kuota Utama</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {daftarJenisCuti.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-semibold">{item.nama_cuti}</div>
                    <div className="text-xs font-mono text-muted-foreground">
                      {item.kode_cuti}
                    </div>
                  </TableCell>
                  <TableCell>{item.kuota_default} Hari</TableCell>
                  <TableCell className="text-xs">
                    {formatLabelBatasHari(item.batas_hari_pengajuan)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.wajib_lampiran ? "default" : "outline"}>
                      {item.wajib_lampiran ? "Wajib Lampiran" : "Opsional"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.potong_kuota_tahunan ? "secondary" : "outline"
                      }
                    >
                      {item.potong_kuota_tahunan
                        ? "Potong Kuota Tahunan"
                        : "Tidak Memotong"}
                    </Badge>
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
                  <TableCell className="text-right space-x-1">
                    <Button
                      size="icon-sm"
                      variant="outline"
                      onClick={() => bukaEdit(item)}
                      aria-label="Edit jenis cuti"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      disabled={sedangProses}
                      onClick={() => aturJenisDihapus(item)}
                      aria-label="Hapus jenis cuti"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={modalTambah} onOpenChange={aturModalTambah}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Jenis Cuti Baru</DialogTitle>
            <DialogDescription>
              Atur parameter jenis cuti baru seperti Cuti Ibadah, Cuti Belajar, atau lainnya.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={tanganiTambah} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tambah_kode">Kode Cuti</Label>
                <Input
                  id="tambah_kode"
                  name="kode_cuti"
                  placeholder="IBADAH"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tambah_nama_cuti">Nama Jenis Cuti</Label>
                <Input
                  id="tambah_nama_cuti"
                  name="nama_cuti"
                  placeholder="Cuti Ibadah"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tambah_desk_cuti">Deskripsi</Label>
              <Textarea id="tambah_desk_cuti" name="deskripsi" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tambah_kuota_def">Kuota Maks (Hari)</Label>
                <Input
                  id="tambah_kuota_def"
                  name="kuota_default"
                  type="number"
                  min={0}
                  defaultValue={5}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tambah_batas">
                  Batas Pengajuan (Hari)
                </Label>
                <Input
                  id="tambah_batas"
                  name="batas_hari_pengajuan"
                  type="number"
                  defaultValue={3}
                  required
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Gunakan angka positif untuk minimal H-N (contoh: 3 = H-3), atau angka negatif untuk pengajuan susulan (contoh: -3 = maks 3 hari setelah mulai).
            </p>
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={wajibLampiran}
                  onCheckedChange={(v) => aturWajibLampiran(Boolean(v))}
                />
                <input
                  type="hidden"
                  name="wajib_lampiran"
                  value={wajibLampiran ? "on" : ""}
                />
                <span>Wajib melampirkan dokumen/surat</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={potongKuota}
                  onCheckedChange={(v) => aturPotongKuota(Boolean(v))}
                />
                <input
                  type="hidden"
                  name="potong_kuota_tahunan"
                  value={potongKuota ? "on" : ""}
                />
                <span>Memotong kuota cuti tahunan utama</span>
              </label>
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => aturModalTambah(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={sedangProses}>
                Simpan Jenis Cuti
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(jenisDiedit)}
        onOpenChange={(terbuka) => !terbuka && aturJenisDiedit(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Jenis Cuti</DialogTitle>
            <DialogDescription>
              Perubahan aturan akan langsung diterapkan pada pengajuan baru berikutnya.
            </DialogDescription>
          </DialogHeader>
          {jenisDiedit && (
            <form onSubmit={tanganiUbah} className="space-y-3">
              <input type="hidden" name="id" value={jenisDiedit.id} />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit_kode">Kode Cuti</Label>
                  <Input
                    id="edit_kode"
                    name="kode_cuti"
                    defaultValue={jenisDiedit.kode_cuti}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit_nama_cuti">Nama Jenis Cuti</Label>
                  <Input
                    id="edit_nama_cuti"
                    name="nama_cuti"
                    defaultValue={jenisDiedit.nama_cuti}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit_desk_cuti">Deskripsi</Label>
                <Textarea
                  id="edit_desk_cuti"
                  name="deskripsi"
                  rows={2}
                  defaultValue={jenisDiedit.deskripsi || ""}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit_kuota_def">Kuota Maks (Hari)</Label>
                  <Input
                    id="edit_kuota_def"
                    name="kuota_default"
                    type="number"
                    min={0}
                    defaultValue={jenisDiedit.kuota_default}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit_batas">Batas Pengajuan (Hari)</Label>
                  <Input
                    id="edit_batas"
                    name="batas_hari_pengajuan"
                    type="number"
                    defaultValue={jenisDiedit.batas_hari_pengajuan}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={wajibLampiran}
                    onCheckedChange={(v) => aturWajibLampiran(Boolean(v))}
                  />
                  <input
                    type="hidden"
                    name="wajib_lampiran"
                    value={wajibLampiran ? "on" : ""}
                  />
                  <span>Wajib melampirkan dokumen/surat</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={potongKuota}
                    onCheckedChange={(v) => aturPotongKuota(Boolean(v))}
                  />
                  <input
                    type="hidden"
                    name="potong_kuota_tahunan"
                    value={potongKuota ? "on" : ""}
                  />
                  <span>Memotong kuota cuti tahunan utama</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={statusAktif}
                    onCheckedChange={(v) => aturStatusAktif(Boolean(v))}
                  />
                  <input
                    type="hidden"
                    name="status_aktif"
                    value={statusAktif ? "on" : ""}
                  />
                  <span>Status aktif ditampilkan di form pengajuan</span>
                </label>
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => aturJenisDiedit(null)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={sedangProses}>
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <DialogKonfirmasi
        terbuka={Boolean(jenisDihapus)}
        saatUbahTerbuka={(terbuka) => !terbuka && aturJenisDihapus(null)}
        judul="Hapus Jenis Cuti?"
        deskripsi={`Jenis cuti "${jenisDihapus?.nama_cuti}" akan dihapus permanen dari daftar kebijakan perusahaan.`}
        labelKonfirmasi="Hapus Jenis Cuti"
        sedangMemproses={sedangProses}
        saatKonfirmasi={tanganiHapus}
      />
    </div>
  );
}

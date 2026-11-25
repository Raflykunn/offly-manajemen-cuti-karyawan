"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  CalendarCog,
  CalendarOff,
  Pencil,
  Plus,
  Save,
  Trash2,
  Users,
} from "lucide-react";
import {
  hapusHariLibur,
  hapusPeriodeBlackout,
  perbaruiBatasKapasitasDivisi,
  tambahHariLibur,
  tambahPeriodeBlackout,
  ubahHariLibur,
  ubahStatusBlackout,
} from "@/actions/konfigurasi-aksi";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import DialogKonfirmasi from "@/components/tata-letak/DialogKonfirmasi";

export default function KelolaKalenderClient({
  hariLibur,
  periodeBlackout,
  daftarDivisi,
}) {
  const router = useRouter();
  const [sedangProses, mulaiTransisi] = useTransition();
  const [pesanBanner, aturPesanBanner] = useState(null);
  const [jenisLibur, aturJenisLibur] = useState("Libur Nasional");
  const [targetHapus, aturTargetHapus] = useState(null);
  const [liburDiedit, aturLiburDiedit] = useState(null);
  const [nilaiKapasitas, aturNilaiKapasitas] = useState(() => {
    const awal = {};
    for (const d of daftarDivisi) {
      awal[d.id] = String(d.batas_kapasitas_persen);
    }
    return awal;
  });

  function tanganiTambahLibur(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    mulaiTransisi(async () => {
      const hasil = await tambahHariLibur(formData);
      aturPesanBanner(hasil);
      if (hasil.sukses) {
        form.reset();
        router.refresh();
      }
    });
  }

  function tanganiUbahLibur(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    mulaiTransisi(async () => {
      const hasil = await ubahHariLibur(formData);
      aturPesanBanner(hasil);
      if (hasil.sukses) {
        aturLiburDiedit(null);
        router.refresh();
      }
    });
  }

  function tanganiKonfirmasiHapus() {
    if (!targetHapus) return;
    mulaiTransisi(async () => {
      const hasil =
        targetHapus.jenis === "libur"
          ? await hapusHariLibur(targetHapus.id)
          : await hapusPeriodeBlackout(targetHapus.id);
      aturPesanBanner(hasil);
      aturTargetHapus(null);
      router.refresh();
    });
  }

  function tanganiTambahBlackout(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    mulaiTransisi(async () => {
      const hasil = await tambahPeriodeBlackout(formData);
      aturPesanBanner(hasil);
      if (hasil.sukses) {
        form.reset();
        router.refresh();
      }
    });
  }

  function tanganiToggleBlackout(id, statusSaatIni) {
    mulaiTransisi(async () => {
      const hasil = await ubahStatusBlackout(id, !statusSaatIni);
      aturPesanBanner(hasil);
      router.refresh();
    });
  }

  function tanganiSimpanKapasitas(divisiId) {
    mulaiTransisi(async () => {
      const hasil = await perbaruiBatasKapasitasDivisi(
        divisiId,
        nilaiKapasitas[divisiId]
      );
      aturPesanBanner(hasil);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CalendarCog className="size-6 text-primary" />
          Pengaturan Kalender, Larangan Cuti &amp; Kapasitas Tim
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola hari libur nasional/cuti bersama, tanggal larangan cuti, dan batas persentase cuti per divisi.
        </p>
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

      <Tabs defaultValue="libur" className="space-y-4">
        <TabsList>
          <TabsTrigger value="libur">Hari Libur &amp; Cuti Bersama</TabsTrigger>
          <TabsTrigger value="blackout">Periode Blackout</TabsTrigger>
          <TabsTrigger value="kapasitas">Kapasitas Tim Divisi</TabsTrigger>
        </TabsList>

        <TabsContent value="libur" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-4 h-fit">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="size-4 text-primary" />
                  Tambah Hari Libur
                </CardTitle>
                <CardDescription>
                  Tanggal yang terdaftar di sini otomatis dikecualikan dari hitungan hari cuti karyawan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={tanganiTambahLibur} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="tgl_libur">Tanggal</Label>
                    <Input id="tgl_libur" name="tanggal" type="date" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="nama_libur">Keterangan Hari Libur</Label>
                    <Input
                      id="nama_libur"
                      name="nama_libur"
                      placeholder="Contoh: Cuti Bersama Lebaran"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Jenis Hari Libur</Label>
                    <Select
                      name="jenis"
                      value={jenisLibur}
                      onValueChange={aturJenisLibur}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>{(v) => v}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Libur Nasional">
                          Libur Nasional
                        </SelectItem>
                        <SelectItem value="Cuti Bersama">
                          Cuti Bersama
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={sedangProses}
                  >
                    Tambah Tanggal Libur
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-8">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarOff className="size-4 text-primary" />
                  Daftar Hari Libur &amp; Cuti Bersama ({hariLibur.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Keterangan</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hariLibur.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {formatTanggalIndo(item.tanggal)}
                        </TableCell>
                        <TableCell>{item.nama_libur}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.jenis}</Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            size="icon-sm"
                            variant="outline"
                            aria-label={`Edit ${item.nama_libur}`}
                            disabled={sedangProses}
                            onClick={() => aturLiburDiedit({ ...item })}
                          >
                            <Pencil className="size-3.5" aria-hidden="true" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="destructive"
                            aria-label={`Hapus ${item.nama_libur}`}
                            disabled={sedangProses}
                            onClick={() =>
                              aturTargetHapus({
                                jenis: "libur",
                                id: item.id,
                                label: item.nama_libur,
                              })
                            }
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
          </div>
        </TabsContent>

        <TabsContent value="blackout" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-4 h-fit">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Ban className="size-4 text-primary" />
                  Tambah Periode Larangan Cuti
                </CardTitle>
                <CardDescription>
                  Rentang tanggal sibuk (misal tutup buku) saat pengajuan cuti diblokir.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={tanganiTambahBlackout} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="nama_periode">Nama Periode</Label>
                    <Input
                      id="nama_periode"
                      name="nama_periode"
                      placeholder="Audit Tahunan Q4"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="bo_mulai">Tanggal Mulai</Label>
                      <Input
                        id="bo_mulai"
                        name="tanggal_mulai"
                        type="date"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bo_selesai">Tanggal Selesai</Label>
                      <Input
                        id="bo_selesai"
                        name="tanggal_selesai"
                        type="date"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bo_alasan">Alasan</Label>
                    <Textarea id="bo_alasan" name="alasan" rows={2} required />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={sedangProses}
                  >
                    Simpan Periode Larangan Cuti
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-8">
              <CardHeader>
                <CardTitle className="text-base">
                  Daftar Periode Larangan Cuti ({periodeBlackout.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Periode &amp; Alasan</TableHead>
                      <TableHead>Rentang Tanggal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {periodeBlackout.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-semibold">{item.nama_periode}</div>
                          <p className="text-xs text-muted-foreground">
                            {item.alasan}
                          </p>
                        </TableCell>
                        <TableCell className="text-xs">
                          {formatTanggalIndo(item.tanggal_mulai)} s.d.{" "}
                          {formatTanggalIndo(item.tanggal_selesai)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              item.status_aktif
                                ? "bg-rose-50 text-rose-800 border-rose-200"
                                : "bg-zinc-100 text-zinc-700"
                            }
                          >
                            {item.status_aktif ? "Aktif Memblokir" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={sedangProses}
                            onClick={() =>
                              tanganiToggleBlackout(item.id, item.status_aktif)
                            }
                          >
                            {item.status_aktif ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="destructive"
                            aria-label={`Hapus ${item.nama_periode || "periode blackout"}`}
                            disabled={sedangProses}
                            onClick={() =>
                              aturTargetHapus({
                                jenis: "blackout",
                                id: item.id,
                                label: item.nama_periode || "periode blackout ini",
                              })
                            }
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
          </div>
        </TabsContent>

        <TabsContent value="kapasitas">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="size-4 text-primary" />
                Pengaturan Batas Maksimal Kapasitas Cuti per Divisi
              </CardTitle>
              <CardDescription>
                Menentukan batas persentase maksimal anggota dalam satu divisi yang diperbolehkan cuti pada rentang tanggal yang bersamaan.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Divisi</TableHead>
                    <TableHead>Ketua Divisi</TableHead>
                    <TableHead>Anggota Aktif</TableHead>
                    <TableHead>Batas Maksimal (%)</TableHead>
                    <TableHead className="text-right">Simpan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {daftarDivisi.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-semibold">
                        {d.nama_divisi}
                      </TableCell>
                      <TableCell>{d.nama_ketua_divisi || "-"}</TableCell>
                      <TableCell>{d.jumlah_anggota} Orang</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 w-32">
                          <Input
                            type="number"
                            min={5}
                            max={100}
                            value={nilaiKapasitas[d.id] ?? "30"}
                            onChange={(e) =>
                              aturNilaiKapasitas((prev) => ({
                                ...prev,
                                [d.id]: e.target.value,
                              }))
                            }
                            className="h-8"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          disabled={sedangProses}
                          onClick={() => tanganiSimpanKapasitas(d.id)}
                        >
                          <Save className="size-3.5 mr-1" />
                          Simpan
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={Boolean(liburDiedit)}
        onOpenChange={(terbuka) => !terbuka && aturLiburDiedit(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Hari Libur</DialogTitle>
            <DialogDescription>
              Perbarui tanggal, keterangan, atau jenis hari libur.
            </DialogDescription>
          </DialogHeader>
          {liburDiedit && (
            <form onSubmit={tanganiUbahLibur} className="space-y-3">
              <input type="hidden" name="id" value={liburDiedit.id} />
              <div className="space-y-1.5">
                <Label htmlFor="edit_tgl_libur">Tanggal</Label>
                <Input
                  id="edit_tgl_libur"
                  name="tanggal"
                  type="date"
                  defaultValue={liburDiedit.tanggal}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit_nama_libur">Keterangan Hari Libur</Label>
                <Input
                  id="edit_nama_libur"
                  name="nama_libur"
                  defaultValue={liburDiedit.nama_libur}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Jenis Hari Libur</Label>
                <Select
                  name="jenis"
                  value={liburDiedit.jenis}
                  onValueChange={(nilai) =>
                    aturLiburDiedit((lama) =>
                      lama ? { ...lama, jenis: nilai } : lama
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>{(v) => v}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Libur Nasional">
                      Libur Nasional
                    </SelectItem>
                    <SelectItem value="Cuti Bersama">Cuti Bersama</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => aturLiburDiedit(null)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={sedangProses}>
                  {sedangProses ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <DialogKonfirmasi
        terbuka={Boolean(targetHapus)}
        saatUbahTerbuka={(terbuka) => !terbuka && aturTargetHapus(null)}
        judul={
          targetHapus?.jenis === "libur"
            ? "Hapus Hari Libur?"
            : "Hapus Periode Larangan Cuti?"
        }
        deskripsi={`Data "${targetHapus?.label}" akan dihapus dari pengaturan kalender perusahaan.`}
        labelKonfirmasi="Ya, Hapus"
        sedangMemproses={sedangProses}
        saatKonfirmasi={tanganiKonfirmasiHapus}
      />
    </div>
  );
}

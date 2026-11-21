"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Download, Eye, History, Search } from "lucide-react";
import { batalkanPengajuanCuti } from "@/actions/cuti-aksi";
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
  KepalaTabelSortir,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import LencanaStatusCuti from "./LencanaStatusCuti";
import ModalDetailCuti from "./ModalDetailCuti";

export default function RiwayatCutiClient({
  sesiPeran,
  sesiPenggunaId,
  daftarRiwayat,
  daftarJenisCuti,
  daftarDivisi,
}) {
  const router = useRouter();
  const [sedangProses, mulaiTransisi] = useTransition();
  const [cari, aturCari] = useState("");
  const [filterStatus, aturFilterStatus] = useState("semua");
  const [filterJenis, aturFilterJenis] = useState("semua");
  const [filterDivisi, aturFilterDivisi] = useState("semua");
  const [urutkan, aturUrutkan] = useState("terbaru");
  const [detailDipilih, aturDetailDipilih] = useState(null);
  const [pengajuanDibatalkan, aturPengajuanDibatalkan] = useState(null);
  const [alasanBatal, aturAlasanBatal] = useState("");
  const [pesanBanner, aturPesanBanner] = useState(null);

  function tanganiEksekusiBatal() {
    if (!pengajuanDibatalkan) return;
    mulaiTransisi(async () => {
      const hasil = await batalkanPengajuanCuti(
        pengajuanDibatalkan.id,
        alasanBatal
      );
      aturPesanBanner(hasil);
      if (hasil.sukses) {
        aturPengajuanDibatalkan(null);
        aturAlasanBatal("");
        router.refresh();
      }
    });
  }

  const petaJenis = useMemo(() => {
    const peta = new Map();
    for (const j of daftarJenisCuti) {
      peta.set(String(j.id), j.nama_cuti);
    }
    return peta;
  }, [daftarJenisCuti]);

  const petaDivisi = useMemo(() => {
    const peta = new Map();
    for (const d of daftarDivisi) {
      peta.set(String(d.id), d.nama_divisi);
    }
    return peta;
  }, [daftarDivisi]);

  const daftarTersaring = useMemo(() => {
    const kueri = cari.trim().toLowerCase();
    const hasil = daftarRiwayat.filter((item) => {
      if (kueri) {
        const cocok =
          item.nomor_pengajuan.toLowerCase().includes(kueri) ||
          item.nama_pemohon.toLowerCase().includes(kueri) ||
          item.alasan_cuti.toLowerCase().includes(kueri);
        if (!cocok) return false;
      }
      if (filterStatus !== "semua" && item.status !== filterStatus) {
        return false;
      }
      if (
        filterJenis !== "semua" &&
        String(item.jenis_cuti_id) !== filterJenis
      ) {
        return false;
      }
      if (
        filterDivisi !== "semua" &&
        String(item.divisi_id) !== filterDivisi
      ) {
        return false;
      }
      return true;
    });

    return [...hasil].sort((a, b) => {
      if (urutkan === "mulai_terawal") {
        return a.tanggal_mulai.localeCompare(b.tanggal_mulai);
      }
      if (urutkan === "mulai_terakhir") {
        return b.tanggal_mulai.localeCompare(a.tanggal_mulai);
      }
      if (urutkan === "durasi_tersingkat") {
        return a.total_hari_cuti - b.total_hari_cuti;
      }
      if (urutkan === "durasi_terlama") {
        return b.total_hari_cuti - a.total_hari_cuti;
      }
      return (b.dibuat_pada || "").localeCompare(a.dibuat_pada || "");
    });
  }, [daftarRiwayat, cari, filterStatus, filterJenis, filterDivisi, urutkan]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <History className="size-6 text-primary" />
          Riwayat Pengajuan Cuti
        </h1>
        <p className="text-sm text-muted-foreground">
          {sesiPeran === "admin" || sesiPeran === "hrd"
            ? "Seluruh riwayat pengajuan cuti karyawan dan ketua divisi di perusahaan."
            : sesiPeran === "ketua_divisi"
              ? "Riwayat pengajuan cuti pribadi dan seluruh anggota divisi yang Anda pimpin."
              : "Riwayat pengajuan cuti pribadi serta penugasan sebagai rekan pengganti."}
        </p>
      </div>

      {pesanBanner && (
        <Alert
          variant={pesanBanner.sukses ? "default" : "destructive"}
          className={
            pesanBanner.sukses
              ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
              : ""
          }
        >
          <AlertDescription>{pesanBanner.pesan}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Data Riwayat &amp; Surat Cuti</CardTitle>
          <CardDescription>
            Menampilkan {daftarTersaring.length} dari {daftarRiwayat.length} catatan pengajuan cuti.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Cari nomor, nama, alasan..."
                value={cari}
                onChange={(e) => aturCari(e.target.value)}
                className="pl-9 h-8"
              />
            </div>

            <Select value={filterStatus} onValueChange={aturFilterStatus}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v) => (v === "semua" ? "Semua Status" : v)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved by Leader">
                  Approved by Leader
                </SelectItem>
                <SelectItem value="Approved by HRD">Approved by HRD</SelectItem>
                <SelectItem value="Rejected by Leader">
                  Rejected by Leader
                </SelectItem>
                <SelectItem value="Rejected by HRD">Rejected by HRD</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterJenis} onValueChange={aturFilterJenis}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v) =>
                    v === "semua"
                      ? "Semua Jenis Cuti"
                      : petaJenis.get(v) || "Jenis Cuti"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Jenis Cuti</SelectItem>
                {daftarJenisCuti.map((j) => (
                  <SelectItem key={j.id} value={String(j.id)}>
                    {j.nama_cuti}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(sesiPeran === "admin" || sesiPeran === "hrd") && (
              <Select value={filterDivisi} onValueChange={aturFilterDivisi}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(v) =>
                      v === "semua"
                        ? "Semua Divisi"
                        : petaDivisi.get(v) || "Divisi"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Divisi</SelectItem>
                  {daftarDivisi.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.nama_divisi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={urutkan} onValueChange={aturUrutkan}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v) => {
                    if (v === "mulai_terawal") return "Tanggal Mulai Terawal";
                    if (v === "mulai_terakhir") return "Tanggal Mulai Terakhir";
                    if (v === "durasi_tersingkat") return "Durasi Tersingkat";
                    if (v === "durasi_terlama") return "Durasi Terlama";
                    return "Terbaru Diajukan";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="terbaru">Terbaru Diajukan</SelectItem>
                <SelectItem value="mulai_terawal">
                  Tanggal Mulai Terawal
                </SelectItem>
                <SelectItem value="mulai_terakhir">
                  Tanggal Mulai Terakhir
                </SelectItem>
                <SelectItem value="durasi_tersingkat">
                  Durasi Tersingkat
                </SelectItem>
                <SelectItem value="durasi_terlama">Durasi Terlama</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor &amp; Pemohon</TableHead>
                <TableHead>Jenis Cuti</TableHead>
                <KepalaTabelSortir
                  label="Periode"
                  nilaiAktif={urutkan}
                  nilaiNaik="mulai_terawal"
                  nilaiTurun="mulai_terakhir"
                  saatUbah={aturUrutkan}
                />
                <KepalaTabelSortir
                  label="Durasi"
                  nilaiAktif={urutkan}
                  nilaiNaik="durasi_tersingkat"
                  nilaiTurun="durasi_terlama"
                  saatUbah={aturUrutkan}
                />
                <TableHead>Status</TableHead>
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
                    Tidak ada riwayat cuti yang sesuai filter.
                  </TableCell>
                </TableRow>
              ) : (
                daftarTersaring.map((item) => {
                  const adalahHandover =
                    item.rekan_pengganti_id === sesiPenggunaId &&
                    item.pengguna_id !== sesiPenggunaId;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold">
                            {item.nomor_pengajuan}
                          </span>
                          {adalahHandover && (
                            <Badge variant="outline" className="text-[10px]">
                              Rekan Handover
                            </Badge>
                          )}
                        </div>
                        <div className="font-medium text-sm">
                          {item.nama_pemohon}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {labelPeranPengguna(item.peran_pemohon)}
                          {item.nama_divisi ? ` • ${item.nama_divisi}` : ""}
                        </div>
                      </TableCell>
                      <TableCell>{item.nama_cuti}</TableCell>
                      <TableCell className="text-xs">
                        {formatTanggalIndo(item.tanggal_mulai)} –{" "}
                        {formatTanggalIndo(item.tanggal_selesai)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatAngkaKuota(item.total_hari_cuti)} Hari
                      </TableCell>
                      <TableCell>
                        <LencanaStatusCuti status={item.status} />
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => aturDetailDipilih(item)}
                        >
                          <Eye className="size-3.5 mr-1" />
                          Detail
                        </Button>
                        {item.pengguna_id === sesiPenggunaId &&
                          item.status === "Pending" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                aturAlasanBatal("");
                                aturPengajuanDibatalkan(item);
                              }}
                            >
                              <Ban className="size-3.5 mr-1" />
                              Batalkan
                            </Button>
                          )}
                        {item.status === "Approved by HRD" && (
                          <Button
                            size="sm"
                            variant="default"
                            nativeButton={false}
                            render={
                              <a
                                href={`/api/cuti/${item.id}/surat`}
                                target="_blank"
                                rel="noreferrer"
                              />
                            }
                          >
                            <Download className="size-3.5 mr-1" />
                            Surat PDF
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

      <ModalDetailCuti
        pengajuan={detailDipilih}
        saatTutup={() => aturDetailDipilih(null)}
      />

      <Dialog
        open={Boolean(pengajuanDibatalkan)}
        onOpenChange={(terbuka) => !terbuka && aturPengajuanDibatalkan(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Batalkan Pengajuan Cuti</DialogTitle>
            <DialogDescription>
              Pengajuan{" "}
              <span className="font-mono font-semibold text-foreground">
                {pengajuanDibatalkan?.nomor_pengajuan}
              </span>{" "}
              akan dibatalkan dan kuota cuti tahunan Anda akan dikembalikan otomatis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="alasan_batal">Alasan Pembatalan (Wajib)</Label>
            <Textarea
              id="alasan_batal"
              rows={3}
              value={alasanBatal}
              onChange={(e) => aturAlasanBatal(e.target.value)}
              placeholder="Tuliskan alasan pembatalan cuti"
              required
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => aturPengajuanDibatalkan(null)}
            >
              Tutup
            </Button>
            <Button
              variant="destructive"
              disabled={sedangProses || !alasanBatal.trim()}
              onClick={tanganiEksekusiBatal}
            >
              {sedangProses ? "Membatalkan..." : "Konfirmasi Batalkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

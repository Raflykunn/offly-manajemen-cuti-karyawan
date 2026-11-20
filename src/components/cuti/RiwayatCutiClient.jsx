"use client";

import { useMemo, useState } from "react";
import { Download, Eye, History, Search } from "lucide-react";
import {
  formatAngkaKuota,
  formatTanggalIndo,
  labelPeranPengguna,
} from "@/lib/kalkulasi-cuti";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import LencanaStatusCuti from "./LencanaStatusCuti";
import ModalDetailCuti from "./ModalDetailCuti";

export default function RiwayatCutiClient({
  sesiPeran,
  sesiPenggunaId,
  daftarRiwayat,
  daftarJenisCuti,
  daftarDivisi,
}) {
  const [cari, aturCari] = useState("");
  const [filterStatus, aturFilterStatus] = useState("semua");
  const [filterJenis, aturFilterJenis] = useState("semua");
  const [filterDivisi, aturFilterDivisi] = useState("semua");
  const [urutkan, aturUrutkan] = useState("terbaru");
  const [detailDipilih, aturDetailDipilih] = useState(null);

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
                <SelectItem value="durasi_terlama">Durasi Terlama</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor &amp; Pemohon</TableHead>
                <TableHead>Jenis Cuti</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Durasi</TableHead>
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
                        {item.status === "Approved by HRD" && (
                          <Button
                            size="sm"
                            variant="default"
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
    </div>
  );
}

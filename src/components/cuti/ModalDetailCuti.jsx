"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  MapPin,
  Phone,
  RotateCcw,
  UserCheck,
  XCircle,
} from "lucide-react";
import {
  apakahUrlLampiranAman,
  formatAngkaKuota,
  formatTanggalIndo,
  labelPeranPengguna,
} from "@/lib/kalkulasi-cuti";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import LencanaStatusCuti from "./LencanaStatusCuti";

export default function ModalDetailCuti({
  pengajuan,
  saatTutup,
  bisaAjukanUlang = false,
}) {
  if (!pengajuan) return null;

  const langsungKeHrd = pengajuan.peran_pemohon === "ketua_divisi";
  const disetujuiHrd = pengajuan.status === "Approved by HRD";

  return (
    <Dialog open={Boolean(pengajuan)} onOpenChange={(buka) => !buka && saatTutup()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <DialogTitle className="text-base font-semibold">
              {pengajuan.nomor_pengajuan}
            </DialogTitle>
            <LencanaStatusCuti status={pengajuan.status} />
          </div>
          <DialogDescription>
            Diajukan pada {formatTanggalIndo(pengajuan.tanggal_pengajuan)} oleh{" "}
            <span className="font-medium text-foreground">
              {pengajuan.nama_pemohon}
            </span>{" "}
            ({labelPeranPengguna(pengajuan.peran_pemohon)})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg border bg-muted/40 p-3.5">
            <div>
              <p className="text-sm text-muted-foreground">Jenis Cuti</p>
              <p className="font-semibold text-base">{pengajuan.nama_cuti}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Periode Cuti</p>
              <p className="font-semibold text-base">
                {formatTanggalIndo(pengajuan.tanggal_mulai)} s.d.{" "}
                {formatTanggalIndo(pengajuan.tanggal_selesai)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Durasi</p>
              <p className="font-semibold text-base text-primary">
                {formatAngkaKuota(pengajuan.total_hari_cuti)} Hari Kerja{" "}
                {pengajuan.opsi_setengah_hari ? "(Setengah Hari)" : ""}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Alasan &amp; Serah Terima (Handover)
            </p>
            <div className="rounded-lg border p-3 space-y-2">
              <p>{pengajuan.alasan_cuti}</p>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="size-3.5 text-primary" />
                  <span className="text-muted-foreground">Rekan Pengganti:</span>
                  <span className="font-medium">
                    {pengajuan.nama_rekan_pengganti || "-"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-primary" />
                  <span className="text-muted-foreground">Nomor Darurat:</span>
                  <span className="font-medium">{pengajuan.nomor_darurat}</span>
                </div>
                <div className="sm:col-span-2 flex items-start gap-1.5">
                  <MapPin className="size-3.5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Alamat Selama Cuti:</span>
                  <span className="font-medium">{pengajuan.alamat_selama_cuti}</span>
                </div>
              </div>
              {pengajuan.catatan_tugas && (
                <div className="rounded border bg-muted/30 p-2 text-xs">
                  <span className="font-semibold">Catatan Tugas Handover: </span>
                  {pengajuan.catatan_tugas}
                </div>
              )}
            </div>
          </div>

          {apakahUrlLampiranAman(pengajuan.lampiran_url) && (
            <div className="rounded-lg border p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <FileText className="size-4 text-primary" />
                <span>Lampiran Surat Dokter / Dokumen Pendukung</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={
                  <a
                    href={pengajuan.lampiran_url}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                Lihat Lampiran
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Timeline Approval
            </p>
            <div className="rounded-lg border p-3.5 space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">1. Pengajuan Dibuat</p>
                  <p className="text-muted-foreground">
                    {formatTanggalIndo(pengajuan.dibuat_pada, true)} oleh{" "}
                    {pengajuan.nama_pemohon}
                  </p>
                </div>
              </div>

              {!langsungKeHrd && (
                <div className="flex items-start gap-2.5">
                  {pengajuan.status === "Rejected by Leader" ? (
                    <XCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                  ) : pengajuan.waktu_verifikasi_ketua ? (
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">2. Verifikasi Ketua Divisi</p>
                    {pengajuan.waktu_verifikasi_ketua ? (
                      <>
                        <p className="text-muted-foreground">
                          {pengajuan.nama_ketua_approver || "Ketua Divisi"} •{" "}
                          {formatTanggalIndo(pengajuan.waktu_verifikasi_ketua, true)}
                        </p>
                        {pengajuan.catatan_ketua && (
                          <p className="mt-1 rounded bg-muted/50 px-2 py-1 border">
                            Catatan: {pengajuan.catatan_ketua}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground">
                        {pengajuan.status === "Cancelled"
                          ? "Dibatalkan oleh pemohon."
                          : "Menunggu verifikasi Ketua Divisi."}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2.5">
                {pengajuan.status === "Rejected by HRD" ? (
                  <XCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                ) : pengajuan.status === "Approved by HRD" ? (
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="size-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">
                    {langsungKeHrd ? "2" : "3"}. Persetujuan Final HRD
                  </p>
                  {pengajuan.waktu_verifikasi_hrd ? (
                    <>
                      <p className="text-muted-foreground">
                        {pengajuan.nama_hrd_approver || "HRD"} •{" "}
                        {formatTanggalIndo(pengajuan.waktu_verifikasi_hrd, true)}
                      </p>
                      {pengajuan.catatan_hrd && (
                        <p className="mt-1 rounded bg-muted/50 px-2 py-1 border">
                          Catatan: {pengajuan.catatan_hrd}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      {pengajuan.status === "Cancelled"
                        ? "Pengajuan dibatalkan."
                        : "Menunggu persetujuan final HRD."}
                    </p>
                  )}
                </div>
              </div>

              {pengajuan.status === "Cancelled" && pengajuan.alasan_pembatalan && (
                <div className="rounded border bg-zinc-50 p-2 text-zinc-800">
                  <span className="font-semibold">Alasan Pembatalan: </span>
                  {pengajuan.alasan_pembatalan}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          {bisaAjukanUlang && (
            <Button
              variant="default"
              nativeButton={false}
              render={<Link href={`/pengajuan-cuti?ulangi=${pengajuan.id}`} />}
            >
              <RotateCcw className="size-4 mr-1.5" />
              Ajukan Ulang
            </Button>
          )}
          {disetujuiHrd && (
            <Button
              variant="default"
              nativeButton={false}
              render={
                <a href={`/api/cuti/${pengajuan.id}/surat`} target="_blank" rel="noreferrer" />
              }
            >
              <Download className="size-4 mr-1.5" />
              Unduh Surat Cuti (PDF)
            </Button>
          )}
          <Button variant="outline" onClick={saatTutup}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

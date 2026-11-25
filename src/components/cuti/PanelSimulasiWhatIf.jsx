"use client";

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";
import { formatAngkaKuota, formatTanggalIndo } from "@/lib/kalkulasi-cuti";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PanelSimulasiWhatIf({
  simulasi,
  sedangMemuat,
  sisaKuotaAwal,
}) {
  return (
    <Card className="border-primary/30 bg-accent/15 sticky top-20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Simulasi Kuota &amp; Kalender (What-If)
          </CardTitle>
          {sedangMemuat && (
            <Badge variant="outline" className="text-sm">
              Menghitung...
            </Badge>
          )}
        </div>
        <CardDescription>
          Pratinjau dinamis dampak pengajuan terhadap kuota tahunan dan jadwal tim divisi Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {!simulasi ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-4 text-center space-y-2">
              <CalendarDays className="size-6 text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">
                Pilih jenis cuti, tanggal mulai, dan tanggal selesai untuk melihat simulasi kuota &amp; kalender tim secara real-time.
              </p>
              <p className="text-base font-semibold">
                Sisa Kuota Saat Ini:{" "}
                <span className="text-primary">
                  {formatAngkaKuota(sisaKuotaAwal)} Hari
                </span>
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4 space-y-2.5 text-sm">
              <p className="font-semibold text-foreground">Ketentuan Ringkas Pengajuan</p>
              <ul className="space-y-1.5 text-muted-foreground list-disc pl-4 leading-relaxed">
                <li>Akhir pekan dan hari libur nasional otomatis dilewati dari hitungan kuota.</li>
                <li>Cuti setengah hari (0.5) hanya aktif bila tanggal mulai dan selesai sama.</li>
                <li>Cuti sakit dapat diajukan maksimal H-3 hingga H+3 dari tanggal izin.</li>
                <li>Pengajuan akan diteruskan ke Ketua Divisi dan/atau HRD sesuai peran pemohon.</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border bg-card p-2.5">
                <p className="text-sm text-muted-foreground">Hari Kerja</p>
                <p className="text-lg font-bold text-primary">
                  {formatAngkaKuota(simulasi.totalHari)}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-2.5">
                <p className="text-sm text-muted-foreground">Sisa Awal</p>
                <p className="text-lg font-bold">
                  {formatAngkaKuota(simulasi.sisaKuotaSekarang)}
                </p>
              </div>
              <div className="rounded-lg border-2 border-primary bg-accent p-2.5">
                <p className="text-sm font-medium text-accent-foreground">Proyeksi Sisa</p>
                <p className="text-lg font-bold text-primary">
                  {formatAngkaKuota(simulasi.proyeksiSisaKuota)}
                </p>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Akhir Pekan Terlewati</span>
                <span className="font-medium">
                  {simulasi.akhirPekanTerlewati} Hari
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hari Libur Nasional</span>
                <span className="font-medium">
                  {simulasi.hariLiburTerlewati.length} Hari
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pemotongan Kuota</span>
                <span className="font-medium">
                  {simulasi.memotongKuota
                    ? "Memotong Kuota Tahunan"
                    : "Tidak Memotong Kuota"}
                </span>
              </div>
              {simulasi.hariLiburTerlewati.length > 0 && (
                <div className="pt-1 border-t">
                  <p className="font-medium text-muted-foreground mb-1">
                    Hari libur di dalam rentang:
                  </p>
                  {simulasi.hariLiburTerlewati.map((h) => (
                    <p key={h.tanggal} className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                      • {formatTanggalIndo(h.tanggal)}: {h.nama}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {simulasi.infoKapasitas && (
              <div className="rounded-lg border bg-card p-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Users className="size-3.5 text-primary" />
                    Sinkronisasi Kalender Divisi
                  </span>
                  <Badge
                    variant={
                      simulasi.infoKapasitas.melebihiKapasitas
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {simulasi.infoKapasitas.persenSetelahPengajuan}% / Maks{" "}
                    {simulasi.infoKapasitas.batasPersen}%
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Total anggota aktif: {simulasi.infoKapasitas.totalAnggota} orang.
                  Rekan yang cuti di tanggal sama:{" "}
                  {simulasi.infoKapasitas.jumlahRekanCuti} orang.
                </p>
                {simulasi.infoKapasitas.rekanCutiBersamaan.length > 0 && (
                  <div className="space-y-1 pt-1 border-t">
                    {simulasi.infoKapasitas.rekanCutiBersamaan.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-medium">{r.nama_lengkap}</span>
                        <span className="text-muted-foreground">
                          {formatTanggalIndo(r.tanggal_mulai)} –{" "}
                          {formatTanggalIndo(r.tanggal_selesai)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Separator />

            {simulasi.dapatDiajukan ? (
              <Alert className="border-emerald-600/40 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-100">
                <CheckCircle2 className="size-4 text-emerald-700 dark:text-emerald-300" />
                <AlertDescription className="text-sm">
                  Pengajuan memenuhi seluruh aturan kuota, rentang waktu, dan kalender perusahaan.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="size-4" />
                <AlertDescription className="text-sm space-y-1">
                  {simulasi.daftarPesanValidasi.map((pesan, indeks) => (
                    <p key={indeks} className="flex items-start gap-1">
                      <AlertTriangle className="size-3 shrink-0 mt-0.5" />
                      <span>{pesan}</span>
                    </p>
                  ))}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

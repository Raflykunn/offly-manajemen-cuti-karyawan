import Link from "next/link";
import {
  Building2,
  CalendarCheck,
  CalendarPlus,
  FileText,
  Stethoscope,
  UserCheck2,
} from "lucide-react";
import {
  apakahLayakCutiTahunan,
  formatAngkaKuota,
  formatTanggalIndo,
  gayaStatusCuti,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DasborKaryawan({ data }) {
  const { infoPengguna, ringkasan, pengajuanTerbaru, tugasHandover } = data;
  const layakTahunan = apakahLayakCutiTahunan(infoPengguna.tanggal_bergabung);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dasbor Karyawan</h1>
          <p className="text-sm text-muted-foreground">
            Pantau sisa kuota cuti tahunan secara real-time, status pengajuan, dan tugas pengganti.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/pengajuan-cuti" />}
          size="sm"
        >
          <CalendarPlus className="size-4 mr-1.5" />
          Ajukan Cuti Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/30 bg-accent/25">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sisa Kuota Cuti Tahunan
            </CardTitle>
            <CalendarCheck className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatAngkaKuota(infoPengguna.sisa_kuota_cuti)} Hari
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dari kuota awal {formatAngkaKuota(infoPengguna.kuota_cuti_awal)} hari{" "}
              {layakTahunan ? "• Eligible" : "• Masa kerja < 1 thn"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cuti Sakit Diajukan
            </CardTitle>
            <Stethoscope className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ringkasan.jumlah_cuti_sakit} Kali
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tidak memotong kuota tahunan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pengajuan Cuti
            </CardTitle>
            <FileText className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ringkasan.total_pengajuan}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {ringkasan.sedang_diproses} pengajuan sedang diproses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Divisi &amp; Atasan
            </CardTitle>
            <Building2 className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {infoPengguna.nama_divisi || "Belum Ada Divisi"}
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              Ketua: {infoPengguna.nama_ketua_divisi || "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Pengajuan Cuti Terbaru</CardTitle>
              <CardDescription>
                Riwayat 5 permohonan cuti terakhir Anda.
              </CardDescription>
            </div>
            <Button
              nativeButton={false}
              render={<Link href="/riwayat-cuti" />}
              variant="outline"
              size="sm"
            >
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent>
            {pengajuanTerbaru.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Anda belum memiliki riwayat pengajuan cuti.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomor &amp; Jenis</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead>Durasi</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pengajuanTerbaru.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-mono text-xs font-semibold">
                          {item.nomor_pengajuan}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.nama_cuti}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatTanggalIndo(item.tanggal_mulai)} s.d.{" "}
                        {formatTanggalIndo(item.tanggal_selesai)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatAngkaKuota(item.total_hari_cuti)} Hari
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={gayaStatusCuti(item.status)}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck2 className="size-4 text-primary" />
              Tugas Pengganti (Handover)
            </CardTitle>
            <CardDescription>
              Rekan divisi yang menunjuk Anda sebagai pengganti sementara.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tugasHandover.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Tidak ada jadwal serah terima tugas aktif untuk Anda.
              </p>
            ) : (
              <div className="space-y-3">
                {tugasHandover.map((tugas) => (
                  <div
                    key={tugas.id}
                    className="rounded-lg border p-3 bg-muted/20 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">
                        {tugas.nama_pemohon}
                      </span>
                      <Badge
                        variant="outline"
                        className={gayaStatusCuti(tugas.status)}
                      >
                        {tugas.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Periode: {formatTanggalIndo(tugas.tanggal_mulai)} –{" "}
                      {formatTanggalIndo(tugas.tanggal_selesai)}
                    </p>
                    {tugas.catatan_tugas && (
                      <p className="text-xs bg-background rounded border p-2">
                        {tugas.catatan_tugas}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

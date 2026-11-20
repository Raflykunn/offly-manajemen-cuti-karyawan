import Link from "next/link";
import {
  Building2,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  FileCheck2,
} from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import WidgetKuotaHangus from "./WidgetKuotaHangus";

export default function DasborHrd({ data }) {
  const { statistik, karyawanCutiBulanIni, daftarDivisi, kandidatKuotaHangus } =
    data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dasbor HRD</h1>
          <p className="text-sm text-muted-foreground">
            Pusat persetujuan final cuti karyawan, pemantauan kapasitas divisi, dan pengingat kuota.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            nativeButton={false}
            render={<Link href="/pengaturan-kalender" />}
            variant="outline"
            size="sm"
          >
            Kalender &amp; Blackout
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/persetujuan-hrd" />}
            size="sm"
          >
            <ClipboardCheck className="size-4 mr-1.5" />
            Persetujuan Final ({statistik.pendingFinal})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pengajuan Bulan Ini
            </CardTitle>
            <FileCheck2 className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistik.pengajuanBulanIni}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total pengajuan masuk bulan ini
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-accent/25">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Final Approval
            </CardTitle>
            <Clock3 className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {statistik.pendingFinal}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Siap diproses HRD sekarang
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sedang Cuti Bulan Ini
            </CardTitle>
            <CalendarDays className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistik.sedangCutiBulanIni}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Karyawan &amp; Ketua Divisi disetujui
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Divisi
            </CardTitle>
            <Building2 className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistik.totalDivisi}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unit divisi aktif perusahaan
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Karyawan Sedang Cuti Bulan Ini
            </CardTitle>
            <CardDescription>
              Daftar cuti yang telah disetujui HRD pada bulan berjalan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {karyawanCutiBulanIni.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Belum ada karyawan yang dijadwalkan cuti pada bulan ini.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama &amp; Peran</TableHead>
                    <TableHead>Divisi</TableHead>
                    <TableHead>Jenis &amp; Durasi</TableHead>
                    <TableHead>Periode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {karyawanCutiBulanIni.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.nama_lengkap}</div>
                        <div className="text-xs text-muted-foreground">
                          {labelPeranPengguna(item.peran)}
                        </div>
                      </TableCell>
                      <TableCell>{item.nama_divisi || "-"}</TableCell>
                      <TableCell>
                        <div className="text-xs font-medium">{item.nama_cuti}</div>
                        <div className="text-xs text-primary font-semibold">
                          {formatAngkaKuota(item.total_hari_cuti)} Hari
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatTanggalIndo(item.tanggal_mulai)} –{" "}
                        {formatTanggalIndo(item.tanggal_selesai)}
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
            <CardTitle className="text-base">Daftar Divisi Perusahaan</CardTitle>
            <CardDescription>
              Ringkasan ketua divisi, jumlah anggota, dan batas kapasitas tim.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {daftarDivisi.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Belum ada divisi terdaftar.
              </p>
            ) : (
              <div className="space-y-3">
                {daftarDivisi.map((divisi) => (
                  <div
                    key={divisi.id}
                    className="rounded-lg border p-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {divisi.nama_divisi}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ketua: {divisi.nama_ketua_divisi || "-"}
                      </p>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <Badge variant="secondary" className="text-xs">
                        {divisi.jumlah_anggota} Anggota
                      </Badge>
                      <p className="text-[11px] text-muted-foreground">
                        Maks cuti: {divisi.batas_kapasitas_persen}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <WidgetKuotaHangus kandidat={kandidatKuotaHangus} />
    </div>
  );
}

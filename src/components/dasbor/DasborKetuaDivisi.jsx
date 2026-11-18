import Link from "next/link";
import {
  CalendarCheck2,
  CalendarPlus,
  CheckSquare,
  Clock3,
  Inbox,
  Users,
} from "lucide-react";
import {
  formatAngkaKuota,
  formatTanggalIndo,
  gayaStatusCuti,
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

export default function DasborKetuaDivisi({ data }) {
  const { divisi, statistik, anggotaDivisi, pengajuanMenunggu } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Dasbor Ketua Divisi
          </h1>
          <p className="text-sm text-muted-foreground">
            {divisi
              ? `Pengawasan pengajuan cuti dan jadwal tim Divisi ${divisi.nama_divisi}.`
              : "Anda belum ditetapkan memimpin divisi manapun oleh Admin."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button render={<Link href="/verifikasi-divisi" />} variant="outline" size="sm">
            <CheckSquare className="size-4 mr-1.5" />
            Verifikasi Divisi ({statistik.pendingVerifikasi})
          </Button>
          <Button render={<Link href="/pengajuan-cuti" />} size="sm">
            <CalendarPlus className="size-4 mr-1.5" />
            Ajukan Cuti Pribadi
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pengajuan Masuk
            </CardTitle>
            <Inbox className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistik.totalMasuk}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total riwayat pengajuan anggota divisi
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-accent/25">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Verifikasi
            </CardTitle>
            <Clock3 className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {statistik.pendingVerifikasi}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Menunggu persetujuan tahap pertama
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Anggota Divisi
            </CardTitle>
            <Users className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistik.jumlahAnggota}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Batas kapasitas cuti: {divisi?.batas_kapasitas_persen ?? 30}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cuti Minggu Ini
            </CardTitle>
            <CalendarCheck2 className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistik.cutiMingguIni}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Anggota divisi sedang cuti pekan ini
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Daftar Anggota Divisi &amp; Status Cuti Minggu Ini
            </CardTitle>
            <CardDescription>
              Memantau kesiapan tim dan anggota yang sedang cuti pada minggu berjalan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {anggotaDivisi.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Belum ada anggota terdaftar di divisi ini.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Peran</TableHead>
                    <TableHead>Sisa Kuota</TableHead>
                    <TableHead>Status Minggu Ini</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anggotaDivisi.map((anggota) => (
                    <TableRow key={anggota.id}>
                      <TableCell>
                        <div className="font-medium">{anggota.nama_lengkap}</div>
                        <div className="text-xs text-muted-foreground">
                          {anggota.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {labelPeranPengguna(anggota.peran)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatAngkaKuota(anggota.sisa_kuota_cuti)} Hari
                      </TableCell>
                      <TableCell>
                        {anggota.cutiMingguIni ? (
                          <div className="space-y-0.5">
                            <Badge
                              variant="outline"
                              className="bg-amber-100 text-amber-800 border-amber-200"
                            >
                              Sedang Cuti ({anggota.cutiMingguIni.nama_cuti})
                            </Badge>
                            <p className="text-[11px] text-muted-foreground">
                              {formatTanggalIndo(anggota.cutiMingguIni.tanggal_mulai)} –{" "}
                              {formatTanggalIndo(anggota.cutiMingguIni.tanggal_selesai)}
                            </p>
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            Aktif Bekerja
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Antrean Verifikasi Terbaru</CardTitle>
              <CardDescription>
                Pengajuan cuti bawahan berstatus Pending.
              </CardDescription>
            </div>
            <Button render={<Link href="/verifikasi-divisi" />} variant="outline" size="sm">
              Proses Semua
            </Button>
          </CardHeader>
          <CardContent>
            {pengajuanMenunggu.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Tidak ada pengajuan cuti yang menunggu verifikasi Anda.
              </p>
            ) : (
              <div className="space-y-3">
                {pengajuanMenunggu.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border p-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-semibold truncate">
                        {item.nama_lengkap}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.nama_cuti} • {formatAngkaKuota(item.total_hari_cuti)} Hari
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatTanggalIndo(item.tanggal_mulai)} –{" "}
                        {formatTanggalIndo(item.tanggal_selesai)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={gayaStatusCuti(item.status)}
                    >
                      {item.status}
                    </Badge>
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

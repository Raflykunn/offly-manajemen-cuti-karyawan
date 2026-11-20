import Link from "next/link";
import {
  Building2,
  CalendarClock,
  CalendarPlus,
  Clock3,
  UserCheck,
  UserX,
} from "lucide-react";
import { formatTanggalIndo, labelPeranPengguna } from "@/lib/kalkulasi-cuti";
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

export default function DasborAdmin({ data }) {
  const { statistik, karyawanBelumLayak, kandidatKuotaHangus } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dasbor Admin</h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan operasional pengguna, divisi, dan kelayakan cuti tahunan perusahaan.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            nativeButton={false}
            render={<Link href="/manajemen-pengguna" />}
            variant="outline"
            size="sm"
          >
            Kelola Pengguna
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/manajemen-divisi" />}
            size="sm"
          >
            Kelola Divisi
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Karyawan Aktif / Nonaktif
            </CardTitle>
            <UserCheck className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistik.karyawanAktif}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / {statistik.karyawanNonaktif} Nonaktif
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total akun aktif sistem: {statistik.totalPenggunaAktif}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pengajuan Bulan Ini
            </CardTitle>
            <CalendarPlus className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistik.pengajuanBulanIni}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total permohonan masuk bulan berjalan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approval
            </CardTitle>
            <Clock3 className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {statistik.pendingApproval}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Menunggu verifikasi atasan atau HRD
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
              Unit divisi terdaftar aktif
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarClock className="size-4 text-primary" />
                Karyawan Masa Kerja &lt; 1 Tahun
              </CardTitle>
              <CardDescription>
                Daftar karyawan yang belum memenuhi syarat 1 tahun untuk pengajuan Cuti Tahunan.
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {karyawanBelumLayak.length} Karyawan
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {karyawanBelumLayak.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Seluruh karyawan saat ini telah memiliki masa kerja minimal 1 tahun.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Karyawan</TableHead>
                  <TableHead>Divisi</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead>Tanggal Bergabung</TableHead>
                  <TableHead>Masa Kerja</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {karyawanBelumLayak.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.nama_lengkap}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.email}
                      </div>
                    </TableCell>
                    <TableCell>{item.nama_divisi || "-"}</TableCell>
                    <TableCell>{labelPeranPengguna(item.peran)}</TableCell>
                    <TableCell>{formatTanggalIndo(item.tanggal_bergabung)}</TableCell>
                    <TableCell>
                      {item.bulan_kerja} Bulan
                    </TableCell>
                    <TableCell>
                      {item.status_aktif ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                          Belum Eligible
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-zinc-100 text-zinc-700">
                          <UserX className="size-3 mr-1" />
                          Nonaktif
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

      <WidgetKuotaHangus kandidat={kandidatKuotaHangus} />
    </div>
  );
}

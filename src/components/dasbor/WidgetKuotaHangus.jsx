"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, BellRing, Check } from "lucide-react";
import {
  kirimPengingatKuotaHangus,
  kirimSemuaPengingatKuotaHangus,
} from "@/actions/dasbor-aksi";
import { formatAngkaKuota, labelPeranPengguna } from "@/lib/kalkulasi-cuti";
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

export default function WidgetKuotaHangus({ kandidat = [] }) {
  const [terkirimIds, aturTerkirimIds] = useState([]);
  const [pesanStatus, aturPesanStatus] = useState("");
  const [sedangKirim, mulaiTransisi] = useTransition();

  const belumDikirimIds = kandidat
    .filter((item) => !terkirimIds.includes(item.id))
    .map((item) => item.id);

  function tanganiKirimPengingat(idPengguna) {
    mulaiTransisi(async () => {
      const hasil = await kirimPengingatKuotaHangus(idPengguna);
      if (hasil?.sukses) {
        aturTerkirimIds((lama) => [...new Set([...lama, idPengguna])]);
        aturPesanStatus(hasil.pesan);
      }
    });
  }

  function tanganiKirimSemua() {
    if (belumDikirimIds.length === 0) return;
    mulaiTransisi(async () => {
      const hasil = await kirimSemuaPengingatKuotaHangus(belumDikirimIds);
      if (hasil?.sukses) {
        aturTerkirimIds((lama) => [
          ...new Set([...lama, ...(hasil.terkirimIds || belumDikirimIds)]),
        ]);
        aturPesanStatus(hasil.pesan);
      }
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="size-4 text-primary" />
              Peringatan Kuota Hangus (Sisa &ge; 8 Hari)
            </CardTitle>
            <CardDescription>
              Daftar karyawan yang memenuhi syarat tetapi jarang mengambil cuti menjelang akhir tahun.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
              {kandidat.length} Karyawan
            </Badge>
            {kandidat.length > 0 && (
              <Button
                type="button"
                size="sm"
                disabled={sedangKirim || belumDikirimIds.length === 0}
                onClick={tanganiKirimSemua}
              >
                <BellRing className="size-3.5 mr-1.5" />
                {belumDikirimIds.length === 0
                  ? "Semua Terkirim"
                  : `Kirim Semua (${belumDikirimIds.length})`}
              </Button>
            )}
          </div>
        </div>
        {pesanStatus && (
          <p className="text-xs text-emerald-700 font-medium pt-1">
            {pesanStatus}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {kandidat.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Tidak ada karyawan dengan sisa kuota menumpuk saat ini.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Karyawan</TableHead>
                <TableHead>Divisi</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead className="text-right">Sisa Kuota</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kandidat.map((item) => {
                const sudahDikirim = terkirimIds.includes(item.id);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.nama_lengkap}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.email}
                      </div>
                    </TableCell>
                    <TableCell>{item.nama_divisi || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {labelPeranPengguna(item.peran)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {formatAngkaKuota(item.sisa_kuota_cuti)} /{" "}
                      {formatAngkaKuota(item.kuota_cuti_awal)} Hari
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant={sudahDikirim ? "outline" : "default"}
                        disabled={sedangKirim || sudahDikirim}
                        onClick={() => tanganiKirimPengingat(item.id)}
                      >
                        {sudahDikirim ? (
                          <>
                            <Check className="size-3.5 mr-1" />
                            Terkirim
                          </>
                        ) : (
                          <>
                            <BellRing className="size-3.5 mr-1" />
                            Kirim Pengingat
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

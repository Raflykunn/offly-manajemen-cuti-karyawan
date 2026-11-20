"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Check,
  CheckSquare,
  FileText,
  UserCheck,
  X,
} from "lucide-react";
import { verifikasiCutiKetuaDivisi } from "@/actions/cuti-aksi";
import { formatAngkaKuota, formatTanggalIndo } from "@/lib/kalkulasi-cuti";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LencanaStatusCuti from "./LencanaStatusCuti";

export default function VerifikasiKetuaDivisiClient({
  divisi,
  daftarMenunggu,
  daftarRiwayatDivisi,
}) {
  const router = useRouter();
  const [sedangProses, mulaiTransisi] = useTransition();
  const [pesanBanner, aturPesanBanner] = useState(null);
  const [aksiModal, aturAksiModal] = useState(null);
  const [catatan, aturCatatan] = useState("");

  function bukaModalVerifikasi(pengajuan, keputusan) {
    aturCatatan("");
    aturAksiModal({ pengajuan, keputusan });
  }

  function tanganiKonfirmasiVerifikasi() {
    if (!aksiModal) return;
    mulaiTransisi(async () => {
      const hasil = await verifikasiCutiKetuaDivisi(
        aksiModal.pengajuan.id,
        aksiModal.keputusan,
        catatan
      );
      aturPesanBanner(hasil);
      if (hasil.sukses) {
        aturAksiModal(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CheckSquare className="size-6 text-primary" />
          Verifikasi Pengajuan Cuti Divisi
        </h1>
        <p className="text-sm text-muted-foreground">
          {divisi
            ? `Tinjau permohonan cuti dan catatan serah terima tugas anggota Divisi ${divisi.nama_divisi}.`
            : "Anda belum ditetapkan sebagai Ketua pada divisi mana pun."}
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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">
            Antrean Menunggu Verifikasi ({daftarMenunggu.length})
          </h2>
        </div>

        {daftarMenunggu.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Tidak ada pengajuan cuti bawahan yang menunggu verifikasi saat ini.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {daftarMenunggu.map((item) => (
              <Card key={item.id} className="flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="size-10 border">
                        {item.foto_pemohon && (
                          <AvatarImage
                            src={item.foto_pemohon}
                            alt={item.nama_pemohon}
                          />
                        )}
                        <AvatarFallback className="bg-primary/15 text-accent-foreground font-semibold">
                          {item.nama_pemohon.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">
                          {item.nama_pemohon}
                        </CardTitle>
                        <CardDescription className="text-xs font-mono">
                          {item.nomor_pengajuan} • Diajukan{" "}
                          {formatTanggalIndo(item.tanggal_pengajuan)}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">{item.nama_cuti}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-sm">
                  <div className="rounded-lg border bg-muted/25 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="size-3.5 text-primary" />
                      {formatTanggalIndo(item.tanggal_mulai)} s.d.{" "}
                      {formatTanggalIndo(item.tanggal_selesai)}
                    </span>
                    <Badge variant="outline" className="font-semibold">
                      {formatAngkaKuota(item.total_hari_cuti)} Hari Kerja
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Alasan Cuti
                    </p>
                    <p className="text-sm">{item.alasan_cuti}</p>
                  </div>

                  <div className="rounded-lg border p-2.5 space-y-1.5 bg-background text-xs">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="size-3.5 text-primary" />
                      <span className="text-muted-foreground">Rekan Pengganti:</span>
                      <span className="font-semibold">
                        {item.nama_rekan_pengganti || "Tidak ditentukan"}
                      </span>
                    </div>
                    {item.catatan_tugas && (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Catatan Handover:{" "}
                        </span>
                        {item.catatan_tugas}
                      </p>
                    )}
                  </div>

                  {item.lampiran_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      render={
                        <a
                          href={item.lampiran_url}
                          target="_blank"
                          rel="noreferrer"
                        />
                      }
                    >
                      <FileText className="size-3.5 mr-1.5" />
                      Lihat Surat Dokter / Lampiran
                    </Button>
                  )}
                </CardContent>

                <CardFooter className="border-t pt-3 gap-2 justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => bukaModalVerifikasi(item, "tolak")}
                  >
                    <X className="size-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => bukaModalVerifikasi(item, "setuju")}
                  >
                    <Check className="size-4 mr-1" />
                    Approve
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {daftarRiwayatDivisi.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Riwayat Verifikasi Divisi Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {daftarRiwayatDivisi.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
              >
                <div>
                  <span className="font-semibold">{r.nama_pemohon}</span>{" "}
                  <span className="text-xs font-mono text-muted-foreground">
                    ({r.nomor_pengajuan})
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {r.nama_cuti} • {formatTanggalIndo(r.tanggal_mulai)} –{" "}
                    {formatTanggalIndo(r.tanggal_selesai)} (
                    {formatAngkaKuota(r.total_hari_cuti)} hari)
                  </p>
                </div>
                <LencanaStatusCuti status={r.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog
        open={Boolean(aksiModal)}
        onOpenChange={(terbuka) => !terbuka && aturAksiModal(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {aksiModal?.keputusan === "setuju"
                ? "Setujui Pengajuan Cuti (Ketua Divisi)"
                : "Tolak Pengajuan Cuti"}
            </DialogTitle>
            <DialogDescription>
              {aksiModal?.keputusan === "setuju"
                ? `Pengajuan ${aksiModal?.pengajuan.nomor_pengajuan} milik ${aksiModal?.pengajuan.nama_pemohon} akan diteruskan ke HRD untuk persetujuan final.`
                : `Pengajuan ${aksiModal?.pengajuan.nomor_pengajuan} akan ditolak dan kuota pemohon dikembalikan otomatis.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="catatan_ketua">
              Catatan Ketua Divisi{" "}
              {aksiModal?.keputusan === "tolak" ? "(Wajib Diisi)" : "(Opsional)"}
            </Label>
            <Textarea
              id="catatan_ketua"
              rows={3}
              value={catatan}
              onChange={(e) => aturCatatan(e.target.value)}
              placeholder={
                aksiModal?.keputusan === "tolak"
                  ? "Tuliskan alasan penolakan yang jelas untuk karyawan"
                  : "Catatan serah terima atau pesan persetujuan (opsional)"
              }
              required={aksiModal?.keputusan === "tolak"}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => aturAksiModal(null)}>
              Batal
            </Button>
            <Button
              variant={
                aksiModal?.keputusan === "tolak" ? "destructive" : "default"
              }
              disabled={
                sedangProses ||
                (aksiModal?.keputusan === "tolak" && !catatan.trim())
              }
              onClick={tanganiKonfirmasiVerifikasi}
            >
              {sedangProses
                ? "Memproses..."
                : aksiModal?.keputusan === "setuju"
                  ? "Ya, Setujui & Teruskan ke HRD"
                  : "Ya, Tolak Pengajuan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

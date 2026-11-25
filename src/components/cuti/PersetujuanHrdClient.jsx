"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCheck,
  ClipboardCheck,
  FileText,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";
import {
  setujuiBanyakCutiHrd,
  verifikasiFinalHrd,
} from "@/actions/cuti-aksi";
import {
  apakahUrlLampiranAman,
  formatAngkaKuota,
  formatTanggalIndo,
  labelPeranPengguna,
} from "@/lib/kalkulasi-cuti";
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
import { Checkbox } from "@/components/ui/checkbox";
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

export default function PersetujuanHrdClient({ daftarMenunggu }) {
  const router = useRouter();
  const [sedangProses, mulaiTransisi] = useTransition();
  const [pesanBanner, aturPesanBanner] = useState(null);

  const [daftarTerpilih, aturDaftarTerpilih] = useState([]);
  const [aksiModal, aturAksiModal] = useState(null);
  const [catatan, aturCatatan] = useState("");
  const [modalMassal, aturModalMassal] = useState(false);

  const semuaDipilih =
    daftarMenunggu.length > 0 &&
    daftarTerpilih.length === daftarMenunggu.length;

  function toggleSemua() {
    if (semuaDipilih) {
      aturDaftarTerpilih([]);
    } else {
      aturDaftarTerpilih(daftarMenunggu.map((d) => d.id));
    }
  }

  function toggleSatu(id, diceklis) {
    if (diceklis) {
      aturDaftarTerpilih((prev) => [...new Set([...prev, id])]);
    } else {
      aturDaftarTerpilih((prev) => prev.filter((item) => item !== id));
    }
  }

  function bukaModalTunggal(pengajuan, keputusan) {
    aturCatatan("");
    aturAksiModal({ pengajuan, keputusan });
  }

  function tanganiEksekusiTunggal() {
    if (!aksiModal) return;
    mulaiTransisi(async () => {
      const hasil = await verifikasiFinalHrd(
        aksiModal.pengajuan.id,
        aksiModal.keputusan,
        catatan
      );
      aturPesanBanner(hasil);
      if (hasil.sukses) {
        aturAksiModal(null);
        aturDaftarTerpilih((prev) =>
          prev.filter((id) => id !== aksiModal.pengajuan.id)
        );
        router.refresh();
      }
    });
  }

  function tanganiEksekusiMassal() {
    mulaiTransisi(async () => {
      const hasil = await setujuiBanyakCutiHrd(daftarTerpilih, catatan);
      aturPesanBanner(hasil);
      if (hasil.sukses) {
        aturModalMassal(false);
        aturDaftarTerpilih([]);
        aturCatatan("");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="size-6 text-primary" />
            Persetujuan Final HRD
          </h1>
          <p className="text-sm text-muted-foreground">
            Validasi akhir pengajuan cuti Karyawan yang disetujui Ketua Divisi dan pengajuan langsung dari Ketua Divisi.
          </p>
        </div>

        {daftarMenunggu.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleSemua}>
              {semuaDipilih ? "Batal Pilih Semua" : "Pilih Semua"}
            </Button>
            <Button
              size="sm"
              disabled={daftarTerpilih.length === 0 || sedangProses}
              onClick={() => {
                aturCatatan("");
                aturModalMassal(true);
              }}
            >
              <CheckCheck className="size-4 mr-1.5" />
              Multi-Approve Terpilih ({daftarTerpilih.length})
            </Button>
          </div>
        )}
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

      {daftarMenunggu.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Seluruh pengajuan cuti telah selesai diproses. Tidak ada antrean persetujuan HRD saat ini.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {daftarMenunggu.map((item) => {
            const terpilih = daftarTerpilih.includes(item.id);
            return (
              <Card
                key={item.id}
                className={terpilih ? "border-primary ring-1 ring-primary/30" : ""}
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="pt-1">
                        <Checkbox
                          checked={terpilih}
                          className="border-muted-foreground/50"
                          onCheckedChange={(nilai) =>
                            toggleSatu(item.id, Boolean(nilai))
                          }
                          aria-label={`Pilih ${item.nomor_pengajuan}`}
                        />
                      </div>
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
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-base">
                            {item.nama_pemohon}
                          </CardTitle>
                          <Badge variant="secondary" className="text-sm">
                            {labelPeranPengguna(item.peran_pemohon)}
                          </Badge>
                          {item.nama_divisi && (
                            <Badge variant="outline" className="text-sm">
                              Divisi {item.nama_divisi}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-sm mt-0.5">
                          {item.nomor_pengajuan} • Diajukan{" "}
                          {formatTanggalIndo(item.tanggal_pengajuan)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-medium">
                        Sisa Kuota: {formatAngkaKuota(item.sisa_kuota_cuti)} /{" "}
                        {formatAngkaKuota(item.kuota_cuti_awal)} Hari
                      </Badge>
                      <LencanaStatusCuti status={item.status} />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-sm">
                  {item.melebihi_kapasitas && (
                    <Alert className="bg-yellow-100 border-yellow-400 text-foreground dark:bg-yellow-950/70 dark:border-yellow-700 dark:text-yellow-100">
                      <AlertTriangle
                        className="size-4 text-yellow-700 dark:text-yellow-400"
                        aria-hidden="true"
                      />
                      <AlertDescription className="text-xs text-foreground dark:text-yellow-100">
                        <strong className="font-semibold">
                          Peringatan Limit Kapasitas Tim:
                        </strong>{" "}
                        {item.jumlah_cuti_bersamaan} dari{" "}
                        {item.total_anggota_divisi} anggota Divisi {item.nama_divisi} (
                        {item.persen_beban_divisi}%) tercatat cuti pada rentang tanggal yang sama, melampaui batas maksimal {item.batas_kapasitas_persen}%.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-lg border bg-muted/20 p-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Jenis &amp; Durasi</p>
                      <p className="font-semibold text-sm mt-0.5">
                        {item.nama_cuti} • {formatAngkaKuota(item.total_hari_cuti)}{" "}
                        Hari
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Periode Cuti</p>
                      <p className="font-semibold text-sm mt-0.5 flex items-center gap-1">
                        <Calendar className="size-3.5 text-primary" />
                        {formatTanggalIndo(item.tanggal_mulai)} –{" "}
                        {formatTanggalIndo(item.tanggal_selesai)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rekan Pengganti</p>
                      <p className="font-semibold text-sm mt-0.5 flex items-center gap-1">
                        <UserCheck className="size-3.5 text-primary" />
                        {item.nama_rekan_pengganti || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg border p-3 space-y-1">
                      <p className="font-semibold text-muted-foreground">
                        Alasan &amp; Catatan Handover
                      </p>
                      <p className="text-sm text-foreground">{item.alasan_cuti}</p>
                      {item.catatan_tugas && (
                        <p className="text-muted-foreground pt-1">
                          Handover: {item.catatan_tugas}
                        </p>
                      )}
                    </div>

                    <div className="rounded-lg border p-3 space-y-1 bg-sky-50/50 border-sky-200">
                      <p className="font-semibold flex items-center gap-1.5 text-sky-900">
                        <ShieldCheck className="size-3.5" />
                        Informasi Verifikasi Atasan
                      </p>
                      {item.peran_pemohon === "ketua_divisi" ? (
                        <p className="text-sky-800">
                          Pengajuan langsung dari Ketua Divisi (Alur 2: Ketua Divisi → HRD).
                        </p>
                      ) : (
                        <>
                          <p className="text-sky-900">
                            Disetujui oleh:{" "}
                            <span className="font-semibold">
                              {item.nama_ketua_approver || "Ketua Divisi"}
                            </span>
                          </p>
                          <p className="text-sky-800">
                            Tanggal:{" "}
                            {formatTanggalIndo(item.waktu_verifikasi_ketua, true)}
                          </p>
                          <p className="text-sky-900">
                            Catatan atasan:{" "}
                            {item.catatan_ketua || "Tidak ada catatan tambahan."}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {apakahUrlLampiranAman(item.lampiran_url) && (
                    <Button
                      size="sm"
                      variant="outline"
                      nativeButton={false}
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

                <CardFooter className="border-t pt-3 justify-end gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => bukaModalTunggal(item, "tolak")}
                  >
                    <X className="size-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => bukaModalTunggal(item, "setuju")}
                  >
                    <Check className="size-4 mr-1" />
                    Approve Final
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={Boolean(aksiModal)}
        onOpenChange={(terbuka) => !terbuka && aturAksiModal(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {aksiModal?.keputusan === "setuju"
                ? "Persetujuan Final HRD"
                : "Tolak Pengajuan Cuti (HRD)"}
            </DialogTitle>
            <DialogDescription>
              {aksiModal?.keputusan === "setuju"
                ? `Pengajuan ${aksiModal?.pengajuan.nomor_pengajuan} akan berstatus Approved by HRD dan Surat Cuti PDF otomatis tersedia bagi pemohon.`
                : `Pengajuan ${aksiModal?.pengajuan.nomor_pengajuan} akan ditolak dan kuota pemohon dikembalikan otomatis.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="catatan_hrd">
              Catatan HRD{" "}
              {aksiModal?.keputusan === "tolak" ? "(Wajib Diisi)" : "(Opsional)"}
            </Label>
            <Textarea
              id="catatan_hrd"
              rows={3}
              value={catatan}
              onChange={(e) => aturCatatan(e.target.value)}
              placeholder={
                aksiModal?.keputusan === "tolak"
                  ? "Tuliskan alasan penolakan final"
                  : "Catatan tambahan persetujuan HRD (opsional)"
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
              onClick={tanganiEksekusiTunggal}
            >
              {sedangProses
                ? "Memproses..."
                : aksiModal?.keputusan === "setuju"
                  ? "Konfirmasi Approve Final"
                  : "Konfirmasi Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalMassal} onOpenChange={aturModalMassal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Multi-Approve HRD</DialogTitle>
            <DialogDescription>
              Anda akan menyetujui secara final {daftarTerpilih.length} pengajuan cuti terpilih sekaligus.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="catatan_hrd_massal">
              Catatan Persetujuan Massal (Opsional)
            </Label>
            <Textarea
              id="catatan_hrd_massal"
              rows={3}
              value={catatan}
              onChange={(e) => aturCatatan(e.target.value)}
              placeholder="Contoh: Disetujui sesuai jadwal tim."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => aturModalMassal(false)}>
              Batal
            </Button>
            <Button disabled={sedangProses} onClick={tanganiEksekusiMassal}>
              {sedangProses
                ? "Menyetujui..."
                : `Setujui ${daftarTerpilih.length} Pengajuan`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  History,
  RotateCcw,
  Send,
  Upload,
} from "lucide-react";
import { ajukanCutiBaru } from "@/actions/cuti-aksi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import PanelSimulasiWhatIf from "./PanelSimulasiWhatIf";

export default function PengajuanCutiClient({
  pengguna,
  daftarJenisCuti,
  daftarRekanPengganti,
}) {
  const router = useRouter();
  const [sedangProses, mulaiTransisi] = useTransition();
  const [pesanBanner, aturPesanBanner] = useState(null);

  const [jenisCutiId, aturJenisCutiId] = useState(
    daftarJenisCuti[0] ? String(daftarJenisCuti[0].id) : ""
  );
  const [opsiSetengahHari, aturOpsiSetengahHari] = useState(false);
  const [tanggalMulai, aturTanggalMulai] = useState("");
  const [tanggalSelesai, aturTanggalSelesai] = useState("");
  const [rekanPenggantiId, aturRekanPenggantiId] = useState("kosong");
  const [lampiranUrl, aturLampiranUrl] = useState("");
  const [namaLampiran, aturNamaLampiran] = useState("");
  const [sedangUnggah, aturSedangUnggah] = useState(false);

  const [simulasi, aturSimulasi] = useState(null);
  const [sedangSimulasi, aturSedangSimulasi] = useState(false);

  const jenisAktif = useMemo(
    () => daftarJenisCuti.find((j) => String(j.id) === jenisCutiId) || null,
    [daftarJenisCuti, jenisCutiId]
  );

  const petaJenis = useMemo(() => {
    const peta = new Map();
    for (const j of daftarJenisCuti) {
      peta.set(String(j.id), j.nama_cuti);
    }
    return peta;
  }, [daftarJenisCuti]);

  const petaRekan = useMemo(() => {
    const peta = new Map();
    for (const r of daftarRekanPengganti) {
      peta.set(String(r.id), r.nama_lengkap);
    }
    return peta;
  }, [daftarRekanPengganti]);

  const tanggalLengkap = Boolean(jenisCutiId && tanggalMulai && tanggalSelesai);

  useEffect(() => {
    if (!tanggalLengkap) {
      return;
    }

    let dibatalkan = false;

    async function jalankanSimulasiWhatIf() {
      try {
        aturSedangSimulasi(true);
        const res = await fetch("/api/cuti/simulasi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jenis_cuti_id: Number(jenisCutiId),
            tanggal_mulai: tanggalMulai,
            tanggal_selesai: tanggalSelesai,
            opsi_setengah_hari: opsiSetengahHari,
          }),
        });
        const data = await res.json();
        if (!dibatalkan && data?.sukses) {
          aturSimulasi(data.simulasi);
        }
      } catch {
      } finally {
        if (!dibatalkan) aturSedangSimulasi(false);
      }
    }

    jalankanSimulasiWhatIf();

    return () => {
      dibatalkan = true;
    };
  }, [tanggalLengkap, jenisCutiId, tanggalMulai, tanggalSelesai, opsiSetengahHari]);

  async function tanganiUnggahBerkas(event) {
    const berkas = event.target.files?.[0];
    if (!berkas) return;

    aturSedangUnggah(true);
    const dataUnggah = new FormData();
    dataUnggah.append("berkas", berkas);

    try {
      const res = await fetch("/api/unggah", {
        method: "POST",
        body: dataUnggah,
      });
      const hasil = await res.json();
      if (hasil.sukses) {
        aturLampiranUrl(hasil.url);
        aturNamaLampiran(hasil.namaBerkas);
      } else {
        aturPesanBanner({ sukses: false, pesan: hasil.pesan });
      }
    } catch {
      aturPesanBanner({
        sukses: false,
        pesan: "Gagal mengunggah lampiran berkas.",
      });
    } finally {
      aturSedangUnggah(false);
    }
  }

  function resetFormulir(formElement) {
    if (formElement) formElement.reset();
    aturJenisCutiId(daftarJenisCuti[0] ? String(daftarJenisCuti[0].id) : "");
    aturOpsiSetengahHari(false);
    aturTanggalMulai("");
    aturTanggalSelesai("");
    aturRekanPenggantiId("kosong");
    aturLampiranUrl("");
    aturNamaLampiran("");
    aturSimulasi(null);
  }

  function tanganiKirimPengajuan(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    mulaiTransisi(async () => {
      const hasil = await ajukanCutiBaru(formData);
      aturPesanBanner(hasil);
      if (hasil.sukses) {
        resetFormulir(form);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarPlus className="size-6 text-primary" />
            Pengajuan Cuti
          </h1>
          <p className="text-sm text-muted-foreground">
            {pengguna.peran === "ketua_divisi"
              ? "Sebagai Ketua Divisi, pengajuan cuti Anda dikirim langsung ke HRD."
              : "Lengkapi formulir di bawah untuk mengajukan cuti melalui persetujuan Ketua Divisi dan HRD."}
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/riwayat-cuti" />}
          variant="outline"
          size="sm"
        >
          <History className="size-4 mr-1.5" />
          Lihat Riwayat &amp; Surat Cuti
        </Button>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle className="text-lg">Formulir Pengajuan Cuti Baru</CardTitle>
            <CardDescription>
              Tanggal pengajuan tercatat otomatis hari ini (
              {formatTanggalIndo(new Date())}).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={tanganiKirimPengajuan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Jenis Cuti</Label>
                  <Select
                    name="jenis_cuti_id"
                    value={jenisCutiId}
                    onValueChange={aturJenisCutiId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(v) => petaJenis.get(v) || "Pilih Jenis Cuti"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {daftarJenisCuti.map((j) => (
                        <SelectItem key={j.id} value={String(j.id)}>
                          {j.nama_cuti}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {jenisAktif?.deskripsi && (
                    <p className="text-[11px] text-muted-foreground">
                      {jenisAktif.deskripsi}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Rekan Pengganti (Handover)</Label>
                  <Select
                    name="rekan_pengganti_id"
                    value={rekanPenggantiId}
                    onValueChange={aturRekanPenggantiId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(v) =>
                          v === "kosong"
                            ? "Pilih Rekan Pengganti (Opsional)"
                            : petaRekan.get(v) || "Rekan Pengganti"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kosong">
                        Tanpa Rekan Pengganti
                      </SelectItem>
                      {daftarRekanPengganti.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          {r.nama_lengkap}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tanggal_mulai">Tanggal Mulai Cuti</Label>
                  <Input
                    id="tanggal_mulai"
                    name="tanggal_mulai"
                    type="date"
                    value={tanggalMulai}
                    onChange={(e) => {
                      aturTanggalMulai(e.target.value);
                      if (!tanggalSelesai || e.target.value > tanggalSelesai) {
                        aturTanggalSelesai(e.target.value);
                      }
                    }}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tanggal_selesai">Tanggal Selesai Cuti</Label>
                  <Input
                    id="tanggal_selesai"
                    name="tanggal_selesai"
                    type="date"
                    value={tanggalSelesai}
                    min={tanggalMulai || undefined}
                    onChange={(e) => {
                      aturTanggalSelesai(e.target.value);
                      if (e.target.value !== tanggalMulai) {
                        aturOpsiSetengahHari(false);
                      }
                    }}
                    required
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer select-none rounded-lg border p-3 bg-muted/20">
                <Checkbox
                  checked={opsiSetengahHari}
                  disabled={tanggalMulai !== tanggalSelesai || !tanggalMulai}
                  onCheckedChange={(v) => aturOpsiSetengahHari(Boolean(v))}
                />
                <input
                  type="hidden"
                  name="opsi_setengah_hari"
                  value={opsiSetengahHari ? "on" : ""}
                />
                <div>
                  <span className="font-medium">
                    Ajukan Cuti Setengah Hari (0.5 Hari)
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Aktif jika tanggal mulai dan tanggal selesai jatuh pada 1 hari kerja yang sama.
                  </p>
                </div>
              </label>

              <div className="space-y-1.5">
                <Label htmlFor="alasan_cuti">Alasan Pengajuan Cuti</Label>
                <Textarea
                  id="alasan_cuti"
                  name="alasan_cuti"
                  rows={2}
                  placeholder="Jelaskan keperluan cuti Anda dengan jelas"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="catatan_tugas">
                  Catatan Tugas Serah Terima (Handover)
                </Label>
                <Textarea
                  id="catatan_tugas"
                  name="catatan_tugas"
                  rows={2}
                  placeholder="Daftar pekerjaan atau tanggung jawab yang dialihkan ke rekan pengganti"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="alamat_selama_cuti">Alamat Selama Cuti</Label>
                  <Input
                    id="alamat_selama_cuti"
                    name="alamat_selama_cuti"
                    placeholder="Kota / alamat lengkap"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nomor_darurat">Nomor Darurat</Label>
                  <Input
                    id="nomor_darurat"
                    name="nomor_darurat"
                    placeholder="08xxxxxxxxxx"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="berkas_lampiran" className="flex items-center gap-2">
                  <span>Lampiran Dokumen / Surat Dokter</span>
                  {jenisAktif?.wajib_lampiran ? (
                    <Badge variant="destructive" className="text-[10px]">
                      Wajib
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      Opsional
                    </Badge>
                  )}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="berkas_lampiran"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={tanganiUnggahBerkas}
                  />
                  {sedangUnggah && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      Mengunggah...
                    </span>
                  )}
                </div>
                <input type="hidden" name="lampiran_url" value={lampiranUrl} />
                {lampiranUrl && (
                  <p className="text-xs text-emerald-700 flex items-center gap-1">
                    <Upload className="size-3.5" />
                    Terunggah: {namaLampiran || lampiranUrl}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => resetFormulir(e.currentTarget.form)}
                >
                  <RotateCcw className="size-4 mr-1.5" />
                  Reset Form
                </Button>
                <Button
                  type="submit"
                  disabled={
                    sedangProses ||
                    sedangUnggah ||
                    (tanggalLengkap && simulasi && !simulasi.dapatDiajukan)
                  }
                >
                  <Send className="size-4 mr-1.5" />
                  {sedangProses ? "Mengirim..." : "Submit Pengajuan Cuti"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-5 lg:sticky lg:top-20 self-start">
          <PanelSimulasiWhatIf
            simulasi={tanggalLengkap ? simulasi : null}
            sedangMemuat={sedangSimulasi}
            sisaKuotaAwal={pengguna.sisa_kuota_cuti}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarPlus,
  History,
  RotateCcw,
  Send,
  Upload,
} from "lucide-react";
import { ajukanCutiBaru } from "@/actions/cuti-aksi";
import { formatTanggalIndo, formatTanggalIso } from "@/lib/kalkulasi-cuti";
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
import ComboboxCari from "@/components/ui/combobox-cari";
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
  dataUlangi = null,
  peringatanUlangi = "",
}) {
  const router = useRouter();
  const [sedangProses, mulaiTransisi] = useTransition();
  const [pesanBanner, aturPesanBanner] = useState(null);

  const [jenisCutiId, aturJenisCutiId] = useState(
    dataUlangi?.jenis_cuti_id
      ? String(dataUlangi.jenis_cuti_id)
      : daftarJenisCuti[0]
        ? String(daftarJenisCuti[0].id)
        : ""
  );
  const [opsiSetengahHari, aturOpsiSetengahHari] = useState(
    Boolean(dataUlangi?.opsi_setengah_hari)
  );
  const [tanggalMulai, aturTanggalMulai] = useState(
    dataUlangi?.tanggal_mulai || ""
  );
  const [tanggalSelesai, aturTanggalSelesai] = useState(
    dataUlangi?.tanggal_selesai || ""
  );
  const [rekanPenggantiId, aturRekanPenggantiId] = useState(
    dataUlangi?.rekan_pengganti_id ? String(dataUlangi.rekan_pengganti_id) : ""
  );
  const [namaCutiKustom, aturNamaCutiKustom] = useState(
    dataUlangi?.nama_cuti_kustom || ""
  );
  const [lampiranUrl, aturLampiranUrl] = useState(
    dataUlangi?.lampiran_url || ""
  );
  const [namaLampiran, aturNamaLampiran] = useState(
    dataUlangi?.lampiran_url ? "Lampiran sebelumnya tersimpan" : ""
  );
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

  const opsiRekan = useMemo(
    () =>
      daftarRekanPengganti.map((r) => ({
        nilai: String(r.id),
        label: r.nama_lengkap,
        kataKunci: r.email || "",
      })),
    [daftarRekanPengganti]
  );

  const tanggalLengkap = Boolean(
    jenisCutiId && tanggalMulai && tanggalSelesai && tanggalSelesai >= tanggalMulai
  );

  const minTanggalMulai = useMemo(() => {
    const batas = Number(jenisAktif?.batas_hari_pengajuan ?? 0);
    const tgl = new Date();
    tgl.setDate(tgl.getDate() + batas);
    return formatTanggalIso(tgl);
  }, [jenisAktif]);

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
        if (!dibatalkan) {
          aturSimulasi(data?.sukses ? data.simulasi : null);
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

    if (!berkas.name.toLowerCase().endsWith(".pdf")) {
      event.target.value = "";
      aturPesanBanner({
        sukses: false,
        pesan: "Format berkas lampiran harus berupa PDF.",
      });
      return;
    }

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
    aturRekanPenggantiId("");
    aturNamaCutiKustom("");
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

      {peringatanUlangi && (
        <Alert variant="destructive" role="alert">
          <AlertTriangle className="size-4" aria-hidden="true" />
          <AlertDescription>{peringatanUlangi}</AlertDescription>
        </Alert>
      )}

      {dataUlangi && (
        <Alert className="border-primary/50 bg-accent text-accent-foreground">
          <AlertTriangle className="size-4 text-primary" aria-hidden="true" />
          <AlertDescription className="text-sm text-accent-foreground">
            Mengajukan ulang berdasarkan{" "}
            <span className="font-semibold">{dataUlangi.nomor_pengajuan}</span>
            {(dataUlangi.catatan_hrd || dataUlangi.catatan_ketua) && (
              <>
                {" "}
                — Catatan penolakan:{" "}
                <span className="font-medium">
                  {dataUlangi.catatan_hrd || dataUlangi.catatan_ketua}
                </span>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

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
              {dataUlangi && (
                <input type="hidden" name="ulangi_dari_id" value={dataUlangi.id} />
              )}
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
                  {jenisAktif?.kode_cuti === "LAINNYA" && (
                    <div className="space-y-1.5 pt-2">
                      <Label htmlFor="nama_cuti_kustom">
                        Nama / Keperluan Cuti Lainnya
                      </Label>
                      <Input
                        id="nama_cuti_kustom"
                        name="nama_cuti_kustom"
                        value={namaCutiKustom}
                        onChange={(e) => aturNamaCutiKustom(e.target.value)}
                        placeholder="Contoh: Cuti Duka Kerabat, Izin Acara Keluarga"
                        minLength={3}
                        maxLength={120}
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rekan_pengganti_cari">
                    Rekan Pengganti (Handover)
                  </Label>
                  <ComboboxCari
                    id="rekan_pengganti_cari"
                    name="rekan_pengganti_id"
                    opsi={opsiRekan}
                    nilai={rekanPenggantiId}
                    saatUbahNilai={aturRekanPenggantiId}
                    placeholder={
                      opsiRekan.length === 0
                        ? "Belum ada rekan satu divisi"
                        : "Cari rekan satu divisi..."
                    }
                    teksKosong="Tidak ada rekan satu divisi yang cocok."
                    ariaLabel="Cari dan pilih rekan pengganti satu divisi"
                    wajib={opsiRekan.length > 0}
                    nonaktif={opsiRekan.length === 0}
                    batasTampil={10}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tanggal_mulai">Tanggal Mulai Cuti</Label>
                  <Input
                    id="tanggal_mulai"
                    name="tanggal_mulai"
                    type="date"
                    min={minTanggalMulai}
                    value={tanggalMulai}
                    onChange={(e) => {
                      const nilaiBaru = e.target.value;
                      aturTanggalMulai(nilaiBaru);
                      if (!tanggalSelesai || nilaiBaru > tanggalSelesai) {
                        aturTanggalSelesai(nilaiBaru);
                      } else if (nilaiBaru !== tanggalSelesai) {
                        aturOpsiSetengahHari(false);
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

              {simulasi &&
                !simulasi.dapatDiajukan &&
                simulasi.daftarPesanValidasi?.length > 0 && (
                  <Alert variant="destructive" role="alert">
                    <AlertTriangle className="size-4" aria-hidden="true" />
                    <AlertDescription className="text-sm space-y-1">
                      {simulasi.daftarPesanValidasi.map((pesan, indeks) => (
                        <p key={indeks}>{pesan}</p>
                      ))}
                    </AlertDescription>
                  </Alert>
                )}

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none rounded-lg border p-3 bg-muted/20">
                  <Checkbox
                    checked={opsiSetengahHari}
                    disabled={!tanggalMulai}
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

                {opsiSetengahHari &&
                  tanggalMulai &&
                  tanggalSelesai &&
                  tanggalMulai !== tanggalSelesai && (
                    <Alert className="border-amber-500/60 bg-amber-50 dark:bg-amber-950/50 text-amber-950 dark:text-amber-100">
                      <AlertTriangle className="size-4 text-amber-700 dark:text-amber-300" aria-hidden="true" />
                      <AlertDescription className="flex flex-wrap items-center justify-between gap-2 text-sm text-amber-950 dark:text-amber-100">
                        <span>
                          Cuti setengah hari hanya berlaku untuk 1 hari yang sama.
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => aturTanggalSelesai(tanggalMulai)}
                        >
                          Samakan ke {formatTanggalIndo(tanggalMulai)}
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="alasan_cuti">Alasan Pengajuan Cuti</Label>
                <Textarea
                  id="alasan_cuti"
                  name="alasan_cuti"
                  rows={2}
                  defaultValue={dataUlangi?.alasan_cuti || ""}
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
                  defaultValue={dataUlangi?.catatan_tugas || ""}
                  placeholder="Daftar pekerjaan atau tanggung jawab yang dialihkan ke rekan pengganti"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="alamat_selama_cuti">Alamat Selama Cuti</Label>
                  <Input
                    id="alamat_selama_cuti"
                    name="alamat_selama_cuti"
                    defaultValue={dataUlangi?.alamat_selama_cuti || ""}
                    placeholder="Kota / alamat lengkap"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nomor_darurat">Nomor Darurat</Label>
                  <Input
                    id="nomor_darurat"
                    name="nomor_darurat"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{12,13}"
                    minLength={12}
                    maxLength={13}
                    title="Nomor HP harus terdiri dari 12–13 digit angka."
                    defaultValue={dataUlangi?.nomor_darurat || ""}
                    placeholder="08xxxxxxxxxx (12–13 digit)"
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value
                        .replace(/\D/g, "")
                        .slice(0, 13);
                    }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="berkas_lampiran" className="flex items-center gap-2">
                  <span>Lampiran Dokumen / Surat Dokter (PDF)</span>
                  {jenisAktif?.wajib_lampiran ? (
                    <Badge variant="destructive" className="text-xs">
                      Wajib
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Opsional
                    </Badge>
                  )}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="berkas_lampiran"
                    type="file"
                    accept=".pdf,application/pdf"
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
                  nativeButton={false}
                  render={<Link href="/dasbor" />}
                  variant="ghost"
                >
                  Batal
                </Button>
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

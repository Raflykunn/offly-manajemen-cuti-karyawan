import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  CalendarDays,
  Check,
  Clock3,
  FileCheck2,
  FileText,
  LogIn,
  ShieldAlert,
  Users,
} from "lucide-react";
import { ambilSesiPengguna } from "@/lib/autentikasi";
import { jalankanKueri } from "@/lib/db";
import { formatTanggalIndo, labelPeranPengguna } from "@/lib/kalkulasi-cuti";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TombolTema from "@/components/tata-letak/TombolTema";
import NavigasiBeranda from "@/components/tata-letak/NavigasiBeranda";

async function ambilDataPublikBeranda() {
  try {
    const [hasilJenis, hasilLibur, hasilRingkasan] = await Promise.all([
      jalankanKueri(
        `SELECT id, kode_cuti, nama_cuti, deskripsi, kuota_default,
                wajib_lampiran, potong_kuota_tahunan
         FROM jenis_cuti
         WHERE status_aktif = TRUE
         ORDER BY id ASC`
      ),
      jalankanKueri(
        `SELECT id, TO_CHAR(tanggal, 'YYYY-MM-DD') AS tanggal, nama_libur, jenis
         FROM hari_libur
         ORDER BY tanggal ASC
         LIMIT 6`
      ),
      jalankanKueri(
        `SELECT
           (SELECT COUNT(*)::int FROM divisi) AS total_divisi,
           (SELECT COUNT(*)::int FROM pengguna WHERE status_aktif = TRUE) AS total_karyawan`
      ),
    ]);

    return {
      daftarJenisCuti: hasilJenis.rows,
      daftarHariLibur: hasilLibur.rows,
      ringkasan: hasilRingkasan.rows[0] || {
        total_divisi: 0,
        total_karyawan: 0,
      },
    };
  } catch {
    return {
      daftarJenisCuti: [],
      daftarHariLibur: [],
      ringkasan: { total_divisi: 0, total_karyawan: 0 },
    };
  }
}

function pecahTanggalKartu(tanggalIso) {
  const tgl = new Date(`${tanggalIso}T00:00:00`);
  if (Number.isNaN(tgl.getTime())) {
    return { hari: "--", bulan: "---" };
  }
  const hari = String(tgl.getDate()).padStart(2, "0");
  const bulan = new Intl.DateTimeFormat("id-ID", { month: "short" })
    .format(tgl)
    .toUpperCase();
  return { hari, bulan };
}

export default async function HalamanUtama() {
  const [sesi, dataPublik] = await Promise.all([
    ambilSesiPengguna(),
    ambilDataPublikBeranda(),
  ]);

  const { daftarJenisCuti, daftarHariLibur, ringkasan } = dataPublik;

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground selection:bg-primary/25">
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-xs focus:font-semibold focus:text-primary-foreground shadow-md"
      >
        Lewati ke konten utama
      </a>

      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-sm supports-[backdrop-filter]:bg-background/85">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 rounded-lg">
            <div className="size-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <CalendarCheck2 className="size-5" />
            </div>
            <div className="leading-none">
              <span className="text-lg font-bold tracking-tight block">
                Offly
              </span>
              <span className="text-[11px] text-muted-foreground">
                Manajemen Cuti Karyawan
              </span>
            </div>
          </Link>

          <NavigasiBeranda />

          <div className="flex items-center gap-2">
            {sesi ? (
              <Button nativeButton={false} render={<Link href="/dasbor" />} size="sm">
                Buka Dasbor ({labelPeranPengguna(sesi.peran)})
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            ) : (
              <Button nativeButton={false} render={<Link href="/masuk" />} size="sm">
                <LogIn className="size-4 mr-1.5" />
                Masuk
              </Button>
            )}
            <TombolTema />
          </div>
        </div>
      </header>

      <main id="konten-utama" tabIndex={-1} className="flex-1 outline-none">
        <section className="border-b">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h1 className="judul-seimbang text-[clamp(2.1rem,1.4rem+2.8vw,3.35rem)] font-bold tracking-tight leading-[1.15]">
                Ajukan dan setujui cuti tim{" "}
                <span className="text-primary underline decoration-primary/40 decoration-2 underline-offset-4">
                  tanpa rekap manual
                </span>
                .
              </h1>

              <p className="paragraf-rapi text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
                Portal internal untuk Karyawan, Ketua Divisi, HRD, dan Admin. Hari kerja dan sisa kuota dihitung otomatis, kapasitas tim tetap terjaga, dan surat izin cuti terbit langsung sebagai berkas PDF.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {sesi ? (
                  <Button
                    nativeButton={false}
                    render={<Link href="/dasbor" />}
                    size="lg"
                  >
                    Masuk ke Dasbor Saya
                    <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button
                    nativeButton={false}
                    render={<Link href="/masuk" />}
                    size="lg"
                  >
                    <LogIn className="size-4 mr-1.5" />
                    Masuk ke Akun
                  </Button>
                )}
                <Button
                  nativeButton={false}
                  render={<a href="#kebijakan" />}
                  variant="outline"
                  size="lg"
                >
                  Lihat Kebijakan Cuti
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-5 border-t max-w-lg tabular-nums">
                <div>
                  <p className="text-2xl font-bold font-mono">12</p>
                  <p className="text-sm text-muted-foreground">
                    Hari Kerja / Tahun
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono text-primary">
                    {ringkasan.total_divisi}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Divisi Terdaftar
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono">
                    {daftarJenisCuti.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Jenis Cuti Aktif
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-xl border bg-card shadow-md dark:shadow-none ring-1 ring-border/50 overflow-hidden motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:-translate-y-0.5">
                <div className="bg-primary px-5 py-4 text-primary-foreground flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium opacity-90">
                      Pratinjau Tiket Cuti
                    </p>
                    <p className="text-base font-bold font-mono">
                      OFFLY-2026-0001
                    </p>
                  </div>
                  <Badge className="bg-background text-foreground hover:bg-background text-xs font-medium">
                    Disetujui HRD
                  </Badge>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Jenis Cuti</p>
                      <p className="font-semibold mt-0.5">
                        Cuti Tahunan
                      </p>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Presisi Durasi</p>
                      <p className="font-semibold mt-0.5 text-primary">
                        0.5 Hari Kerja
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 border-y border-dashed py-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <span className="size-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center">
                          <Check className="size-3" aria-hidden="true" />
                        </span>
                        1. Pengajuan Karyawan
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Serah terima siap
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <span className="size-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center">
                          <Check className="size-3" aria-hidden="true" />
                        </span>
                        2. Verifikasi Ketua Divisi
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Disetujui
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <span className="size-5 rounded-full bg-primary/15 text-primary dark:bg-primary/25 dark:text-amber-300 flex items-center justify-center">
                          <Check className="size-3" aria-hidden="true" />
                        </span>
                        3. Pengesahan Akhir HRD
                      </span>
                      <span className="text-xs text-primary font-semibold">
                        Berkas PDF siap
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Simulasi Sisa Kuota
                      </span>
                      <span className="font-mono font-semibold tabular-nums">
                        11.0 → 10.5 Hari
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-[87%] bg-primary rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="alur" tabIndex={-1} className="border-b bg-muted/20 scroll-mt-20 outline-none">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-14 space-y-8 ungkap-gulir">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Alur Persetujuan
                </p>
                <h2 className="judul-seimbang text-2xl md:text-3xl font-bold tracking-tight">
                  Verifikasi berjenjang sesuai peran di divisi
                </h2>
              </div>
              <p className="paragraf-rapi text-sm text-muted-foreground max-w-sm">
                Kuota tahunan otomatis kembali ke saldo karyawan apabila pengajuan dibatalkan atau ditolak.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              <div className="@container rounded-xl border bg-card p-6 flex flex-col gap-5 h-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Alur Karyawan</h3>
                  <span className="text-xs text-muted-foreground">3 Tahap</span>
                </div>
                <div className="grid grid-cols-1 @sm:grid-cols-3 gap-2.5 text-sm">
                  <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                    <p className="text-xs font-mono text-primary font-bold">Tahap 1</p>
                    <p className="font-semibold">Karyawan</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Mengajukan cuti dan menunjuk rekan serah terima tugas.
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                    <p className="text-xs font-mono text-primary font-bold">Tahap 2</p>
                    <p className="font-semibold">Ketua Divisi</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Memeriksa kesiapan tugas dan beban tim di divisi.
                    </p>
                  </div>
                  <div className="rounded-lg border bg-accent/50 dark:bg-accent/40 border-primary/30 p-3 space-y-1">
                    <p className="text-xs font-mono text-primary font-bold">Tahap 3</p>
                    <p className="font-semibold">HRD</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Pengesahan akhir dan penerbitan surat cuti PDF.
                    </p>
                  </div>
                </div>
              </div>

              <div className="@container rounded-xl border bg-card p-6 flex flex-col gap-5 h-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Alur Ketua Divisi</h3>
                  <span className="text-xs text-muted-foreground">2 Tahap</span>
                </div>
                <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border bg-muted/30 p-3.5 space-y-1">
                    <p className="text-xs font-mono text-primary font-bold">Tahap 1</p>
                    <p className="font-semibold">Ketua Divisi</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Mengajukan cuti pribadi langsung menuju antrean HRD.
                    </p>
                  </div>
                  <div className="rounded-lg border bg-accent/50 dark:bg-accent/40 border-primary/30 p-3.5 space-y-1">
                    <p className="text-xs font-mono text-primary font-bold">Tahap 2</p>
                    <p className="font-semibold">HRD</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Memvalidasi kapasitas divisi dan menerbitkan surat izin cuti.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="keunggulan"
          tabIndex={-1}
          className="max-w-6xl mx-auto px-4 md:px-6 py-14 space-y-8 ungkap-gulir scroll-mt-20 outline-none"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Fitur Utama
            </p>
            <h2 className="judul-seimbang text-2xl md:text-3xl font-bold tracking-tight">
              Alat kerja harian untuk karyawan dan HRD
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-7 rounded-xl border bg-card p-6 flex flex-col justify-between gap-5 hover:border-primary/40 transition-colors">
              <div className="space-y-2">
                <div className="size-9 rounded-lg bg-accent dark:bg-accent/60 text-accent-foreground flex items-center justify-center">
                  <Clock3 className="size-4 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold">
                  Simulasi Kuota dan Cuti Setengah Hari
                </h3>
                <p className="paragraf-rapi text-sm text-muted-foreground leading-relaxed">
                  Sebelum mengirim permohonan, karyawan dapat melihat proyeksi sisa kuota, akhir pekan serta hari libur nasional yang dilewati, dan rekan satu divisi yang cuti di tanggal yang sama.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-medium">Aturan pengajuan otomatis</span>
                <span className="text-muted-foreground">
                  Dukungan 0.5 hari · Validasi tanggal bentrok · Aturan H-3 dan H+3 sakit
                </span>
              </div>
            </div>

            <div className="md:col-span-5 rounded-xl border bg-card p-6 flex flex-col justify-between gap-5 hover:border-primary/40 transition-colors">
              <div className="space-y-2">
                <div className="size-9 rounded-lg bg-accent dark:bg-accent/60 text-accent-foreground flex items-center justify-center">
                  <ShieldAlert className="size-4 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold">
                  Kapasitas Tim dan Tanggal Sibuk
                </h3>
                <p className="paragraf-rapi text-sm text-muted-foreground leading-relaxed">
                  Mencegah kekosongan operasional divisi dengan batas persentase cuti bersamaan dan penguncian tanggal sibuk perusahaan.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 flex items-center justify-between text-xs">
                <span className="font-medium">Batas Aman Divisi</span>
                <span className="font-mono font-bold text-primary tabular-nums">
                  30% – 40%
                </span>
              </div>
            </div>

            <div className="md:col-span-5 rounded-xl border bg-card p-6 flex flex-col justify-between gap-5 hover:border-primary/40 transition-colors">
              <div className="space-y-2">
                <div className="size-9 rounded-lg bg-accent dark:bg-accent/60 text-accent-foreground flex items-center justify-center">
                  <FileText className="size-4 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold">Surat Cuti Resmi PDF</h3>
                <p className="paragraf-rapi text-sm text-muted-foreground leading-relaxed">
                  Pengajuan yang telah disetujui HRD otomatis menghasilkan surat izin cuti berstempel digital yang siap diunduh oleh Karyawan maupun Ketua Divisi.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 flex items-center justify-between text-xs">
                <span className="font-medium">Validasi Berkas</span>
                <span className="font-mono font-bold text-primary">
                  Stempel Digital Resmi
                </span>
              </div>
            </div>

            <div className="md:col-span-7 rounded-xl border bg-card p-6 flex flex-col justify-between gap-4 hover:border-primary/40 transition-colors">
              <div className="space-y-2">
                <div className="size-9 rounded-lg bg-accent dark:bg-accent/60 text-accent-foreground flex items-center justify-center">
                  <FileCheck2 className="size-4 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold">
                  Persetujuan Massal HRD dan Pengingat Kuota
                </h3>
                <p className="paragraf-rapi text-sm text-muted-foreground leading-relaxed">
                  HRD dapat menyetujui beberapa pengajuan sekaligus dalam satu transaksi serta mengirim pengingat kepada karyawan yang belum mengambil hak cuti tahunan.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border bg-muted/30 p-2.5 flex items-center gap-2">
                  <Building2 className="size-4 text-primary shrink-0" aria-hidden="true" />
                  <span>Manajemen Divisi dan Anggota</span>
                </div>
                <div className="rounded-lg border bg-muted/30 p-2.5 flex items-center gap-2">
                  <Users className="size-4 text-primary shrink-0" aria-hidden="true" />
                  <span>Deteksi Masa Kerja di Bawah 1 Tahun</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="kebijakan" tabIndex={-1} className="border-t bg-muted/20 scroll-mt-20 outline-none">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 ungkap-gulir">
            <div className="@container lg:col-span-7 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Kebijakan Perusahaan
                </p>
                <h2 className="judul-seimbang text-2xl font-bold tracking-tight mt-1">
                  Jenis Cuti Aktif
                </h2>
                <p className="paragraf-rapi text-sm text-muted-foreground">
                  Ketentuan dan kuota cuti yang berlaku di perusahaan.
                </p>
              </div>

              {daftarJenisCuti.length === 0 ? (
                <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
                  Data jenis cuti belum tersedia.
                </div>
              ) : (
                <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3">
                  {daftarJenisCuti.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border bg-card p-4 flex flex-col justify-between gap-2.5 hover:border-primary/40 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold">{item.nama_cuti}</h3>
                          <Badge variant="secondary" className="font-mono text-xs shrink-0 tabular-nums">
                            {item.kuota_default} Hari
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.deskripsi || "Mengikuti ketentuan perusahaan."}
                        </p>
                      </div>
                      <p className="text-[11px] font-medium text-muted-foreground pt-1 border-t">
                        {item.wajib_lampiran ? "Wajib lampiran" : "Tanpa lampiran"} ·{" "}
                        {item.potong_kuota_tahunan ? "Potong kuota tahunan" : "Non-kuota"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div id="kalender" tabIndex={-1} className="lg:col-span-5 space-y-5 scroll-mt-20 outline-none">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Kalender Resmi
                </p>
                <h2 className="judul-seimbang text-2xl font-bold tracking-tight mt-1">
                  Hari Libur &amp; Cuti Bersama
                </h2>
                <p className="paragraf-rapi text-sm text-muted-foreground">
                  Otomatis dikecualikan dari perhitungan hari cuti.
                </p>
              </div>

              <div className="rounded-xl border bg-card p-4 space-y-2.5">
                {daftarHariLibur.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Belum ada jadwal hari libur terdaftar.
                  </p>
                ) : (
                  daftarHariLibur.map((libur) => {
                    const { hari, bulan } = pecahTanggalKartu(libur.tanggal);
                    return (
                      <div
                        key={libur.id}
                        className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 p-2.5"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-11 rounded-lg bg-accent dark:bg-accent/50 border border-primary/20 flex flex-col items-center justify-center shrink-0 leading-none tabular-nums">
                            <span className="text-sm font-bold font-mono text-foreground">
                              {hari}
                            </span>
                            <span className="text-[10px] font-mono text-accent-foreground dark:text-amber-300 mt-0.5">
                              {bulan}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-snug">
                              {libur.nama_libur}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <CalendarDays className="size-3" aria-hidden="true" />
                              {formatTanggalIndo(libur.tanggal)}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[11px] shrink-0">
                          {libur.jenis}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 md:px-6 py-12 ungkap-gulir">
          <div className="rounded-2xl border bg-primary text-primary-foreground p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <h2 className="judul-seimbang text-2xl md:text-3xl font-bold tracking-tight">
                Mulai kelola cuti tim kerja Anda dengan lebih teratur
              </h2>
              <p className="paragraf-rapi text-sm opacity-95">
                Masuk menggunakan akun Karyawan, Ketua Divisi, HRD, atau Admin. Tampilan dasbor menyesuaikan peran Anda secara otomatis.
              </p>
            </div>
            {sesi ? (
              <Button
                nativeButton={false}
                render={<Link href="/dasbor" />}
                variant="secondary"
                size="lg"
                className="shrink-0"
              >
                Buka Dasbor Sekarang
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                nativeButton={false}
                render={<Link href="/masuk" />}
                variant="secondary"
                size="lg"
                className="shrink-0"
              >
                <LogIn className="size-4 mr-1.5" />
                Masuk ke Offly
              </Button>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            Offly | Sistem Manajemen Cuti Karyawan
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#alur" className="hover:text-foreground">
              Alur Cuti
            </a>
            <a href="#keunggulan" className="hover:text-foreground">
              Fitur
            </a>
            <a href="#kebijakan" className="hover:text-foreground">
              Kebijakan &amp; Libur
            </a>
            <Link
              href={sesi ? "/dasbor" : "/masuk"}
              className="text-primary hover:underline font-medium"
            >
              {sesi ? "Dasbor" : "Masuk"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

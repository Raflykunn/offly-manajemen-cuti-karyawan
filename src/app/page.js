import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  FileCheck2,
  FileText,
  LogIn,
  ShieldAlert,
} from "lucide-react";
import { ambilSesiPengguna } from "@/lib/autentikasi";
import { jalankanKueri } from "@/lib/db";
import { formatTanggalIndo } from "@/lib/kalkulasi-cuti";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import NavbarBeranda from "@/components/beranda/NavbarBeranda";
import IlustrasiHero from "@/components/beranda/IlustrasiHero";
import AlurVerifikasiBeranda from "@/components/beranda/AlurVerifikasiBeranda";
import DaftarHariLiburBeranda from "@/components/beranda/DaftarHariLiburBeranda";

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
         LIMIT 12`
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
  const jadwalLiburSiap = daftarHariLibur.map((libur) => ({
    ...libur,
    ...pecahTanggalKartu(libur.tanggal),
    tanggalIndo: formatTanggalIndo(libur.tanggal),
  }));

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground selection:bg-primary/25">
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-xs focus:font-semibold focus:text-primary-foreground shadow-md"
      >
        Lewati ke konten utama
      </a>

      <NavbarBeranda sudahMasuk={Boolean(sesi)} />

      <main id="konten-utama" tabIndex={-1} className="flex-1 outline-none">
        <section className="border-b">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h1 className="judul-seimbang text-[clamp(2.1rem,1.4rem+2.8vw,3.35rem)] font-bold tracking-tight leading-[1.15] text-foreground">
                Ajukan dan setujui cuti tim tanpa rekap manual.
              </h1>

              <p className="paragraf-rapi text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
                Portal internal untuk Karyawan, Ketua Divisi, HRD, dan Admin. Kuota dan hari kerja dihitung otomatis agar kapasitas tim terjaga hingga surat izin cuti PDF terbit.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {sesi ? (
                  <Button
                    nativeButton={false}
                    render={<Link href="/dasbor" />}
                    size="lg"
                  >
                    Masuk ke Dasbor Saya
                    <ArrowRight className="size-4 ml-1.5" aria-hidden="true" />
                  </Button>
                ) : (
                  <Button
                    nativeButton={false}
                    render={<Link href="/masuk" />}
                    size="lg"
                  >
                    <LogIn className="size-4 mr-1.5" aria-hidden="true" />
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

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 pt-2 max-w-lg tabular-nums text-center">
                <div className="rounded-xl border bg-card px-3 py-3 sm:px-4 shadow-2xs">
                  <p className="text-xl sm:text-2xl font-bold font-mono">12</p>
                  <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                    Hari Kerja / Tahun
                  </p>
                </div>
                <div className="rounded-xl border border-primary/25 bg-accent/40 dark:bg-accent/20 px-3 py-3 sm:px-4 shadow-2xs">
                  <p className="text-xl sm:text-2xl font-bold font-mono text-primary">
                    {ringkasan.total_divisi}
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                    Divisi Terdaftar
                  </p>
                </div>
                <div className="rounded-xl border bg-card px-3 py-3 sm:px-4 shadow-2xs">
                  <p className="text-xl sm:text-2xl font-bold font-mono">
                    {daftarJenisCuti.length}
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                    Jenis Cuti Aktif
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <IlustrasiHero />
            </div>
          </div>
        </section>

        <section id="alur" tabIndex={-1} className="border-b bg-muted/20 scroll-mt-20 outline-none">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-14 space-y-8 ungkap-gulir">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="judul-seimbang text-2xl md:text-3xl font-bold tracking-tight">
                Verifikasi berjenjang sesuai peran di divisi
              </h2>
              <p className="paragraf-rapi text-sm text-muted-foreground max-w-sm">
                Kuota tahunan otomatis kembali ke saldo karyawan apabila pengajuan dibatalkan atau ditolak.
              </p>
            </div>

            <AlurVerifikasiBeranda />
          </div>
        </section>

        <section
          id="keunggulan"
          tabIndex={-1}
          className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-14 space-y-8 ungkap-gulir scroll-mt-20 outline-none"
        >
          <div>
            <h2 className="judul-seimbang text-2xl md:text-3xl font-bold tracking-tight">
              Alat kerja harian untuk karyawan dan HRD
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 rounded-xl border bg-card p-6 flex flex-col justify-between gap-6 hover:border-primary/40 transition-colors">
              <div className="space-y-2">
                <div className="size-9 rounded-lg bg-accent dark:bg-accent/60 text-accent-foreground flex items-center justify-center">
                  <Clock3 className="size-4 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold">
                  Simulasi kuota dan cuti setengah hari
                </h3>
                <p className="paragraf-rapi text-sm text-muted-foreground leading-relaxed">
                  Karyawan bisa mengecek sisa kuota serta daftar rekan satu divisi yang cuti di tanggal yang sama sebelum mengirim pengajuan.
                </p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-foreground">
                    Contoh simulasi hari kerja dan akhir pekan
                  </span>
                  <span className="font-mono font-semibold text-primary tabular-nums">
                    11.0 → 8.5 Hari
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 text-center text-[11px] font-mono tabular-nums">
                  <div className="rounded-md bg-primary/15 text-primary py-1.5 px-1 font-semibold">
                    <div>Kam 12</div>
                    <div className="text-[10px]">1.0 Hr</div>
                  </div>
                  <div className="rounded-md bg-primary/15 text-primary py-1.5 px-1 font-semibold">
                    <div>Jum 13</div>
                    <div className="text-[10px]">1.0 Hr</div>
                  </div>
                  <div className="rounded-md bg-muted text-muted-foreground py-1.5 px-1">
                    <div>Sab 14</div>
                    <div className="text-[10px]">Libur</div>
                  </div>
                  <div className="rounded-md bg-muted text-muted-foreground py-1.5 px-1">
                    <div>Min 15</div>
                    <div className="text-[10px]">Libur</div>
                  </div>
                  <div className="rounded-md bg-accent text-accent-foreground py-1.5 px-1 font-semibold">
                    <div>Sen 16</div>
                    <div className="text-[10px]">0.5 Hr</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 rounded-xl border bg-card p-6 flex flex-col justify-between gap-6 hover:border-primary/40 transition-colors">
              <div className="space-y-2">
                <div className="size-9 rounded-lg bg-accent dark:bg-accent/60 text-accent-foreground flex items-center justify-center">
                  <ShieldAlert className="size-4 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold">
                  Kapasitas tim dan tanggal sibuk
                </h3>
                <p className="paragraf-rapi text-sm text-muted-foreground leading-relaxed">
                  Mencegah kekosongan operasional divisi dengan batas persentase cuti bersamaan dan penguncian tanggal sibuk perusahaan.
                </p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">
                    Contoh: terpakai 30% dari batas 40%
                  </span>
                  <span className="font-mono font-bold text-primary tabular-nums">
                    Aman
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-3/4 rounded-full bg-primary" />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Periode sibuk otomatis memblokir pengajuan baru.
                </p>
              </div>
            </div>

            <div className="md:col-span-6 rounded-xl border bg-card p-6 flex flex-col justify-between gap-5 hover:border-primary/40 transition-colors">
              <div className="space-y-2">
                <div className="size-9 rounded-lg bg-accent dark:bg-accent/60 text-accent-foreground flex items-center justify-center">
                  <FileText className="size-4 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold">Surat cuti resmi PDF</h3>
                <p className="paragraf-rapi text-sm text-muted-foreground leading-relaxed">
                  Pengajuan yang telah disetujui HRD otomatis menghasilkan surat izin cuti berstempel digital yang siap diunduh oleh Karyawan maupun Ketua Divisi.
                </p>
              </div>
              <div className="space-y-2.5">
                <Separator />
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">
                    Hanya bisa dibuka oleh pemohon, atasan, dan HRD
                  </span>
                  <span className="font-mono font-semibold text-primary">
                    Stempel Digital PDF
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-6 rounded-xl border bg-card p-6 flex flex-col justify-between gap-5 hover:border-primary/40 transition-colors">
              <div className="space-y-2">
                <div className="size-9 rounded-lg bg-accent dark:bg-accent/60 text-accent-foreground flex items-center justify-center">
                  <FileCheck2 className="size-4 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold">
                  Persetujuan massal HRD dan pengingat kuota
                </h3>
                <p className="paragraf-rapi text-sm text-muted-foreground leading-relaxed">
                  HRD dapat menyetujui beberapa pengajuan sekaligus dalam satu transaksi serta mengirim pengingat kepada karyawan yang belum mengambil hak cuti tahunan.
                </p>
              </div>
              <div className="space-y-2.5">
                <Separator />
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Manajemen divisi dan anggota</span>
                  <span aria-hidden="true">·</span>
                  <span>Deteksi masa kerja di bawah 1 tahun</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="kebijakan" tabIndex={-1} className="border-t bg-muted/20 scroll-mt-20 outline-none">
          <div className="max-w-6xl mx-auto px-4 md:px-6 pt-12 pb-8 md:pt-14 md:pb-8 grid grid-cols-1 lg:grid-cols-12 gap-10 ungkap-gulir">
            <div className="lg:col-span-7 space-y-5">
              <div>
                <h2 className="judul-seimbang text-2xl font-bold tracking-tight">
                  Jenis cuti aktif
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
                <div className="rounded-xl border bg-card divide-y divide-border overflow-hidden">
                  {daftarJenisCuti.map((item) => (
                    <div
                      key={item.id}
                      className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0 sm:w-44 shrink-0">
                        <h3 className="text-sm font-semibold text-foreground">
                          {item.nama_cuti}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground flex-1 leading-relaxed">
                        {item.wajib_lampiran ? "Wajib lampiran" : "Tanpa lampiran"} ·{" "}
                        {item.potong_kuota_tahunan ? "Potong kuota tahunan" : "Non-kuota"}
                      </p>
                      <span className="font-mono text-xs font-semibold text-primary tabular-nums sm:text-right shrink-0">
                        {item.kuota_default} Hari
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div id="kalender" tabIndex={-1} className="lg:col-span-5 space-y-5 scroll-mt-20 outline-none">
              <div>
                <h2 className="judul-seimbang text-2xl font-bold tracking-tight">
                  Hari libur dan cuti bersama
                </h2>
                <p className="paragraf-rapi text-sm text-muted-foreground">
                  Otomatis dikecualikan dari perhitungan hari cuti.
                </p>
              </div>

              <DaftarHariLiburBeranda daftarHariLibur={jadwalLiburSiap} />
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 md:px-6 pt-4 pb-10 md:pt-6 md:pb-12 ungkap-gulir">
          <div className="rounded-2xl border border-primary/20 bg-primary text-primary-foreground p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <h2 className="judul-seimbang text-2xl md:text-3xl font-bold tracking-tight">
                Kelola pengajuan cuti tim dari satu tempat
              </h2>
              <p className="paragraf-rapi text-sm opacity-95">
                Masuk dengan akun Karyawan, Ketua Divisi, HRD, atau Admin. Isi dasbor langsung menyesuaikan peran Anda.
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
                <ArrowRight className="size-4 ml-1.5" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                nativeButton={false}
                render={<Link href="/masuk" />}
                variant="secondary"
                size="lg"
                className="shrink-0"
              >
                <LogIn className="size-4 mr-1.5" aria-hidden="true" />
                Masuk ke Offly
              </Button>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            Offly
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <a href="#alur" className="inline-flex items-center min-h-11 md:min-h-0 hover:text-foreground">
              Alur Cuti
            </a>
            <a href="#keunggulan" className="inline-flex items-center min-h-11 md:min-h-0 hover:text-foreground">
              Fitur
            </a>
            <a href="#kebijakan" className="inline-flex items-center min-h-11 md:min-h-0 hover:text-foreground">
              Kebijakan &amp; Libur
            </a>
            <Link
              href={sesi ? "/dasbor" : "/masuk"}
              className="inline-flex items-center min-h-11 md:min-h-0 text-primary hover:underline font-medium"
            >
              {sesi ? "Dasbor" : "Masuk"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

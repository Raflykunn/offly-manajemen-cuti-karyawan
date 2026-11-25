import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";
import { ambilSesiPengguna } from "@/lib/autentikasi";
import { jalankanKueri } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NavbarBeranda from "@/components/beranda/NavbarBeranda";
import IlustrasiHero from "@/components/beranda/IlustrasiHero";
import AlurVerifikasiBeranda from "@/components/beranda/AlurVerifikasiBeranda";

async function ambilDataPublikBeranda() {
  try {
    const hasilJenis = await jalankanKueri(
      `SELECT id, nama_cuti
       FROM jenis_cuti
       WHERE status_aktif = TRUE
       ORDER BY id ASC`
    );

    return {
      daftarJenisCuti: hasilJenis.rows,
    };
  } catch {
    return {
      daftarJenisCuti: [],
    };
  }
}

export default async function HalamanUtama() {
  const [sesi, dataPublik] = await Promise.all([
    ambilSesiPengguna(),
    ambilDataPublikBeranda(),
  ]);

  const { daftarJenisCuti } = dataPublik;

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
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 sm:py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-7 flex flex-col justify-center space-y-5 sm:space-y-6">
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
                  Lihat Jenis Cuti
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <IlustrasiHero />
            </div>
          </div>
        </section>

        <section id="alur" tabIndex={-1} className="border-b bg-muted/40 scroll-mt-20 outline-none">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-14 space-y-8 ungkap-gulir">
            <div className="space-y-2 max-w-2xl">
              <h2 className="judul-seimbang text-2xl md:text-3xl font-bold tracking-tight">
                Verifikasi berjenjang sesuai peran di divisi
              </h2>
              <p className="paragraf-rapi text-base text-muted-foreground">
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
            <div className="md:col-span-7 rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between gap-4 hover:border-primary transition-colors">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  Simulasi kuota dan cuti setengah hari
                </h3>
                <p className="paragraf-rapi text-sm text-muted-foreground leading-relaxed">
                  Cek sisa kuota dan rekan satu divisi yang cuti sebelum mengirim pengajuan.
                </p>
              </div>

              <div className="rounded-lg border border-primary/50 bg-accent/50 p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-foreground">
                    Contoh simulasi hari kerja dan akhir pekan
                  </span>
                  <span className="font-semibold text-primary tabular-nums">
                    11.0 → 8.5 Hari
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 text-center text-sm tabular-nums">
                  <div className="rounded-md border border-primary/50 bg-accent text-accent-foreground py-1.5 px-1 font-semibold">
                    <div>Kam 12</div>
                    <div className="text-sm font-medium">1.0 Hr</div>
                  </div>
                  <div className="rounded-md border border-primary/50 bg-accent text-accent-foreground py-1.5 px-1 font-semibold">
                    <div>Jum 13</div>
                    <div className="text-sm font-medium">1.0 Hr</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted text-muted-foreground py-1.5 px-1">
                    <div>Sab 14</div>
                    <div className="text-sm">Libur</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted text-muted-foreground py-1.5 px-1">
                    <div>Min 15</div>
                    <div className="text-sm">Libur</div>
                  </div>
                  <div className="rounded-md border-2 border-primary bg-accent text-accent-foreground py-1.5 px-1 font-semibold">
                    <div>Sen 16</div>
                    <div className="text-sm font-medium">0.5 Hr</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between gap-4 hover:border-primary transition-colors">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  Kapasitas tim dan tanggal sibuk
                </h3>
                <p className="paragraf-rapi text-sm text-muted-foreground leading-relaxed">
                  Jaga kapasitas divisi dengan batas persentase cuti dan penguncian tanggal sibuk.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-muted/60 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    Contoh: terpakai 30% dari batas 40%
                  </span>
                  <span className="font-bold text-primary tabular-nums">
                    Aman
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden border border-border">
                  <div className="h-full w-3/4 rounded-full bg-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Periode sibuk otomatis memblokir pengajuan baru.
                </p>
              </div>
            </div>

            <div className="md:col-span-6 rounded-xl border bg-card p-6 shadow-sm flex flex-col gap-2 hover:border-primary transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">Surat cuti resmi PDF</h3>
                <Badge variant="outline" className="border-primary/40 bg-accent/60 text-primary font-semibold">
                  Stempel Digital PDF
                </Badge>
              </div>
              <p className="paragraf-rapi text-sm text-muted-foreground leading-relaxed">
                Pengajuan yang disetujui HRD otomatis menghasilkan surat izin cuti siap unduh.
              </p>
            </div>

            <div className="md:col-span-6 rounded-xl border bg-card p-6 shadow-sm flex flex-col gap-2 hover:border-primary transition-colors">
              <h3 className="text-lg font-semibold">
                Persetujuan massal HRD dan pengingat kuota
              </h3>
              <p className="paragraf-rapi text-sm text-muted-foreground leading-relaxed">
                HRD dapat menyetujui beberapa pengajuan sekaligus dan mengirim pengingat kuota tahunan.
              </p>
            </div>
          </div>
        </section>

        <section id="kebijakan" tabIndex={-1} className="border-t border-b bg-muted/35 scroll-mt-20 outline-none">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-12 space-y-6 ungkap-gulir">
            <div className="space-y-1.5 max-w-2xl">
              <h2 className="judul-seimbang text-2xl font-bold tracking-tight">
                Jenis cuti yang didukung
              </h2>
              <p className="paragraf-rapi text-sm text-muted-foreground">
                Seluruh jenis cuti aktif yang tersedia dan dapat diajukan sesuai ketentuan perusahaan.
              </p>
            </div>

            {daftarJenisCuti.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Data jenis cuti belum tersedia.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {daftarJenisCuti.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground shadow-sm"
                  >
                    {item.nama_cuti}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-12 ungkap-gulir">
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

      <footer className="border-t bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
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
              Jenis Cuti
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

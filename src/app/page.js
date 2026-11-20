import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  FileText,
  GitBranch,
  LogIn,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { ambilSesiPengguna } from "@/lib/autentikasi";
import { jalankanKueri } from "@/lib/db";
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
        `SELECT id, tanggal, nama_libur, jenis
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
      daftarHariLibur: hasilLibur.rows.map((h) => ({
        ...h,
        tanggal: new Date(h.tanggal).toISOString().slice(0, 10),
      })),
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

export default async function HalamanUtama() {
  const [sesi, dataPublik] = await Promise.all([
    ambilSesiPengguna(),
    ambilDataPublikBeranda(),
  ]);

  const { daftarJenisCuti, daftarHariLibur, ringkasan } = dataPublik;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
              <CalendarCheck2 className="size-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">Offly</span>
              <span className="hidden sm:inline-block text-xs text-muted-foreground ml-2">
                Manajemen Cuti Karyawan
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#fitur" className="hover:text-foreground transition-colors">
              Fitur Utama
            </a>
            <a href="#alur" className="hover:text-foreground transition-colors">
              Alur Persetujuan
            </a>
            <a href="#kebijakan" className="hover:text-foreground transition-colors">
              Kebijakan Cuti
            </a>
            <a href="#kalender" className="hover:text-foreground transition-colors">
              Hari Libur
            </a>
          </nav>

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
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="border-b bg-muted/25">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <Badge
                variant="secondary"
                className="bg-accent text-accent-foreground border border-primary/25"
              >
                <Sparkles className="size-3.5 mr-1" />
                Portal Tamu &amp; Informasi Cuti Perusahaan
              </Badge>

              <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                Pengelolaan cuti karyawan yang rapi, transparan, dan terotomasi.
              </h1>

              <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                Offly menyederhanakan proses pengajuan cuti, verifikasi Ketua Divisi, dan persetujuan final HRD lengkap dengan simulasi kuota real-time, kalender hari libur, serta penerbitan surat cuti resmi PDF.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {sesi ? (
                  <Button
                    nativeButton={false}
                    render={<Link href="/dasbor" />}
                    size="lg"
                  >
                    Lanjut ke Dasbor
                    <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button
                    nativeButton={false}
                    render={<Link href="/masuk" />}
                    size="lg"
                  >
                    <LogIn className="size-4 mr-1.5" />
                    Masuk ke Akun Karyawan
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
            </div>

            <div className="lg:col-span-5">
              <Card className="border-primary/25 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Ringkasan Informasi Publik
                  </CardTitle>
                  <CardDescription>
                    Data operasional cuti yang aktif di sistem Offly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-primary" />
                        Divisi Aktif
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {ringkasan.total_divisi}
                      </p>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Users className="size-3.5 text-primary" />
                        Pengguna Aktif
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {ringkasan.total_karyawan}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border bg-accent/30 p-3 text-xs space-y-1">
                    <p className="font-semibold text-foreground">
                      Hak Cuti Tahunan Standar
                    </p>
                    <p className="text-muted-foreground">
                      12 hari kerja per tahun (tidak termasuk akhir pekan dan hari libur nasional), mendukung cuti setengah hari (0.5 hari).
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="fitur" className="max-w-6xl mx-auto px-4 md:px-6 py-14 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Fitur Utama Platform
            </h2>
            <p className="text-sm text-muted-foreground">
              Dirancang untuk empat peran: Admin, Karyawan, Ketua Divisi, dan HRD.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <GitBranch className="size-5 text-primary mb-1" />
                <CardTitle className="text-base">Alur Persetujuan 2 Skema</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed">
                Otomatisasi alur Karyawan → Ketua Divisi → HRD serta pengajuan Ketua Divisi langsung ke HRD.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <Sparkles className="size-5 text-primary mb-1" />
                <CardTitle className="text-base">Simulasi Kuota What-If</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed">
                Hitung hari kerja otomatis (termasuk 0.5 hari), proyeksi sisa kuota, dan cek rekan divisi yang sedang cuti.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <ShieldCheck className="size-5 text-primary mb-1" />
                <CardTitle className="text-base">Kapasitas &amp; Blackout</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed">
                Validasi persentase maksimal anggota divisi yang cuti bersamaan dan pemblokiran tanggal tutup buku.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <FileText className="size-5 text-primary mb-1" />
                <CardTitle className="text-base">Surat Cuti Resmi PDF</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed">
                Unduh surat izin cuti berformat PDF lengkap dengan pengesahan digital Ketua Divisi dan HRD.
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="alur" className="border-y bg-muted/20">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-14 space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Alur Persetujuan Cuti
              </h2>
              <p className="text-sm text-muted-foreground">
                Setiap status pengajuan terpantau secara real-time dan kuota otomatis kembali jika dibatalkan atau ditolak.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-1">
                    Alur 1
                  </Badge>
                  <CardTitle className="text-lg">
                    Pengajuan Cuti Karyawan
                  </CardTitle>
                  <CardDescription>
                    Karyawan → Ketua Divisi → HRD
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                    <span>Karyawan mengisi form &amp; menunjuk rekan pengganti</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                    <span>Ketua Divisi melakukan verifikasi tahap pertama</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                    <span>HRD memberikan persetujuan final &amp; menerbitkan PDF</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-1">
                    Alur 2
                  </Badge>
                  <CardTitle className="text-lg">
                    Pengajuan Cuti Ketua Divisi
                  </CardTitle>
                  <CardDescription>
                    Ketua Divisi → HRD
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                    <span>Ketua Divisi mengajukan cuti pribadi langsung ke HRD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                    <span>HRD memverifikasi jadwal &amp; memberikan persetujuan final</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                    <span>Surat izin cuti resmi PDF siap diunduh setelah disetujui</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section
          id="kebijakan"
          className="max-w-6xl mx-auto px-4 md:px-6 py-14 grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          <div className="lg:col-span-7 space-y-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Jenis &amp; Kebijakan Cuti
              </h2>
              <p className="text-sm text-muted-foreground">
                Daftar jenis cuti aktif yang dikonfigurasi di dalam database perusahaan.
              </p>
            </div>

            {daftarJenisCuti.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  Kebijakan jenis cuti akan tampil setelah database terhubung.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {daftarJenisCuti.map((item) => (
                  <Card key={item.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base">
                          {item.nama_cuti}
                        </CardTitle>
                        <Badge variant="secondary">
                          {item.kuota_default} Hari
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs text-muted-foreground">
                      <p>{item.deskripsi || "Mengikuti kebijakan perusahaan."}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <Badge variant="outline" className="text-[10px]">
                          {item.wajib_lampiran
                            ? "Wajib Lampiran"
                            : "Tanpa Lampiran"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {item.potong_kuota_tahunan
                            ? "Potong Kuota Tahunan"
                            : "Tidak Potong Kuota"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div id="kalender" className="lg:col-span-5 space-y-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Kalender Libur Nasional
              </h2>
              <p className="text-sm text-muted-foreground">
                Tanggal libur resmi tidak memotong hari kerja cuti karyawan.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-3">
                {daftarHariLibur.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Daftar hari libur belum tersedia.
                  </p>
                ) : (
                  daftarHariLibur.map((libur) => (
                    <div
                      key={libur.id}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CalendarDays className="size-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {libur.nama_libur}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTanggalIndo(libur.tanggal)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {libur.jenis}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>Offly — Sistem Manajemen Cuti Karyawan</span>
          <span>
            {sesi ? (
              <Link href="/dasbor" className="text-primary hover:underline font-medium">
                Kembali ke Dasbor
              </Link>
            ) : (
              <Link href="/masuk" className="text-primary hover:underline font-medium">
                Masuk sebagai Karyawan / Ketua Divisi / HRD / Admin
              </Link>
            )}
          </span>
        </div>
      </footer>
    </div>
  );
}

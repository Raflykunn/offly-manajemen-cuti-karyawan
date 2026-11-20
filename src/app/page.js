import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarCheck2,
  CalendarDays,
  Check,
  Clock3,
  FileCheck2,
  FileText,
  LogIn,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import { ambilSesiPengguna } from "@/lib/autentikasi";
import { jalankanKueri } from "@/lib/db";
import { formatTanggalIndo, labelPeranPengguna } from "@/lib/kalkulasi-cuti";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/25">
      <div className="border-b bg-muted/50 text-[11px] font-mono text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-8 flex items-center justify-between gap-4 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-foreground font-medium">
              <span className="size-1.5 rounded-full bg-primary" />
              OFFLY LEAVE ENGINE
            </span>
            <span>KUOTA STANDAR: 12 HARI KERJA</span>
            <span className="hidden sm:inline">PRESISI: 0.5 HARI</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{ringkasan.total_divisi} DIVISI</span>
            <span>{ringkasan.total_karyawan} PENGGUNA AKTIF</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b bg-background/95">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
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

          <nav className="hidden md:flex items-center gap-1 rounded-full border bg-muted/40 p-1 text-xs font-medium">
            <a
              href="#alur"
              className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
            >
              Alur Cuti
            </a>
            <a
              href="#keunggulan"
              className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
            >
              Keunggulan
            </a>
            <a
              href="#kebijakan"
              className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
            >
              Kebijakan
            </a>
            <a
              href="#kalender"
              className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
            >
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
        <section className="border-b">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                <Sparkles className="size-3.5 text-primary" />
                Portal Informasi &amp; Pengajuan Cuti Terpadu
              </div>

              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.06]">
                Cuti tanpa drama.{" "}
                <span className="inline-block bg-primary/20 text-foreground px-2 rounded-md border-b-2 border-primary">
                  Persetujuan
                </span>{" "}
                tanpa tunggu.
              </h1>

              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
                Satu portal ringan untuk Karyawan, Ketua Divisi, HRD, dan Admin. Hitung hari kerja otomatis, jaga kapasitas tim, dan terbitkan surat cuti PDF dalam hitungan detik.
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
                    Mulai Masuk ke Akun
                    <ArrowUpRight className="size-4 ml-1.5" />
                  </Button>
                )}
                <Button
                  nativeButton={false}
                  render={<a href="#kebijakan" />}
                  variant="outline"
                  size="lg"
                >
                  Jelajahi Kebijakan Cuti
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t max-w-lg">
                <div>
                  <p className="text-2xl font-bold font-mono">12</p>
                  <p className="text-xs text-muted-foreground">
                    Hari Kerja / Tahun
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono text-primary">
                    {ringkasan.total_divisi}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Divisi Terdaftar
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono">
                    {daftarJenisCuti.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Jenis Cuti Aktif
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="bg-primary px-5 py-4 text-primary-foreground flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-wider opacity-85">
                      PRATINJAU TIKET CUTI
                    </p>
                    <p className="text-base font-bold font-mono">
                      OFFLY-2026-0001
                    </p>
                  </div>
                  <Badge className="bg-background text-foreground hover:bg-background font-mono text-[11px]">
                    Approved by HRD
                  </Badge>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <p className="text-muted-foreground">Jenis Cuti</p>
                      <p className="font-semibold text-sm mt-0.5">
                        Cuti Tahunan
                      </p>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <p className="text-muted-foreground">Presisi Durasi</p>
                      <p className="font-semibold text-sm mt-0.5 text-primary">
                        0.5 Hari Kerja
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 border-y border-dashed py-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-medium">
                        <span className="size-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                          <Check className="size-3" />
                        </span>
                        1. Pengajuan Karyawan
                      </span>
                      <span className="font-mono text-muted-foreground">
                        Handover OK
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-medium">
                        <span className="size-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                          <Check className="size-3" />
                        </span>
                        2. Verifikasi Ketua Divisi
                      </span>
                      <span className="font-mono text-muted-foreground">
                        Approved
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-medium">
                        <span className="size-5 rounded-full bg-primary/20 text-accent-foreground flex items-center justify-center">
                          <Check className="size-3" />
                        </span>
                        3. Pengesahan Final HRD
                      </span>
                      <span className="font-mono text-primary font-semibold">
                        PDF Siap
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Simulasi Sisa Kuota
                      </span>
                      <span className="font-mono font-semibold">
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

        <section id="alur" className="border-b bg-muted/20">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-14 space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
                  01 / OTOMATISASI PERSETUJUAN
                </p>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Dua jalur persetujuan tanpa birokrasi berbelit
                </h2>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm">
                Kuota tahunan otomatis kembali ke saldo karyawan apabila pengajuan dibatalkan atau ditolak di tahap mana pun.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border bg-card p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono">
                    ALUR 01 — KARYAWAN
                  </Badge>
                  <span className="text-xs text-muted-foreground">3 Tahap</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                    <p className="font-mono text-primary font-bold">STEP 1</p>
                    <p className="font-semibold">Karyawan</p>
                    <p className="text-muted-foreground">
                      Ajukan cuti &amp; isi rekan handover
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                    <p className="font-mono text-primary font-bold">STEP 2</p>
                    <p className="font-semibold">Ketua Divisi</p>
                    <p className="text-muted-foreground">
                      Verifikasi tugas &amp; beban tim
                    </p>
                  </div>
                  <div className="rounded-lg border bg-accent/50 border-primary/30 p-3 space-y-1">
                    <p className="font-mono text-primary font-bold">STEP 3</p>
                    <p className="font-semibold">HRD Final</p>
                    <p className="text-muted-foreground">
                      Pengesahan &amp; surat PDF resmi
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono">
                    ALUR 02 — KETUA DIVISI
                  </Badge>
                  <span className="text-xs text-muted-foreground">2 Tahap</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border bg-muted/30 p-3.5 space-y-1">
                    <p className="font-mono text-primary font-bold">STEP 1</p>
                    <p className="font-semibold text-sm">Ketua Divisi</p>
                    <p className="text-muted-foreground">
                      Mengajukan cuti pribadi langsung menuju antrean HRD
                    </p>
                  </div>
                  <div className="rounded-lg border bg-accent/50 border-primary/30 p-3.5 space-y-1">
                    <p className="font-mono text-primary font-bold">STEP 2</p>
                    <p className="font-semibold text-sm">HRD Final</p>
                    <p className="text-muted-foreground">
                      Validasi kapasitas divisi &amp; terbitkan surat izin cuti
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="keunggulan"
          className="max-w-6xl mx-auto px-4 md:px-6 py-14 space-y-8"
        >
          <div className="space-y-1">
            <p className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
              02 / ARSITEKTUR BENTO FITUR
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Cepat, presisi, dan siap audit
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-7 rounded-xl border bg-card p-6 flex flex-col justify-between gap-5">
              <div className="space-y-2">
                <div className="size-9 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
                  <Clock3 className="size-4 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">
                  Simulasi Kuota What-If &amp; Cuti Setengah Hari
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sebelum menekan kirim, karyawan dapat melihat proyeksi sisa kuota, daftar akhir pekan serta hari libur nasional yang dilewati, sekaligus melihat rekan satu divisi yang cuti di tanggal yang sama.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <span className="rounded border bg-muted/40 px-2.5 py-1">
                  0.5 HARI DIDUKUNG
                </span>
                <span className="rounded border bg-muted/40 px-2.5 py-1">
                  VALIDASI OVERLAP OTOMATIS
                </span>
                <span className="rounded border bg-muted/40 px-2.5 py-1">
                  ATURAN H-3 &amp; H+3 SAKIT
                </span>
              </div>
            </div>

            <div className="md:col-span-5 rounded-xl border bg-card p-6 flex flex-col justify-between gap-5">
              <div className="space-y-2">
                <div className="size-9 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
                  <ShieldAlert className="size-4 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">
                  Kapasitas Tim &amp; Periode Blackout
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Cegah kekosongan operasional divisi dengan batas persentase cuti bersamaan dan penguncian tanggal sibuk perusahaan.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 flex items-center justify-between text-xs">
                <span className="font-medium">Batas Aman Divisi</span>
                <span className="font-mono font-bold text-primary">
                  30% – 40%
                </span>
              </div>
            </div>

            <div className="md:col-span-5 rounded-xl border bg-card p-6 space-y-3">
              <div className="size-9 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
                <FileText className="size-4 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Surat Cuti Resmi PDF</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pengajuan berstatus Approved by HRD otomatis menghasilkan surat izin cuti berstempel digital yang siap diunduh oleh Karyawan maupun Ketua Divisi.
              </p>
            </div>

            <div className="md:col-span-7 rounded-xl border bg-card p-6 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="size-9 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
                  <FileCheck2 className="size-4 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">
                  Multi-Approve HRD &amp; Peringatan Kuota Hangus
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  HRD dapat menyetujui banyak pengajuan sekaligus dalam satu transaksi serta mengirim pengingat satu klik kepada karyawan yang jarang mengambil cuti menjelang akhir tahun.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border bg-muted/30 p-2.5 flex items-center gap-2">
                  <Building2 className="size-4 text-primary shrink-0" />
                  <span>Manajemen Divisi &amp; Anggota</span>
                </div>
                <div className="rounded-lg border bg-muted/30 p-2.5 flex items-center gap-2">
                  <Users className="size-4 text-primary shrink-0" />
                  <span>Deteksi Masa Kerja &lt; 1 Thn</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="kebijakan" className="border-t bg-muted/20">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-14 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-5">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
                  03 / KEBIJAKAN PERUSAHAAN
                </p>
                <h2 className="text-2xl font-bold tracking-tight mt-1">
                  Jenis Cuti Aktif
                </h2>
                <p className="text-sm text-muted-foreground">
                  Dikelola dinamis langsung dari database oleh Admin.
                </p>
              </div>

              {daftarJenisCuti.length === 0 ? (
                <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
                  Data jenis cuti akan tampil setelah koneksi PostgreSQL aktif.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {daftarJenisCuti.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border bg-card p-4 space-y-2.5 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-mono text-primary font-semibold">
                            {item.kode_cuti}
                          </p>
                          <h3 className="text-sm font-bold">{item.nama_cuti}</h3>
                        </div>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {item.kuota_default} Hari
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.deskripsi || "Mengikuti ketentuan perusahaan."}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <Badge variant="outline" className="text-[10px]">
                          {item.wajib_lampiran
                            ? "Wajib Lampiran"
                            : "Tanpa Lampiran"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {item.potong_kuota_tahunan
                            ? "Potong Kuota"
                            : "Non-Kuota"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div id="kalender" className="lg:col-span-5 space-y-5">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
                  04 / KALENDER RESMI
                </p>
                <h2 className="text-2xl font-bold tracking-tight mt-1">
                  Hari Libur &amp; Cuti Bersama
                </h2>
                <p className="text-sm text-muted-foreground">
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
                          <div className="size-11 rounded-lg bg-accent border border-primary/20 flex flex-col items-center justify-center shrink-0 leading-none">
                            <span className="text-sm font-bold font-mono text-foreground">
                              {hari}
                            </span>
                            <span className="text-[9px] font-mono text-accent-foreground mt-0.5">
                              {bulan}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {libur.nama_libur}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <CalendarDays className="size-3" />
                              {formatTanggalIndo(libur.tanggal)}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">
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

        <section className="max-w-6xl mx-auto px-4 md:px-6 py-12">
          <div className="rounded-2xl border bg-primary text-primary-foreground p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Siap mengelola cuti tim dengan lebih tertib?
              </h2>
              <p className="text-sm opacity-90">
                Masuk menggunakan akun Karyawan, Ketua Divisi, HRD, atau Admin. Peran Anda dideteksi otomatis saat masuk.
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
            Offly — Sistem Manajemen Cuti Karyawan
          </span>
          <div className="flex items-center gap-4">
            <a href="#alur" className="hover:text-foreground">
              Alur
            </a>
            <a href="#kebijakan" className="hover:text-foreground">
              Kebijakan
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

"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TAHAP_KARYAWAN = [
  {
    nomor: "01",
    peran: "Karyawan",
    keterangan: "Mengajukan cuti dan menunjuk rekan serah terima tugas.",
    status: "Menunggu",
  },
  {
    nomor: "02",
    peran: "Ketua Divisi",
    keterangan: "Memeriksa kesiapan tugas dan beban tim di divisi.",
    status: "Disetujui Ketua Divisi",
  },
  {
    nomor: "03",
    peran: "HRD",
    keterangan: "Pengesahan akhir dan penerbitan surat cuti PDF.",
    status: "Disetujui HRD",
  },
];

const TAHAP_KETUA = [
  {
    nomor: "01",
    peran: "Ketua Divisi",
    keterangan: "Mengajukan cuti pribadi langsung menuju antrean HRD.",
    status: "Menunggu",
  },
  {
    nomor: "02",
    peran: "HRD",
    keterangan: "Memvalidasi kapasitas divisi dan menerbitkan surat izin cuti.",
    status: "Disetujui HRD",
  },
];

function GarisTahap({ daftarTahap, kolomMd }) {
  return (
    <div className="relative pt-2">
      <ol className={`relative grid grid-cols-1 ${kolomMd} gap-4 md:gap-6`}>
        {daftarTahap.map((tahap, indeks) => (
          <li
            key={tahap.nomor}
            className="relative rounded-xl border border-border bg-card p-5 shadow-sm flex md:flex-col md:items-center md:text-center gap-4 md:gap-3"
          >
            {indeks < daftarTahap.length - 1 && (
              <span
                aria-hidden="true"
                className="hidden md:block absolute top-1/2 -translate-y-1/2 -right-6 w-6 border-t-2 border-border"
              />
            )}
            <span className="relative z-10 size-10 rounded-full bg-accent text-accent-foreground border-2 border-primary font-sans text-base font-bold tabular-nums flex items-center justify-center shrink-0">
              {tahap.nomor}
            </span>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center md:justify-center gap-2">
                <h3 className="text-base font-semibold text-foreground">
                  {tahap.peran}
                </h3>
                <span className="text-sm font-sans font-semibold text-primary">
                  {tahap.status}
                </span>
              </div>
              <p className="paragraf-rapi text-sm text-muted-foreground leading-relaxed max-w-sm">
                {tahap.keterangan}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function AlurVerifikasiBeranda() {
  return (
    <Tabs defaultValue="karyawan" className="space-y-6">
      <TabsList>
        <TabsTrigger value="karyawan">Alur Karyawan (3 Tahap)</TabsTrigger>
        <TabsTrigger value="ketua">Alur Ketua Divisi (2 Tahap)</TabsTrigger>
      </TabsList>

      <TabsContent value="karyawan" className="outline-none">
        <GarisTahap daftarTahap={TAHAP_KARYAWAN} kolomMd="md:grid-cols-3" />
      </TabsContent>

      <TabsContent value="ketua" className="outline-none">
        <GarisTahap daftarTahap={TAHAP_KETUA} kolomMd="md:grid-cols-2" />
      </TabsContent>
    </Tabs>
  );
}

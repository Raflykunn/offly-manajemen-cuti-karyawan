"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TAHAP_KARYAWAN = [
  {
    nomor: "01",
    peran: "Karyawan",
    keterangan: "Mengajukan cuti dan menunjuk rekan serah terima tugas.",
    status: "Pending",
  },
  {
    nomor: "02",
    peran: "Ketua Divisi",
    keterangan: "Memeriksa kesiapan tugas dan beban tim di divisi.",
    status: "Approved by Leader",
  },
  {
    nomor: "03",
    peran: "HRD",
    keterangan: "Pengesahan akhir dan penerbitan surat cuti PDF.",
    status: "Approved by HRD",
  },
];

const TAHAP_KETUA = [
  {
    nomor: "01",
    peran: "Ketua Divisi",
    keterangan: "Mengajukan cuti pribadi langsung menuju antrean HRD.",
    status: "Pending",
  },
  {
    nomor: "02",
    peran: "HRD",
    keterangan: "Memvalidasi kapasitas divisi dan menerbitkan surat izin cuti.",
    status: "Approved by HRD",
  },
];

function GarisTahap({ daftarTahap, kolomMd }) {
  return (
    <div className="relative pt-4">
      <ol className={`relative grid grid-cols-1 ${kolomMd} gap-8 md:gap-6`}>
        {daftarTahap.map((tahap, indeks) => (
          <li
            key={tahap.nomor}
            className="relative flex md:flex-col md:items-center md:text-center gap-4 md:gap-3"
          >
            {indeks < daftarTahap.length - 1 && (
              <span
                aria-hidden="true"
                className="hidden md:block absolute top-5 left-[calc(50%+1.5rem)] -right-1/2 border-t border-border"
              />
            )}
            <span className="relative z-10 size-10 rounded-full bg-accent text-primary border border-primary/25 font-mono text-sm font-bold tabular-nums flex items-center justify-center shrink-0">
              {tahap.nomor}
            </span>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center md:justify-center gap-2">
                <h3 className="text-base font-semibold text-foreground">
                  {tahap.peran}
                </h3>
                <span className="text-[11px] font-mono text-muted-foreground">
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
